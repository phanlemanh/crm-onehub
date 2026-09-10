import { defineHook } from "eve/hooks";
import {
	clearBuilderDelegationStep,
	recordBuilderDelegation,
} from "../lib/builder-delegation";
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
		"step.started"(event, ctx) {
			if (purposeOf(ctx) !== "builder") {
				return;
			}

			const next = clearBuilderDelegationStep(
				builderDelegationState.get(),
				event.data,
			);
			builderDelegationState.update(() => next);
		},
	},
});
