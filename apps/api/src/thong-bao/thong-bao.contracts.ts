import {
	LOAI_THONG_BAO,
	MUC_LOAI,
	noiDungThongBao,
} from "@crm/validation/thong-bao";
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

export const caiDatLoaiRa = z.object({
	loai: z.enum(LOAI_THONG_BAO),
	muc: z.enum(MUC_LOAI),
	dayRa: z.boolean(),
	macDinh: z.boolean(),
});
export type CaiDatLoaiRa = z.infer<typeof caiDatLoaiRa>;

export const caiDatThongBaoOutput = z.object({
	kenh: z.enum(["zalo", "slack"]).nullable(),
	lyDo: z.enum(["chua-noi", "zalo-tat"]).nullable(),
	loai: z.array(caiDatLoaiRa),
});
export type CaiDatThongBaoOutput = z.infer<typeof caiDatThongBaoOutput>;

export const luuCaiDatThongBaoOutput = caiDatLoaiRa;
