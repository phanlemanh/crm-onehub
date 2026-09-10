import { defineState } from "eve/context";
import { EMPTY_BUILDER_DELEGATION } from "./builder-delegation";

export const builderDelegationState = defineState(
	"crm.builder-delegation.v2",
	() => EMPTY_BUILDER_DELEGATION,
);
