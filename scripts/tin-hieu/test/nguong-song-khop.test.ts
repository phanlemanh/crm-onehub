import { afterAll, describe, expect, test } from "bun:test";
import { copyFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { tinHieuMessages } from "../../../apps/app/lib/messages/tin-hieu.ts";
import { ghepTatCa } from "../../../apps/app/lib/tin-hieu/tat-ca.ts";
import {
	bocPhanHoiKeoVe,
	idTep,
	tepTuBanGhi,
} from "../../../packages/validation/src/tin-hieu.ts";
import { chayKeoVe } from "../keo-ve.ts";

const MAU = path.join(
	import.meta.dir,
	"..",
	"..",
	"..",
	"apps",
	"app",
	"test",
	"fixtures",
	"tin-hieu",
	"LO-TRINH.mau.html",
);
const NOW = new Date("2026-11-12T00:00:00Z");
const MS_NGAY = 86_400_000;
const m = tinHieuMessages("vi");
const tam: string[] = [];
afterAll(() => {
	for (const d of tam) rmSync(d, { recursive: true, force: true });
});

type Mau = {
	so: number;
	tuoiNgay: number;
	phongBan: { id: string; ten: string } | null;
	daKeoVe: boolean;
};

function hangTatCa(x: Mau) {
	return {
		so: x.so,
		guiLuc: new Date(NOW.getTime() - x.tuoiNgay * MS_NGAY),
		daKeoVe: x.daKeoVe,
		phongBan: x.phongBan,
	};
}

function tepKeoVe(ds: Mau[]) {
	return bocPhanHoiKeoVe(
		ds.map((x) => ({
			id: idTep(x.so),
			tep: tepTuBanGhi({
				tieuDe: `gap ${x.so}`,
				muonLam: `muon ${x.so}`,
				daXayRa: `gap ${x.so}`,
				man: "/okr",
				guiLuc: hangTatCa(x).guiLuc,
			}),
			phongBan: x.phongBan?.ten ?? null,
			phongBanId: x.phongBan?.id ?? null,
		})),
	);
}

function mayChu(ds: Mau[]) {
	const sv = Bun.serve({
		port: 0,
		fetch: (req) =>
			req.headers.get("x-api-key") === "khoa-thu"
				? Response.json(tepKeoVe(ds))
				: new Response("{}", { status: 401 }),
	});
	return { url: `http://localhost:${sv.port}`, dung: () => sv.stop(true) };
}

async function baSoCuaLenh(ds: Mau[], coBanVe: boolean) {
	const r = mkdtempSync(path.join(tmpdir(), "mth-khop-"));
	tam.push(r);
	if (coBanVe) copyFileSync(MAU, path.join(r, "LO-TRINH.html"));
	const sv = mayChu(ds);
	const kq = await chayKeoVe({
		root: r,
		url: sv.url,
		key: "khoa-thu",
		now: NOW,
	});
	sv.dung();
	expect(kq.ma).toBe(0);
	const chu = kq.tongKet.join("\n");
	const a = chu.match(/trong \d+ ngày: (\d+) tín hiệu từ (\d+) phòng ban/);
	const b = chu.match(/gửi quá \d+ ngày: (\d+) · chưa có chỗ sau gom: (\d+)/);
	expect(a, "dong tong ket doi khuon").not.toBeNull();
	expect(b, "dong tong ket doi khuon").not.toBeNull();
	return {
		trongKy: Number(a?.[1]),
		soPhong: Number(a?.[2]),
		quaHan: Number(b?.[1]),
		chuaCoCho: Number(b?.[2]),
	};
}

function baSoCuaTrang(ds: Mau[], coBanVe: boolean) {
	const html = coBanVe ? Bun.file(MAU).text() : Promise.resolve(null);
	return html.then(
		(h) => ghepTatCa({ rows: ds.map(hangTatCa), html: h, now: NOW, m }).baSo,
	);
}

const KD = { id: "pb-kd", ten: "Kinh doanh" };
const NS = { id: "pb-ns", ten: "Nhân sự" };
const KD2 = { id: "pb-kd-2", ten: "Kinh doanh" };

const BO: Record<string, Mau[]> = {
	"khong phong ban": [
		{ so: 1, tuoiNgay: 2, phongBan: KD, daKeoVe: true },
		{ so: 2, tuoiNgay: 3, phongBan: null, daKeoVe: true },
		{ so: 3, tuoiNgay: 40, phongBan: NS, daKeoVe: true },
	],
	"qua 7 ngay da co cho": [
		{ so: 1, tuoiNgay: 9, phongBan: KD, daKeoVe: true },
		{ so: 2, tuoiNgay: 10, phongBan: NS, daKeoVe: true },
		{ so: 4, tuoiNgay: 12, phongBan: NS, daKeoVe: true },
		{ so: 5, tuoiNgay: 1, phongBan: null, daKeoVe: false },
	],
	"hai phong ban trung ten": [
		{ so: 1, tuoiNgay: 2, phongBan: KD, daKeoVe: true },
		{ so: 2, tuoiNgay: 2, phongBan: KD2, daKeoVe: true },
		{ so: 3, tuoiNgay: 8, phongBan: KD2, daKeoVe: true },
	],
};

describe("mth-khop", () => {
	for (const [ten, ds] of Object.entries(BO))
		test(`mth-khop: ${ten} — trang va lenh keo ve ra cung ba so`, async () => {
			const lenh = await baSoCuaLenh(ds, true);
			const trang = await baSoCuaTrang(ds, true);
			expect(
				[trang.trongKy, trang.soPhong, trang.chuaCoCho],
				"trang va lenh keo ve dem khac nhau",
			).toEqual([lenh.trongKy, lenh.soPhong, lenh.chuaCoCho]);
		});

	test("mth-khop: hai phong ban trung ten dem la hai o ca hai ben", async () => {
		const ds = BO["hai phong ban trung ten"] ?? [];
		expect((await baSoCuaLenh(ds, true)).soPhong).toBe(2);
		expect((await baSoCuaTrang(ds, true)).soPhong).toBe(2);
	});

	test("mth-khop: khong ban ve — lenh tinh moi tin hieu qua han la chua co cho, trang khong in so (chenh lech da khai)", async () => {
		const ds = BO["qua 7 ngay da co cho"] ?? [];
		const lenh = await baSoCuaLenh(ds, false);
		const trang = await baSoCuaTrang(ds, false);
		expect(lenh.chuaCoCho).toBe(lenh.quaHan);
		expect(trang.chuaCoCho).toBeNull();
		expect([trang.trongKy, trang.soPhong]).toEqual([
			lenh.trongKy,
			lenh.soPhong,
		]);
	});
});
