import { describe, expect, test } from "bun:test";
import type { Locale } from "@crm/ui/lib/locale";
import { BAC_GHI_DANH, MA_CHI_SO } from "@crm/validation/okr-chi-so";
import { LY_DO_DOC_SHEET } from "@crm/validation/okr-nguon";
import { okrSoMessages } from "@/lib/messages/okr-so";

const DON_VI = ["thoa-thuan", "cuoc-goi", "buoc", "ca-nhan", "thu"] as const;
const NGUON = ["tay", "crm", "api", "bangTinh"] as const;
const LOCALE: readonly Locale[] = ["vi", "en"];
const CO_DAU = /[à-ỹ]/i;

const TRANG_THAI = {
	"ST-hopthoai-nguon-tay": ["trangThai.hopThoai.oNguon", "nguon.tay.nhan"],
	"ST-hopthoai-nguon-crm": [
		"trangThai.hopThoai.oChiSo",
		"phamVi.nhan",
		"phamVi.toan-cong-ty",
		"phamVi.bo-phan",
		"phamVi.phong-ban",
		"phamVi.nguoi",
		"phamVi.tim",
		"phamVi.khongKhop",
		"trangThai.hopThoai.oBac",
		"nguon.crm.nhan",
		"trangThai.hopThoai.crmKhongHopKieu",
	],
	"ST-hopthoai-xemtruoc-dangtai": ["trangThai.hopThoai.xemTruoc.dangDem"],
	"ST-hopthoai-xemtruoc-co": ["trangThai.hopThoai.xemTruoc.toiHomNay"],
	"ST-hopthoai-xemtruoc-loi": ["trangThai.hopThoai.xemTruoc.loi", "thuLai"],
	"ST-hopthoai-nguon-api": [
		"nguon.api.nhan",
		"trangThai.hopThoai.api.maKr",
		"trangThai.hopThoai.api.lenhMau",
		"trangThai.hopThoai.api.moTa",
		"trangThai.hopThoai.api.caiDat",
	],
	"ST-hopthoai-nguon-sheets": [
		"nguon.bangTinh.nhan",
		"trangThai.hopThoai.sheets.oDuongDan",
		"trangThai.hopThoai.sheets.oO",
		"trangThai.hopThoai.sheets.goiYO",
		"trangThai.hopThoai.sheets.saiO",
		"trangThai.hopThoai.sheets.saiDuongDan",
		"trangThai.hopThoai.sheets.chiaSe",
		"trangThai.hopThoai.sheets.diaChiChiaSe",
	],
	"ST-hopthoai-sheets-dangdoc": ["trangThai.hopThoai.sheets.dangDoc"],
	"ST-hopthoai-sheets-doc-duoc": ["trangThai.hopThoai.sheets.docDuoc"],
	"ST-hopthoai-sheets-loi": [
		...LY_DO_DOC_SHEET.map((l) => `trangThai.hopThoai.sheets.lyDo.${l}`),
		"trangThai.hopThoai.sheets.docLai",
	],
	"ST-hopthoai-sheets-tat": ["trangThai.hopThoai.sheets.tat"],
	"ST-hopthoai-khoa": [
		"trangThai.hopThoai.khoa.chuThich",
		"trangThai.hopThoai.khoa.themDoCanh",
	],
	"ST-bangkr-dau-nguon": ["dau.crm", "dau.api", "dau.bangTinh"],
	"ST-bangkr-do-canh": ["trangThai.bangKr.doCanh", "trangThai.bangKr.moSo"],
	"ST-bangkr-chua-chup": [
		"trangThai.bangKr.chuaChup",
		"trangThai.bangKr.chuaGhiApi",
	],
	"ST-bangkr-chi-okr": ["trangThai.bangKr.chiOkr"],
	"ST-so-dangtai": ["trangThai.so.dangTai"],
	"ST-so-co": [
		"trangThai.so.tieuDe",
		"trangThai.so.khoang",
		"trangThai.so.daChup",
		"trangThai.so.banGhi",
		"trangThai.so.lichSu",
		"trangThai.so.cotBanGhi",
		"trangThai.so.cotNgay",
		"trangThai.so.cotSo",
		"trangThai.so.xemThem",
	],
	"ST-so-rong": MA_CHI_SO.map((ma) => `chiSo.${ma}.rong`),
	"ST-so-lech": ["trangThai.so.lech"],
	"ST-so-loi": ["trangThai.so.loi", "thuLai"],
	"ST-so-api": [
		"trangThai.so.lanGhi",
		"trangThai.so.cotNgay",
		"trangThai.so.cotSo",
		"trangThai.so.cotNguoiCamKhoa",
		"trangThai.so.chuaGhi",
	],
	"ST-capnhat-may": ["trangThai.capNhat.soTu"],
	"ST-capnhat-do-canh": ["trangThai.capNhat.soMay"],
} satisfies Record<string, readonly string[]>;

