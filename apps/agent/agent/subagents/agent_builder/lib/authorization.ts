import type { Approval } from "eve/tools";
import { builderTurnAuthorized } from "../../../lib/session-purpose";

export const BUILDER_DENIED_REASON =
	"This turn is not an agent-creation request. Tell the user that building an agent starts from the Create agent action, then answer what they actually asked.";

export const builderTurnApproval: Approval = (ctx) =>
	builderTurnAuthorized(ctx)
		? "not-applicable"
		: { type: "denied", reason: BUILDER_DENIED_REASON };
