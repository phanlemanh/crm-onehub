import { defineDynamic, defineTool } from "eve/tools";
import { z } from "zod";
import { TRO_LY_OKR } from "../lib/okr/config";
import { purposeOf } from "../lib/session-purpose";

const { tuTao, coSan, tuChoi } = TRO_LY_OKR.congCuChan;

export default defineDynamic({
	events: {
		"step.started": (_event, ctx) =>
			purposeOf(ctx) === "okr"
				? Object.fromEntries(
						[...tuTao, ...coSan].map((ten) => [
							ten,
							defineTool({
								description: tuChoi,
								inputSchema: z.looseObject({}),
								execute: () => ({ ok: false as const, reason: tuChoi }),
							}),
						]),
					)
				: null,
	},
});
