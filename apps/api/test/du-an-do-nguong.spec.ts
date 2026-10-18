import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import { gieoDuAnMau, LE_MAU, TEN_DU_AN_MAU } from "@crm/db/du-an-gieo";
import { ngayVN } from "@crm/db/onboarding-nhac";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { z } from "zod";
import { donDuAn } from "./support/du-an-gieo";
import { donDep, moXuong } from "./support/ke-hoach-gieo";
import { batApp, donViec, goi, nguoi } from "./support/viec-gieo";

const RANG = join(
	import.meta.dir,
	"..",
	"..",
	"..",
	"_acceptance",
	"du-an-gantt",
	"rang",
);
const THUOC = join(RANG, "do-nguong.mjs");
const NOW = new Date("2026-10-16T03:00:00.000Z");
const MA_TEST_MS = 180_000;

const ket = z.object({
	duAnDat: z.number(),
	duAnDatDu: z.number(),
	nguoiTaoDat: z.number(),
	duAnCoPhuThuoc: z.number(),
});
type Ket = z.infer<typeof ket>;
const TRUONG = [
	"duAnDat",
	"duAnDatDu",
	"nguoiTaoDat",
	"duAnCoPhuThuoc",
] as const satisfies readonly (keyof Ket)[];

const dapAn = ket
	.extend({ sauP5: ket })
	.parse(JSON.parse(readFileSync(join(RANG, "dap-an.json"), "utf8")));

let app: NestExpressApplication;

async function boMau(): Promise<void> {
	const mau = await db.duAn.findMany({
		where: { ten: TEN_DU_AN_MAU },
		select: { id: true },
	});
	const ids = mau.map((m) => m.id);
	await db.viec.deleteMany({ where: { duAnId: { in: ids } } });
	await db.duAn.deleteMany({ where: { id: { in: ids } } });
	await db.ngayNghi.deleteMany({ where: { ten: LE_MAU.ten } });
}

beforeAll(async () => {
	await moXuong();
	app = await batApp();
});

afterAll(async () => {
	await app.close();
	await boMau();
	await donDuAn();
	await donViec();
	await donDep();
});

function chay(trong: string[]): Ket {
	const den = ngayVN(new Date(Date.now() + 24 * 60 * 60 * 1000));
	const r = spawnSync(
		"node",
		[THUOC, "--tu", ngayVN(NOW), "--den", den, "--trong", trong.join(",")],
		{
			env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL },
			encoding: "utf8",
		},
	);
	if (r.status !== 0) {
		throw new Error(`dgt: thuoc khong chay ${r.status} ${r.stderr}`);
	}
	return ket.parse(JSON.parse(r.stdout));
}

async function demHang() {
	const [duAn, duAnVet, duAnMoc, duAnMocCho, viecPhuThuoc, viec, viecVet] =
		await Promise.all([
			db.duAn.count(),
			db.duAnVet.count(),
			db.duAnMoc.count(),
			db.duAnMocCho.count(),
			db.viecPhuThuoc.count(),
			db.viec.count(),
			db.viecVet.count(),
		]);
	return { duAn, duAnVet, duAnMoc, duAnMocCho, viecPhuThuoc, viec, viecVet };
}

function soSanh(ra: Ket, dap: Ket): void {
	if (ra.duAnDat === dap.duAnDat + 1) {
		throw new Error("dgt: dem viec thieu ngay");
	}
	for (const t of TRUONG) {
		if (ra[t] !== dap[t]) {
			throw new Error(`dgt: ${t} ra ${ra[t]} dap an ${dap[t]}`);
		}
	}
}

