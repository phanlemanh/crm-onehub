export const API_KEY_HEADER = "x-api-key";
export const API_KEY_PREFIX = "crm_";

export const DAY_SECONDS = 24 * 60 * 60;

export const API_KEY_EXPIRATION = {
	minDays: 1,
	maxDays: 365,
} as const;

const MINUTE_MS = 60 * 1000;

export const API_KEY_USAGE = {
	lastRequestIntervalMs: MINUTE_MS,
} as const;
