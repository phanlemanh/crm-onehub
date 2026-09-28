import { defineTool } from "eve/tools";
import { z } from "zod";
import { demGhiDau } from "../lib-mau";

export default defineTool({
	description:
		"Write one tally line. Fixture tool for the delegation measurement.",
	inputSchema: z.object({}),
	async execute() {
		return { dem: demGhiDau() };
	},
});
