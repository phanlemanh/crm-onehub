import { defineAgent } from "eve";
import { mockModel } from "eve/evals";
import { CAU_HOI_THU, CUA_SO_THU } from "../../kich-ban";

export default defineAgent({
	modelContextWindowTokens: CUA_SO_THU,
	description: "Fixture builder that asks the user one question.",
	model: mockModel(({ lastUserMessage, toolResults }) =>
		toolResults.length === 0
			? {
					toolCalls: [
						{
							id: `${CAU_HOI_THU.tienToMa}${lastUserMessage?.split("\n").at(-1)}`,
							name: "ask_question",
							input: {
								prompt: CAU_HOI_THU.prompt,
								options: [CAU_HOI_THU.option],
							},
						},
					],
				}
			: CAU_HOI_THU.daTraLoi,
	),
});
