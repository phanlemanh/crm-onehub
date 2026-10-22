const GIAY_MS = 1_000;
const PHUT_MS = 60 * GIAY_MS;

export const FIELD_FILES_CONFIG = {
	phieu: { tienTo: "truong-tep:phieu", hanMs: 60 * PHUT_MS },
	nhan: { khoa: "truong-tep:nhan", timeoutMs: 30 * GIAY_MS },
	don: { toiDa: 500 },
} as const;
