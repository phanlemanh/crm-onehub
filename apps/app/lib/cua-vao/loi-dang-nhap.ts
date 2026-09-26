export const TIEN_TO_CHUA_CHO_PHEP = "This_CRM_is_private.";
export const MA_DA_HUY = "access_denied";

export type LoaiLoi = "chua-cho-phep" | "da-huy" | "chung";

export function phanLoaiLoiDangNhap(
	raw: string | string[] | undefined,
): LoaiLoi | null {
	const giaTri = Array.isArray(raw) ? raw[0] : raw;
	if (giaTri === undefined || giaTri === "") return null;
	if (giaTri.startsWith(TIEN_TO_CHUA_CHO_PHEP)) return "chua-cho-phep";
	if (giaTri === MA_DA_HUY) return "da-huy";
	return "chung";
}
