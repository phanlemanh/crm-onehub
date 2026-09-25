import { z } from "zod";

export const CAP_MUC_TIEU = [
	"onehub",
	"bo-phan",
	"phong-ban",
	"ca-nhan",
] as const;
export const LOAI_MUC_TIEU = ["cam-ket", "tham-vong"] as const;
export const TRANG_THAI_MUC_TIEU = ["nhap", "cong-bo", "da-bo"] as const;

export type CapMucTieu = (typeof CAP_MUC_TIEU)[number];
export type LoaiMucTieu = (typeof LOAI_MUC_TIEU)[number];
export type TrangThaiMucTieu = (typeof TRANG_THAI_MUC_TIEU)[number];

export const HANG_CAP = {
	onehub: 0,
	"bo-phan": 1,
	"phong-ban": 2,
	"ca-nhan": 3,
} as const satisfies Record<CapMucTieu, number>;

const ma = z.string().trim().min(1).max(120);

export const donViMucTieu = z.discriminatedUnion("level", [
	z.object({ level: z.literal("onehub") }),
	z.object({ level: z.literal("bo-phan"), divisionId: ma }),
	z.object({ level: z.literal("phong-ban"), departmentId: ma }),
	z.object({ level: z.literal("ca-nhan"), personUserId: ma }),
]);

export type DonViMucTieu = z.infer<typeof donViMucTieu>;

export const mucTieuInput = z.object({
	cycleId: ma,
	unit: donViMucTieu,
	title: z.string().trim().min(3).max(200),
	kind: z.enum(LOAI_MUC_TIEU),
	ownerUserId: ma,
	participantIds: z.array(ma).max(50),
	whyNow: z.string().trim().max(500),
});

export type MucTieuInput = z.infer<typeof mucTieuInput>;

export const mucTieuUpdate = z.object({
	id: ma,
	title: z.string().trim().min(3).max(200).optional(),
	kind: z.enum(LOAI_MUC_TIEU).optional(),
	ownerUserId: ma.optional(),
	participantIds: z.array(ma).max(50).optional(),
	whyNow: z.string().trim().max(500).optional(),
});

export type MucTieuUpdate = z.infer<typeof mucTieuUpdate>;
