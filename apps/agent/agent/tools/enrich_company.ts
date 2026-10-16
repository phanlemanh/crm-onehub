import { defineTool } from "eve/tools";
import { z } from "zod";
import { runBrand } from "../lib/brand";
import { spend } from "../lib/focus";
import {
	assertNotZaloQuestion,
	assertResearchPurpose,
} from "../lib/session-purpose";

export default defineTool({
	description:
		"Look up a company's brand, industry, location and social links by domain and fill in its record. Fills empty fields; on a repeat lookup it also replaces fields the previous lookup filled that nobody has changed since, and clears address parts the new result no longer reports. Never overwrites a field a person typed or edited.",
	inputSchema: z.object({
		companyId: z.string(),
		fresh: z
			.boolean()
			.default(false)
			.describe(
				"Bypass the vendor's ~90-day cache. Only when a rep has asked for a fresh look.",
			),
	}),
	async execute({ companyId, fresh }, ctx) {
		assertNotZaloQuestion(ctx);
		assertResearchPurpose(ctx);
		const result = await runBrand({ companyId, fresh, spend });

		if (!result.enriched) {
			return {
				enriched: false as const,
				reason: result.reason,
				retryable: result.retryable,
			};
		}

		const filled = result.filled ?? [];
		const cleared = result.cleared ?? [];

		return {
			enriched: true as const,
			filled,
			cleared,
			mirrored: result.mirrored ?? [],
			note:
				filled.length === 0 && cleared.length === 0
					? "Everything it returned was already on the record."
					: undefined,
		};
	},
});
