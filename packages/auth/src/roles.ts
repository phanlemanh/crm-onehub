import type { WorkspaceRole } from "@crm/validation/vai-workspace";

export {
	docDuocPhamVi,
	isWorkspaceRole,
	KHONG_TRONG_PHAM_VI,
	laVaiChiOkr,
	PHAM_VI_DU_LIEU,
	type PhamViDuLieu,
	toWorkspaceRole,
	VAI_CHI_OKR,
	WORKSPACE_ROLES,
	type WorkspaceRole,
} from "@crm/validation/vai-workspace";

export function isWorkspaceAdmin(role: WorkspaceRole | null): boolean {
	return role === "owner" || role === "admin";
}
