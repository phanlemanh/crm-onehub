export const FIELDS_CONFIG = {
	backfill: {
		maxRecordsPerRun: 500,
	},
	messages: {
		forbidden: "Only an owner or an admin can change the team's fields.",
	},
} as const;
