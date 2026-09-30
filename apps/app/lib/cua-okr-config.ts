import { z } from "zod";
import type { RouterOutputs } from "@/lib/trpc/types";

type TuChoiLuot = Extract<
	RouterOutputs["okr"]["soanTangLuot"],
	{ ok: false }
>["lyDo"];

const PHIEN = ":phien";
const doan = z.string().regex(/^[A-Za-z0-9_-]{1,128}$/);

export const CUA_OKR = {
	maCuoc: z.string().regex(/^[a-z0-9-]{8,64}$/),
	doanDuong: z.array(doan).min(1),
	phienEve: {
		header: "x-eve-session-id",
		ma: doan,
		than: z.object({ sessionId: doan }),
	},
	phien: PHIEN,
	dangDuong: {
		sucKhoe: ["eve", "v1", "health"],
		thongTin: ["eve", "v1", "info"],
		moPhien: ["eve", "v1", "session"],
		guiTiep: ["eve", "v1", "session", PHIEN],
		dong: ["eve", "v1", "session", PHIEN, "stream"],
		huyLuot: ["eve", "v1", "session", PHIEN, "cancel"],
	},
	dangLuot: ["moPhien", "guiTiep"],
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
		duongKhongPhucVu: "duong-khong-phuc-vu",
		cuocKhongThuocBan: "cuoc-khong-thuoc-ban",
		cuocKhongDang: "cuoc-khong-dang",
		phienKhongThuocCuoc: "phien-khong-thuoc-cuoc",
		daCoPhien: "da-co-phien",
		khongDocDuocPhien: "khong-doc-duoc-phien",
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
