import { z } from "zod";

export const TRANG_THAI_LOI_MOI = [
	"pending",
	"accepted",
	"rejected",
	"canceled",
] as const;

export type TrangThaiLoiMoi = (typeof TRANG_THAI_LOI_MOI)[number];

export const TRANG_THAI_CHO = "pending";

export const TRANG_THAI_NHAN = "accepted";

export const TRANG_THAI_TU_CHOI = "rejected";

export const TRANG_THAI_HUY = "canceled";

export const CON_HIEU_LUC = [TRANG_THAI_CHO, TRANG_THAI_NHAN] as const;

export const CANCELLED_CU = "cancelled";

export type TrangThaiDaDoc = TrangThaiLoiMoi | "unknown";

export type KetQuaDocTrangThai = {
	trangThai: TrangThaiDaDoc;
	loi?: string;
};

const schema = z.enum(TRANG_THAI_LOI_MOI);

export function docTrangThai(value: unknown): KetQuaDocTrangThai {
	const ket = schema.safeParse(value);

	if (ket.success) return { trangThai: ket.data };

	return {
		trangThai: "unknown",
		loi: `truong status khong doc duoc: ${JSON.stringify(value)}`,
	};
}

export function conHieuLuc(value: TrangThaiDaDoc): boolean {
	return (CON_HIEU_LUC as readonly string[]).includes(value);
}
