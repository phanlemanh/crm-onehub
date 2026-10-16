import { z } from "zod";

export const guiTinHieuOutput = z.object({ id: z.string(), ma: z.string() });
export type GuiTinHieuOutput = z.infer<typeof guiTinHieuOutput>;

export const dongTinHieuCuaToi = z.object({
	id: z.string(),
	so: z.number().int(),
	ma: z.string(),
	tieuDe: z.string(),
	muonLam: z.string(),
	man: z.string(),
	guiLuc: z.date(),
	daKeoVe: z.boolean(),
});
export const tinHieuCuaToiOutput = z.object({
	rows: z.array(dongTinHieuCuaToi),
});
export type TinHieuCuaToiOutput = z.infer<typeof tinHieuCuaToiOutput>;

const thamChieu = z.object({ id: z.string(), ten: z.string() });

export const dongTinHieuTatCa = dongTinHieuCuaToi.extend({
	nguoiGui: thamChieu.nullable(),
	phongBan: thamChieu.nullable(),
});
export const tinHieuTatCaOutput = z.object({
	rows: z.array(dongTinHieuTatCa),
});
export type TinHieuTatCaOutput = z.infer<typeof tinHieuTatCaOutput>;

export const xoaTinHieuOutput = z.object({ ok: z.literal(true) });
