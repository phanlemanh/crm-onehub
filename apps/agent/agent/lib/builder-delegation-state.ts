import { defineState } from "eve/context";
import {
	type BuilderDelegationState,
	EMPTY_BUILDER_DELEGATION,
} from "./builder-delegation";

export const builderDelegationState = defineState<BuilderDelegationState>(
	"crm.builder-delegation",
	() => ({ ...EMPTY_BUILDER_DELEGATION }),
);
