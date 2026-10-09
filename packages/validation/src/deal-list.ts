import { z } from "zod";

const requiredText = z.string().min(1);

const finiteNumber = z.number().refine((value) => Number.isFinite(value));

const optionalText = z.string().min(1).nullable().catch(null);

export const dealListItem = z.object({
	id: requiredText,
	name: requiredText,
	stage: requiredText,
	stageId: requiredText.nullable().catch(null),
	amount: finiteNumber.nullable(),
	currency: requiredText,
	company: z.object({
		id: requiredText,
		name: requiredText,
		domain: optionalText,
		iconUrl: optionalText,
		iconDarkUrl: optionalText,
		iconTone: optionalText,
		logoUrl: optionalText,
	}),
	owner: z
		.object({
			id: requiredText,
			name: requiredText,
			email: requiredText,
			image: optionalText,
		})
		.nullable(),
	daysSinceLastActivity: finiteNumber,
	neverActive: z.boolean().catch(false),
	expectedCloseDate: requiredText.nullable(),
});

export const dealListResult = z.object({
	asOf: requiredText,
	criteria: z.object({
		status: requiredText,
		inactiveForDays: finiteNumber.nullable(),
		companyId: requiredText.nullable(),
		ownerId: requiredText.nullable(),
	}),
	deals: z.array(dealListItem),
	hasMore: z.boolean().catch(false),
});

export type DealListItem = z.infer<typeof dealListItem>;

export type DealListResult = z.infer<typeof dealListResult>;

const dealListResultOrNull = dealListResult.nullable().catch(null);

export function parseDealListResult(value: unknown): DealListResult | null {
	return dealListResultOrNull.parse(value);
}
