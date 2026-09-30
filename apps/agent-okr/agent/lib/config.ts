const MINUTE_MS = 60_000;
const MO_HINH = "google/gemini-3.8-flash";
const MO_HINH_JUDGE = "zai/glm-5.2-fast";
const THE = ["onehub:tro-ly-okr", "onehub:soan-okr"] as const;

export const TRO_LY_OKR_SOAN = {
	model: MO_HINH,
	moHinhZdr: [MO_HINH, MO_HINH_JUDGE],
	tags: THE,
	tranRaMoiLoiGoi: 3_000,
	cuaSoNguCanh: 1_048_576,
	limits: {
		maxInputTokensPerSession: 60_000,
		maxOutputTokensPerSession: 8_000,
		sessionTimeoutMs: 30 * MINUTE_MS,
	},
	purpose: "okr-soan",
	audience: "crm-okr-agent",
	issuer: "crm-app",
	env: {
		url: "OKR_AGENT_URL",
		biMat: "OKR_AGENT_BRIDGE_SECRET",
		tenCay: "PHIEN_DO_TEN_CAY",
	},
	congMacDinh: 2100,
} as const;
