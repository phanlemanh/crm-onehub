import { z } from "zod";
import { parse } from "./index";

export const LOAI_VIEC_MA_LECH = "onboarding-identify";

export const MA_NEN_TANG_KEY = "ma_moi_gioi_nen_tang";

export const onboardingIdentifyPayload = z.object({
	planId: z.string().trim().min(1).max(120),
	platformBrokerId: z.string().trim().min(1).max(120),
});

export type OnboardingIdentifyPayload = z.infer<
	typeof onboardingIdentifyPayload
>;

export function parseOnboardingIdentifyPayload(
	value: unknown,
): OnboardingIdentifyPayload {
	return parse(onboardingIdentifyPayload, value, "payload onboarding-identify");
}
