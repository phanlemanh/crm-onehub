import type { Approval } from "eve/tools";
import { APP_AUTH } from "./app-auth";
import type { SessionPurpose } from "./session-purpose";

type Attributes = Readonly<Record<string, string | readonly string[]>>;

const LUOT_TAC_NHAN: SessionPurpose = "team-agent";

export function isAutomated(session: {
	auth: {
		current?: {
			authenticator?: string;
			principalId?: string;
			principalType?: string;
			attributes?: Attributes;
		} | null;
		initiator?: { attributes?: Attributes } | null;
	};
}): boolean {
	const auth = session.auth.current;
	const purpose =
		auth?.attributes?.purpose ?? session.auth.initiator?.attributes?.purpose;
	return (
		purpose === LUOT_TAC_NHAN ||
		(auth?.authenticator === APP_AUTH.authenticator &&
			auth.principalId === APP_AUTH.principalId &&
			auth.principalType === APP_AUTH.principalType)
	);
}

export function sensitiveWrite(instead: string): Approval {
	return ({ session }) =>
		isAutomated(session)
			? {
					type: "denied" as const,
					reason: `Not something to do unattended. ${instead}`,
				}
			: "user-approval";
}