async function duAnApi(
	nguoiId: string,
	ten: string,
	viec: { batDau: string | null; han: string | null }[],
	phuThuoc: [number, number][],
	moc: number[] | null,
): Promise<string> {
	const p = await goi(app, "duAn.tao", "mutation", { ten }, nguoiId);
	const duAnId = z.object({ id: z.string() }).parse(p.data).id;
	const ids: string[] = [];
	for (const [i, v] of viec.entries()) {
		const r = await goi(
			app,
			"viec.create",
			"mutation",
			{
				tieuDe: `${ten} việc ${i + 1}`,
				duAnId,
				batDauNgay: v.batDau,
				hanNgay: v.han,
			},
			nguoiId,
		);
		if (r.status !== 200) throw new Error(`dgt: dung viec loi ${r.message}`);
		ids.push(z.object({ id: z.string() }).parse(r.data).id);
	}
	for (const [t, s] of phuThuoc) {
		const r = await goi(
			app,
			"duAn.phuThuocTao",
			"mutation",
			{ truocId: ids[t] ?? "", sauId: ids[s] ?? "" },
			nguoiId,
		);
		if (r.status !== 200)
			throw new Error(`dgt: dung phu thuoc loi ${r.message}`);
	}
	if (moc) {
		const r = await goi(
			app,
			"duAn.mocTao",
			"mutation",
			{
				duAnId,
				ten: "Mốc",
				ngay: "2026-11-30",
				cho: moc.map((i) => ids[i] ?? ""),
			},
			nguoiId,
		);
		if (r.status !== 200) throw new Error(`dgt: dung moc loi ${r.message}`);
	}
	return duAnId;
}

const NAM_VIEC = [
	{ batDau: "2026-10-19", han: "2026-10-20" },
	{ batDau: "2026-10-21", han: "2026-10-22" },
	{ batDau: "2026-10-23", han: "2026-10-27" },
	{ batDau: "2026-10-28", han: "2026-10-29" },
	{ batDau: "2026-10-30", han: "2026-11-02" },
];

describe("dgt-thuoc", () => {
	test(
		"dgt-thuoc: đúng đáp án viết tay trên kho mẫu, chỉ đọc, gieo luỹ đẳng",
		async () => {
			const src = readFileSync(THUOC, "utf8");
			if (/\b(INSERT|UPDATE|DELETE)\b/.test(src)) {
				throw new Error("dgt: thuoc co lenh ghi");
			}
			await boMau();
			const n1 = await nguoi("dgt-1", "member");
			const n2 = await nguoi("dgt-2", "member");
			const n3 = await nguoi("dgt-3", "member");
			const n4 = await nguoi("dgt-4", "member");
			const url = process.env.TEST_DATABASE_URL ?? "";
			const mau = await gieoDuAnMau(db, {
				databaseUrl: url,
				nguon: "TEST_DATABASE_URL",
				now: NOW,
			});
			if (!mau.duAnId || !mau.taoBoiId)
				throw new Error("dgt: gieo khong ra du an");
			const nguoiMau = mau.taoBoiId;
			const khac = [n1, n2, n3, n4].filter((n) => n.id !== nguoiMau);
			const [nguoiP3, nguoiP4] = khac;
			if (!nguoiP3 || !nguoiP4) throw new Error("dgt: thieu nguoi");

			await duAnApi(nguoiMau, "P2", NAM_VIEC, [[0, 1]], null);
			await duAnApi(nguoiP3.id, "P3", NAM_VIEC, [], [4]);
			await duAnApi(
				nguoiP4.id,
				"P4",
				NAM_VIEC.map((v, i) => (i === 4 ? { batDau: v.batDau, han: null } : v)),
				[[0, 1]],
				[1],
			);
			const trong = [nguoiMau, nguoiP3.id, nguoiP4.id];

			const truoc = await demHang();
			const ra = chay(trong);
			const sau = await demHang();
			for (const bang of Object.keys(truoc) as (keyof typeof truoc)[]) {
				if (truoc[bang] !== sau[bang]) {
					throw new Error(`dgt: thuoc ghi vao kho ${bang}`);
				}
			}
			soSanh(ra, dapAn);

			await duAnApi(nguoiP4.id, "P5", NAM_VIEC.slice(0, 2), [[0, 1]], null);
			soSanh(chay(trong), dapAn.sauP5);

			const truocGieo = await demHang();
			await gieoDuAnMau(db, {
				databaseUrl: url,
				nguon: "TEST_DATABASE_URL",
				now: NOW,
			});
			if (
				(await db.duAn.count({ where: { ten: TEN_DU_AN_MAU } })) !== 1 ||
				JSON.stringify(await demHang()) !== JSON.stringify(truocGieo)
			) {
				throw new Error("dgt: gieo khong luy dang");
			}
			expect(ra.duAnDat).toBe(dapAn.duAnDat);
		},
		MA_TEST_MS,
	);
});
