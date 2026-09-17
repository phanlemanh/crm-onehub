import type { TrangThaiLoiMoi } from "@crm/validation/invitation-status";
import type { InvitationStatus } from "better-auth/plugins/organization";

type BangNhau<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
const _KHOP: BangNhau<TrangThaiLoiMoi, InvitationStatus> = true;
void _KHOP;

export {
	CANCELLED_CU,
	CON_HIEU_LUC,
	conHieuLuc,
	docTrangThai,
	type KetQuaDocTrangThai,
	TRANG_THAI_LOI_MOI,
	type TrangThaiDaDoc,
	type TrangThaiLoiMoi,
} from "@crm/validation/invitation-status";
