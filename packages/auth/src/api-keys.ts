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

export const KHOA_KEO_TIN_HIEU = {
	configId: "keo-tin-hieu",
	quyen: { tinHieu: ["keoVe"] },
} as const;

export const KHOA_DAY_LO_TRINH = {
	configId: "day-lo-trinh",
	quyen: { loTrinh: ["day"] },
} as const;

export const LOAI_KHOA_API = [
	"toan-quyen",
	"keo-tin-hieu",
	"day-lo-trinh",
] as const;

export type LoaiKhoaApi = (typeof LOAI_KHOA_API)[number];

export function loaiKhoaTuConfig(configId: string | null): LoaiKhoaApi {
	if (configId === KHOA_KEO_TIN_HIEU.configId) return "keo-tin-hieu";
	if (configId === KHOA_DAY_LO_TRINH.configId) return "day-lo-trinh";
	return "toan-quyen";
}

export function configKhoaMay(configId: string | null): string | undefined {
	if (configId === KHOA_KEO_TIN_HIEU.configId)
		return KHOA_KEO_TIN_HIEU.configId;
	if (configId === KHOA_DAY_LO_TRINH.configId)
		return KHOA_DAY_LO_TRINH.configId;
	return undefined;
}
