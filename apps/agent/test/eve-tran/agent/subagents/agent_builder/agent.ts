import { defineAgent } from "eve";
import { mockModel } from "eve/evals";
import { CUA_SO_THU } from "../../kich-ban";

export default defineAgent({
	modelContextWindowTokens: CUA_SO_THU,
	description: "Fixture builder that returns at once.",
	model: mockModel("ban nhap gia"),
});
