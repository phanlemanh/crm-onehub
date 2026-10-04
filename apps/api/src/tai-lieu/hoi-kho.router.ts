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
import { docPhamViYeuCau } from "../trpc/pham-vi-yeu-cau";
import type { NguoiGoi } from "./quyen";
import {
	taiLieuBaoSaiInput,
	taiLieuBaoSaiOutput,
	taiLieuHoiInput,
	taiLieuHoiKetQuaInput,
	taiLieuHoiKetQuaOutput,
	taiLieuHoiOutput,
} from "./tai-lieu-hoi.contracts";
import { TaiLieuHoiService } from "./tai-lieu-hoi.service";

const TAG = ["Documents"];

function nguoiGoi(ctx: AuthedTrpcContext): NguoiGoi {
	return { id: ctx.user.id, role: docPhamViYeuCau(ctx).role };
}

@Router({ alias: "hoiKho" })
@UseMiddlewares(PhamViDoiTacMiddleware)
export class HoiKhoRouter {
	constructor(
		@Inject(TaiLieuHoiService) private readonly hoiKho: TaiLieuHoiService,
	) {}

	@Mutation({
		input: taiLieuHoiInput,
		output: taiLieuHoiOutput,
		meta: restMeta("POST", "/tai-lieu/hoi", TAG),
	})
	hoi(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof taiLieuHoiInput>,
	) {
		return this.hoiKho.hoi(nguoiGoi(ctx), input);
	}

	@Query({
		input: taiLieuHoiKetQuaInput,
		output: taiLieuHoiKetQuaOutput,
		meta: restMeta("GET", "/tai-lieu/hoi/{hoiId}", TAG),
	})
	ketQua(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof taiLieuHoiKetQuaInput>,
	) {
		return this.hoiKho.ketQua(nguoiGoi(ctx), input.hoiId);
	}

	@Mutation({
		input: taiLieuBaoSaiInput,
		output: taiLieuBaoSaiOutput,
		meta: restMeta("POST", "/tai-lieu/hoi/{hoiId}/bao-sai", TAG),
	})
	baoSai(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof taiLieuBaoSaiInput>,
	) {
		return this.hoiKho.baoSai(nguoiGoi(ctx), input);
	}
}
