import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
	description: "Record one fixture step.",
	inputSchema: z.object({ buoc: z.number() }),
	async execute({ buoc }) {
		return { buoc };
	},
});
