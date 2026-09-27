import type { HookEvent } from "eve/hooks";

export const BUILDER_DELEGATION_SUBAGENT = "agent_builder";

export const BUILDER_DELEGATION_LIMIT_MESSAGE =
	"The agent builder can be delegated only once per turn.";

export const BUILDER_OUTPUT_SCHEMA_MESSAGE =
	"Call agent_builder with message only; it returns its own result.";

export type ActionsRequestedData = HookEvent<"actions.requested">["data"];

export type BuilderDelegationState = {
	turnId: string | null;
	callIds: readonly string[];
};

export const EMPTY_BUILDER_DELEGATION: BuilderDelegationState = {
	turnId: null,
	callIds: [],
};

export function recordBuilderDelegation(
	state: BuilderDelegationState,
	event: ActionsRequestedData,
): BuilderDelegationState {
	const { actions, turnId } = event;
	const kemKhuon = actions.some(
		(action) =>
			action.kind === "subagent-call" &&
			action.subagentName === BUILDER_DELEGATION_SUBAGENT &&
			"outputSchema" in action.input,
	);
	if (kemKhuon) throw new Error(BUILDER_OUTPUT_SCHEMA_MESSAGE);

	const current = state.turnId === turnId ? state : EMPTY_BUILDER_DELEGATION;
	const moi = actions
		.filter(
			(action) =>
				action.kind === "subagent-call" &&
				action.subagentName === BUILDER_DELEGATION_SUBAGENT,
		)
		.map((action) => action.callId)
		.filter((callId) => !current.callIds.includes(callId));

	if (moi.length === 0) return { ...current, turnId };
	if (current.callIds.length + moi.length > 1) {
		throw new Error(BUILDER_DELEGATION_LIMIT_MESSAGE);
	}

	return { turnId, callIds: [...current.callIds, ...moi] };
}
