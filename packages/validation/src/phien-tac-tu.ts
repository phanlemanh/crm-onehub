export const SESSION_PURPOSES = [
	"builder",
	"team-agent",
	"research",
	"zalo",
	"okr",
] as const;

export type SessionPurpose = (typeof SESSION_PURPOSES)[number];

export const KENH_TAC_TU = ["crm", "eve", "zalo"] as const;
