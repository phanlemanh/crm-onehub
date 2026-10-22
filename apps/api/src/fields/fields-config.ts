export const FIELDS_CONFIG = {
	backfill: {
		maxRecordsPerRun: 500,
	},
	messages: {
		forbidden: "Only an owner or an admin can change the team's fields.",
		requiredShown: "A required field stays on the record sheet.",
		requiredStandardShown: "A required standard field cannot be hidden.",
		notStandard: "That is not a standard field of this record type.",
		orderMismatch:
			"That order must name every standard field and every live custom field of this record type exactly once.",
	},
} as const;
