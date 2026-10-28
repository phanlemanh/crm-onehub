import { tomTatCamXuc } from "@crm/validation/okr-cam-xuc";
import { MUC_TU_TIN } from "@crm/validation/okr-cap-nhat";
import { KIEU_KR } from "@crm/validation/okr-kr";
import { PHAM_VI_BO } from "@crm/validation/okr-tham-so";
import { z } from "zod";

const ma = z.string().trim().min(1).max(120);
const nguoi = z.object({ id: z.string(), name: z.string() });

export const capNhatGanDayInput = z.object({
	cycleId: ma,
	phamVi: z.enum(PHAM_VI_BO).default("tat-ca"),
	trang: z.number().int().min(1).max(100_000).default(1),
});

export const traLoiCapNhat = z.object({
	id: z.string(),
	nguoi,
	noiDung: z.string(),
	luc: z.string(),
});

export const dongCapNhat = z.object({
	checkInId: z.string(),
	luc: z.string(),
	nguoi,
	thayCho: nguoi.nullable(),
	kr: z.object({
		id: z.string(),
		tieuDe: z.string(),
		kieu: z.enum(KIEU_KR),
		donVi: z.string(),
		dich: z.number(),
	}),
	mucTieu: z.object({ id: z.string(), tieuDe: z.string() }),
	bo: z.object({ khoa: z.string(), ten: z.string() }),
	giaTri: z.number(),
	tuTin: z.enum(MUC_TU_TIN),
	ghiChu: z.string(),
	moiNhat: z.boolean(),
	traLoi: z.array(traLoiCapNhat),
	camXuc: tomTatCamXuc,
	mentionNguoiCapNhat: z.string().nullable(),
});

export const capNhatGanDayOutput = z.object({
	rows: z.array(dongCapNhat),
	total: z.number(),
	trang: z.number(),
	coTrang: z.number(),
	facetCounts: z.object({
		phamVi: z.array(z.object({ value: z.enum(PHAM_VI_BO), count: z.number() })),
	}),
});

export type CapNhatGanDayInput = z.infer<typeof capNhatGanDayInput>;
export type DongCapNhat = z.infer<typeof dongCapNhat>;
export type TraLoiCapNhat = z.infer<typeof traLoiCapNhat>;
export type CapNhatGanDayOutput = z.infer<typeof capNhatGanDayOutput>;
