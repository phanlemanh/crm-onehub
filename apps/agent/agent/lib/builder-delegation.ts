import type { HookEvent } from "eve/hooks";

export const BUILDER_DELEGATION_SUBAGENT = "agent_builder";

export const BUILDER_DELEGATION_LIMIT_MESSAGE =
	"The agent builder can be delegated only once per turn.";

export type ActionsRequestedData = HookEvent<"actions.requested">["data"];

export type StepStartedData = HookEvent<"step.started">["data"];

export type BuilderDelegationState = {
	turnId: string | null;
	stepIndex: number | null;
	callIds: readonly string[];
};

export const EMPTY_BUILDER_DELEGATION: BuilderDelegationState = {
	turnId: null,
	stepIndex: null,
	callIds: [],
};

export function recordBuilderDelegation(
	state: BuilderDelegationState,
	event: ActionsRequestedData,
): BuilderDelegationState {
	const { actions, stepIndex, turnId } = event;
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

	if (current.callIds.length > 0 && current.stepIndex !== stepIndex) {
		throw new Error(BUILDER_DELEGATION_LIMIT_MESSAGE);
	}
	if (current.callIds.length + moi.length > 1) {
		throw new Error(BUILDER_DELEGATION_LIMIT_MESSAGE);
	}

	return { turnId, stepIndex, callIds: [...current.callIds, ...moi] };
}

export function clearBuilderDelegationStep(
	state: BuilderDelegationState,
	event: StepStartedData,
): BuilderDelegationState {
	const { stepIndex, turnId } = event;
	if (state.turnId !== turnId) return EMPTY_BUILDER_DELEGATION;
	if (state.stepIndex !== stepIndex) return state;
	return { turnId, stepIndex: null, callIds: [] };
}
