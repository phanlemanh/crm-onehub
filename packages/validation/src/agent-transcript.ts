import { z } from "zod";
import { eveToolInput, eveToolOutput } from "./eve-tool";

export const tone = z.enum(["neutral", "success", "warning"]);

export type Tone = z.infer<typeof tone>;

export const source = z.object({
	url: z.string(),
	title: z.string(),
	network: z.enum(["linkedin", "github", "web"]),
});

export type Source = z.infer<typeof source>;

const said = z.object({
	kind: z.literal("said"),
	id: z.string(),
	mine: z.boolean(),
	text: z.string(),
});

const reasoned = z.object({
	kind: z.literal("reasoned"),
	id: z.string(),
	streaming: z.boolean(),
	text: z.string(),
});

const did = z.object({
	kind: z.literal("did"),
	id: z.string(),
	label: z.string(),
	input: eveToolInput,
	output: eveToolOutput,
	tone,
	pending: z.boolean(),
	sources: z.array(source),
	tool: z.string(),
	errorText: z.string().nullable(),
	failed: z.boolean(),
	skipped: z.literal(true).optional(),
});

export const agentTranscriptItem = z.discriminatedUnion("kind", [
	said,
	reasoned,
	did,
]);

export type AgentTranscriptItem = z.infer<typeof agentTranscriptItem>;

export type SaidItem = z.infer<typeof said>;

export type ReasonedItem = z.infer<typeof reasoned>;

export type DidItem = z.infer<typeof did>;

export function parseAgentTranscriptItem(value: unknown): AgentTranscriptItem {
	return agentTranscriptItem.parse(value);
}
