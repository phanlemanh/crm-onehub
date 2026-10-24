import { z } from "zod";

/** Chi phí quảng cáo theo ngày × nền tảng × campaign — đẩy từ máy nội bộ OneHub. */
export const NEN_TANG_ADS = ["google", "meta", "tiktok"] as const;

const ngayInput = z
	.string()
	.regex(/^\d{4}-\d{2}-\d{2}$/, "ngay phải dạng YYYY-MM-DD");

export const chiPhiAdsRowInput = z.object({
	ngay: ngayInput,
	nenTang: z.enum(NEN_TANG_ADS),
	accountId: z.string().trim().max(64).default(""),
	campaignId: z.string().trim().min(1).max(128),
	campaignName: z.string().trim().max(256).default(""),
	spend: z.number().min(0),
	currency: z.string().trim().max(8).default("VND"),
	clicks: z.number().int().min(0).default(0),
	impressions: z.number().int().min(0).default(0),
	conversions: z.number().min(0).default(0),
	fetchedAt: z.string().datetime({ offset: true }).optional(),
});

/** Giới hạn 300 dòng/lần để nằm dưới trần body 100KB của cầu REST — client tự chia trang. */
export const chiPhiAdsUpsertInput = z.object({
	rows: z.array(chiPhiAdsRowInput).min(1).max(300),
});

export const chiPhiAdsUpsertOutput = z.object({
	upserted: z.number().int(),
});

export const chiPhiAdsListInput = z.object({
	from: ngayInput,
	to: ngayInput,
	nenTang: z.enum(NEN_TANG_ADS).optional(),
});

export const chiPhiAdsRowOutput = z.object({
	ngay: z.string(),
	nenTang: z.string(),
	accountId: z.string(),
	campaignId: z.string(),
	campaignName: z.string(),
	spend: z.number(),
	currency: z.string(),
	clicks: z.number().int(),
	impressions: z.number().int(),
	conversions: z.number(),
});

export const chiPhiAdsListOutput = z.object({
	rows: z.array(chiPhiAdsRowOutput),
	tongSpend: z.number(),
});

export type ChiPhiAdsUpsertInput = z.infer<typeof chiPhiAdsUpsertInput>;
export type ChiPhiAdsListInput = z.infer<typeof chiPhiAdsListInput>;
export type ChiPhiAdsListOutput = z.infer<typeof chiPhiAdsListOutput>;
