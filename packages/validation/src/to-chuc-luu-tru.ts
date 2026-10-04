import { z } from "zod";

export const lyDoChanLuuTru = z.discriminatedUnion("loai", [
	z.object({
		loai: z.literal("khuon"),
		khuon: z.array(z.string().min(1)).min(1),
		cau: z.string(),
	}),
	z.object({
		loai: z.literal("nguoi"),
		so: z.number().int().positive(),
		cau: z.string(),
	}),
	z.object({
		loai: z.literal("okr"),
		so: z.number().int().positive(),
		cau: z.string(),
	}),
]);

export type LyDoChanLuuTru = z.infer<typeof lyDoChanLuuTru>;

export const LOAI_CHAN_KHOI_PHUC = ["cha-luu-tru", "trung-ten"] as const;

export const ketQuaKhoiPhuc = z.union([
	z.object({ id: z.string() }),
	z.object({
		chan: z.object({
			loai: z.enum(LOAI_CHAN_KHOI_PHUC),
			ten: z.string().min(1),
		}),
	}),
]);

export type KetQuaKhoiPhuc = z.infer<typeof ketQuaKhoiPhuc>;
