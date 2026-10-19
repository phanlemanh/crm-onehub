const SECOND_MS = 1_000;

export const CONTEXT = {
	timeoutMs: 60 * SECOND_MS,
	verifyTimeoutMs: 15 * SECOND_MS,
	brandLanguage: "vietnamese",

	people: {
		matchFloor: 70,
		enrichCost: 2,
	},

	avatarHosts: ["brand.dev", "licdn.com"],
} as const;
