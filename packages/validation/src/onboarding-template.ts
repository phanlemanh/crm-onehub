import { z } from "zod";
import { parse } from "./index";

export const ONBOARDING_TEMPLATE_MAX_STEPS = 100;

export const onboardingTemplateStep = z.object({
	label: z.string().trim().min(1).max(200),
	departmentId: z.string().trim().min(1).max(120),
	position: z.int().min(0).max(ONBOARDING_TEMPLATE_MAX_STEPS),
	offsetDays: z.int().min(0).max(365),
});

export const onboardingTemplateSteps = z
	.array(onboardingTemplateStep)
	.min(1)
	.max(ONBOARDING_TEMPLATE_MAX_STEPS);

export type OnboardingTemplateStep = z.infer<typeof onboardingTemplateStep>;

export function parseOnboardingTemplateSteps(
	value: unknown,
): OnboardingTemplateStep[] {
	return parse(onboardingTemplateSteps, value, "bước của khuôn kế hoạch");
}
