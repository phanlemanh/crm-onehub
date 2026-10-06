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
import { PhamViToChucMiddleware } from "../trpc/middlewares/pham-vi-du-lieu.middleware";
import { restMeta } from "../trpc/openapi";
import {
	orgAccessOutput,
	orgAddPeopleInput,
	orgAttachInput,
	orgDepartmentArchiveOutput,
	orgDepartmentCreateInput,
	orgDepartmentMoveInput,
	orgDivisionCreateInput,
	orgHeadInput,
	orgIdInput,
	orgImportApplyInput,
	orgImportApplyOutput,
	orgImportInput,
	orgImportPreviewOutput,
	orgKhoiPhucOutput,
	orgLuuTruXemTruocOutput,
	orgOkOutput,
	orgPlacementInput,
	orgRenameInput,
	orgReorderInput,
	orgTreeOutput,
} from "./to-chuc.contracts";
import { ToChucService } from "./to-chuc.service";

const TAG = ["Organization"];

@Router({ alias: "org" })
@UseMiddlewares(PhamViToChucMiddleware)
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
		output: orgKhoiPhucOutput,
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

	@Query({
		input: orgIdInput,
		output: orgLuuTruXemTruocOutput,
		meta: restMeta("GET", "/org/departments/{id}/archive-check", TAG),
	})
	async luuTruXemTruoc(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof orgIdInput>,
	) {
		await this.toChuc.yeuCauQuanTri(ctx.user.id);
		return this.toChuc.luuTruXemTruoc(input);
	}

	@Mutation({
		input: orgIdInput,
		output: orgDepartmentArchiveOutput,
		meta: restMeta("POST", "/org/departments/{id}/archive", TAG),
	})
	async archiveDepartment(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof orgIdInput>,
	) {
		await this.toChuc.yeuCauQuanTri(ctx.user.id);
		return this.toChuc.archiveDepartment(input);
	}

	@Mutation({
		input: orgIdInput,
		output: orgKhoiPhucOutput,
		meta: restMeta("POST", "/org/departments/{id}/restore", TAG),
	})
	async restoreDepartment(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof orgIdInput>,
	) {
		await this.toChuc.yeuCauQuanTri(ctx.user.id);
		return this.toChuc.restoreDepartment(input);
	}

	@Mutation({
		input: orgIdInput,
		output: orgOkOutput,
		meta: restMeta("DELETE", "/org/departments/{id}", TAG),
	})
	async purgeDepartment(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof orgIdInput>,
	) {
		await this.toChuc.yeuCauQuanTri(ctx.user.id);
		return this.toChuc.purgeDepartment(input);
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

	@Mutation({
		input: orgAttachInput,
		output: orgOkOutput,
		meta: restMeta("POST", "/org/divisions/{divisionId}/departments", TAG),
	})
	async attachDepartments(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof orgAttachInput>,
	) {
		await this.toChuc.yeuCauQuanTri(ctx.user.id);
		return this.toChuc.attachDepartments(input);
	}

	@Mutation({
		input: orgAddPeopleInput,
		output: orgOkOutput,
		meta: restMeta("POST", "/org/departments/{departmentId}/people", TAG),
	})
	async addPeople(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof orgAddPeopleInput>,
	) {
		await this.toChuc.yeuCauQuanTri(ctx.user.id);
		return this.toChuc.addPeople(input);
	}

	@Mutation({
		input: orgHeadInput,
		output: orgOkOutput,
		meta: restMeta("POST", "/org/heads", TAG),
	})
	async setHead(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof orgHeadInput>,
	) {
		await this.toChuc.yeuCauQuanTri(ctx.user.id);
		return this.toChuc.setHead(input);
	}

	@Mutation({
		input: orgPlacementInput,
		output: orgOkOutput,
		meta: restMeta("POST", "/org/placements", TAG),
	})
	async setPlacement(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof orgPlacementInput>,
	) {
		await this.toChuc.yeuCauQuanTri(ctx.user.id);
		return this.toChuc.setPlacement(input);
	}

	@Mutation({
		input: orgImportInput,
		output: orgImportPreviewOutput,
		meta: restMeta("POST", "/org/import/preview", TAG),
	})
	async previewImport(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof orgImportInput>,
	) {
		await this.toChuc.yeuCauQuanTri(ctx.user.id);
		return this.toChuc.previewImport(input);
	}

	@Mutation({
		input: orgImportApplyInput,
		output: orgImportApplyOutput,
		meta: restMeta("POST", "/org/import", TAG),
	})
	async applyImport(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof orgImportApplyInput>,
	) {
		await this.toChuc.yeuCauQuanTri(ctx.user.id);
		return this.toChuc.applyImport(input);
	}
}
