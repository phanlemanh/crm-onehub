import type { HookEvent } from "eve/hooks";
import { z } from "zod";

export const BUILDER_DELEGATION_SUBAGENT = "agent_builder";

export const BUILDER_DELEGATION_LIMIT_MESSAGE =
	"The agent builder can be delegated only once per turn.";

export type ActionsRequestedData = HookEvent<"actions.requested">["data"];

const builderDelegation = z.object({
	turnId: z.string().nullable(),
	stepIndex: z.number().int().nullable(),
	sequence: z.number().int().nullable(),
});

export type BuilderDelegationState = z.infer<typeof builderDelegation>;

export const EMPTY_BUILDER_DELEGATION: BuilderDelegationState = {
	turnId: null,
	stepIndex: null,
	sequence: null,
};

export function recordBuilderDelegation(
	state: BuilderDelegationState,
	event: ActionsRequestedData,
): BuilderDelegationState {
	const { actions, sequence, stepIndex, turnId } = event;
	const current = state.turnId === turnId ? state : EMPTY_BUILDER_DELEGATION;
	const uyThac = actions.filter(
		(action) =>
			action.kind === "subagent-call" &&
			action.subagentName === BUILDER_DELEGATION_SUBAGENT,
	);

	if (uyThac.length === 0) return { ...current, turnId };
	if (uyThac.length > 1) throw new Error(BUILDER_DELEGATION_LIMIT_MESSAGE);

	const daGhi = current.stepIndex !== null && current.sequence !== null;
	if (
		daGhi &&
		(current.stepIndex !== stepIndex || current.sequence !== sequence)
	) {
		throw new Error(BUILDER_DELEGATION_LIMIT_MESSAGE);
	}

	return { turnId, stepIndex, sequence };
}
