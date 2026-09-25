import type { Locale } from "@crm/ui/lib/locale";

const en = {
	tieuDe: "This part is not in your role",
	than: "The OKR-only role does not read partner data. Ask an admin if you need another role.",
	veTongQuan: "Back to Overview",
};

export type NgoaiPhamViMessages = typeof en;

const vi: NgoaiPhamViMessages = {
	tieuDe: "Phần này không thuộc vai của bạn",
	than: "Vai chỉ OKR không đọc dữ liệu đối tác. Hỏi quản trị nếu bạn cần vai khác.",
	veTongQuan: "Về Tổng quan",
};

export function ngoaiPhamViMessages(locale: Locale): NgoaiPhamViMessages {
	return locale === "vi" ? vi : en;
}
