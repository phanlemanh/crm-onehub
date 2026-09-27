const GIAY_MS = 1000;
const PHUT_MS = 60 * GIAY_MS;

export const OKR_SO = {
	banGhi: { coTrang: 50, toiDaTrang: 200 },
	chup: { toiDaMoiNhip: 500, hanNhipMs: 45 * GIAY_MS },
	sheets: {
		toiDaMoiNhip: 10,
		soLanThu: 2,
		tranMs: 5 * GIAY_MS,
		thuLaiMs: 30 * PHUT_MS,
		tokenGiayHieuLuc: 3600,
		tokenDungMs: 55 * PHUT_MS,
		tokenUrl: "https://oauth2.googleapis.com/token",
		apiUrl: "https://sheets.googleapis.com/v4/spreadsheets",
		scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
	},
} as const;
