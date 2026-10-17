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
	datNgayNghiTuanInput,
	lichLamViecOutput,
	lichOkOutput,
	themNgayLeInput,
	xoaNgayLeInput,
} from "./lich-lam-viec.contracts";
import { LichLamViecService } from "./lich-lam-viec.service";

const TAG = ["LichLamViec"];

@Router({ alias: "lichLamViec" })
@UseMiddlewares(PhamViChungMiddleware)
export class LichLamViecRouter {
	constructor(
		@Inject(LichLamViecService) private readonly lich: LichLamViecService,
	) {}

	@Query({
		output: lichLamViecOutput,
		meta: restMeta("GET", "/lich-lam-viec", TAG),
	})
	get(@Ctx() ctx: AuthedTrpcContext) {
		return this.lich.get(ctx.user.id);
	}

	@Mutation({
		input: datNgayNghiTuanInput,
		output: lichOkOutput,
		meta: restMeta("PUT", "/lich-lam-viec/ngay-nghi-tuan", TAG),
	})
	datNgayNghiTuan(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof datNgayNghiTuanInput>,
	) {
		return this.lich.datNgayNghiTuan(input.ngayNghiTuan, ctx.user.id);
	}

	@Mutation({
		input: themNgayLeInput,
		output: lichOkOutput,
		meta: restMeta("POST", "/lich-lam-viec/ngay-le", TAG),
	})
	themNgayLe(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof themNgayLeInput>,
	) {
		return this.lich.themNgayLe(input, ctx.user.id);
	}

	@Mutation({
		input: xoaNgayLeInput,
		output: lichOkOutput,
		meta: restMeta("DELETE", "/lich-lam-viec/ngay-le/{id}", TAG),
	})
	xoaNgayLe(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof xoaNgayLeInput>,
	) {
		return this.lich.xoaNgayLe(input.id, ctx.user.id);
	}
}
