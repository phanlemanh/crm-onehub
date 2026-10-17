import type { DongThongBao } from "@/components/thong-bao/dong-thong-bao";
import { CHO_TAC_NHAN } from "@/lib/agent-builder-cho";

export const STATE = {
	duoiNguong: "ST-duoi-nguong",
	trenNguong: "ST-tren-nguong",
	chuongBaLoai: "ST-chuong-ba-loai",
	chuongDaDoc: "ST-chuong-da-doc",
} as const;

const GIAY_MS = 1000;

export const DA_TROI_MS = {
	[STATE.duoiNguong]: 84 * GIAY_MS,
	[STATE.trenNguong]: CHO_TAC_NHAN.nguongLauMs + 20 * GIAY_MS,
} as const;

export const DA_XONG = {
	[STATE.duoiNguong]: 1,
	[STATE.trenNguong]: 3,
} as const;

export const DANG_GHI = {
	[STATE.duoiNguong]: "agent/instructions.md",
	[STATE.trenNguong]: "agent/README.md",
} as const;

export const HREF_CHAT = "/proto/cho-tac-nhan-lau?state=ST-duoi-nguong";

export function dongTacNhan(
	cau: { xong: string; canTraLoi: string; hong: string },
	chuaDoc: boolean,
): DongThongBao[] {
	return [
		{ id: "tn1", cau: cau.xong, gio: "10:42", chuaDoc, href: HREF_CHAT },
		{ id: "tn2", cau: cau.canTraLoi, gio: "10:15", chuaDoc, href: HREF_CHAT },
		{ id: "tn3", cau: cau.hong, gio: "09:58", chuaDoc, href: HREF_CHAT },
	];
}
