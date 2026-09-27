import { defineHook } from "eve/hooks";
import { recordBuilderDelegation } from "../_chep/builder-delegation";
import { builderDelegationState } from "../_chep/builder-delegation-state";

export default defineHook({
	events: {
		"actions.requested"(event) {
			const next = recordBuilderDelegation(
				builderDelegationState.get(),
				event.data,
			);
			builderDelegationState.update(() => next);
		},
	},
});
