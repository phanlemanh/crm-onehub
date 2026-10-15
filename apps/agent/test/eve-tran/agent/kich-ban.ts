export const KICH_BAN = {
	coKhuon: "co-khuon",
	khongKhuon: "khong-khuon",
	tiep: "tiep",
	dung: "dung",
	hoi: "hoi",
} as const;

export const CAU_HOI_THU = {
	prompt: "chon mot",
	option: { id: "a", label: "A" },
	daTraLoi: "da-tra-loi",
	tienToMa: "cau-hoi-",
} as const;

export const DAU_BUOC_HAI = "buoc-hai-sau-cap-them";

export const HAN_MUC_THU = {
	maxOutputTokens: 100,
	outputTokensBuocMot: 500,
} as const;

export const CUA_SO_THU = 128_000;

export const CHO_TRA_LOI_MS = 20_000;
