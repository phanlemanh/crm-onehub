import { DEFAULT_AGENT_MODEL } from "@crm/db/settings";
import { generateText, jsonSchema, stepCountIs, tool } from "ai";
import { z } from "zod";

const unionCu = z.discriminatedUnion("status", [
	z.object({
		status: z.literal("draft_ready"),
		summary: z.string().min(1).max(1000),
		agentId: z.string().min(1),
		versionId: z.string().min(1),
	}),
	z.object({
		status: z.literal("not_authorized"),
		reason: z.string().min(1).max(1000),
	}),
]);

const objectMoi = (await import("./agent/subagents/agent_builder/agent"))
	.default.outputSchema;

async function thu(ten: string, schema: z.ZodType): Promise<void> {
	const { $schema, ...body } = z.toJSONSchema(schema, { target: "draft-7" });
	process.stdout.write(
		`\n[${ten}] gốc type=${String(body.type)} khóa=${Object.keys(body).join(",")}\n`,
	);
	try {
		const result = await generateText({
			model: DEFAULT_AGENT_MODEL.id,
			stopWhen: stepCountIs(2),
			prompt:
				"You are not authorized to build an agent on this turn. Call final_output with status not_authorized and a one-sentence reason.",
			tools: {
				final_output: tool({
					description:
						"Deliver your final answer in the required structure by calling this tool.",
					inputSchema: jsonSchema(body),
				}),
			},
		});
		const call = result.steps.flatMap((step) => step.toolCalls)[0];
		process.stdout.write(
			`[${ten}] NHẬN — tool gọi: ${call ? JSON.stringify(call.input) : "không gọi tool nào"}\n`,
		);
	} catch (error) {
		process.stdout.write(
			`[${ten}] TỪ CHỐI — ${error instanceof Error ? error.message : String(error)}\n`,
		);
	}
}

await thu("union cũ", unionCu);
await thu("object mới", objectMoi);
