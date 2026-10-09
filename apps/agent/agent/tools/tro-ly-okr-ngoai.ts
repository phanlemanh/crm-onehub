import { defineDynamic, defineTool } from "eve/tools";
import { z } from "zod";
import { TRO_LY_OKR } from "../lib/okr/config";
import { SUBAGENT_TRO_LY_OKR } from "../lib/okr/uy-quyen";
import { purposeOf } from "../lib/session-purpose";

const { moTa, lyDo, bienBoDe } = TRO_LY_OKR.ngoaiPhien;

const boDe = () =>
	process.env.NODE_ENV !== "production" && process.env[bienBoDe] === "1";

export default defineDynamic({
	events: {
		"step.started": (_event, ctx) =>
			purposeOf(ctx) === "okr" || boDe()
				? null
				: {
						[SUBAGENT_TRO_LY_OKR]: defineTool({
							description: moTa,
							inputSchema: z.looseObject({}),
							execute: () => ({ ok: false as const, reason: lyDo }),
						}),
					},
	},
});
