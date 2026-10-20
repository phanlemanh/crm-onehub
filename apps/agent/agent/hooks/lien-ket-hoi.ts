import { defineHook } from "eve/hooks";
import { lienKetPhienGoc } from "../lib/tai-lieu-lien-ket";

export default defineHook({
	events: {
		async "session.started"(_event, ctx) {
			await lienKetPhienGoc(ctx);
		},
		async "turn.started"(_event, ctx) {
			await lienKetPhienGoc(ctx);
		},
	},
});
