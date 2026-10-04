import { Inject } from "@nestjs/common";
import {
	Ctx,
	Input,
	Mutation,
	Query,
	Router,
	UseMiddlewares,
} from "nestjs-trpc";
import type { z } from "zod";
import type { AuthedTrpcContext } from "../trpc/context.types";
import { PhamViChungMiddleware } from "../trpc/middlewares/pham-vi-du-lieu.middleware";
import { SignedInMiddleware } from "../trpc/middlewares/signed-in.middleware";
import { restMeta } from "../trpc/openapi";
import { ghiPhamViYeuCau } from "../trpc/pham-vi-yeu-cau";
import {
	allowanceListOutput,
	allowanceOutput,
	allowEmailInput,
	issuePasswordLinkInput,
	memberListInput,
	memberListOutput,
	passwordLinkOutput,
	removeMemberInput,
	removeMemberOutput,
	revokeAllowanceInput,
	setMemberRoleInput,
	setStaffDomainsInput,
	staffDomainsOutput,
	updateWorkspaceInput,
	workspaceMemberOutput,
	workspaceOutput,
} from "./workspace.contracts";
import { WorkspaceService } from "./workspace.service";

@Router({ alias: "workspace" })
export class WorkspaceRouter {
	constructor(
		@Inject(WorkspaceService) private readonly workspace: WorkspaceService,
	) {}

	@Query({
		output: workspaceOutput,
		meta: restMeta("GET", "/workspace", ["Workspace"]),
	})
	@UseMiddlewares(SignedInMiddleware)
	async get(@Ctx() ctx: AuthedTrpcContext) {
		const ketQua = await this.workspace.get(ctx.user.id);
		ghiPhamViYeuCau(ctx, { role: ketQua.viewerRole, phamVi: "chung" });
		return ketQua;
	}

	@Query({
		input: memberListInput,
		output: memberListOutput,
		meta: restMeta("POST", "/workspace/members/search", ["Workspace"]),
	})
	@UseMiddlewares(PhamViChungMiddleware)
	async members(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof memberListInput>,
	) {
		return this.workspace.members(ctx.user.id, input);
	}

	@Mutation({
		input: updateWorkspaceInput,
		output: workspaceOutput,
		meta: restMeta("PATCH", "/workspace", ["Workspace"]),
	})
	@UseMiddlewares(PhamViChungMiddleware)
	async update(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof updateWorkspaceInput>,
	) {
		return this.workspace.update(ctx.user.id, input);
	}

	@Mutation({
		input: setMemberRoleInput,
		output: workspaceMemberOutput,
		meta: restMeta("PATCH", "/workspace/members/{memberId}/role", [
			"Workspace",
		]),
	})
	@UseMiddlewares(PhamViChungMiddleware)
	async setMemberRole(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof setMemberRoleInput>,
	) {
		return this.workspace.setMemberRole(ctx.user.id, input);
	}

	@Query({
		output: staffDomainsOutput,
		meta: restMeta("GET", "/workspace/staff-domains", ["Workspace"]),
	})
	@UseMiddlewares(PhamViChungMiddleware)
	async staffDomains(@Ctx() ctx: AuthedTrpcContext) {
		return this.workspace.staffDomains(ctx.user.id);
	}

	@Mutation({
		input: setStaffDomainsInput,
		output: staffDomainsOutput,
		meta: restMeta("PUT", "/workspace/staff-domains", ["Workspace"]),
	})
	@UseMiddlewares(PhamViChungMiddleware)
	async setStaffDomains(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof setStaffDomainsInput>,
	) {
		return this.workspace.setStaffDomains(ctx.user.id, input);
	}

	@Query({
		output: allowanceListOutput,
		meta: restMeta("GET", "/workspace/allowances", ["Workspace"]),
	})
	@UseMiddlewares(PhamViChungMiddleware)
	async allowances(@Ctx() ctx: AuthedTrpcContext) {
		return this.workspace.allowances(ctx.user.id);
	}

	@Mutation({
		input: allowEmailInput,
		output: allowanceOutput,
		meta: restMeta("POST", "/workspace/allowances", ["Workspace"]),
	})
	@UseMiddlewares(PhamViChungMiddleware)
	async allowEmail(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof allowEmailInput>,
	) {
		return this.workspace.allowEmail(ctx.user.id, input);
	}

	@Mutation({
		input: issuePasswordLinkInput,
		output: passwordLinkOutput,
		meta: restMeta("POST", "/workspace/password-link", ["Workspace"]),
	})
	@UseMiddlewares(PhamViChungMiddleware)
	async issuePasswordLink(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof issuePasswordLinkInput>,
	) {
		return this.workspace.issuePasswordLink(ctx.user.id, input);
	}

	@Mutation({
		input: revokeAllowanceInput,
		output: allowanceOutput,
		meta: restMeta("DELETE", "/workspace/allowances/{allowanceId}", [
			"Workspace",
		]),
	})
	@UseMiddlewares(PhamViChungMiddleware)
	async revokeAllowance(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof revokeAllowanceInput>,
	) {
		return this.workspace.revokeAllowance(ctx.user.id, input);
	}

	@Mutation({
		input: removeMemberInput,
		output: removeMemberOutput,
		meta: restMeta("DELETE", "/workspace/members/{memberId}", ["Workspace"]),
	})
	@UseMiddlewares(PhamViChungMiddleware)
	async removeMember(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof removeMemberInput>,
	) {
		return this.workspace.removeMember(ctx.user.id, input);
	}
}
