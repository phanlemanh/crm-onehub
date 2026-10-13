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
	viecBanGhiInput,
	viecChiTietOutput,
	viecCreateInput,
	viecCuaBanGhiOutput,
	viecCuaToiInput,
	viecCuaToiNhomOutput,
	viecDoiNguoiInput,
	viecDoiTrangThaiInput,
	viecGanInput,
	viecIdInput,
	viecSuaInput,
	viecTaoOutput,
	viecTheoDoiInput,
	viecVetOutput,
} from "./viec.contracts";
import { ViecService } from "./viec.service";

const TAG = ["Viec"];

@Router({ alias: "viec" })
@UseMiddlewares(PhamViDoiTacMiddleware)
export class ViecRouter {
	constructor(@Inject(ViecService) private readonly viec: ViecService) {}

	@Query({
		input: viecCuaToiInput,
		output: viecCuaToiNhomOutput,
		meta: restMeta("GET", "/viec", TAG),
	})
	cuaToi(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof viecCuaToiInput>,
	) {
		return this.viec.cuaToi(input, ctx.user.id);
	}

	@Query({
		input: viecIdInput,
		output: viecChiTietOutput,
		meta: restMeta("GET", "/viec/{id}", TAG),
	})
	get(@Ctx() ctx: AuthedTrpcContext, @Input("id") id: string) {
		return this.viec.get(id, ctx.user.id);
	}

	@Query({
		input: viecIdInput,
		output: viecVetOutput,
		meta: restMeta("GET", "/viec/{id}/lich-su", TAG),
	})
	lichSu(@Ctx() ctx: AuthedTrpcContext, @Input("id") id: string) {
		return this.viec.lichSu(id, ctx.user.id);
	}

	@Query({
		input: viecBanGhiInput,
		output: viecCuaBanGhiOutput,
		meta: restMeta("GET", "/viec-theo-ban-ghi", TAG),
	})
	cuaBanGhi(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof viecBanGhiInput>,
	) {
		return this.viec.cuaBanGhi(input, ctx.user.id);
	}

	@Mutation({
		input: viecCreateInput,
		output: viecTaoOutput,
		meta: restMeta("POST", "/viec", TAG),
	})
	create(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof viecCreateInput>,
	) {
		return this.viec.create(input, ctx.user.id);
	}

	@Mutation({
		input: viecDoiTrangThaiInput,
		output: viecChiTietOutput,
		meta: restMeta("POST", "/viec/{id}/trang-thai", TAG),
	})
	doiTrangThai(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof viecDoiTrangThaiInput>,
	) {
		return this.viec.doiTrangThai(input, ctx.user.id);
	}

	@Mutation({
		input: viecSuaInput,
		output: viecChiTietOutput,
		meta: restMeta("PATCH", "/viec/{id}", TAG),
	})
	sua(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof viecSuaInput>,
	) {
		return this.viec.sua(input, ctx.user.id);
	}

	@Mutation({
		input: viecDoiNguoiInput,
		output: viecChiTietOutput,
		meta: restMeta("POST", "/viec/{id}/nguoi-thuc-hien", TAG),
	})
	doiNguoiThucHien(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof viecDoiNguoiInput>,
	) {
		return this.viec.doiNguoiThucHien(input, ctx.user.id);
	}

	@Mutation({
		input: viecGanInput,
		output: viecChiTietOutput,
		meta: restMeta("POST", "/viec/{id}/gan", TAG),
	})
	gan(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof viecGanInput>,
	) {
		return this.viec.gan(input, ctx.user.id);
	}

	@Mutation({
		input: viecGanInput,
		output: viecChiTietOutput,
		meta: restMeta("POST", "/viec/{id}/go", TAG),
	})
	go(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof viecGanInput>,
	) {
		return this.viec.go(input, ctx.user.id);
	}

	@Mutation({
		input: viecTheoDoiInput,
		output: viecChiTietOutput,
		meta: restMeta("POST", "/viec/{id}/theo-doi", TAG),
	})
	theoDoi(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof viecTheoDoiInput>,
	) {
		return this.viec.theoDoi(input, ctx.user.id);
	}

	@Mutation({
		input: viecTheoDoiInput,
		output: viecTaoOutput,
		meta: restMeta("POST", "/viec/{id}/bo-theo-doi", TAG),
	})
	boTheoDoi(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof viecTheoDoiInput>,
	) {
		return this.viec.boTheoDoi(input, ctx.user.id);
	}

	@Mutation({
		input: viecIdInput,
		output: viecTaoOutput,
		meta: restMeta("DELETE", "/viec/{id}", TAG),
	})
	xoa(@Ctx() ctx: AuthedTrpcContext, @Input("id") id: string) {
		return this.viec.xoa(id, ctx.user.id);
	}
}
