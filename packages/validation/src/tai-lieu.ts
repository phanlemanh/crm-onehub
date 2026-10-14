import { z } from "zod";

export const LOAI_TRANG = [
	"quy-dinh",
	"chinh-sach",
	"quy-trinh",
	"bieu-mau",
	"chien-luoc",
] as const;
export type LoaiTrang = (typeof LOAI_TRANG)[number];

export const TRANG_THAI_DE_XUAT = [
	"CHO_DUYET",
	"DA_DUYET",
	"TRA_LAI",
	"CU",
] as const;
export type TrangThaiDeXuat = (typeof TRANG_THAI_DE_XUAT)[number];

export const LOAI_DE_XUAT = ["NOI_DUNG", "LUU_TRU", "KHOI_PHUC"] as const;
export type LoaiDeXuat = (typeof LOAI_DE_XUAT)[number];

export const DANG_CHO = [
	"duyet",
	"may-soan",
	"go-tay",
	"loi",
	"tra-lai",
	"chua-co-ban",
] as const;
export type DangCho = (typeof DANG_CHO)[number];

export const LOAI_SU_KIEN = [
	"TAO",
	"DE_XUAT",
	"DUYET",
	"TRA_LAI",
	"CU",
	"MAY_SOAN",
	"XAC_MINH",
	"LUU_TRU",
	"KHOI_PHUC",
] as const;
export type LoaiSuKien = (typeof LOAI_SU_KIEN)[number];

export const TAI_LIEU = {
	ten: { min: 1, max: 160 },
	lyDo: { min: 1, max: 500 },
	noiDung: { max: 200_000 },
	danhSach: { coTrang: 25 },
	diff: { tranSuaKhoi: 2_000, tranSuaTu: 2_000 },
	nap: { coKhoi: 4_000 },
	soan: { bangMoi: { hang: 3, cot: 3 } },
	tim: {
		toiThieu: 2,
		toiDa: 200,
		soDong: 20,
		benTrich: 60,
		cauToiDa: 160,
		nhacToiToiDa: 100,
		sucKhoeToiDa: 200,
	},
	slugDuPhong: "trang",
	slugGiuTruoc: ["moi", "de-xuat"],
} as const;

export function chuanNfc(s: string): string {
	return s.normalize("NFC");
}

export function gocSlug(ten: string): string {
	const s = ten
		.normalize("NFD")
		.replace(/\p{M}/gu, "")
		.replace(/đ/g, "d")
		.replace(/Đ/g, "d")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
	return s === "" ? TAI_LIEU.slugDuPhong : s;
}

function laGiuTruoc(slug: string): boolean {
	return TAI_LIEU.slugGiuTruoc.some((s) => s === slug);
}

export function sinhSlug(ten: string, daCo: ReadonlySet<string>): string {
	const g = gocSlug(ten);
	const trung = (s: string) => daCo.has(s) || laGiuTruoc(s);
	if (!trung(g)) return g;
	let n = 2;
	while (trung(`${g}-${n}`)) n += 1;
	return `${g}-${n}`;
}

export function coChuHaySo(ten: string): boolean {
	return /[\p{L}\p{N}]/u.test(ten);
}

const DUONG_TRANG =
	/^(?:\/[^/?#]+)?\/tai-lieu\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?(?:[?#].*)?$/;

export function slugTuDuongDan(den: string): string | null {
	return DUONG_TRANG.exec(den)?.[1] ?? null;
}

const deXuatId = z.string().min(1);

export const suKienChiTiet = z.discriminatedUnion("loai", [
	z.object({ loai: z.literal("TAO"), deXuatId }),
	z.object({ loai: z.literal("DE_XUAT"), deXuatId }),
	z.object({
		loai: z.literal("DUYET"),
		deXuatId,
		phienBan: z.number().int().positive(),
		diffHash: z.string().min(1),
	}),
	z.object({
		loai: z.literal("TRA_LAI"),
		deXuatId,
		lyDo: z.string().min(TAI_LIEU.lyDo.min).max(TAI_LIEU.lyDo.max),
	}),
	z.object({ loai: z.literal("CU"), deXuatId, vi: z.string().min(1) }),
	z.object({
		loai: z.literal("MAY_SOAN"),
		deXuatId: deXuatId.nullable(),
		nguonId: z.string().min(1),
		phien: z.string().min(1),
		maModel: z.string().min(1),
		nhanKhoa: z.enum(["rieng", "chung"]),
		tokenVao: z.number().int().nonnegative(),
		tokenRa: z.number().int().nonnegative(),
		chiPhiUsd: z.number().nonnegative().nullable(),
		soLanBac: z.number().int().nonnegative(),
	}),
	z.object({ loai: z.literal("XAC_MINH"), den: z.iso.date().nullable() }),
	z.object({ loai: z.literal("LUU_TRU"), deXuatId }),
	z.object({ loai: z.literal("KHOI_PHUC"), deXuatId }),
]);

export type SuKienChiTiet = z.infer<typeof suKienChiTiet>;

export function parseSuKienChiTiet(v: unknown): SuKienChiTiet {
	const r = suKienChiTiet.safeParse(v);
	if (!r.success)
		throw new Error(`sự kiện tài liệu không đọc được: ${r.error.message}`);
	return r.data;
}

const loaiDeXuat = z.enum(LOAI_DE_XUAT);

export function parseLoaiDeXuat(v: unknown): LoaiDeXuat {
	const r = loaiDeXuat.safeParse(v);
	if (!r.success)
		throw new Error(`loại đề xuất tài liệu không đọc được: ${String(v)}`);
	return r.data;
}
