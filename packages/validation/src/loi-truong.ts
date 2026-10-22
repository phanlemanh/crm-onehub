import { z } from "zod";

export const LY_DO_LOI_TRUONG = ["thieu", "gia-tri"] as const;

export const loiTruong = z.object({
	khoa: z.string().min(1),
	lyDo: z.enum(LY_DO_LOI_TRUONG),
});

export type LoiTruong = z.infer<typeof loiTruong>;

export const KHOA_LOI_TRUONG = "truong";

const duLieuLoi = z.object({ [KHOA_LOI_TRUONG]: loiTruong });

export function docLoiTruong(data: unknown): LoiTruong | null {
	const doc = duLieuLoi.safeParse(data);
	return doc.success ? doc.data[KHOA_LOI_TRUONG] : null;
}
