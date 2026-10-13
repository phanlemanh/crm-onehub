import { afterAll, beforeAll, describe, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db, TrangThaiViec } from "@crm/db";
import { keoViec } from "@crm/db/viec-ghi";
import {
	gieoBangMau,
	gieoViecMau,
	TIEU_DE_CHA_MAU,
	TIEU_DE_MAU,
} from "@crm/db/viec-gieo";
import { donDep, moXuong } from "./support/ke-hoach-gieo";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { batApp, donViec, nguoi, thoaThuan } from "./support/viec-gieo";

const RANG = join(
	import.meta.dir,
	"..",
	"..",
	"..",
	"_acceptance",
	"kanban-viec",
	"rang",
);
const THUOC = join(RANG, "do-nguong.mjs");
const NGAY = "2026-02-14";
const NOW = new Date(`${NGAY}T03:00:00.000Z`);
const KHOA = [
	"doiTrangThaiNguoi",
	"quaBangKeo",
	"quaBangMenu",
	"tiLeBangKeo",
	"tiLeBang",
	"viecCoCon",
	"nguoiTaoCon",
] as const;
type Ket = Record<(typeof KHOA)[number], number>;

let app: NestExpressApplication;

beforeAll(async () => {
	await moXuong();
	app = await batApp();
});
afterAll(async () => {
	await app.close();
	await donViec();
	await donDep();
});

function chay(trong: string[]): Ket {
	const r = spawnSync(
		"node",
		[THUOC, "--tu", NGAY, "--den", NGAY, "--trong", trong.join(",")],
		{
			env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL },
			encoding: "utf8",
		},
	);
	if (r.status !== 0)
		throw new Error(`kv: thuoc khong chay ${r.status} ${r.stderr}`);
	return JSON.parse(r.stdout) as Ket;
}

async function demHang(): Promise<string> {
	const [viec, vet, gan, theoDoi, thuTu] = await Promise.all([
		db.viec.count(),
		db.viecVet.count(),
		db.viecGan.count(),
		db.viecTheoDoi.count(),
		db.viecThuTu.count(),
	]);
	return JSON.stringify({ viec, vet, gan, theoDoi, thuTu });
}

describe("kv-thuoc", () => {
	test("kv-thuoc: đúng đáp án trên kho mẫu, chỉ đọc, đếm lần kéo và lần menu riêng", async () => {
		const src = readFileSync(THUOC, "utf8");
		if (
			/\b(INSERT|UPDATE|DELETE)\b|\$executeRaw|\.create\(|\.update\(|\.delete\(/.test(
				src,
			)
		) {
			throw new Error("kv: thuoc co lenh ghi");
		}
		await db.viec.deleteMany({
			where: { tieuDe: { in: [...TIEU_DE_MAU, TIEU_DE_CHA_MAU] } },
		});
		await db.viec.deleteMany({ where: { cha: { tieuDe: TIEU_DE_CHA_MAU } } });
		const a = await nguoi("kv-th-a", "member");
		await nguoi("kv-th-b", "member");
		await thoaThuan(app, a.id, "KV Thuoc");
		const url = process.env.TEST_DATABASE_URL ?? "";
		await gieoViecMau(db, {
			databaseUrl: url,
			nguon: "TEST_DATABASE_URL",
			now: NOW,
		});
		const bang = await gieoBangMau(db, {
			databaseUrl: url,
			nguon: "TEST_DATABASE_URL",
			now: NOW,
		});
		if (!bang.chaId || bang.conIds.length !== 3) {
			throw new Error("kv: gieo thieu cha ba con");
		}
		const cha = await db.viec.findUniqueOrThrow({
			where: { id: bang.chaId },
			select: {
				nguoiGiaoId: true,
				nguoiThucHienId: true,
				gan: { select: { dealId: true } },
			},
		});
		if (
			cha.gan.length !== 1 ||
			(await db.viec.count({ where: { chaId: bang.chaId } })) !== 3
		) {
			throw new Error("kv: gieo thieu cha ba con");
		}
		const trong = [cha.nguoiGiaoId, cha.nguoiThucHienId];
		const dapAn = JSON.parse(
			readFileSync(join(RANG, "dap-an.json"), "utf8"),
		) as Ket;
		const truoc = await demHang();
		const ket = chay(trong);
		if ((await demHang()) !== truoc) throw new Error("kv: thuoc ghi vao kho");
		for (const k of KHOA) {
			if (ket[k] !== dapAn[k]) {
				throw new Error(`kv: thuoc lech ${k} ${ket[k]} ${dapAn[k]}`);
			}
		}
		const ba = bang.conIds[2] ?? "";
		const nguoiBa = (await db.viec.findUniqueOrThrow({ where: { id: ba } }))
			.nguoiThucHienId;
		await db.$transaction((tx) =>
			keoViec(tx, {
				viecId: ba,
				nguoiId: nguoiBa,
				den: TrangThaiViec.DANG_LAM,
				thuTu: [ba],
				nguon: "bang-keo",
				now: NOW,
			}),
		);
		const sauKeo = chay(trong);
		if (
			sauKeo.quaBangKeo !== ket.quaBangKeo + 1 ||
			sauKeo.quaBangMenu !== ket.quaBangMenu
		) {
			throw new Error("kv: thuoc khong dem lan keo moi");
		}
		await db.$transaction((tx) =>
			keoViec(tx, {
				viecId: ba,
				nguoiId: nguoiBa,
				den: TrangThaiViec.CHO_DANH_GIA,
				thuTu: [],
				nguon: "bang-menu",
				now: NOW,
			}),
		);
		const sauMenu = chay(trong);
		if (
			!(
				sauMenu.tiLeBang > sauKeo.tiLeBang &&
				sauMenu.tiLeBangKeo < sauKeo.tiLeBangKeo
			)
		) {
			throw new Error("kv: thuoc lan menu sai");
		}
	}, 180_000);
});
