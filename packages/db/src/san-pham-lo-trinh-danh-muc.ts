import { MINUTE_MS } from "./okr-tro-ly-danh-muc";

const MB = 1024 * 1024;
const GIAY_MS = MINUTE_MS / 60;

export const TRANG_THAI_LAY = [
	"chua-lay",
	"da-lay",
	"chua-cau-hinh",
	"chua-cai",
	"khong-thay-kho",
	"khong-thay-tep",
	"khoi-hong",
	"qua-tran",
	"loi-github",
] as const;

export type TrangThaiLay = (typeof TRANG_THAI_LAY)[number];

export const LO_TRINH_SAN_PHAM = {
	nguonCrm: "crm",
	nhipKiemMs: 5 * MINUTE_MS,
	toiDaMoiNhip: 10,
	tranTepByte: 2 * MB,
	hanNhipMs: 50 * GIAY_MS,
	tranGoiMs: 10 * GIAY_MS,
	jwtSongGiay: 540,
	jwtLuiGiay: 60,
	tepMacDinh: "LO-TRINH.html",
	tranTen: 60,
	tranMa: 40,
	tranTep: 200,
} as const;
