import { createLoader, parseAsString, parseAsStringLiteral } from "nuqs/server";
import { SEARCH_PARAM } from "@/lib/search-param-keys";

export const ONBOARDING_TRANG_THAI = ["dang-chay", "da-dong"] as const;

export type OnboardingTrangThai = (typeof ONBOARDING_TRANG_THAI)[number];

export const onboardingParsers = {
	[SEARCH_PARAM.onboarding.boPhan]: parseAsString.withDefault(""),
	[SEARCH_PARAM.onboarding.trangThai]: parseAsStringLiteral(
		ONBOARDING_TRANG_THAI,
	).withDefault("dang-chay"),
};

export const loadOnboardingSearchParams = createLoader(onboardingParsers);
