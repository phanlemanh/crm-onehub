import { defineHook } from "eve/hooks";
import { dongTheoKetQuaCon, ketQuaTroLyKho } from "../lib/tai-lieu-hoi-phien";

export default defineHook({
	events: {
		async "action.result"(event, ctx) {
			try {
				const kq = ketQuaTroLyKho.safeParse(event.data);
				if (kq.success) await dongTheoKetQuaCon(kq.data, ctx);
			} catch (error) {
				console.warn("[tro-ly-kho] could not close the question", {
					reason: error instanceof Error ? error.name : "unknown",
				});
			}
		},
	},
});
