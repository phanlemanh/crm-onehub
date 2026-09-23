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
	zaloCuaToiOutput,
	zaloGoOutput,
	zaloLuuUuTienInput,
	zaloLuuUuTienOutput,
	zaloTaoMaOutput,
	zaloXuongOutput,
} from "./zalo.contracts";
import { ZaloService } from "./zalo.service";

@Router({ alias: "zalo" })
@UseMiddlewares(AuthMiddleware)
export class ZaloRouter {
	constructor(@Inject(ZaloService) private readonly zalo: ZaloService) {}

	@Mutation({
		output: zaloTaoMaOutput,
		meta: restMeta("POST", "/zalo/code", ["Zalo"]),
	})
	taoMa(@Ctx() ctx: AuthedTrpcContext) {
		return this.zalo.taoMa(ctx.user.id);
	}

	@Mutation({
		output: zaloGoOutput,
		meta: restMeta("DELETE", "/zalo/link", ["Zalo"]),
	})
	go(@Ctx() ctx: AuthedTrpcContext) {
		return this.zalo.go(ctx.user.id);
	}

	@Mutation({
		input: zaloLuuUuTienInput,
		output: zaloLuuUuTienOutput,
		meta: restMeta("PATCH", "/zalo/preference", ["Zalo"]),
	})
	luuUuTien(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof zaloLuuUuTienInput>,
	) {
		return this.zalo.luuUuTien(ctx.user.id, input.channel);
	}

	@Query({
		output: zaloCuaToiOutput,
		meta: restMeta("GET", "/zalo/me", ["Zalo"]),
	})
	cuaToi(@Ctx() ctx: AuthedTrpcContext) {
		return this.zalo.cuaToi(ctx.user.id);
	}

	@Query({
		output: zaloXuongOutput,
		meta: restMeta("GET", "/zalo/workspace", ["Zalo"]),
	})
	xuong(@Ctx() ctx: AuthedTrpcContext) {
		return this.zalo.xuong(ctx.user.id);
	}
}
