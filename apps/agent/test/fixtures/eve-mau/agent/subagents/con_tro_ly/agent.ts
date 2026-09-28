import { defineAgent } from "eve";
import { mockModel } from "eve/evals";

export default defineAgent({
	modelContextWindowTokens: 128_000,
	description: "Fixture child con_tro_ly. Replies at once.",
	model: mockModel({
		modelId: "mau-con_tro_ly",
		provider: "mau",
		respond: () => "ok",
	}),
});
