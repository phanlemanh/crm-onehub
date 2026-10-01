export const TRANG_THAI_HOI_Y = ["dang-mo", "dang-gom", "da-cong-bo"] as const;

export type TrangThaiHoiY = (typeof TRANG_THAI_HOI_Y)[number];

export function trangThaiHoiY(
	h: { hanLuc: Date; congBoLuc: Date | null },
	now: Date,
): TrangThaiHoiY {
	if (h.congBoLuc) return "da-cong-bo";
	if (now.getTime() >= h.hanLuc.getTime()) return "dang-gom";
	return "dang-mo";
}
