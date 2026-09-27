const SECOND_MS = 1_000;
const MINUTE_MS = 60 * SECOND_MS;

export const TRO_LY_OKR = {
	model: "google/gemini-3.8-flash",
	tranRaMoiLoiGoi: 2_000,
	limits: {
		maxInputTokensPerSession: 40_000,
		maxOutputTokensPerSession: 4_000,
		sessionTimeoutMs: 10 * MINUTE_MS,
	},
	tags: ["onehub:tro-ly-okr"],
	brief: "Run one Trợ lý OKR task.",
	chiDanGoc:
		'This session runs one Trợ lý OKR task. Call the tool tro_ly_okr exactly once with the message "run". Do not call any other tool and do not do the work yourself. When it returns, reply "done".',
	tinNhanGoc: "run",
	khoaMoHinh: ["AI_GATEWAY_API_KEY", "VERCEL_OIDC_TOKEN"],
	ketThuc: {
		hetLease: "hong:het-lease",
		turnFailed: "hong:turn-failed",
		khongNop: "hong:khong-nop",
		payloadHong: "hong:payload",
		chuaCoKhoa: "khong-chay:chua-co-khoa-mo-hinh",
	},
} as const;
