import { defineDynamic, defineTool } from "eve/tools";
import { z } from "zod";
import { TRO_LY_OKR } from "../lib/okr/config";
import { purposeOf } from "../lib/session-purpose";

const { moTa, lyDo } = TRO_LY_OKR.ngoaiPhien;

export default defineDynamic({
	events: {
		"step.started": (_event, ctx) =>
			purposeOf(ctx) === "okr"
				? null
				: {
						tro_ly_okr: defineTool({
							description: moTa,
							inputSchema: z.looseObject({}),
							execute: () => ({ ok: false as const, reason: lyDo }),
						}),
					},
	},
});
