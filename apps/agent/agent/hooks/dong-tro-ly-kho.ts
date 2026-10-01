import { defineHook } from "eve/hooks";
import { dongTheoKetQuaCon } from "../lib/tai-lieu-hoi-phien";

export default defineHook({
	events: {
		async "action.result"(event, ctx) {
			try {
				await dongTheoKetQuaCon(event.data, ctx);
			} catch (error) {
				console.warn("[tro-ly-kho] could not close the question", {
					reason: error instanceof Error ? error.name : "unknown",
				});
			}
		},
	},
});
