import { WORKSPACE_ROLES } from "@crm/auth";
import { MAX_SLUG } from "@crm/db/workspace";
import { z } from "zod";
import { listInput } from "../trpc/list-input";

export const memberListInput = listInput.extend({
	role: z.array(z.string()).default([]),
});

export type MemberListInput = z.infer<typeof memberListInput>;

export const updateWorkspaceInput = z.object({
	name: z.string().trim().min(1).max(120),
	website: z.string().trim().min(1).max(255),
	slug: z
		.string()
		.trim()
		.min(1)
		.max(MAX_SLUG)
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
		.optional(),
});

export const ALLOWANCE_STATUSES = [
	"pending",
	"accepted",
	"rejected",
	"canceled",
	"unknown",
] as const;

export const allowanceOutput = z.object({
	id: z.string(),
	email: z.string(),
	role: z.enum(WORKSPACE_ROLES),
	status: z.enum(ALLOWANCE_STATUSES),
	invitedByName: z.string().nullable(),
	createdAt: z.string(),
	passwordLinkIssuedAt: z.string().nullable(),
	passwordLinkIssuedByName: z.string().nullable(),
});

export type Allowance = z.infer<typeof allowanceOutput>;

export const allowanceListOutput = z.object({
	rows: z.array(allowanceOutput),
});

export const allowEmailInput = z.object({
	email: z.string().trim().min(1).max(255),
	role: z.enum(WORKSPACE_ROLES),
});

export const revokeAllowanceInput = z.object({
	allowanceId: z.string().min(1),
});

export const removeMemberInput = z.object({
	memberId: z.string().min(1),
});

export const removeMemberOutput = z.object({
	memberId: z.string(),
});

export type AllowEmailInput = z.infer<typeof allowEmailInput>;
export type RevokeAllowanceInput = z.infer<typeof revokeAllowanceInput>;
export type RemoveMemberInput = z.infer<typeof removeMemberInput>;

export const setMemberRoleInput = z.object({
	memberId: z.string().min(1),
	role: z.enum(WORKSPACE_ROLES),
});

export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceInput>;
export type SetMemberRoleInput = z.infer<typeof setMemberRoleInput>;

export const issuePasswordLinkInput = z.object({
	email: z.string().trim().min(1).max(255),
});

export const passwordLinkOutput = z.object({
	url: z.string(),
	expiresAt: z.string(),
});

export type IssuePasswordLinkInput = z.infer<typeof issuePasswordLinkInput>;

export const workspaceOutput = z.object({
	id: z.string(),
	slug: z.string(),
	name: z.string(),
	website: z.string().nullable(),
	onboarded: z.boolean(),
	viewerRole: z.enum(WORKSPACE_ROLES).nullable(),
	canRename: z.boolean(),
	canChangeRoles: z.boolean(),
	canManageMembers: z.boolean(),
	canIssuePasswordLink: z.boolean(),
	canManageSettings: z.boolean(),
});

export type Workspace = z.infer<typeof workspaceOutput>;

export const workspaceMemberOutput = z.object({
	id: z.string(),
	userId: z.string(),
	name: z.string(),
	email: z.string(),
	image: z.string().nullable(),
	role: z.enum(WORKSPACE_ROLES),
	joinedAt: z.string(),
	isViewer: z.boolean(),
	passwordLinkIssuedAt: z.string().nullable(),
	passwordLinkIssuedByName: z.string().nullable(),
});

export type WorkspaceMember = z.infer<typeof workspaceMemberOutput>;

export const memberListOutput = z.object({
	rows: z.array(workspaceMemberOutput),
	total: z.number(),
	facetCounts: z.record(z.string(), z.record(z.string(), z.number())),
});

export const staffDomainsOutput = z.object({
	domains: z.array(z.string()),
	canEdit: z.boolean(),
});

export type StaffDomains = z.infer<typeof staffDomainsOutput>;

export const setStaffDomainsInput = z.object({
	domains: z.array(z.string().max(255)).max(100),
});

export type SetStaffDomainsInput = z.infer<typeof setStaffDomainsInput>;
