import { defineTool } from "eve/tools";
import { z } from "zod";
import { createRunActivity } from "../../../lib/run-runtime";
import { requireTeamAgentAttribute } from "../../../lib/session-purpose";

export default defineTool({
	description:
		"Create an approved internal CRM note, or with type TASK assign a Việc (a CRM task with a doer) on an approved record. A TASK becomes a Việc assigned to the person who started this run, linked to the record, with the due date; it is not a timeline entry. The version must allow the exact activity type. The action is logged before it executes and is idempotent across retries.",
	inputSchema: z.object({
		type: z.enum(["NOTE", "TASK"]),
		targetKind: z.enum(["company", "contact", "deal"]),
		targetId: z.string().min(1),
		subject: z.string().trim().max(240).nullish(),
		body: z.string().trim().max(10_000).nullish(),
		dueAt: z.string().nullish(),
	}),
	async execute(input, ctx) {
		return createRunActivity(
			requireTeamAgentAttribute(ctx, "runId"),
			ctx.callId,
			input,
		);
	},
});
