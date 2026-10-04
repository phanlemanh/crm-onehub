import { THAM_SO_KY_OKR } from "./okr-chu-ky";

export const THAM_SO_OKR = {
	ky: THAM_SO_KY_OKR,
	don: "donOkr",
	xem: "xemOkr",
} as const;

export const CACH_XEM_OKR = ["danh-sach", "cay", "hop-tuan", "cham"] as const;

export type CachXemOkr = (typeof CACH_XEM_OKR)[number];

export type DonChonOkr =
	| { loai: "goc" }
	| { loai: "bp"; id: string }
	| { loai: "pb"; id: string }
	| { loai: "nguoi"; id: string };

export const khoaDonOkr = (d: DonChonOkr): string =>
	d.loai === "goc" ? d.loai : `${d.loai}:${d.id}`;

export const LOC_GOP_Y = ["cho"] as const;
export type LocGopY = (typeof LOC_GOP_Y)[number];
