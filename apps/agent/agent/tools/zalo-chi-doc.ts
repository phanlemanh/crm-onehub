import { defineDynamic, defineTool } from "eve/tools";
import { z } from "zod";
import { purposeOf } from "../lib/session-purpose";
import { ZALO } from "../lib/zalo-config";

export default defineDynamic({
	events: {
		"step.started": (_event, ctx) =>
			purposeOf(ctx) === ZALO.hoi.purpose
				? Object.fromEntries(
						[...ZALO.hoi.congCu.ghi, ...ZALO.hoi.congCu.coSanChan].map(
							(ten) => [
								ten,
								defineTool({
									description: ZALO.hoi.tuChoiGhi,
									inputSchema: z.looseObject({}),
									execute: () => ({
										ok: false as const,
										reason: ZALO.hoi.tuChoiGhi,
									}),
								}),
							],
						),
					)
				: null,
	},
});
