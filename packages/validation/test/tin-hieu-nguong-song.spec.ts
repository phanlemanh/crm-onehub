import { describe, expect, test } from "bun:test";
import {
	bocPhanHoiKeoVe,
	CHO_TIN_HIEU,
	coChoSauGom,
	type DongDem,
	type DuongTinHieu,
	demNguongSong,
	dongDemTuKeoVe,
	dongDemTuTatCa,
	TIN_HIEU,
	tepTuBanGhi,
} from "../src/tin-hieu";

const MS_NGAY = 86_400_000;
const NOW = new Date("2026-11-12T00:00:00.000Z");
const truoc = (ms: number) => new Date(NOW.getTime() - ms).toISOString();
const pb = (khoa: string, ten = khoa) => ({ khoa, ten });

function dong(id: string, tuoiMs: number, phong: DongDem["phongBan"]): DongDem {
	return { id, luc: truoc(tuoiMs), phongBan: phong };
}

describe("dem-nguong-song", () => {
	test("bien 30 ngay: dung 30 ngay vao ky, them 1 ms thi ra", () => {
		const vao = demNguongSong(
			[dong("a", TIN_HIEU.ngayDem * MS_NGAY, pb("p1"))],
			NOW,
			new Set(),
		);
		expect(vao.trongKy, "bien 30 ngay lech dong tong ket").toBe(1);
		const ra = demNguongSong(
			[dong("a", TIN_HIEU.ngayDem * MS_NGAY + 1, pb("p1"))],
			NOW,
			new Set(),
		);
		expect(ra.trongKy, "bien 30 ngay lech dong tong ket").toBe(0);
	});

	test("bien 7 ngay: dung 7 ngay chua qua han, them 1 ms thi qua han", () => {
		const chua = demNguongSong(
			[dong("a", TIN_HIEU.ngayCoCho * MS_NGAY, pb("p1"))],
			NOW,
			new Set(),
		);
		expect(chua.quaHan).toBe(0);
		const qua = demNguongSong(
			[dong("a", TIN_HIEU.ngayCoCho * MS_NGAY + 1, pb("p1"))],
			NOW,
			new Set(),
		);
		expect(qua.quaHan).toBe(1);
		expect(qua.chuaCoCho).toBe(1);
	});

	test("phong ban: null vao khongPhong, cung khoa dem mot, khac khoa cung ten dem hai", () => {
		const kq = demNguongSong(
			[
				dong("a", MS_NGAY, null),
				dong("b", MS_NGAY, pb("p1", "Kinh doanh")),
				dong("c", MS_NGAY, pb("p1", "Kinh doanh")),
				dong("d", MS_NGAY, pb("p2", "Kinh doanh")),
			],
			NOW,
			new Set(),
		);
		expect(kq.khongPhong).toBe(1);
		expect(kq.soPhong, "tin hieu khong phong ban bi dem la mot phong ban").toBe(
			2,
		);
		expect(kq.theoPhong).toEqual([
			["Kinh doanh", 2],
			["Kinh doanh", 1],
		]);
		expect(kq.trongKy).toBe(4);
	});

	test("co cho: qua han co trong tap khong tinh, ngoai tap thi tinh, tap rong thi bang qua han", () => {
		const ds = [
			dong("crm-1", 10 * MS_NGAY, pb("p1")),
			dong("crm-2", 12 * MS_NGAY, pb("p1")),
			dong("crm-3", MS_NGAY, pb("p1")),
		];
		const coMot = demNguongSong(ds, NOW, new Set(["crm-1"]));
		expect([coMot.quaHan, coMot.chuaCoCho]).toEqual([2, 1]);
		const rong = demNguongSong(ds, NOW, new Set());
		expect(rong.chuaCoCho).toBe(rong.quaHan);
	});

	test("ngoai ky 30 ngay van tinh qua han", () => {
		const kq = demNguongSong(
			[dong("crm-1", 40 * MS_NGAY, pb("p1"))],
			NOW,
			new Set(),
		);
		expect([kq.trongKy, kq.soPhong, kq.quaHan, kq.chuaCoCho]).toEqual([
			0, 0, 1, 1,
		]);
	});
});

describe("co-cho-sau-gom", () => {
	const banGhi = (cho: DuongTinHieu["cho"], i: number): DuongTinHieu => ({
		id: `crm-${i}`,
		loai: "tin-hieu",
		tieu_de: "t",
		luc: NOW.toISOString(),
		cho,
		nhom: null,
		ten_nhom: null,
		ly_do: null,
		ho_so_phu: null,
		hang: null,
		ho_so: null,
		trang_thai: null,
		cau: "c",
	});

	test("quet du bay gia tri cho: chi chua-gom nam ngoai tap", () => {
		const ds = CHO_TIN_HIEU.map((c, i) => banGhi(c, i));
		const tap = coChoSauGom({ kieu: "co", banGhi: ds });
		for (const [i, c] of CHO_TIN_HIEU.entries())
			expect(tap.has(`crm-${i}`), `cho ${c}`).toBe(c !== "chua-gom");
		expect(CHO_TIN_HIEU.length).toBe(7);
	});

	test("ban ve khong co hay hong thi tap rong", () => {
		expect(coChoSauGom({ kieu: "khong-co" }).size).toBe(0);
		expect(coChoSauGom({ kieu: "hong", loi: "x" }).size).toBe(0);
	});
});

describe("dong-dem", () => {
	const tep = (so: number) =>
		tepTuBanGhi({
			tieuDe: `t${so}`,
			muonLam: "m",
			daXayRa: `t${so}`,
			man: "/",
			guiLuc: new Date(truoc(MS_NGAY)),
		});

	test("tu keo ve: co ma phong ban thi khoa la ma, vang thi khoa la ten", () => {
		const ds = bocPhanHoiKeoVe([
			{ id: "crm-1", tep: tep(1), phongBan: "Kinh doanh", phongBanId: "p1" },
			{ id: "crm-2", tep: tep(2), phongBan: "Kinh doanh" },
			{ id: "crm-3", tep: tep(3), phongBan: null, phongBanId: null },
		]).tep;
		expect(dongDemTuKeoVe(ds).map((d) => d.phongBan)).toEqual([
			{ khoa: "p1", ten: "Kinh doanh" },
			{ khoa: "Kinh doanh", ten: "Kinh doanh" },
			null,
		]);
		expect(dongDemTuKeoVe(ds)[0]?.luc).toBe(tep(1).luc);
	});

	test("tu danh sach: khoa la ma phong ban, luc la gio gui", () => {
		const guiLuc = new Date(truoc(2 * MS_NGAY));
		expect(
			dongDemTuTatCa([
				{ ma: "crm-9", guiLuc, phongBan: { id: "p1", ten: "Kinh doanh" } },
				{ ma: "crm-8", guiLuc: guiLuc.toISOString(), phongBan: null },
			]),
		).toEqual([
			{
				id: "crm-9",
				luc: guiLuc.toISOString(),
				phongBan: { khoa: "p1", ten: "Kinh doanh" },
			},
			{ id: "crm-8", luc: guiLuc.toISOString(), phongBan: null },
		]);
	});
});
