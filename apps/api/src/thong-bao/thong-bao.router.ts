import {
	danhSachThongBaoInput,
	moThongBaoInput,
} from "@crm/validation/thong-bao";
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
	chuongThongBaoOutput,
	danhSachThongBaoOutput,
	docHetThongBaoOutput,
	moThongBaoOutput,
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
		output: chuongThongBaoOutput,
		meta: restMeta("GET", "/thong-bao/chuong", TAG),
	})
	chuong(@Ctx() ctx: AuthedTrpcContext) {
		return this.thongBao.chuong(ctx.user.id);
	}

	@Query({
		input: danhSachThongBaoInput,
		output: danhSachThongBaoOutput,
		meta: restMeta("GET", "/thong-bao", TAG),
	})
	danhSach(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof danhSachThongBaoInput>,
	) {
		return this.thongBao.danhSach(ctx.user.id, input.chiChuaDoc, input.cursor);
	}

	@Mutation({
		input: moThongBaoInput,
		output: moThongBaoOutput,
		meta: restMeta("POST", "/thong-bao/{id}/mo", TAG),
	})
	moMot(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof moThongBaoInput>,
	) {
		return this.thongBao.moMot(ctx.user.id, input.id, new Date());
	}

	@Mutation({
		output: docHetThongBaoOutput,
		meta: restMeta("POST", "/thong-bao/doc-het", TAG),
	})
	docHet(@Ctx() ctx: AuthedTrpcContext) {
		return this.thongBao.docHet(ctx.user.id, new Date());
	}
}
