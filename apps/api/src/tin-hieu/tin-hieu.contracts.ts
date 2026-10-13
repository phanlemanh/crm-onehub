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

export const xoaTinHieuOutput = z.object({ ok: z.literal(true) });
