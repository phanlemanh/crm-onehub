import type { ChonZaloGia } from "./zalo-gia";

export type DangGetMe = {
	ten: string;
	chon: ChonZaloGia;
	lop: string;
	http: number | null;
	maThan: number | null;
};

const tho = (http: number, than: "chu" | { ma: number }): ChonZaloGia => ({
	getMeTho: { http, than },
});

export const BANG_TAM: readonly DangGetMe[] = [
	{
		ten: "http-408 than 408",
		chon: tho(408, { ma: 408 }),
		lop: "http-408",
		http: 408,
		maThan: 408,
	},
	{
		ten: "http-408 than chu",
		chon: tho(408, "chu"),
		lop: "http-408",
		http: 408,
		maThan: null,
	},
	{
		ten: "http-429",
		chon: tho(429, { ma: 429 }),
		lop: "http-429",
		http: 429,
		maThan: 429,
	},
	{
		ten: "http-500",
		chon: { getMe: 500 },
		lop: "http-500",
		http: 500,
		maThan: null,
	},
	{
		ten: "http-503",
		chon: tho(503, "chu"),
		lop: "http-503",
		http: 503,
		maThan: null,
	},
	{
		ten: "mang",
		chon: { getMe: "mang" },
		lop: "mang",
		http: null,
		maThan: null,
	},
	{
		ten: "sai-khuon",
		chon: { getMe: "la" },
		lop: "sai-khuon",
		http: 200,
		maThan: null,
	},
	{
		ten: "ok-false-408",
		chon: tho(200, { ma: 408 }),
		lop: "ok-false-408",
		http: 200,
		maThan: 408,
	},
	{
		ten: "ok-false-429",
		chon: tho(200, { ma: 429 }),
		lop: "ok-false-429",
		http: 200,
		maThan: 429,
	},
	{
		ten: "ok-false-500",
		chon: { getMe: "ok-false-500" },
		lop: "ok-false-500",
		http: 200,
		maThan: 500,
	},
	{
		ten: "http-400+ok-false-429",
		chon: tho(400, { ma: 429 }),
		lop: "http-400",
		http: 400,
		maThan: 429,
	},
];

export const BANG_TU_CHOI: readonly DangGetMe[] = [
	{
		ten: "http-400",
		chon: tho(400, { ma: 400 }),
		lop: "http-400",
		http: 400,
		maThan: 400,
	},
	{
		ten: "http-401",
		chon: { getMe: 401 },
		lop: "http-401",
		http: 401,
		maThan: 401,
	},
	{
		ten: "http-403",
		chon: tho(403, { ma: 403 }),
		lop: "http-403",
		http: 403,
		maThan: 403,
	},
	{
		ten: "http-404",
		chon: tho(404, { ma: 404 }),
		lop: "http-404",
		http: 404,
		maThan: 404,
	},
	{
		ten: "ok-false-400",
		chon: tho(200, { ma: 400 }),
		lop: "ok-false-400",
		http: 200,
		maThan: 400,
	},
	{
		ten: "ok-false-401",
		chon: { getMe: "ok-false-401" },
		lop: "ok-false-401",
		http: 200,
		maThan: 401,
	},
	{
		ten: "ok-false-403",
		chon: tho(200, { ma: 403 }),
		lop: "ok-false-403",
		http: 200,
		maThan: 403,
	},
	{
		ten: "ok-false-404",
		chon: tho(200, { ma: 404 }),
		lop: "ok-false-404",
		http: 200,
		maThan: 404,
	},
];

export const SO_TAM = 11;

export const SO_TU_CHOI = 8;
