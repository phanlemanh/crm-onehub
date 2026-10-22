import { docDuocDoiTac } from "@crm/validation/vai-workspace";
import { isWorkspaceAdmin, type WorkspaceRole } from "./roles";

export const LY_DO_KHONG_MO_TEP = [
	"khong-phu-trach",
	"chua-co-phu-trach",
] as const;

export type LyDoKhongMoTep = (typeof LY_DO_KHONG_MO_TEP)[number];

export type NguoiXinTep = {
	vai: WorkspaceRole | null;
	userId: string;
	phuTrachId: string | null;
};

export type QuyenMoTep =
	| { coTheMo: true; lyDo: null }
	| { coTheMo: false; lyDo: LyDoKhongMoTep | "ngoai-pham-vi" };

export function quyenMoTep(i: NguoiXinTep): QuyenMoTep {
	if (i.vai === null || !docDuocDoiTac(i.vai)) {
		return { coTheMo: false, lyDo: "ngoai-pham-vi" };
	}
	if (isWorkspaceAdmin(i.vai)) return { coTheMo: true, lyDo: null };
	if (i.phuTrachId === null) {
		return { coTheMo: false, lyDo: "chua-co-phu-trach" };
	}
	if (i.phuTrachId !== i.userId) {
		return { coTheMo: false, lyDo: "khong-phu-trach" };
	}
	return { coTheMo: true, lyDo: null };
}

export function coTheXoaTep(
	i: NguoiXinTep & { taiBoiId: string | null },
): boolean {
	if (i.vai === null || !docDuocDoiTac(i.vai)) return false;
	if (isWorkspaceAdmin(i.vai)) return true;
	if (i.phuTrachId !== null && i.phuTrachId === i.userId) return true;
	return i.taiBoiId !== null && i.taiBoiId === i.userId;
}
