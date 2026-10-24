import type { Locale } from "@crm/ui/lib/locale";

const vi = {
	tieuDe: "Lần cập nhật trước",
	loiGhiChu: "Không tải được ghi chú lần trước.",
	thuLai: "Thử lại",
	goiY: [
		"Điều ghi lần trước đã xong chưa?",
		"Đang vướng gì, cần ai giúp?",
		"Tuần tới làm gì?",
	],
};

export type OkrLanTruocMessages = typeof vi;

const en: OkrLanTruocMessages = {
	tieuDe: "Previous update",
	loiGhiChu: "Couldn't load the previous note.",
	thuLai: "Try again",
	goiY: [
		"Is what you noted last time done?",
		"What's in the way, and who can help?",
		"What will you do next week?",
	],
};

export function okrLanTruocMessages(locale: Locale): OkrLanTruocMessages {
	return locale === "en" ? en : vi;
}
