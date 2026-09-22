import { z } from "zod";
import { parse } from "./index";

export const ONBOARDING_BATCH_MAX_ITEMS = 500;

export const onboardingIngestItem = z.object({
	platformBrokerId: z.string().trim().min(1).max(120),
	accountAt: z.iso.datetime().nullable(),
	courseAt: z.iso.datetime().nullable(),
	activeAt: z.iso.datetime().nullable(),
	dealAt: z.iso.datetime().nullable(),
});

export const onboardingBatch = z.object({
	source: z.literal("onehub-platform"),
	planId: z.string().trim().min(1).max(120),
	observedAt: z.iso.datetime(),
	items: z.array(onboardingIngestItem).min(1).max(ONBOARDING_BATCH_MAX_ITEMS),
});

export type OnboardingIngestItem = z.infer<typeof onboardingIngestItem>;
export type OnboardingBatch = z.infer<typeof onboardingBatch>;

export function parseOnboardingBatch(value: unknown): OnboardingBatch {
	return parse(onboardingBatch, value, "lô số liệu từ nền tảng");
}
