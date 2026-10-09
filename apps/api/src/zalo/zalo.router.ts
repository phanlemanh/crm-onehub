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
import { restMeta } from "../trpc/openapi";
import {
	zaloCuaToiOutput,
	zaloGoOutput,
	zaloGuiThuOutput,
	zaloLuuBotInput,
	zaloLuuBotOutput,
	zaloLuuDongTroLyOkrInput,
	zaloLuuDongTroLyOkrOutput,
	zaloLuuUuTienInput,
	zaloLuuUuTienOutput,
	zaloTaoMaOutput,
	zaloXuongOutput,
} from "./zalo.contracts";
import { ZaloService } from "./zalo.service";

@Router({ alias: "zalo" })
@UseMiddlewares(PhamViChungMiddleware)
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

	@Mutation({
		input: zaloLuuDongTroLyOkrInput,
		output: zaloLuuDongTroLyOkrOutput,
		meta: restMeta("PUT", "/zalo/preference/okr-weekly-summary", ["Zalo"]),
	})
	luuDongTroLyOkr(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof zaloLuuDongTroLyOkrInput>,
	) {
		return this.zalo.luuDongTroLyOkr(ctx.user.id, input.bat);
	}

	@Mutation({
		input: zaloLuuBotInput,
		output: zaloLuuBotOutput,
		meta: restMeta("PUT", "/zalo/bot", ["Zalo"]),
	})
	luuBot(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof zaloLuuBotInput>,
	) {
		return this.zalo.luuBot(ctx.user.id, input.token, input.xacNhanDoiBot);
	}

	@Mutation({
		output: zaloGuiThuOutput,
		meta: restMeta("POST", "/zalo/test-message", ["Zalo"]),
	})
	guiThu(@Ctx() ctx: AuthedTrpcContext) {
		return this.zalo.guiThu(ctx.user.id);
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
