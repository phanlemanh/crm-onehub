import { defineAgent, defineDynamic } from "eve";
import { z } from "zod";
import { ghiModelPhien } from "../../lib/model-phien";
import { TAI_LIEU_AGENT } from "../../lib/tai-lieu-config";
import { modelTaiLieu } from "../../lib/tai-lieu-model";

export default defineAgent({
	description:
		"Answer one question about the company's written rules, policies, processes or forms, only from approved pages in use of the document library. Not for deals, companies, people, tasks, deadlines or OKR: it cannot see CRM records. Every claim is checked against a verbatim excerpt before anyone sees it. Reads nothing else and reaches no network. Only usable inside a document-library question session or a Zalo chat; anywhere else it refuses at once, so do not call it.",
	model: defineDynamic({
		fallback: TAI_LIEU_AGENT.hoi.maModel,
		events: {
			"step.started": (_event, ctx) => {
				void ghiModelPhien(ctx, TAI_LIEU_AGENT.hoi.maModel);
				return modelTaiLieu("hoi");
			},
		},
	}),
	outputSchema: z
		.object({
			hoiId: z.string().regex(/^c[a-z0-9]{20,32}$/),
			ketQua: z.enum(["TRA_LOI", "TU_CHOI", "LOI"]),
		})
		.strict(),
	limits: TAI_LIEU_AGENT.hoi.gioiHan,
});
