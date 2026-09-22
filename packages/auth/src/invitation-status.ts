import type { TrangThaiLoiMoi } from "@crm/validation/invitation-status";
import type { InvitationStatus } from "better-auth/plugins/organization";

type BangNhau<A, B> = [A] extends [B]
	? [B] extends [A]
		? true
		: false
	: false;
const _KHOP: BangNhau<TrangThaiLoiMoi, InvitationStatus> = true;
void _KHOP;

export {
	CANCELLED_CU,
	CON_HIEU_LUC,
	conHieuLuc,
	docTrangThai,
	type KetQuaDocTrangThai,
	TRANG_THAI_CHO,
	TRANG_THAI_HUY,
	TRANG_THAI_LOI_MOI,
	TRANG_THAI_NHAN,
	TRANG_THAI_TU_CHOI,
	type TrangThaiDaDoc,
	type TrangThaiLoiMoi,
} from "@crm/validation/invitation-status";
