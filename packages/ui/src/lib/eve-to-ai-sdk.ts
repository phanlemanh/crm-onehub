import type {
	AgentTranscriptItem,
	DidItem,
} from "@crm/validation/agent-transcript";
import type { DynamicToolUIPart, UIMessage } from "ai";
import { DEFAULT_LOCALE, type Locale } from "./locale";
import { messages } from "./messages";

export const EVE_TO_AI_SDK = {
	turn: {
		said: { role: "assistant", mineRole: "user", part: "text" },
		reasoned: { role: "assistant", mineRole: "assistant", part: "reasoning" },
		did: { role: "assistant", mineRole: "assistant", part: "dynamic-tool" },
		asked: null,
	},
	reasoningState: { streaming: "streaming", settled: "done" },
	toolState: {
		pending: "input-available",
		failed: "output-error",
		settled: "output-available",
	},
} as const;

type TurnKind = keyof typeof EVE_TO_AI_SDK.turn;

type TurnSpec = (typeof EVE_TO_AI_SDK.turn)[TurnKind];

type MessagePart = UIMessage["parts"][number];

export function toToolPart(
	item: DidItem,
	locale: Locale = DEFAULT_LOCALE,
): DynamicToolUIPart {
	const head = {
		type: EVE_TO_AI_SDK.turn.did.part,
		toolName: item.tool,
		toolCallId: item.id,
		title: item.label,
	};

	if (item.pending) {
		return {
			...head,
			state: EVE_TO_AI_SDK.toolState.pending,
			input: item.input,
		};
	}

	if (item.failed) {
		return {
			...head,
			state: EVE_TO_AI_SDK.toolState.failed,
			input: item.input,
			errorText: item.errorText ?? messages(locale).chatTool.failed,
		};
	}

	return {
		...head,
		state: EVE_TO_AI_SDK.toolState.settled,
		input: item.input,
		output: item.output,
	};
}

export function toUIMessage(
	item: AgentTranscriptItem,
	locale: Locale = DEFAULT_LOCALE,
): UIMessage {
	const spec: TurnSpec = EVE_TO_AI_SDK.turn[item.kind];

	if (spec === null) {
		throw new Error(
			`eve-to-ai-sdk: dạng lượt "${item.kind}" không đi qua lớp chuyển — hình thức hỏi lại ở lại shadcn`,
		);
	}

	return {
		id: item.id,
		role: item.kind === "said" && item.mine ? spec.mineRole : spec.role,
		parts: [toPart(item, locale)],
	};
}

function toPart(item: AgentTranscriptItem, locale: Locale): MessagePart {
	if (item.kind === "said") {
		return { type: EVE_TO_AI_SDK.turn.said.part, text: item.text };
	}

	if (item.kind === "reasoned") {
		return {
			type: EVE_TO_AI_SDK.turn.reasoned.part,
			id: item.id,
			text: item.text,
			state: item.streaming
				? EVE_TO_AI_SDK.reasoningState.streaming
				: EVE_TO_AI_SDK.reasoningState.settled,
		};
	}

	return toToolPart(item, locale);
}
