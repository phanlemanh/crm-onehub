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
	orgAccessOutput,
	orgDepartmentCreateInput,
	orgDepartmentMoveInput,
	orgDivisionCreateInput,
	orgIdInput,
	orgOkOutput,
	orgRenameInput,
	orgReorderInput,
	orgTreeOutput,
} from "./to-chuc.contracts";
import { ToChucService } from "./to-chuc.service";

const TAG = ["Organization"];

@Router({ alias: "org" })
@UseMiddlewares(AuthMiddleware)
export class ToChucRouter {
	constructor(@Inject(ToChucService) private readonly toChuc: ToChucService) {}

	@Query({ output: orgAccessOutput, meta: restMeta("GET", "/org/access", TAG) })
	access(@Ctx() ctx: AuthedTrpcContext) {
		return this.toChuc.access(ctx.user.id);
	}

	@Query({ output: orgTreeOutput, meta: restMeta("GET", "/org/tree", TAG) })
	tree() {
		return this.toChuc.tree();
	}

	@Mutation({
		input: orgDivisionCreateInput,
		output: orgOkOutput,
		meta: restMeta("POST", "/org/divisions", TAG),
	})
	async createDivision(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof orgDivisionCreateInput>,
	) {
		await this.toChuc.yeuCauQuanTri(ctx.user.id);
		return this.toChuc.createDivision(input);
	}

	@Mutation({
		input: orgRenameInput,
		output: orgOkOutput,
		meta: restMeta("PATCH", "/org/divisions/{id}", TAG),
	})
	async renameDivision(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof orgRenameInput>,
	) {
		await this.toChuc.yeuCauQuanTri(ctx.user.id);
		return this.toChuc.renameDivision(input);
	}

	@Mutation({
		input: orgReorderInput,
		output: orgOkOutput,
		meta: restMeta("POST", "/org/divisions/reorder", TAG),
	})
	async reorderDivisions(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof orgReorderInput>,
	) {
		await this.toChuc.yeuCauQuanTri(ctx.user.id);
		return this.toChuc.reorderDivisions(input);
	}

	@Mutation({
		input: orgIdInput,
		output: orgOkOutput,
		meta: restMeta("POST", "/org/divisions/{id}/archive", TAG),
	})
	async archiveDivision(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof orgIdInput>,
	) {
		await this.toChuc.yeuCauQuanTri(ctx.user.id);
		return this.toChuc.archiveDivision(input);
	}

	@Mutation({
		input: orgIdInput,
		output: orgOkOutput,
		meta: restMeta("POST", "/org/divisions/{id}/restore", TAG),
	})
	async restoreDivision(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof orgIdInput>,
	) {
		await this.toChuc.yeuCauQuanTri(ctx.user.id);
		return this.toChuc.restoreDivision(input);
	}

	@Mutation({
		input: orgIdInput,
		output: orgOkOutput,
		meta: restMeta("DELETE", "/org/divisions/{id}", TAG),
	})
	async purgeDivision(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof orgIdInput>,
	) {
		await this.toChuc.yeuCauQuanTri(ctx.user.id);
		return this.toChuc.purgeDivision(input);
	}

	@Mutation({
		input: orgDepartmentCreateInput,
		output: orgOkOutput,
		meta: restMeta("POST", "/org/departments", TAG),
	})
	async createDepartment(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof orgDepartmentCreateInput>,
	) {
		await this.toChuc.yeuCauQuanTri(ctx.user.id);
		return this.toChuc.createDepartment(input);
	}

	@Mutation({
		input: orgRenameInput,
		output: orgOkOutput,
		meta: restMeta("PATCH", "/org/departments/{id}", TAG),
	})
	async renameDepartment(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof orgRenameInput>,
	) {
		await this.toChuc.yeuCauQuanTri(ctx.user.id);
		return this.toChuc.renameDepartment(input);
	}

	@Mutation({
		input: orgDepartmentMoveInput,
		output: orgOkOutput,
		meta: restMeta("POST", "/org/departments/{id}/move", TAG),
	})
	async moveDepartment(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof orgDepartmentMoveInput>,
	) {
		await this.toChuc.yeuCauQuanTri(ctx.user.id);
		return this.toChuc.moveDepartment(input);
	}
}
