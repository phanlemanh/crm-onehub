const SECOND_MS = 1_000;
const MINUTE_MS = 60 * SECOND_MS;

export const OKR_SO_MAN = {
	docThuLamMoiMs: 3 * SECOND_MS,
	docThuToiDaMs: 2 * MINUTE_MS,
	urlBangTinh: "https://docs.google.com/spreadsheets/d/",
	giaTriMau: 12,
} as const;
