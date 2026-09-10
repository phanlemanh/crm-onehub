import { defineTool } from "eve/tools";
import { z } from "zod";
import { builderContext } from "../../../lib/builder-runtime";
import { requireBuilderAttribute } from "../../../lib/session-purpose";
import { builderTurnApproval } from "../lib/authorization";

export default defineTool({
	approval: builderTurnApproval,
	description:
		"Read the authoritative builder-chat scope, supported real-time CRM events, connected sources, matched Slack people, available Slack channels, selected CRM records, current time, and latest draft.",
	inputSchema: z.object({}),
	async execute(_input, ctx) {
		return builderContext(
			requireBuilderAttribute(ctx, "conversationId"),
			requireBuilderAttribute(ctx, "userId"),
		);
	},
});
