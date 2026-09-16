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
import { AuthMiddleware } from "../trpc/middlewares/auth.middleware";
import { restMeta } from "../trpc/openapi";
import {
	allowanceListOutput,
	allowanceOutput,
	allowEmailInput,
	memberListInput,
	memberListOutput,
	removeMemberInput,
	removeMemberOutput,
	revokeAllowanceInput,
	setMemberRoleInput,
	updateWorkspaceInput,
	workspaceMemberOutput,
	workspaceOutput,
} from "./workspace.contracts";
import { WorkspaceService } from "./workspace.service";

@Router({ alias: "workspace" })
@UseMiddlewares(AuthMiddleware)
export class WorkspaceRouter {
	constructor(
		@Inject(WorkspaceService) private readonly workspace: WorkspaceService,
	) {}

	@Query({
		output: workspaceOutput,
		meta: restMeta("GET", "/workspace", ["Workspace"]),
	})
	async get(@Ctx() ctx: AuthedTrpcContext) {
		return this.workspace.get(ctx.user.id);
	}

	@Query({
		input: memberListInput,
		output: memberListOutput,
		meta: restMeta("POST", "/workspace/members/search", ["Workspace"]),
	})
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
	async setMemberRole(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof setMemberRoleInput>,
	) {
		return this.workspace.setMemberRole(ctx.user.id, input);
	}

	@Query({
		output: allowanceListOutput,
		meta: restMeta("GET", "/workspace/allowances", ["Workspace"]),
	})
	async allowances(@Ctx() ctx: AuthedTrpcContext) {
		return this.workspace.allowances(ctx.user.id);
	}

	@Mutation({
		input: allowEmailInput,
		output: allowanceOutput,
		meta: restMeta("POST", "/workspace/allowances", ["Workspace"]),
	})
	async allowEmail(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof allowEmailInput>,
	) {
		return this.workspace.allowEmail(ctx.user.id, input);
	}

	@Mutation({
		input: revokeAllowanceInput,
		output: allowanceOutput,
		meta: restMeta("DELETE", "/workspace/allowances/{allowanceId}", [
			"Workspace",
		]),
	})
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
	async removeMember(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof removeMemberInput>,
	) {
		return this.workspace.removeMember(ctx.user.id, input);
	}
}
