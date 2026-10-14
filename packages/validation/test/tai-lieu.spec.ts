import { describe, expect, test } from "bun:test";
import {
	chuanNfc,
	coChuHaySo,
	LOAI_DE_XUAT,
	LOAI_SU_KIEN,
	LOAI_TRANG,
	parseLoaiDeXuat,
	parseSuKienChiTiet,
	sinhSlug,
	slugTuDuongDan,
	TAI_LIEU,
	TRANG_THAI_DE_XUAT,
} from "../src/tai-lieu";

const SLUG: [string, string[], string][] = [
	["Quy định hoa hồng", [], "quy-dinh-hoa-hong"],
	["Đối tác Đà Nẵng", [], "doi-tac-da-nang"],
	["Quy định hoa hồng", ["quy-dinh-hoa-hong"], "quy-dinh-hoa-hong-2"],
	[
		"Quy định hoa hồng",
		["quy-dinh-hoa-hong", "quy-dinh-hoa-hong-2"],
		"quy-dinh-hoa-hong-3",
	],
	["  ✨ !!! ", [], "trang"],
	["  ✨ !!! ", ["trang"], "trang-2"],
];

const SLUG_TRUNG_ROUTE: [string, string[], string][] = [
	["Mới", [], "moi-2"],
	["Mới", ["moi-2"], "moi-3"],
	["Đề xuất", [], "de-xuat-2"],
	["Mới quy định", [], "moi-quy-dinh"],
];

describe("tai-lieu", () => {
	for (const [ten, daCo, mong] of SLUG)
		test(`slug ${ten} ${daCo.length}`, () =>
			expect(sinhSlug(ten, new Set(daCo))).toBe(mong));

	for (const [ten, daCo, mong] of SLUG_TRUNG_ROUTE)
		test(`slug trung route ${ten} ${daCo.length}`, () => {
			const ra = sinhSlug(ten, new Set(daCo));
			if (TAI_LIEU.slugGiuTruoc.some((s) => s === ra))
				throw new Error(`slug trung route: ${ra}`);
			expect(ra).toBe(mong);
		});

	test("slug từ tên NFD giống tên NFC", () =>
		expect(sinhSlug("Đối tác Đà Nẵng".normalize("NFD"), new Set())).toBe(
			"doi-tac-da-nang",
		));

	test("ten co chu hay so", () => {
		expect(coChuHaySo("  ✨ !!! ")).toBe(false);
		expect(coChuHaySo("   ")).toBe(false);
		expect(coChuHaySo("Đ")).toBe(true);
		expect(coChuHaySo("2026")).toBe(true);
		expect(coChuHaySo("日本")).toBe(true);
	});

	test("slug tu duong dan trang", () => {
		expect(slugTuDuongDan("/tai-lieu/quy-dinh-hoa-hong")).toBe(
			"quy-dinh-hoa-hong",
		);
		expect(slugTuDuongDan("/onehub/tai-lieu/bieu-mau-2#muc")).toBe(
			"bieu-mau-2",
		);
		expect(slugTuDuongDan("https://vi.wikipedia.org/wiki/Đà_Nẵng")).toBe(null);
		expect(slugTuDuongDan("/tai-lieu/de-xuat/abc")).toBe(null);
		expect(slugTuDuongDan("/contacts/abc")).toBe(null);
	});

	test("nfc", () => {
		const nfd = "hoà".normalize("NFD");
		expect(nfd).not.toBe("hoà");
		expect(chuanNfc(nfd)).toBe("hoà");
	});

	test("hằng số", () => {
		expect(LOAI_TRANG).toEqual([
			"quy-dinh",
			"chinh-sach",
			"quy-trinh",
			"bieu-mau",
			"chien-luoc",
		]);
		expect(TRANG_THAI_DE_XUAT).toEqual([
			"CHO_DUYET",
			"DA_DUYET",
			"TRA_LAI",
			"CU",
		]);
		expect(LOAI_SU_KIEN).toEqual([
			"TAO",
			"DE_XUAT",
			"DUYET",
			"TRA_LAI",
			"CU",
			"MAY_SOAN",
			"XAC_MINH",
			"LUU_TRU",
			"KHOI_PHUC",
		]);
		expect(LOAI_DE_XUAT).toEqual(["NOI_DUNG", "LUU_TRU", "KHOI_PHUC"]);
		expect(TAI_LIEU.ten).toEqual({ min: 1, max: 160 });
		expect(TAI_LIEU.lyDo).toEqual({ min: 1, max: 500 });
		expect(TAI_LIEU.noiDung.max).toBe(200_000);
		expect(TAI_LIEU.diff).toEqual({ tranSuaKhoi: 2_000, tranSuaTu: 2_000 });
	});

	test("sự kiện đọc được theo loại", () => {
		expect(
			parseSuKienChiTiet({
				loai: "DUYET",
				deXuatId: "dx1",
				phienBan: 2,
				diffHash: "ab",
			}),
		).toEqual({ loai: "DUYET", deXuatId: "dx1", phienBan: 2, diffHash: "ab" });
		expect(
			parseSuKienChiTiet({ loai: "TRA_LAI", deXuatId: "dx1", lyDo: "thiếu" }),
		).toEqual({ loai: "TRA_LAI", deXuatId: "dx1", lyDo: "thiếu" });
		expect(
			parseSuKienChiTiet({ loai: "CU", deXuatId: "dx1", vi: "dx2" }).loai,
		).toBe("CU");
		expect(parseSuKienChiTiet({ loai: "TAO", deXuatId: "dx1" }).loai).toBe(
			"TAO",
		);
		expect(parseSuKienChiTiet({ loai: "DE_XUAT", deXuatId: "dx1" }).loai).toBe(
			"DE_XUAT",
		);
	});

	test("sự kiện hỏng thì ném, không nuốt", () => {
		expect(() =>
			parseSuKienChiTiet({ loai: "DUYET", deXuatId: "dx1", phienBan: "2" }),
		).toThrow("sự kiện tài liệu không đọc được");
		expect(() => parseSuKienChiTiet({ loai: "XOA", deXuatId: "dx1" })).toThrow(
			"sự kiện tài liệu không đọc được",
		);
		expect(() => parseSuKienChiTiet(null)).toThrow(
			"sự kiện tài liệu không đọc được",
		);
	});

	test("sự kiện lưu trữ và khôi phục mang mã đề xuất", () => {
		expect(parseSuKienChiTiet({ loai: "LUU_TRU", deXuatId: "dx1" })).toEqual({
			loai: "LUU_TRU",
			deXuatId: "dx1",
		});
		expect(
			parseSuKienChiTiet({ loai: "KHOI_PHUC", deXuatId: "dx1" }).loai,
		).toBe("KHOI_PHUC");
		expect(() => parseSuKienChiTiet({ loai: "LUU_TRU" })).toThrow(
			"sự kiện tài liệu không đọc được",
		);
	});

	test("loại đề xuất đọc ở biên, loại lạ thì ném", () => {
		for (const l of LOAI_DE_XUAT) expect(parseLoaiDeXuat(l)).toBe(l);
		expect(() => parseLoaiDeXuat("XOA")).toThrow(
			"loại đề xuất tài liệu không đọc được",
		);
	});
});
