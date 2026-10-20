import { z } from "zod";

export const banGom = z.object({
	dot: z.string(),
	den: z.string(),
	nhom: z.array(
		z.object({
			ma: z.string(),
			ten: z.string(),
			tinHieu: z.array(z.string()),
		}),
	),
	le: z.array(z.object({ id: z.string(), lyDo: z.string() })),
	daPhu: z.array(z.object({ id: z.string(), hoSo: z.string() })),
	loi: z.array(z.string()),
});
export type BanGom = z.infer<typeof banGom>;

export const chuaGomRa = z.object({
	tin_hieu: z.array(
		z.object({ id: z.string(), luc: z.string(), tieu_de: z.string() }),
	),
	da_giao: z.array(z.object({ slug: z.string(), cau_giao: z.string() })),
	loi: z.array(z.unknown()),
});
export type ChuaGomRa = z.infer<typeof chuaGomRa>;

export const hangLoTrinh = z.object({
	ma: z.string().optional(),
	dot: z.string().optional(),
	phu: z.array(z.string()).optional(),
	cau_giao: z.string().optional(),
});
export type HangLoTrinh = z.infer<typeof hangLoTrinh>;

export const tepLoTrinh = z.object({ hang: z.array(hangLoTrinh).default([]) });

export const nhomMay = z.object({
	ma: z.string(),
	ten: z.string(),
	tinHieu: z.array(z.string()),
});
export type NhomMay = z.infer<typeof nhomMay>;

export const cacNhomMay = z.array(nhomMay);
export const gioDeXuat = z.record(z.string(), z.string());
export const duongTep = z.string();

export const prDeXuat = z.array(
	z.object({
		number: z.number(),
		state: z.string(),
		body: z.string(),
		mergedAt: z.string().nullable().optional(),
		createdAt: z.string().optional(),
	}),
);
export type PrDeXuat = z.infer<typeof prDeXuat>;

export const cauHinhGom = z.object({
	tin_hieu: z.object({ gom: z.string() }),
	lo_trinh: z.object({ tep: z.union([z.string(), z.array(z.string())]) }),
});
export type CauHinhGom = z.infer<typeof cauHinhGom>;
