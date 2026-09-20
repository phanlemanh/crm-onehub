const DAY_MS = 24 * 60 * 60 * 1000;

export const ONBOARDING = {
	plan: {
		defaultTargetDays: 30,
	},
	stale: {
		warnAfterMs: 7 * DAY_MS,
	},
	ingest: {
		maxItemsPerBatch: 500,
	},
} as const;
