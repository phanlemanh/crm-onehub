import { DEFAULT_AGENT_MODEL } from "@crm/db/settings";
import { defineAgent, defineDynamic } from "eve";
import { z } from "zod";
import { modelChoBoDung } from "../../lib/model";
import { BUILDER_STATUS } from "./lib/authorization";

export default defineAgent({
	description:
		"Turn one private CRM builder-chat request into a validated, reviewable team-agent version without deploying it.",
	model: defineDynamic({
		fallback: DEFAULT_AGENT_MODEL.id,
		events: { "session.started": () => modelChoBoDung() },
	}),
	outputSchema: z
		.object({
			status: z.enum([BUILDER_STATUS.draftReady, BUILDER_STATUS.notAuthorized]),
			summary: z.string().min(1).max(1000).optional(),
			agentId: z.string().min(1).optional(),
			versionId: z.string().min(1).optional(),
			reason: z.string().min(1).max(1000).optional(),
		})
		.superRefine((output, issues) => {
			const required =
				output.status === BUILDER_STATUS.draftReady
					? (["summary", "agentId", "versionId"] as const)
					: (["reason"] as const);
			for (const field of required) {
				if (output[field]) continue;
				issues.addIssue({
					code: "custom",
					path: [field],
					message: `${field} is required when status is ${output.status}.`,
				});
			}
		}),
	limits: {
		maxInputTokensPerSession: 100_000,
		maxOutputTokensPerSession: 10_000,
		sessionTimeoutMs: 24 * 60 * 60 * 1000,
	},
});
