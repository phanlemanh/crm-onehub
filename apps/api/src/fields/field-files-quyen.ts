import { isWorkspaceAdmin, type WorkspaceRole } from "@crm/auth";

export type NguoiGoiTep = { id: string; role: WorkspaceRole | null };

export function coTheMoTep(nguoi: NguoiGoiTep): boolean {
	return isWorkspaceAdmin(nguoi.role);
}

export function coTheXoaTep(
	nguoi: NguoiGoiTep,
	tep: { taiBoiId: string | null },
): boolean {
	return isWorkspaceAdmin(nguoi.role) || tep.taiBoiId === nguoi.id;
}
