import { Inject } from "@nestjs/common";
import { Input, Mutation, Query, Router } from "nestjs-trpc";
import type { z } from "zod";
import { restMeta } from "../trpc/openapi";
import {
	chiPhiAdsListInput,
	chiPhiAdsListOutput,
	chiPhiAdsUpsertInput,
	chiPhiAdsUpsertOutput,
} from "./chi-phi-ads.contracts";
import { ChiPhiAdsService } from "./chi-phi-ads.service";

/**
 * Chi phí quảng cáo (Google Ads · Meta · TikTok) theo ngày × campaign.
 * Máy nội bộ OneHub đẩy snapshot hằng ngày qua cầu REST (x-api-key):
 *   POST /rest/ad-spend  — bulk upsert theo khoá (ngay, nenTang, campaignId)
 *   GET  /rest/ad-spend  — đọc theo khoảng ngày (phục vụ app CRM hiển thị)
 */
@Router({ alias: "chiPhiAds" })
export class ChiPhiAdsRouter {
	constructor(
		@Inject(ChiPhiAdsService) private readonly chiPhi: ChiPhiAdsService,
	) {}

	@Mutation({
		input: chiPhiAdsUpsertInput,
		output: chiPhiAdsUpsertOutput,
		meta: restMeta("POST", "/ad-spend", ["AdSpend"]),
	})
	async upsertBulk(@Input() input: z.infer<typeof chiPhiAdsUpsertInput>) {
		return this.chiPhi.upsertBulk(input);
	}

	@Query({
		input: chiPhiAdsListInput,
		output: chiPhiAdsListOutput,
		meta: restMeta("GET", "/ad-spend", ["AdSpend"]),
	})
	async list(@Input() input: z.infer<typeof chiPhiAdsListInput>) {
		return this.chiPhi.list(input);
	}
}
