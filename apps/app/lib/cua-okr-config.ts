import { z } from "zod";
import type { RouterOutputs } from "@/lib/trpc/types";

type TuChoiLuot = Extract<
	RouterOutputs["okr"]["soanTangLuot"],
	{ ok: false }
>["lyDo"];

export const CUA_OKR = {
	maCuoc: z.string().regex(/^[a-z0-9-]{8,64}$/),
	duongLuot: /^\/eve\/v1\/session(?:\/[^/]+)?$/,
	duongPhien: /\/eve\/v1\/session\/([^/]+)/,
	khongChuyen: [
		"host",
		"cookie",
		"x-forwarded-host",
		"x-forwarded-proto",
		"x-forwarded-for",
		"forwarded",
		"transfer-encoding",
		"connection",
		"keep-alive",
		"content-length",
		"expect",
	],
	tienToRieng: "x-crm-",
	khongTra: [
		"transfer-encoding",
		"connection",
		"content-encoding",
		"content-length",
	],
	loi: {
		chuaCauHinh: "chua-cau-hinh-tro-ly-okr",
		chuaDangNhap: "chua-dang-nhap",
		thieuCuoc: "thieu-cuoc-soan",
		cuocKhongThuocBan: "cuoc-khong-thuoc-ban",
		cuocKhongDang: "cuoc-khong-dang",
		phienKhongThuocCuoc: "phien-khong-thuoc-cuoc",
		khongDemDuocLuot: "khong-dem-duoc-luot",
		khongNoiDuoc: "tro-ly-okr-khong-noi-duoc",
	},
	trangThaiTuChoiLuot: {
		"het-luot-cuoc": 429,
		"het-tran-thang": 429,
		"cuoc-khong-dang": 403,
		"don-vi-chua-bat": 403,
		"chua-co-khoa-mo-hinh": 503,
	} satisfies Record<TuChoiLuot, number>,
} as const;
