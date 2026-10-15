import { defineTool } from "eve/tools";
import { z } from "zod";
import { canPhienHoi, docOkr } from "../lib/hoi-doc";

export default defineTool({
	description:
		"Read one Mục tiêu (loai objective) or the Mục tiêu holding one KR (loai kr) with every KR, progress, expected progress, status and the latest weekly check-ins. cuaBan marks the Mục tiêu and each KR the asker owns. A Mục tiêu the asker may not see answers exactly like one that does not exist.",
	inputSchema: z.object({
		loai: z.enum(["objective", "kr"]),
		id: z.string().trim().min(1).max(120),
	}),
	execute: async (input, ctx) => {
		const p = canPhienHoi(ctx);
		if ("ok" in p) return p;
		return docOkr(p.userId, input);
	},
});
