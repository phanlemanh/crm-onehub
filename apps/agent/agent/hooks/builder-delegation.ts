import { defineHook } from "eve/hooks";
import { recordBuilderDelegation } from "../lib/builder-delegation";
import { builderDelegationState } from "../lib/builder-delegation-state";
import { purposeOf } from "../lib/session-purpose";

export default defineHook({
	events: {
		"actions.requested"(event, ctx) {
			if (purposeOf(ctx) !== "builder") {
				return;
			}

			const next = recordBuilderDelegation(
				builderDelegationState.get(),
				event.data,
			);
			builderDelegationState.update(() => next);
		},
	},
});
