import { DU_AN } from "@crm/db/du-an";
import { duAnLich } from "@crm/validation/du-an-lich";
import { z } from "zod";
import { ngayLich } from "../onboarding/onboarding.contracts";

const ma = z.string().trim().min(1).max(120);
const ten = z.string().trim().min(1).max(DU_AN.tenToiDa);
const moTa = z.string().trim().max(DU_AN.moTaToiDa).nullable().optional();
const ngayRa = z.string().nullable();

export const duAnIdInput = z.object({ id: ma });
export const duAnListInput = z.object({
	trangThai: z.enum(["mo", "dong"]).default("mo"),
});
export const duAnTaoInput = z.object({ ten, moTa });
export const duAnSuaInput = z.object({ id: ma, ten: ten.optional(), moTa });
export const duAnMocTaoInput = z.object({
	duAnId: ma,
	ten,
	ngay: ngayLich,
	cho: z.array(ma).max(DU_AN.viecToiDa).default([]),
});
export const duAnMocSuaInput = z.object({
	id: ma,
	ten: ten.optional(),
	ngay: ngayLich.optional(),
	cho: z.array(ma).max(DU_AN.viecToiDa).optional(),
});
export const duAnPhuThuocInput = z.object({ truocId: ma, sauId: ma });

export const duAnDong = z.object({
	id: z.string(),
	ten: z.string(),
	moTa: z.string().nullable(),
	soViec: z.number().int(),
	soXong: z.number().int(),
	batDauSom: ngayRa,
	hanMuon: ngayRa,
	mocKe: z
		.object({ ten: z.string(), ngay: z.string(), tre: z.boolean() })
		.nullable(),
	taoBoi: z.object({ id: z.string(), name: z.string() }),
	dong: z.boolean(),
	coLichSu: z.boolean(),
	quyen: z.object({ dong: z.boolean(), xoa: z.boolean() }),
});

export const duAnListOutput = z.array(duAnDong);
export const duAnLichOutput = duAnLich;
export const duAnTaoOutput = z.object({ id: z.string() });
export const duAnOkOutput = z.object({ ok: z.literal(true) });
export const duAnDaDoiOutput = z.object({
	daDoi: z.array(z.object({ id: z.string(), tieuDe: z.string() })),
});

export type DuAnListInput = z.infer<typeof duAnListInput>;
export type DuAnTaoInput = z.infer<typeof duAnTaoInput>;
export type DuAnSuaInput = z.infer<typeof duAnSuaInput>;
export type DuAnMocTaoInput = z.infer<typeof duAnMocTaoInput>;
export type DuAnMocSuaInput = z.infer<typeof duAnMocSuaInput>;
export type DuAnPhuThuocInput = z.infer<typeof duAnPhuThuocInput>;
export type DuAnDongOutput = z.infer<typeof duAnDong>;
export type DuAnLichOutput = z.infer<typeof duAnLichOutput>;
