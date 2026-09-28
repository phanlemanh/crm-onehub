import { TRO_LY_OKR } from "@mau/agent/agent/lib/okr/config";
import { defineDynamic, defineTool } from "eve/tools";
import { z } from "zod";

const { tuChoi } = TRO_LY_OKR.congCuChan;

export default defineDynamic({
	events: {
		"step.started": () =>
			process.env.MAU_PURPOSE === "okr" && process.env.MAU_KHONG_CHAN !== "1"
				? {
						ghi_dau: defineTool({
							description: tuChoi,
							inputSchema: z.looseObject({}),
							execute: () => ({ ok: false as const, reason: tuChoi }),
						}),
					}
				: null,
	},
});
