import { TINH_TRANG_KR, type TinhTrangKr } from "@crm/validation/okr-muc-tieu";
import { z } from "zod";
import { OKR_XEM } from "./okr-xem.config";

export { TINH_TRANG_KR, type TinhTrangKr };

const ma = z.string().trim().min(1).max(120);
const toiDa = OKR_XEM.loc.toiDaMoiMat;

export const locMoiKr = z.object({
	tinhTrang: z
		.array(z.enum(TINH_TRANG_KR))
		.max(TINH_TRANG_KR.length)
		.default([]),
	donVi: z.array(ma).max(toiDa).default([]),
	nguoi: z.array(ma).max(toiDa).default([]),
});

export const moiKrInput = z.object({
	cycleId: ma,
	loc: locMoiKr,
});

export const dongMoiKr = z.object({
	keyResultId: z.string(),
	tieuDe: z.string(),
	objectiveId: z.string(),
	mucTieu: z.string(),
	donVi: z.object({ khoa: z.string(), ten: z.string() }),
	nguoi: z.object({ id: z.string(), name: z.string() }),
	progress: z.number(),
	expected: z.number().nullable(),
	tinhTrang: z.enum(TINH_TRANG_KR),
});

const demCoTen = z.object({
	value: z.string(),
	count: z.number(),
	name: z.string(),
});

export const moiKrOutput = z.object({
	rows: z.array(dongMoiKr),
	total: z.number(),
	facetCounts: z.object({
		tinhTrang: z.array(
			z.object({ value: z.enum(TINH_TRANG_KR), count: z.number() }),
		),
		donVi: z.array(demCoTen),
		nguoi: z.array(demCoTen),
	}),
});

export type LocMoiKr = z.infer<typeof locMoiKr>;
export type MoiKrInput = z.infer<typeof moiKrInput>;
export type DongMoiKr = z.infer<typeof dongMoiKr>;
export type MoiKrOutput = z.infer<typeof moiKrOutput>;
