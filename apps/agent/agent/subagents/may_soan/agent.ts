import { defineAgent, defineDynamic } from "eve";
import { z } from "zod";
import { TAI_LIEU_AGENT } from "../../lib/tai-lieu-config";
import { modelMaySoan } from "../../lib/tai-lieu-model";

export default defineAgent({
	description:
		"Draft one document-page proposal from the text of one uploaded source file and submit it with nop_ban_de_xuat. Reads nothing else and reaches no network.",
	model: defineDynamic({
		fallback: TAI_LIEU_AGENT.soan.maModel,
		events: {
			"step.started": () => modelMaySoan(),
		},
	}),
	outputSchema: z.object({
		tomTat: z.string().trim().min(1).max(500),
	}),
	limits: TAI_LIEU_AGENT.soan.gioiHan,
});
