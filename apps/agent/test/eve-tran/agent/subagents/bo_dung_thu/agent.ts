import { defineAgent } from "eve";
import { mockModel } from "eve/evals";
import { CUA_SO_THU, DAU_BUOC_HAI, HAN_MUC_THU } from "../../kich-ban";

export default defineAgent({
	modelContextWindowTokens: CUA_SO_THU,
	description: "Fixture builder that spends more output tokens than it may.",
	model: mockModel(({ toolResults }) =>
		toolResults.length === 0
			? {
					toolCalls: [{ name: "ghi_buoc", input: { buoc: 1 } }],
					usage: { outputTokens: HAN_MUC_THU.outputTokensBuocMot },
				}
			: DAU_BUOC_HAI,
	),
	limits: { maxOutputTokensPerSession: HAN_MUC_THU.maxOutputTokens },
});
