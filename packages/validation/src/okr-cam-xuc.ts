import { z } from "zod";

export const LOAI_CAM_XUC = [
	"dong-y",
	"chuc-mung",
	"co-len",
	"da-xem",
] as const;
export type LoaiCamXuc = (typeof LOAI_CAM_XUC)[number];

const ma = z.string().trim().min(1).max(120);

export const thaCamXucInput = z
	.object({ checkInId: ma, loai: z.enum(LOAI_CAM_XUC) })
	.strict();
export type ThaCamXucInput = z.infer<typeof thaCamXucInput>;

export const mucCamXuc = z.object({
	loai: z.enum(LOAI_CAM_XUC),
	so: z.number().int().min(1),
	cuaToi: z.boolean(),
	nguoi: z.array(z.object({ id: z.string(), name: z.string() })),
});

export const tomTatCamXuc = z.array(mucCamXuc);
export type TomTatCamXuc = z.infer<typeof tomTatCamXuc>;
