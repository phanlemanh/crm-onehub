import { DU_AN } from "@crm/db/du-an";
import { z } from "zod";
import { ngayLich } from "../onboarding/onboarding.contracts";

export const lichLamViecOutput = z.object({
	ngayNghiTuan: z.array(z.number().int().min(1).max(7)),
	ngayLe: z.array(
		z.object({ id: z.string(), ngay: z.string(), ten: z.string() }),
	),
	sua: z.boolean(),
});

export const datNgayNghiTuanInput = z.object({
	ngayNghiTuan: z.array(z.number().int().min(1).max(7)).max(6),
});

export const themNgayLeInput = z.object({
	ngay: ngayLich,
	ten: z.string().trim().min(1).max(DU_AN.tenNgayLeToiDa),
});

export const xoaNgayLeInput = z.object({
	id: z.string().trim().min(1).max(120),
});

export const lichOkOutput = z.object({ ok: z.literal(true) });

export type LichLamViecOutput = z.infer<typeof lichLamViecOutput>;
