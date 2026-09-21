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
	danhMuc: {
		pageSize: 25,
	},
	bangCot: {
		tranThe: 30,
	},
} as const;

export const MA_NEN_TANG = {
	key: "ma_moi_gioi_nen_tang",
	label: "Mã môi giới trên nền tảng",
} as const;
