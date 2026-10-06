import { DEFAULT_AGENT_MODEL } from "@crm/db/settings";
import { defineAgent, defineDynamic } from "eve";
import { z } from "zod";
import { SESSION_LIMITS } from "../../lib/dispatch-config";
import { modelChoBoChay } from "../../lib/model";
import { ghiModelPhien } from "../../lib/model-phien";
import { ketQuaLuot } from "../../lib/run-result";

export default defineAgent({
	description:
		"Execute one immutable deployed CRM agent version and persist its result and every side effect.",
	model: defineDynamic({
		fallback: DEFAULT_AGENT_MODEL.id,
		events: {
			"session.started": (_event, ctx) => {
				const chon = modelChoBoChay(ctx);
				void ghiModelPhien(ctx, chon?.model ?? DEFAULT_AGENT_MODEL.id);
				return chon;
			},
		},
	}),
	outputSchema: z.object({
		summary: z.string().min(1).max(1000),
		result: ketQuaLuot.nullable(),
	}),
	limits: SESSION_LIMITS.runner,
});
