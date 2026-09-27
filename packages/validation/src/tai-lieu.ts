import { z } from "zod";

export const LOAI_TRANG = [
	"quy-dinh",
	"chinh-sach",
	"quy-trinh",
	"bieu-mau",
] as const;
export type LoaiTrang = (typeof LOAI_TRANG)[number];

export const TRANG_THAI_DE_XUAT = [
	"CHO_DUYET",
	"DA_DUYET",
	"TRA_LAI",
	"CU",
] as const;
export type TrangThaiDeXuat = (typeof TRANG_THAI_DE_XUAT)[number];

export const LOAI_SU_KIEN = [
	"TAO",
	"DE_XUAT",
	"DUYET",
	"TRA_LAI",
	"CU",
] as const;
export type LoaiSuKien = (typeof LOAI_SU_KIEN)[number];

export const TAI_LIEU = {
	ten: { min: 1, max: 160 },
	lyDo: { min: 1, max: 500 },
	noiDung: { max: 200_000 },
	danhSach: { coTrang: 25 },
	diff: { tranMs: 1_500 },
	slugDuPhong: "trang",
} as const;

export function chuanNfc(s: string): string {
	return s.normalize("NFC");
}

function goc(ten: string): string {
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

export function sinhSlug(ten: string, daCo: ReadonlySet<string>): string {
	const g = goc(ten);
	if (!daCo.has(g)) return g;
	let n = 2;
	while (daCo.has(`${g}-${n}`)) n += 1;
	return `${g}-${n}`;
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
]);

export type SuKienChiTiet = z.infer<typeof suKienChiTiet>;

export function parseSuKienChiTiet(v: unknown): SuKienChiTiet {
	const r = suKienChiTiet.safeParse(v);
	if (!r.success)
		throw new Error(`sự kiện tài liệu không đọc được: ${r.error.message}`);
	return r.data;
}
