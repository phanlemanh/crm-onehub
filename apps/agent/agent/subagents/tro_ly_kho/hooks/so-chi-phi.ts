import { defineHook } from "eve/hooks";
import { ghiBuoc } from "../../../lib/so-chi-phi";
import { ghiSoTroLyKho, hangCuaPhien } from "../../../lib/tai-lieu-hoi";
import { nhanKhoaTaiLieu } from "../../../lib/tai-lieu-model";

export default defineHook({
	events: {
		async "step.completed"(event, ctx) {
			try {
				await ghiBuoc(event, ctx, "tro_ly_kho");
				const usage = event.data.usage;
				await ghiSoTroLyKho(
					await hangCuaPhien(ctx),
					{
						tokenVao: usage?.inputTokens ?? 0,
						tokenRa: usage?.outputTokens ?? 0,
					},
					nhanKhoaTaiLieu("hoi"),
				);
			} catch (error) {
				console.warn("[tro-ly-kho] could not record spend", {
					reason: error instanceof Error ? error.name : "unknown",
				});
			}
		},
	},
});
