import { defineHook } from "eve/hooks";
import { dongLuotKhiBoChayLoi, loiBoChay } from "../lib/dong-luot-tac-nhan";

export default defineHook({
	events: {
		async "action.result"(event, ctx) {
			try {
				const loi = loiBoChay.safeParse(event.data);
				if (loi.success) await dongLuotKhiBoChayLoi(loi.data, ctx);
			} catch (error) {
				console.warn("[dong-luot] could not close the run", {
					reason: error instanceof Error ? error.message : String(error),
				});
			}
		},
	},
});
