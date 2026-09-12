import { defineHook } from "eve/hooks";
import {
	builderDelegationState,
	recordBuilderDelegation,
} from "../lib/builder-delegation";
import { purposeOf } from "../lib/session-purpose";

export default defineHook({
	events: {
		"actions.requested"(event, ctx) {
			if (purposeOf(ctx) !== "builder") {
				return;
			}

			const next = recordBuilderDelegation(
				builderDelegationState.get(),
				event.data.turnId,
				event.data.actions,
			);
			builderDelegationState.update(() => next);
		},
	},
});
