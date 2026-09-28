import { defineAgent } from "eve";
import { mockModel } from "eve/evals";

export default defineAgent({
	modelContextWindowTokens: 128_000,
	description: "Fixture child con_builder. Replies at once.",
	model: mockModel({
		modelId: "mau-con_builder",
		provider: "mau",
		respond: () => "ok",
	}),
});