type GiaTri = string | ((...doiSo: string[]) => string);
type Nhanh = { readonly [khoa: string]: GiaTri | Nhanh };

function phang(o: Nhanh, tien = ""): [string, GiaTri][] {
	return Object.entries(o).flatMap(([k, v]): [string, GiaTri][] =>
		v instanceof Function || !(v instanceof Object)
			? [[`${tien}${k}`, v]]
			: phang(v, `${tien}${k}.`),
	);
}

const PHANG: ReadonlyMap<Locale, ReadonlyMap<string, GiaTri>> = new Map(
	LOCALE.map((locale) => [locale, new Map(phang(okrSoMessages(locale)))]),
);

function lay(locale: Locale, duong: string): string | undefined {
	const v = PHANG.get(locale)?.get(duong);
	return v instanceof Function ? v("12", "15", "25/10") : v;
}

function thieu(duong: readonly string[]): string[] {
	return LOCALE.flatMap((locale) =>
		duong.filter((d) => !lay(locale, d)?.trim()).map((d) => `${locale}:${d}`),
	);
}

function khongDoiTieng(duong: readonly string[]): string[] {
	return duong.filter((d) => lay("vi", d) === lay("en", d));
}

function khongDau(duong: readonly string[]): string[] {
	return duong.filter((d) => !CO_DAU.test(lay("vi", d) ?? ""));
}

describe("chữ của số OKR", () => {
	test("bảy chỉ số: nhãn và định nghĩa một dòng ở cả hai tiếng, khác nhau, tiếng Việt có dấu", () => {
		const duong = MA_CHI_SO.flatMap((ma) => [
			`chiSo.${ma}.nhan`,
			`chiSo.${ma}.dinhNghia`,
		]);
		expect(thieu(duong)).toEqual([]);
		expect(khongDoiTieng(duong)).toEqual([]);
		expect(khongDau(duong)).toEqual([]);
		expect(duong.filter((d) => lay("vi", d)?.includes("\n"))).toEqual([]);
	});

	test("danh mục chữ không thừa mã ngoài bảy chỉ số", () => {
		for (const locale of LOCALE)
			expect(Object.keys(okrSoMessages(locale).chiSo)).toEqual([...MA_CHI_SO]);
	});

	test("bốn bậc ghi danh có nhãn và định nghĩa", () => {
		const duong = BAC_GHI_DANH.flatMap((b) => [
			`bac.${b}.nhan`,
			`bac.${b}.dinhNghia`,
		]);
		expect(thieu(duong)).toEqual([]);
		expect(khongDoiTieng(duong)).toEqual([]);
		expect(khongDau(duong)).toEqual([]);
		for (const locale of LOCALE)
			expect(Object.keys(okrSoMessages(locale).bac)).toEqual([...BAC_GHI_DANH]);
	});

	test("bốn nguồn có nhãn và mô tả", () => {
		const duong = NGUON.flatMap((n) => [`nguon.${n}.nhan`, `nguon.${n}.moTa`]);
		expect(thieu(duong)).toEqual([]);
		expect(
			khongDoiTieng(duong.filter((d) => d !== "nguon.bangTinh.nhan")),
		).toEqual([]);
	});

	test("năm đơn vị đếm ghép số ở cả hai tiếng", () => {
		const duong = DON_VI.map((d) => `donVi.${d}`);
		expect(thieu(duong)).toEqual([]);
		expect(khongDoiTieng(duong)).toEqual([]);
		expect(okrSoMessages("en").donVi["thoa-thuan"]("1")).toBe("1 deal");
		expect(okrSoMessages("vi").donVi["thoa-thuan"]("12")).toBe("12 thoả thuận");
	});

	test("đủ hai mươi tư trạng thái của đặc tả UX", () => {
		expect(Object.keys(TRANG_THAI)).toHaveLength(24);
		const vang = Object.entries(TRANG_THAI).flatMap(([st, duong]) =>
			thieu(duong).map((d) => `${st} ${d}`),
		);
		expect(vang).toEqual([]);
	});

	test("chữ của trạng thái đổi theo tiếng, trừ dấu nguồn", () => {
		const duong = [...new Set(Object.values(TRANG_THAI).flat())].filter(
			(d) => !d.startsWith("dau.") && d !== "nguon.bangTinh.nhan",
		);
		expect(khongDoiTieng(duong)).toEqual([]);
	});

	test("khoá của sheets.lyDo khớp đúng LY_DO_DOC_SHEET, cả hai tiếng", () => {
		for (const locale of LOCALE)
			expect(
				Object.keys(okrSoMessages(locale).trangThai.hopThoai.sheets.lyDo),
			).toEqual([...LY_DO_DOC_SHEET]);
	});
});
