import { z } from "zod";
import { parse } from "./index";

export const LISTING_TIERS = ["cao", "vua", "thap", "ngu"] as const;

export const LISTING_BATCH_MAX_ITEMS = 500;

export const listingItem = z.object({
	url: z.url().max(500),
	shopName: z.string().trim().min(1).max(200),
	personName: z.string().trim().min(1).max(200).optional(),
	isCompany: z.boolean(),
	hasLicense: z.boolean(),
	districts: z.array(z.string().trim().min(1).max(100)).max(30),
	city: z.string().trim().min(1).max(100).nullable(),
	listingsTotal: z.int().min(0).max(1_000_000),
	listingsNew30d: z.int().min(0).max(1_000_000),
	tier: z.enum(LISTING_TIERS),
	phone: z.string().trim().min(6).max(30).optional(),
});

export const listingBatch = z.object({
	source: z.literal("nhatot"),
	crawledAt: z.iso.datetime(),
	items: z.array(listingItem).min(1).max(LISTING_BATCH_MAX_ITEMS),
});

export type ListingItem = z.infer<typeof listingItem>;
export type ListingBatch = z.infer<typeof listingBatch>;
export type ListingTier = (typeof LISTING_TIERS)[number];

export function parseListingBatch(value: unknown): ListingBatch {
	return parse(listingBatch, value, "lô từ sàn");
}
