import { defineHook } from "eve/hooks";
import { builderTurnAuthorized } from "../../../lib/session-purpose";
import {
	builderExecutionState,
	markBuilderDraftSaveFinished,
	recordBuilderActions,
} from "../lib/execution-state";

export default defineHook({
	events: {
		"actions.requested"(event, ctx) {
			const next = recordBuilderActions(
				builderExecutionState.get(),
				event.data.turnId,
				event.data.stepIndex,
				event.data.actions,
				builderTurnAuthorized(ctx),
			);
			builderExecutionState.update(() => next);
		},
		"action.result"(event) {
			if (
				event.data.status !== "completed" &&
				event.data.result.kind === "tool-result" &&
				event.data.result.toolName === "save_agent_draft"
			) {
				markBuilderDraftSaveFinished(false);
			}
		},
	},
});
