export const WORKSPACE_ROLES = ["owner", "admin", "member", "okr"] as const;

export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];

export const VAI_CHI_OKR = "okr" as const;

export const PHAM_VI_DU_LIEU = ["doi-tac", "to-chuc", "okr", "chung"] as const;

export type PhamViDuLieu = (typeof PHAM_VI_DU_LIEU)[number];

export const KHONG_TRONG_PHAM_VI =
	"Your role does not include this part of OneHub Center.";

const PHAM_VI_CUA_CHI_OKR: readonly PhamViDuLieu[] = [
	"okr",
	"chung",
	"to-chuc",
];

export function isWorkspaceRole(value: string): value is WorkspaceRole {
	return (WORKSPACE_ROLES as readonly string[]).includes(value);
}

export function toWorkspaceRole(value: string): WorkspaceRole {
	return isWorkspaceRole(value) ? value : "member";
}

export function laVaiChiOkr(role: WorkspaceRole | null): boolean {
	return role === VAI_CHI_OKR;
}

export function docDuocPhamVi(
	role: WorkspaceRole | null,
	phamVi: PhamViDuLieu | null,
): boolean {
	if (role === null) return false;
	if (!laVaiChiOkr(role)) return true;
	return phamVi !== null && PHAM_VI_CUA_CHI_OKR.includes(phamVi);
}

export function laQuanTriWorkspace(role: WorkspaceRole | null): boolean {
	return role === "owner" || role === "admin";
}
