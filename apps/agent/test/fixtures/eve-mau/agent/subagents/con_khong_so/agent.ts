import { defineAgent } from "eve";
import { mockModel } from "eve/evals";

export default defineAgent({
	modelContextWindowTokens: 128_000,
	description: "Fixture child con_khong_so. Replies at once.",
	model: mockModel({
		modelId: "mau-con_khong_so",
		provider: "mau",
		respond: () => "ok",
	}),
});
