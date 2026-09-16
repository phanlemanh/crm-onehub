export const WORKSPACE_ROLES = ["owner", "admin", "member"] as const;

export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];

export function isWorkspaceRole(value: string): value is WorkspaceRole {
	return (WORKSPACE_ROLES as readonly string[]).includes(value);
}

export function toWorkspaceRole(value: string): WorkspaceRole {
	return isWorkspaceRole(value) ? value : "member";
}

export function isWorkspaceAdmin(role: WorkspaceRole | null): boolean {
	return role === "owner" || role === "admin";
}
