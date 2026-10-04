import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { db } from "@crm/db";
import { type GoiKiem, kiemDongDeXuat } from "@crm/validation/okr-kiem-de-xuat";
import type { DongGopY } from "@crm/validation/okr-tro-ly";
import { type BoKiem, nopDeXuatVao } from "../agent/lib/okr/nop-de-xuat";
import { donDep, gieoNguoi, moXuong } from "./support/nhac-gieo";
import { donOkr, gieoChuKy, gieoMucTieu } from "./support/okr-gieo";
import { donTroLy, gieoCauHinhAi } from "./support/tro-ly-gieo";
import {
	dongDaNop,
	moViecDeXuat,
	nguCanhCon,
} from "./support/tro-ly-phien-con";

const THUOC = resolve(
	import.meta.dir,
	"../../../_acceptance/tro-ly-okr-de-xuat/rang/so-moi-lot.mjs",
);
const TEN_THUOC = "so-moi-lot";
const CHU_SO_BANG_CHU =
	/\b(một|hai|ba|bốn|năm|sáu|bảy|tám|chín|mười|mươi|mốt|tư|lăm|trăm|linh|lẻ)\b/giu;
const khoaCu = process.env.AI_GATEWAY_API_KEY;

let nguoi = "";
let chuKy = "";
const mucTieu: string[] = [];

const boKiemBoSoMoi: BoKiem = (d, g) => {
	const kq = kiemDongDeXuat(d, g);
	return !kq.qua && kq.maLoai === "so-moi" ? { qua: true } : kq;
};

const boKiemKhongHieuChu: BoKiem = (d: DongGopY, g: GoiKiem) =>
	kiemDongDeXuat(
		{ ...d, sau: (d.sau ?? "").replace(CHU_SO_BANG_CHU, "").trim() },
		g,
	);

function dongKr(
	objectiveId: string,
	keyResultId: string,
	sau: string,
): DongGopY {
	return {
		loai: "viet-lai",
		objectiveId,
		keyResultId,
		truong: "kr.title",
		truoc: "Doanh thu kênh đối tác",
		sau,
		maVanDe: null,
		targetObjectiveId: null,
		targetKeyResultId: null,
		lyDo: "Nói rõ đích của KR.",
	};
}

async function gieoMotMucTieu(): Promise<{ objectiveId: string; kr: string }> {
	const objectiveId = await gieoMucTieu({
		cycleId: chuKy,
		chu: nguoi,
		congBo: new Date(),
		tieuDe: "Tăng doanh thu kênh đối tác",
	});
	mucTieu.push(objectiveId);
	const kr = await db.okrKeyResult.create({
		data: {
			objectiveId,
			title: "Doanh thu kênh đối tác",
			kind: "tang-toi",
			ownerUserId: nguoi,
			startValue: 2,
			targetValue: 4,
			currentValue: 2,
			unit: "tỷ đồng",
		},
	});
	return { objectiveId, kr: kr.id };
}

async function nopQua(sau: string, kiem?: BoKiem): Promise<string> {
	const { objectiveId, kr } = await gieoMotMucTieu();
	const viec = await moViecDeXuat({ objectiveId, nguoiYeuCau: nguoi });
	await nopDeXuatVao(
		{ dong: [dongKr(objectiveId, kr, sau)] },
		nguCanhCon(viec.phienGoc),
		kiem,
	);
	await dongDaNop(viec.taskId);
	const [hang] = await db.okrDeXuat.findMany({
		where: { taskId: viec.taskId },
	});
	if (!hang) throw new Error(`nop khong ghi dong: ${sau}`);
	return hang.id;
}

function doThuoc() {
	const chay = spawnSync("bun", [THUOC, "--muc-tieu", mucTieu.join(",")], {
		env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL },
		encoding: "utf8",
	});
	if (chay.status !== 0) {
		throw new Error(`${TEN_THUOC} thoat ${chay.status}: ${chay.stderr}`);
	}
	const so = new RegExp(`^${TEN_THUOC}: (\\d+) dong$`, "m").exec(chay.stdout);
	if (!so) throw new Error(`${TEN_THUOC} khong in so dong: ${chay.stdout}`);
	const id = [
		...chay.stdout.matchAll(new RegExp(`^${TEN_THUOC}: id (\\S+)`, "gm")),
	].map((m) => m[1] ?? "");
	return { so: Number(so[1]), id, ra: chay.stdout };
}

beforeAll(async () => {
	process.env.AI_GATEWAY_API_KEY = "khoa-thu";
	await moXuong();
	nguoi = (await gieoNguoi("Người gieo thước số mới")).id;
	chuKy = await gieoChuKy("dang-chay");
	await gieoCauHinhAi(new Date(Date.now() - 60_000), {
		aiOn: true,
		aiDeXuatPhamVi: "toan-cong-ty",
		aiTranThangUsd: 9,
	});
}, 30_000);

afterAll(async () => {
	if (khoaCu === undefined) delete process.env.AI_GATEWAY_API_KEY;
	else process.env.AI_GATEWAY_API_KEY = khoaCu;
	await donTroLy();
	await donOkr();
	await donDep();
}, 30_000);

describe("tro-ly-okr-duong-do", () => {
	test("so-moi-lot: thước riêng đếm dòng chờ có số mới, không lệ thuộc bộ kiểm đang đo", async () => {
		const lanh = await nopQua("Doanh thu kênh đối tác đạt 4 tỷ đồng");
		const loai = await nopQua("Doanh thu kênh đối tác đạt 9 tỷ đồng");
		const trangThai = await db.okrDeXuat.findMany({
			where: { id: { in: [lanh, loai] } },
			select: { id: true, trangThai: true, maLoai: true },
		});
		expect(
			Object.fromEntries(trangThai.map((h) => [h.id, [h.trangThai, h.maLoai]])),
		).toEqual({ [lanh]: ["cho", null], [loai]: ["bi-loai", "so-moi"] });
		const sach = doThuoc();
		expect(sach.so, `${TEN_THUOC}: kho sach ${sach.ra}`).toBe(0);

		const lot = await nopQua(
			"Doanh thu kênh đối tác đạt 7 tỷ đồng",
			boKiemBoSoMoi,
		);
		const motDong = doThuoc();
		expect(motDong.id, `${TEN_THUOC}: thieu dong ${lot}`).toEqual([lot]);
		expect(motDong.so).toBe(1);

		const chu = await nopQua(
			"Doanh thu kênh đối tác lên năm tỷ đồng",
			boKiemKhongHieuChu,
		);
		const cho = await db.okrDeXuat.findUniqueOrThrow({ where: { id: chu } });
		expect(cho.trangThai, "ban sao bo kiem khong hieu chu phai ghi cho").toBe(
			"cho",
		);
		const haiDong = doThuoc();
		expect(haiDong.id.sort(), `${TEN_THUOC}: thieu dong ${chu}`).toEqual(
			[lot, chu].sort(),
		);
		expect(haiDong.so).toBe(2);
		expect(
			haiDong.id.includes(loai),
			`${TEN_THUOC}: dem dong bi-loai ${loai}`,
		).toBe(false);
	}, 60_000);
});
