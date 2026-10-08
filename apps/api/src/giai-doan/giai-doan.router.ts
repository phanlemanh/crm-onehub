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
import { PhamViDoiTacMiddleware } from "../trpc/middlewares/pham-vi-du-lieu.middleware";
import { restMeta } from "../trpc/openapi";
import {
	giaiDoanArchivedOutput,
	giaiDoanArchiveInput,
	giaiDoanCreateInput,
	giaiDoanListOutput,
	giaiDoanRenameInput,
	giaiDoanReorderInput,
	giaiDoanRestoreInput,
	giaiDoanWriteOutput,
} from "./giai-doan.contracts";
import { GiaiDoanService } from "./giai-doan.service";

@Router({ alias: "giaiDoan" })
@UseMiddlewares(PhamViDoiTacMiddleware)
export class GiaiDoanRouter {
	constructor(
		@Inject(GiaiDoanService) private readonly giaiDoan: GiaiDoanService,
	) {}

	@Query({
		output: giaiDoanListOutput,
		meta: restMeta("GET", "/deal-stages", ["Deal stages"]),
	})
	async list(@Ctx() ctx: AuthedTrpcContext) {
		return this.giaiDoan.list(ctx.user.id);
	}

	@Mutation({
		input: giaiDoanCreateInput,
		output: giaiDoanWriteOutput,
		meta: restMeta("POST", "/deal-stages", ["Deal stages"]),
	})
	async create(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof giaiDoanCreateInput>,
	) {
		return this.giaiDoan.create(ctx.user.id, input);
	}

	@Mutation({
		input: giaiDoanRenameInput,
		output: giaiDoanWriteOutput,
		meta: restMeta("PATCH", "/deal-stages/{id}", ["Deal stages"]),
	})
	async rename(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof giaiDoanRenameInput>,
	) {
		return this.giaiDoan.rename(ctx.user.id, input);
	}

	@Mutation({
		input: giaiDoanReorderInput,
		output: giaiDoanWriteOutput,
		meta: restMeta("POST", "/deal-stages/reorder", ["Deal stages"]),
	})
	async reorder(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof giaiDoanReorderInput>,
	) {
		return this.giaiDoan.reorder(ctx.user.id, input);
	}

	@Mutation({
		input: giaiDoanArchiveInput,
		output: giaiDoanWriteOutput,
		meta: restMeta("POST", "/deal-stages/{id}/archive", ["Deal stages"]),
	})
	async archive(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof giaiDoanArchiveInput>,
	) {
		return this.giaiDoan.archive(ctx.user.id, input);
	}

	@Query({
		output: giaiDoanArchivedOutput,
		meta: restMeta("GET", "/deal-stages/archived", ["Deal stages"]),
	})
	async archived() {
		return this.giaiDoan.archived();
	}

	@Mutation({
		input: giaiDoanRestoreInput,
		output: giaiDoanWriteOutput,
		meta: restMeta("POST", "/deal-stages/{id}/restore", ["Deal stages"]),
	})
	async restore(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof giaiDoanRestoreInput>,
	) {
		return this.giaiDoan.restore(ctx.user.id, input);
	}
}
