import type { Approval } from "eve/tools";
import { builderTurnAuthorized } from "../../../lib/session-purpose";

export const BUILDER_STATUS = {
	draftReady: "draft_ready",
	notAuthorized: "not_authorized",
} as const;

export const BUILDER_DENIED_REASON =
	"This turn is not authorized to create or revise an agent. Stop now and return final_output with status not_authorized and this sentence as the reason. Do not write files, do not save a draft.";

export const builderTurnApproval: Approval = (ctx) =>
	builderTurnAuthorized(ctx)
		? "not-applicable"
		: { type: "denied", reason: BUILDER_DENIED_REASON };
