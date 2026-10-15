import { keoVeOutput } from "@crm/validation/tin-hieu";
import { Inject, Logger } from "@nestjs/common";
import { Ctx, Mutation, Router, UseMiddlewares } from "nestjs-trpc";
import type { KhoaTrpcContext } from "../trpc/context.types";
import { KhoaKeoTinHieuMiddleware } from "../trpc/middlewares/khoa-keo-tin-hieu.middleware";
import { restMeta } from "../trpc/openapi";
import { TinHieuService } from "./tin-hieu.service";

@Router({ alias: "tinHieuLich" })
@UseMiddlewares(KhoaKeoTinHieuMiddleware)
export class TinHieuLichRouter {
	private readonly logger = new Logger(TinHieuLichRouter.name);

	constructor(
		@Inject(TinHieuService) private readonly tinHieu: TinHieuService,
	) {}

	@Mutation({
		output: keoVeOutput,
		meta: restMeta("POST", "/tin-hieu/lich/keo-ve", ["Signals"]),
	})
	async keoVe(@Ctx() ctx: KhoaTrpcContext) {
		const { apiKeyId, userId, role } = ctx.khoaKeoTinHieu;
		this.logger.log({ message: "tin-hieu.keo-ve-lich", apiKeyId, userId });
		return this.tinHieu.keoVe({ id: userId, role });
	}
}
