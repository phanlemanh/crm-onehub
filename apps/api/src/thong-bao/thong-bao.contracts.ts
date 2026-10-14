import { noiDungThongBao } from "@crm/validation/thong-bao";
import { z } from "zod";

export const dongThongBaoRa = z.object({
	id: z.string(),
	noiDung: noiDungThongBao,
	duongDan: z.string(),
	taoLuc: z.date(),
	daDoc: z.boolean(),
});
export type DongThongBaoRa = z.infer<typeof dongThongBaoRa>;

export const chuongThongBaoOutput = z.object({
	soChuaDoc: z.number().int(),
	dong: z.array(dongThongBaoRa),
});
export type ChuongThongBaoOutput = z.infer<typeof chuongThongBaoOutput>;

export const danhSachThongBaoOutput = z.object({
	dong: z.array(dongThongBaoRa),
	conTroSau: z.string().nullable(),
});
export type DanhSachThongBaoOutput = z.infer<typeof danhSachThongBaoOutput>;

export const moThongBaoOutput = z.object({ ok: z.literal(true) });

export const docHetThongBaoOutput = z.object({ soDaDoc: z.number().int() });
