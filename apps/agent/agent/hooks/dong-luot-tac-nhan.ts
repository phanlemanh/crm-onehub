import { defineHook } from "eve/hooks";
import { dongLuotKhiBoChayLoi } from "../lib/dong-luot-tac-nhan";

export default defineHook({
	events: {
		async "action.result"(event, ctx) {
			try {
				await dongLuotKhiBoChayLoi(event.data, ctx);
			} catch (error) {
				console.warn("[dong-luot] could not close the run", {
					reason: error instanceof Error ? error.message : String(error),
				});
			}
		},
	},
});
