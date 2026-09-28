import { defineHook } from "eve/hooks";
import { ghiBuoc } from "../../../lib/so-chi-phi";

export default defineHook({
	events: {
		async "step.completed"(event, ctx) {
			await ghiBuoc(event, ctx, "agent_runner");
		},
	},
});
