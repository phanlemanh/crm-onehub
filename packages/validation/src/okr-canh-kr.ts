import { z } from "zod";
import { ngayLich } from "./okr-chu-ky";

export const OKR_CANH_KR = {
	tieuDe: { min: 2, max: 200 },
	url: { max: 2000 },
	ghiChu: { max: 300 },
	loiNhan: { min: 1, max: 500 },
	nguoiNhan: { min: 1, max: 5 },
} as const;

export const LOAI_VIEC_KR = ["viec", "chien-dich", "ke-hoach"] as const;
export type LoaiViecKr = (typeof LOAI_VIEC_KR)[number];

const ma = z.string().trim().min(1).max(120);

export const duongDanBangChung = z
	.string()
	.trim()
	.min(1)
	.max(OKR_CANH_KR.url.max)
	.refine((s) => {
		try {
			const u = new URL(s);
			return u.protocol === "http:" || u.protocol === "https:";
		} catch {
			return false;
		}
	});

const tieuDeViec = z
	.string()
	.trim()
	.min(OKR_CANH_KR.tieuDe.min)
	.max(OKR_CANH_KR.tieuDe.max);

export const themViecInput = z.object({
	keyResultId: ma,
	tieuDe: tieuDeViec,
	nguoiLamUserId: ma,
	hanNgay: ngayLich.nullable(),
});
export type ThemViecInput = z.infer<typeof themViecInput>;

export const suaViecInput = z.object({
	id: ma,
	tieuDe: tieuDeViec.optional(),
	nguoiLamUserId: ma.optional(),
	hanNgay: ngayLich.nullable().optional(),
});
export type SuaViecInput = z.infer<typeof suaViecInput>;

export const danhDauViecInput = z.object({ id: ma, xong: z.boolean() });
export type DanhDauViecInput = z.infer<typeof danhDauViecInput>;

export const idInput = z.object({ id: ma });
export type IdInput = z.infer<typeof idInput>;

export const ganSangKienInput = z.object({
	keyResultId: ma,
	loai: z.enum(["chien-dich", "ke-hoach"]),
	banGhiId: ma,
});
export type GanSangKienInput = z.infer<typeof ganSangKienInput>;

export const bangChungVao = z.object({
	url: duongDanBangChung,
	ghiChu: z.string().trim().max(OKR_CANH_KR.ghiChu.max),
});
export type BangChungVao = z.infer<typeof bangChungVao>;

export const themBangChungInput = bangChungVao.extend({ keyResultId: ma });
export type ThemBangChungInput = z.infer<typeof themBangChungInput>;

export const guiGhiNhanInput = z.object({
	objectiveId: ma,
	keyResultId: ma.nullable(),
	nguoiNhan: z
		.array(z.string().min(1))
		.min(OKR_CANH_KR.nguoiNhan.min)
		.max(OKR_CANH_KR.nguoiNhan.max)
		.refine((a) => new Set(a).size === a.length),
	loiNhan: z
		.string()
		.trim()
		.min(OKR_CANH_KR.loiNhan.min)
		.max(OKR_CANH_KR.loiNhan.max),
});
export type GuiGhiNhanInput = z.infer<typeof guiGhiNhanInput>;
