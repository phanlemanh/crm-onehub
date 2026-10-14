import { db, type Prisma } from "@crm/db";
import { lockIdempotencyKey } from "@crm/db/idempotency";
import { type InputRequested, parse, schemas } from "@crm/validation";
import {
	builderQuestion,
	buildPendingInputRequest,
} from "@crm/validation/builder-question";
import type { ChannelEvents } from "eve/channels";
import {
	builderIdFromToken,
	builderToken,
	lockBuilderConversation,
} from "./custom-agent-dispatch";
import {
	attribute,
	builderTurnAuthorized,
	type PurposeContext,
} from "./session-purpose";

const BUILDER_INPUT = {
	eventType: "input.requested",
	idPrefix: "builder-input",
} as const;

type InputRequestedEvent = Parameters<
	NonNullable<ChannelEvents["input.requested"]>
>[0];

export async function recordBuilderInputRequest(
	data: InputRequestedEvent,
	continuationToken: string | undefined,
	ctx: PurposeContext,
): Promise<boolean> {
	return persistBuilderInputRequest(
		data,
		continuationToken,
		attribute(ctx, "conversationId"),
		builderTurnAuthorized(ctx),
	);
}

export async function persistBuilderInputRequest(
	data: InputRequestedEvent,
	continuationToken: string | undefined,
	authenticatedConversationId: string | null | undefined,
	authorized: boolean,
): Promise<boolean> {
	const conversationId =
		authenticatedConversationId?.trim() ||
		builderIdFromToken(continuationToken);
	if (!conversationId) return false;

	const event = parse(
		schemas.agents.inputRequested,
		data,
		BUILDER_INPUT.eventType,
	);
	const question = event.requests.find(
		(request) =>
			request.kind === "question" || request.kind === "session-limit",
	);
	if (!question) return false;

	const eventId = `${eventPrefix(conversationId)}${question.requestId}`;

	return db.$transaction(async (tx) => {
		await lockIdempotencyKey(tx, eventId);

		const replay = await tx.agentEvent.findUnique({
			where: { id: eventId },
			select: { id: true },
		});
		if (replay) return false;

		const conversation = await lockBuilderConversation(tx, conversationId);
		if (conversation?.kind !== "BUILDER") {
			return dropped(conversationId, "not a builder conversation");
		}
		if (!conversation.sessionId) {
			return dropped(conversationId, "no builder session yet");
		}

		const waiting = await waitingQuestionEvent(tx, conversation.id);
		if (
			waiting &&
			!supersedes(
				event,
				parse(schemas.agents.inputRequested, waiting.data, waiting.id),
			)
		) {
			return dropped(
				conversation.id,
				`older than the waiting question ${waiting.id}`,
			);
		}

		await tx.agentEvent.create({
			data: {
				id: eventId,
				sessionId: conversation.sessionId,
				conversationId: conversation.id,
				type: BUILDER_INPUT.eventType,
				data: event as Prisma.InputJsonValue,
				emittedAt: new Date(),
			},
		});

		await tx.agentConversation.update({
			where: { id: conversation.id },
			data: {
				continuationToken: builderToken(conversation.id),
				pendingInputRequest: buildPendingInputRequest(
					question,
					authorized,
				) as Prisma.InputJsonValue,
			},
		});

		return true;
	});
}

function dropped(conversationId: string, reason: string): false {
	console.error(
		`[agent] builder conversation ${conversationId} input request dropped: ${reason}`,
	);
	return false;
}

async function waitingQuestionEvent(
	tx: Prisma.TransactionClient,
	conversationId: string,
) {
	const row = await tx.agentConversation.findUnique({
		where: { id: conversationId },
		select: { pendingInputRequest: true },
	});
	const waiting = builderQuestion.parse(row?.pendingInputRequest ?? null);
	if (!waiting) return null;
	return tx.agentEvent.findUnique({
		where: { id: `${eventPrefix(conversationId)}${waiting.requestId}` },
		select: { id: true, data: true },
	});
}

function eventPrefix(conversationId: string): string {
	return `${BUILDER_INPUT.idPrefix}:${conversationId}:`;
}

function supersedes(event: InputRequested, current: InputRequested): boolean {
	if (event.sequence !== current.sequence) {
		return event.sequence > current.sequence;
	}
	return event.stepIndex > current.stepIndex;
}
