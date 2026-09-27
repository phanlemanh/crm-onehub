"use client";

import { SESSION_LIMIT_OPTION_IDS } from "@crm/validation/builder-question";
import type { EveMessageInputRequest } from "eve/react";
import {
	AgentClarificationComposer,
	type ClarificationResponse,
} from "@/components/agent-clarification-composer";
import { AgentSessionLimitComposer } from "@/components/agent-session-limit-composer";
import type { TranscriptMessage } from "@/lib/agent-transcript";
import type { OSoanMessages } from "@/lib/messages/agent-builder-o-soan";

export const EVE_SESSION_LIMIT_TOOL = "session_limit_continuation";

export type BuilderAnswerResponse = ClarificationResponse;

export function BuilderQuestionComposer({
	question,
	pending,
	onAnswer,
}: {
	question: EveMessageInputRequest;
	pending: boolean;
	onAnswer: (response: BuilderAnswerResponse) => Promise<void>;
}) {
	if (question.kind === "session-limit") {
		return (
			<AgentSessionLimitComposer
				requestId={question.requestId}
				pending={pending}
				onAnswer={onAnswer}
			/>
		);
	}

	return (
		<AgentClarificationComposer
			question={question}
			pending={pending}
			onSubmit={onAnswer}
		/>
	);
}

export type AnsweredInput = {
	optionId?: string;
	kind?: string;
} | null;

export function sessionLimitAnswerLabel(
	response: AnsweredInput,
	t: OSoanMessages,
): string | null {
	if (response?.kind !== "session-limit") return null;
	return response.optionId === SESSION_LIMIT_OPTION_IDS.stop
		? t.hetHanMuc.dung
		: t.hetHanMuc.capThem;
}

export function withoutSessionLimitSteps(
	transcript: TranscriptMessage,
): TranscriptMessage {
	return {
		...transcript,
		items: transcript.items.filter(
			(item) => !(item.kind === "did" && item.tool === EVE_SESSION_LIMIT_TOOL),
		),
	};
}
