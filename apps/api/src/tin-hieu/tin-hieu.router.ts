import {
	guiTinHieuInput,
	keoVeOutput,
	xoaTinHieuInput,
} from "@crm/validation/tin-hieu";
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
import { docPhamViYeuCau } from "../trpc/pham-vi-yeu-cau";
import {
	guiTinHieuOutput,
	tinHieuCuaToiOutput,
	tinHieuTatCaOutput,
	xoaTinHieuOutput,
} from "./tin-hieu.contracts";
import { type NguoiGoiTinHieu, TinHieuService } from "./tin-hieu.service";

const TAG = ["Signals"];

function nguoiGoi(ctx: AuthedTrpcContext): NguoiGoiTinHieu {
	return { id: ctx.user.id, role: docPhamViYeuCau(ctx).role };
}

@Router({ alias: "tinHieu" })
@UseMiddlewares(PhamViChungMiddleware)
export class TinHieuRouter {
	constructor(
		@Inject(TinHieuService) private readonly tinHieu: TinHieuService,
	) {}

	@Mutation({
		input: guiTinHieuInput,
		output: guiTinHieuOutput,
		meta: restMeta("POST", "/tin-hieu", TAG),
	})
	gui(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof guiTinHieuInput>,
	) {
		return this.tinHieu.gui(nguoiGoi(ctx), input);
	}

	@Query({
		output: tinHieuCuaToiOutput,
		meta: restMeta("GET", "/tin-hieu/cua-toi", TAG),
	})
	cuaToi(@Ctx() ctx: AuthedTrpcContext) {
		return this.tinHieu.cuaToi(nguoiGoi(ctx));
	}

	@Query({
		output: tinHieuTatCaOutput,
		meta: restMeta("GET", "/tin-hieu/tat-ca", TAG),
	})
	tatCa(@Ctx() ctx: AuthedTrpcContext) {
		return this.tinHieu.tatCa(nguoiGoi(ctx));
	}

	@Mutation({
		input: xoaTinHieuInput,
		output: xoaTinHieuOutput,
		meta: restMeta("POST", "/tin-hieu/{id}/xoa", TAG),
	})
	xoa(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof xoaTinHieuInput>,
	) {
		return this.tinHieu.xoa(nguoiGoi(ctx), input.id);
	}

	@Mutation({
		output: keoVeOutput,
		meta: restMeta("POST", "/tin-hieu/keo-ve", TAG),
	})
	keoVe(@Ctx() ctx: AuthedTrpcContext) {
		return this.tinHieu.keoVe(nguoiGoi(ctx));
	}
}
