import { danhSachInput, moMotInput } from "@crm/validation/thong-bao";
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
	chuongOutput,
	danhSachOutput,
	docHetOutput,
	moMotOutput,
} from "./thong-bao.contracts";
import { ThongBaoService } from "./thong-bao.service";

const TAG = ["Notifications"];

@Router({ alias: "thongBao" })
@UseMiddlewares(PhamViChungMiddleware)
export class ThongBaoRouter {
	constructor(
		@Inject(ThongBaoService) private readonly thongBao: ThongBaoService,
	) {}

	@Query({
		output: chuongOutput,
		meta: restMeta("GET", "/thong-bao/chuong", TAG),
	})
	chuong(@Ctx() ctx: AuthedTrpcContext) {
		return this.thongBao.chuong(ctx.user.id);
	}

	@Query({
		input: danhSachInput,
		output: danhSachOutput,
		meta: restMeta("GET", "/thong-bao", TAG),
	})
	danhSach(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof danhSachInput>,
	) {
		return this.thongBao.danhSach(ctx.user.id, input.chiChuaDoc, input.conTro);
	}

	@Mutation({
		input: moMotInput,
		output: moMotOutput,
		meta: restMeta("POST", "/thong-bao/{id}/mo", TAG),
	})
	moMot(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof moMotInput>,
	) {
		return this.thongBao.moMot(ctx.user.id, input.id, new Date());
	}

	@Mutation({
		output: docHetOutput,
		meta: restMeta("POST", "/thong-bao/doc-het", TAG),
	})
	docHet(@Ctx() ctx: AuthedTrpcContext) {
		return this.thongBao.docHet(ctx.user.id, new Date());
	}
}
