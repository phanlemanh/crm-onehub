import { defineHook } from "eve/hooks";
import { dongTheoKetQua, ketQuaMaySoan } from "../lib/tai-lieu-phien";

export default defineHook({
	events: {
		async "action.result"(event, ctx) {
			try {
				const kq = ketQuaMaySoan.safeParse(event.data);
				if (kq.success) await dongTheoKetQua(kq.data, ctx);
			} catch (error) {
				console.warn("[may-soan] could not close the source", {
					reason: error instanceof Error ? error.message : String(error),
				});
			}
		},
	},
});
