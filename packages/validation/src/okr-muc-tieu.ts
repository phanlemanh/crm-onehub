import { z } from "zod";
import { MUC_HIEN_THI } from "./okr-hien-thi";

export const CAP_MUC_TIEU = [
	"onehub",
	"bo-phan",
	"phong-ban",
	"ca-nhan",
] as const;
export const LOAI_MUC_TIEU = ["cam-ket", "tham-vong", "hoc-tap"] as const;
export const TRANG_THAI_MUC_TIEU = [
	"nhap",
	"cho-duyet",
	"cong-bo",
	"da-bo",
] as const;

export type CapMucTieu = (typeof CAP_MUC_TIEU)[number];
export type LoaiMucTieu = (typeof LOAI_MUC_TIEU)[number];
export type TrangThaiMucTieu = (typeof TRANG_THAI_MUC_TIEU)[number];

export const HANG_CAP = {
	onehub: 0,
	"bo-phan": 1,
	"phong-ban": 2,
	"ca-nhan": 3,
} as const satisfies Record<CapMucTieu, number>;

export const NGUONG_TINH_TRANG = {
	thamVong: 0.7,
	cham: 0.85,
	truot: 0.5,
} as const;

export const TINH_TRANG = [
	"dung-nhip",
	"cham-nhip",
	"truot",
	"chua-co-ky-vong",
] as const;
export type TinhTrang = (typeof TINH_TRANG)[number];

export function tinhTrang(
	phanTram: number,
	kyVong: number | null,
	loai: LoaiMucTieu,
): TinhTrang {
	if (kyVong === null || kyVong === 0) return "chua-co-ky-vong";
	const tiLe = phanTram / kyVong;
	if (loai !== "cam-ket")
		return tiLe >= NGUONG_TINH_TRANG.thamVong ? "dung-nhip" : "cham-nhip";
	if (tiLe >= NGUONG_TINH_TRANG.cham) return "dung-nhip";
	if (tiLe >= NGUONG_TINH_TRANG.truot) return "cham-nhip";
	return "truot";
}

const ma = z.string().trim().min(1).max(120);

export const donViMucTieu = z.discriminatedUnion("level", [
	z.strictObject({ level: z.literal("onehub") }),
	z.strictObject({ level: z.literal("bo-phan"), divisionId: ma }),
	z.strictObject({ level: z.literal("phong-ban"), departmentId: ma }),
	z.strictObject({ level: z.literal("ca-nhan"), personUserId: ma }),
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
	hienThi: z.enum(MUC_HIEN_THI).default("cong-khai"),
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
