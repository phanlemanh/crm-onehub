import { defineAgent, defineDynamic } from "eve";
import { z } from "zod";
import { TAI_LIEU_AGENT } from "../../lib/tai-lieu-config";
import { modelTaiLieu } from "../../lib/tai-lieu-model";

export default defineAgent({
	description:
		"Answer one question from the company document library, only from approved pages in use. Every claim is checked against a verbatim excerpt before anyone sees it. Reads nothing else and reaches no network.",
	model: defineDynamic({
		fallback: TAI_LIEU_AGENT.hoi.maModel,
		events: { "step.started": () => modelTaiLieu("hoi") },
	}),
	outputSchema: z
		.object({
			hoiId: z.string().regex(/^c[a-z0-9]{20,32}$/),
			ketQua: z.enum(["TRA_LOI", "TU_CHOI", "LOI"]),
		})
		.strict(),
	limits: TAI_LIEU_AGENT.hoi.gioiHan,
});
