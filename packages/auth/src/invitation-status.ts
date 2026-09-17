import type { InvitationStatus } from "better-auth/plugins/organization";
import { z } from "zod";

export const TRANG_THAI_LOI_MOI = [
	"pending",
	"accepted",
	"rejected",
	"canceled",
] as const;

export type TrangThaiLoiMoi = (typeof TRANG_THAI_LOI_MOI)[number];

type BangNhau<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
const _KHOP: BangNhau<TrangThaiLoiMoi, InvitationStatus> = true;
void _KHOP;

export const CON_HIEU_LUC = ["pending", "accepted"] as const;

export const CANCELLED_CU = "cancelled";

export type TrangThaiDaDoc = TrangThaiLoiMoi | "unknown";

const schema = z.enum(TRANG_THAI_LOI_MOI);

export function docTrangThai(value: unknown): {
	trangThai: TrangThaiDaDoc;
	loi?: string;
} {
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
