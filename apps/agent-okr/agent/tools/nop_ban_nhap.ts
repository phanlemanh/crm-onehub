import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
	description: "Submit the whole OKR draft for this session. Replaced in B7.",
	inputSchema: z.object({
		mucTieu: z
			.array(z.object({ khoa: z.string(), ten: z.string() }))
			.min(2)
			.max(4),
	}),
	execute: () => ({ ketQua: "tu-choi" as const, lyDo: "chua noi", biLoai: [] }),
});
