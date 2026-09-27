import { defineTool } from "eve/tools";
import { webFetch } from "eve/tools/defaults";
import { assertNotZaloQuestion } from "../lib/session-purpose";

export default defineTool({
	...webFetch,
	async execute(input, ctx) {
		assertNotZaloQuestion(ctx);
		return webFetch.execute(input, ctx);
	},
});
