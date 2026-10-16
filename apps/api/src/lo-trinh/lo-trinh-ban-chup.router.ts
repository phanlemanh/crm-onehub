import {
	BAN_CHUP_LO_TRINH,
	type BanChupVao,
	banChupRa,
	banChupVao,
} from "@crm/validation/ban-chup-lo-trinh";
import { Inject, Logger } from "@nestjs/common";
import { Ctx, Input, Mutation, Router, UseMiddlewares } from "nestjs-trpc";
import type { KhoaDayLoTrinhContext } from "../trpc/context.types";
import { KhoaDayLoTrinhMiddleware } from "../trpc/middlewares/khoa-day-lo-trinh.middleware";
import { restMeta } from "../trpc/openapi";
import { LoTrinhBanChupService } from "./lo-trinh-ban-chup.service";

@Router({ alias: "loTrinhBanChup" })
@UseMiddlewares(KhoaDayLoTrinhMiddleware)
export class LoTrinhBanChupRouter {
	private readonly logger = new Logger(LoTrinhBanChupRouter.name);

	constructor(
		@Inject(LoTrinhBanChupService)
		private readonly banChup: LoTrinhBanChupService,
	) {}

	@Mutation({
		input: banChupVao,
		output: banChupRa,
		meta: restMeta("POST", BAN_CHUP_LO_TRINH.duongRest, ["Roadmap"]),
	})
	async day(@Ctx() ctx: KhoaDayLoTrinhContext, @Input() input: BanChupVao) {
		const ketQua = await this.banChup.ghi(input);
		this.logger.log({
			message: "lo-trinh.ban-chup",
			apiKeyId: ctx.khoaDayLoTrinh.apiKeyId,
			sha: input.sha,
			ketQua,
		});
		return { ketQua };
	}
}
