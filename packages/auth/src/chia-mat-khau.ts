const SECOND_MS = 1000;
const HOUR_SECONDS = 60 * 60;

export const PASSWORD = {
	minLength: 12,
	tokenTtlSeconds: HOUR_SECONDS,
	tokenBytes: 24,
	verificationPrefix: "reset-password:",
} as const;

export const CHIA = {
	ttlMs: PASSWORD.tokenTtlSeconds * SECOND_MS,
} as const;
