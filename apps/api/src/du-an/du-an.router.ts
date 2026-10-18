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
	duAnDaDoiOutput,
	duAnDong,
	duAnIdInput,
	duAnLichOutput,
	duAnListInput,
	duAnListOutput,
	duAnMocSuaInput,
	duAnMocTaoInput,
	duAnOkOutput,
	duAnPhuThuocInput,
	duAnSuaInput,
	duAnTaoInput,
	duAnTaoOutput,
} from "./du-an.contracts";
import { DuAnService } from "./du-an.service";

const TAG = ["DuAn"];

@Router({ alias: "duAn" })
@UseMiddlewares(PhamViDoiTacMiddleware)
export class DuAnRouter {
	constructor(@Inject(DuAnService) private readonly duAn: DuAnService) {}

	private nguoi(ctx: AuthedTrpcContext) {
		return ctx.user.id;
	}

	@Query({
		input: duAnListInput,
		output: duAnListOutput,
		meta: restMeta("GET", "/du-an", TAG),
	})
	list(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof duAnListInput>,
	) {
		return this.duAn.list(input, this.nguoi(ctx));
	}

	@Query({
		input: duAnIdInput,
		output: duAnDong,
		meta: restMeta("GET", "/du-an/{id}", TAG),
	})
	get(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof duAnIdInput>,
	) {
		return this.duAn.get(input.id, this.nguoi(ctx));
	}

	@Query({
		input: duAnIdInput,
		output: duAnLichOutput,
		meta: restMeta("GET", "/du-an/{id}/lich", TAG),
	})
	lich(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof duAnIdInput>,
	) {
		return this.duAn.lich(input.id, ctx.user.id);
	}

	@Mutation({
		input: duAnTaoInput,
		output: duAnTaoOutput,
		meta: restMeta("POST", "/du-an", TAG),
	})
	tao(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof duAnTaoInput>,
	) {
		return this.duAn.tao(input, ctx.user.id);
	}

	@Mutation({
		input: duAnSuaInput,
		output: duAnOkOutput,
		meta: restMeta("PATCH", "/du-an/{id}", TAG),
	})
	sua(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof duAnSuaInput>,
	) {
		return this.duAn.sua(input, ctx.user.id);
	}

	@Mutation({
		input: duAnIdInput,
		output: duAnOkOutput,
		meta: restMeta("POST", "/du-an/{id}/dong", TAG),
	})
	dong(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof duAnIdInput>,
	) {
		return this.duAn.dong(input.id, this.nguoi(ctx));
	}

	@Mutation({
		input: duAnIdInput,
		output: duAnOkOutput,
		meta: restMeta("POST", "/du-an/{id}/mo-lai", TAG),
	})
	moLai(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof duAnIdInput>,
	) {
		return this.duAn.moLai(input.id, this.nguoi(ctx));
	}

	@Mutation({
		input: duAnIdInput,
		output: duAnOkOutput,
		meta: restMeta("DELETE", "/du-an/{id}", TAG),
	})
	xoa(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof duAnIdInput>,
	) {
		return this.duAn.xoa(input.id, this.nguoi(ctx));
	}

	@Mutation({
		input: duAnMocTaoInput,
		output: duAnTaoOutput,
		meta: restMeta("POST", "/du-an/{duAnId}/moc", TAG),
	})
	mocTao(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof duAnMocTaoInput>,
	) {
		return this.duAn.mocTao(input, ctx.user.id);
	}

	@Mutation({
		input: duAnMocSuaInput,
		output: duAnOkOutput,
		meta: restMeta("PATCH", "/du-an/moc/{id}", TAG),
	})
	mocSua(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof duAnMocSuaInput>,
	) {
		return this.duAn.mocSua(input, ctx.user.id);
	}

	@Mutation({
		input: duAnIdInput,
		output: duAnOkOutput,
		meta: restMeta("DELETE", "/du-an/moc/{id}", TAG),
	})
	mocXoa(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof duAnIdInput>,
	) {
		return this.duAn.mocXoa(input.id, ctx.user.id);
	}

	@Mutation({
		input: duAnPhuThuocInput,
		output: duAnDaDoiOutput,
		meta: restMeta("POST", "/du-an/phu-thuoc", TAG),
	})
	phuThuocTao(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof duAnPhuThuocInput>,
	) {
		return this.duAn.phuThuocTao(input, ctx.user.id);
	}

	@Mutation({
		input: duAnPhuThuocInput,
		output: duAnOkOutput,
		meta: restMeta("POST", "/du-an/phu-thuoc/xoa", TAG),
	})
	phuThuocXoa(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof duAnPhuThuocInput>,
	) {
		return this.duAn.phuThuocXoa(input, ctx.user.id);
	}
}
