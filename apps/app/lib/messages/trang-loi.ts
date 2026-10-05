import type { Locale } from "@crm/ui/lib/locale";

const en = {
	tieuDe: "Something is wrong on our side",
	than: "You are still signed in. This page could not load because the server is having trouble — try again in a few seconds.",
	thuLai: "Try again",
	dangThu: "Trying again…",
};

export type TrangLoiMessages = typeof en;

const vi: TrangLoiMessages = {
	tieuDe: "Hệ thống đang trục trặc",
	than: "Phiên của bạn vẫn còn — bạn chưa bị đăng xuất. Trang này chưa tải được vì máy chủ đang lỗi; thử lại sau ít giây.",
	thuLai: "Thử lại",
	dangThu: "Đang thử lại…",
};

export function trangLoiMessages(locale: Locale): TrangLoiMessages {
	return locale === "vi" ? vi : en;
}
