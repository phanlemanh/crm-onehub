import { type Db, db } from "@crm/db";
import { WORKSPACE_ID, workspaceSlug } from "@crm/db/workspace";
import {
	type AllowDecision,
	decideSignInFromDb,
	normalizeEmail,
} from "./allow-list";
import { isWorkspaceAdmin, type WorkspaceRole, toWorkspaceRole } from "./roles";

export { WORKSPACE_ID };

export const DEFAULT_WORKSPACE_NAME = "CRM";

export {
	isWorkspaceAdmin,
	isWorkspaceRole,
	toWorkspaceRole,
	WORKSPACE_ROLES,
	type WorkspaceRole,
} from "./roles";

export function canRenameWorkspace(role: WorkspaceRole | null): boolean {
	return isWorkspaceAdmin(role);
}

export function canChangeRole(role: WorkspaceRole | null): boolean {
	return isWorkspaceAdmin(role);
}

export function canManageCurrency(role: WorkspaceRole | null): boolean {
	return isWorkspaceAdmin(role);
}

export function canManageConnections(role: WorkspaceRole | null): boolean {
	return isWorkspaceAdmin(role);
}

export function canManageTracking(role: WorkspaceRole | null): boolean {
	return isWorkspaceAdmin(role);
}

export async function ensureWorkspaceMembership(
	userId: string,
	email = "",
	decide: (address: string) => Promise<AllowDecision> = decideSignInFromDb,
): Promise<string | undefined> {
	try {
		return await db.$transaction(async (tx) => {
			const workspace = await tx.organization.upsert({
				where: { id: WORKSPACE_ID },
				create: {
					id: WORKSPACE_ID,
					name: DEFAULT_WORKSPACE_NAME,
					slug: workspaceSlug(DEFAULT_WORKSPACE_NAME),
					createdAt: new Date(),
				},
				update: {},
				select: { id: true, name: true, slug: true },
			});

			const slug = workspaceSlug(workspace.name);

			if (workspace.slug !== slug) {
				await tx.organization.update({
					where: { id: workspace.id },
					data: { slug },
				});
			}

			const enrolled = await tx.member.count({
				where: { organizationId: workspace.id },
			});

			if (enrolled === 0) {
				const existing = await tx.user.findMany({
					select: { id: true },
					orderBy: [{ createdAt: "asc" }, { id: "asc" }],
				});

				await tx.member.createMany({
					data: existing.map((user, index) => ({
						id: crypto.randomUUID(),
						organizationId: workspace.id,
						userId: user.id,
						role: index === 0 ? "owner" : "member",
						createdAt: new Date(),
					})),
					skipDuplicates: true,
				});
			}

			const existing = await tx.member.findUnique({
				where: {
					organizationId_userId: { organizationId: workspace.id, userId },
				},
				select: { id: true },
			});

			if (existing) return workspace.id;

			const decision = await decide(email);

			if (!decision.allowed) return workspace.id;

			await tx.member.create({
				data: {
					id: crypto.randomUUID(),
					organizationId: workspace.id,
					userId,
					role: decision.role,
					createdAt: new Date(),
				},
			});

			const normalized = normalizeEmail(email);

			if (normalized) {
				await tx.invitation.updateMany({
					where: {
						organizationId: workspace.id,
						email: normalized,
						status: "pending",
					},
					data: { status: "accepted" },
				});
			}

			return workspace.id;
		});
	} catch (error) {
		console.error(
			`[auth] could not enrol user ${userId} in workspace ${WORKSPACE_ID}; the next sign-in will retry`,
			error,
		);
		return undefined;
	}
}

export type WorkspaceMemberReader = Pick<Db, "member">;

export async function workspaceRoleOf(
	userId: string,
	client: WorkspaceMemberReader = db,
): Promise<WorkspaceRole | null> {
	const member = await client.member.findUnique({
		where: { organizationId_userId: { organizationId: WORKSPACE_ID, userId } },
		select: { role: true },
	});

	return member ? toWorkspaceRole(member.role) : null;
}
