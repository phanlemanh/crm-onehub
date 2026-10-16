import { z } from "zod";
import type { RouterOutputs } from "@/lib/trpc/types";

type TuChoiLuot = Extract<
	RouterOutputs["okr"]["soanTangLuot"],
	{ ok: false }
>["lyDo"];

const SECOND_MS = 1_000;
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
	tienToEve: "/eve/v1",
	dangDuong: {
		sucKhoe: ["health"],
		thongTin: ["info"],
		moPhien: ["session"],
		guiTiep: ["session", PHIEN],
		dong: ["session", PHIEN, "stream"],
		huyLuot: ["session", PHIEN, "cancel"],
	},
	dangLuot: ["moPhien", "guiTiep"],
	chiDoc: ["GET", "HEAD"],
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
	trangThaiChuaCauHinh: 503,
	choTroLyMs: 30 * SECOND_MS,
	luotDaHoan: "da-hoan",
	loiMangTrinhDuyet: [
		"Failed to fetch",
		"fetch failed",
		"NetworkError when attempting to fetch resource.",
		"Load failed",
	],
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
		phienDaThay: "phien-da-thay",
		khongDocDuocPhien: "khong-doc-duoc-phien",
		khongGhiDuocPhien: "khong-ghi-duoc-phien",
		khongDemDuocLuot: "khong-dem-duoc-luot",
		khongNoiDuoc: "tro-ly-okr-khong-noi-duoc",
		quaHan: "tro-ly-okr-qua-han",
		troLyTuChoi: "tro-ly-okr-tu-choi",
		troLyLoi: "tro-ly-okr-loi",
	},
	trangThaiTuChoiLuot: {
		"het-luot-cuoc": 429,
		"het-tran-thang": 429,
		"cuoc-khong-dang": 403,
		"don-vi-chua-bat": 403,
		"don-vi-luu-tru": 403,
		"chua-co-khoa-mo-hinh": 503,
	} satisfies Record<TuChoiLuot, number>,
} as const;

export const CUA_OKR_HOI = {
	header: "x-crm-cuoc-hoi",
	loi: { thieuCuoc: "thieu-cuoc-hoi", haiCuoc: "hai-loai-cuoc" },
} as const;

export const MA_LY_DO_HONG = [
	"khong-noi-duoc",
	"qua-han",
	"tro-ly-tu-choi",
	"tro-ly-loi",
	"chua-dem-duoc-luot",
	"chua-mo-duoc-phien",
	"het-dang-nhap",
	"mat-mang",
	"chua-mo-lai-duoc",
	"qua-45s",
	"dung-giua-chung",
] as const;

export type MaLyDoHong = (typeof MA_LY_DO_HONG)[number];
