import { defineHook } from "eve/hooks";
import { ghiSoMaySoan } from "../../../lib/tai-lieu-nop";
import { nguonCuaPhien } from "../../../lib/tai-lieu-phien";

export default defineHook({
	events: {
		async "step.completed"(event, ctx) {
			try {
				const usage = event.data.usage;
				await ghiSoMaySoan(nguonCuaPhien(ctx), ctx.session.id, {
					tokenVao: usage?.inputTokens ?? 0,
					tokenRa: usage?.outputTokens ?? 0,
				});
			} catch (error) {
				console.warn("[may-soan] could not record spend", {
					reason: error instanceof Error ? error.message : String(error),
				});
			}
		},
	},
});
