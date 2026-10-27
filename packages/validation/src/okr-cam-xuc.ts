import { z } from "zod";

export const LOAI_CAM_XUC = [
	"dong-y",
	"chuc-mung",
	"co-len",
	"da-xem",
] as const;
export type LoaiCamXuc = (typeof LOAI_CAM_XUC)[number];
export const loaiCamXuc = z.enum(LOAI_CAM_XUC);

export const OKR_CAM_XUC = {
	tenToiDa: 3,
} as const;

const ma = z.string().trim().min(1).max(120);

export const thaCamXucInput = z
	.object({ checkInId: ma, loai: loaiCamXuc })
	.strict();
export type ThaCamXucInput = z.infer<typeof thaCamXucInput>;

export const mucCamXuc = z.object({
	loai: loaiCamXuc,
	so: z.number().int().min(1),
	cuaToi: z.boolean(),
	nguoi: z.array(z.object({ id: z.string(), name: z.string() })),
});

export const tomTatCamXuc = z.array(mucCamXuc);
export type TomTatCamXuc = z.infer<typeof tomTatCamXuc>;

export const nguoiThaCamXucInput = z.object({ checkInId: ma }).strict();

export const nguoiThaCamXucOutput = z.array(
	z.object({
		loai: loaiCamXuc,
		nguoi: z.array(z.object({ id: z.string(), name: z.string() })),
	}),
);
export type NguoiThaCamXucOutput = z.infer<typeof nguoiThaCamXucOutput>;
