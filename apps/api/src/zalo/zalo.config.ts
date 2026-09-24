const SECOND_MS = 1_000;

export const ZALO_API = {
	cauNoi: { timeoutMs: 20 * SECOND_MS },
	botToken: /^\d+:[A-Za-z0-9_-]+$/,
	goiTokenKyTu: 4,
} as const;
