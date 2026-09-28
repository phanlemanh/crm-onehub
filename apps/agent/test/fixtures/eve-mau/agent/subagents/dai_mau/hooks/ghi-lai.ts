import { defineHook } from "eve/hooks";
import { ghiLai } from "../../../lib-mau";

export default defineHook({
	events: {
		"step.completed"(event, ctx) {
			ghiLai("dai_mau", event, ctx);
		},
	},
});
