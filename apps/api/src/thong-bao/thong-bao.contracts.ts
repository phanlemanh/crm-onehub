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

export const chuongOutput = z.object({
	soChuaDoc: z.number().int(),
	dong: z.array(dongThongBaoRa),
});
export type ChuongOutput = z.infer<typeof chuongOutput>;

export const danhSachOutput = z.object({
	dong: z.array(dongThongBaoRa),
	conTroSau: z.string().nullable(),
});
export type DanhSachOutput = z.infer<typeof danhSachOutput>;

export const moMotOutput = z.object({ ok: z.literal(true) });

export const docHetOutput = z.object({ soDaDoc: z.number().int() });
