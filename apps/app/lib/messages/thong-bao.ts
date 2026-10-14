import type { Locale } from "@crm/ui/lib/locale";

const en = {
	chuong: {
		tieuDe: "Notifications",
		nhan: "Notifications",
		nhanSo: "Notifications, {so} unread",
		docHet: "Mark all as read",
		dangDocHet: "Marking…",
		docHetLoi: "Couldn't mark them as read — try again.",
		homNay: "Today",
		truocDo: "Earlier",
		xemTatCa: "View all",
		chuaDoc: "Unread",
		rongTieuDe: "No notifications yet",
		rongMoTa: "CRM tells you here each morning when something needs you.",
		loiTieuDe: "Couldn't load notifications",
		loiMoTa: "Try again in a moment.",
		thuLai: "Try again",
	},
	trang: {
		tieuDe: "Notifications",
		moTa: "Everything CRM has told you in the last 90 days.",
		loc: { tatCa: "All", chuaDoc: "Unread" },
		daDocHetTieuDe: "You've read everything",
		daDocHetMoTa: "New notifications show up here each morning.",
		xemTatCa: "Show all",
		xemThem: "Load more",
		taiLoiTieuDe: "Couldn't load your notifications",
		taiLoiMoTa: "The list didn't load. Try again in a moment.",
	},
};

type ThongBaoMessages = typeof en;

const vi: ThongBaoMessages = {
	chuong: {
		tieuDe: "Thông báo",
		nhan: "Thông báo",
		nhanSo: "Thông báo, {so} chưa đọc",
		docHet: "Đánh dấu tất cả đã đọc",
		dangDocHet: "Đang đánh dấu…",
		docHetLoi: "Chưa đánh dấu được — thử lại.",
		homNay: "Hôm nay",
		truocDo: "Trước đó",
		xemTatCa: "Xem tất cả",
		chuaDoc: "Chưa đọc",
		rongTieuDe: "Chưa có thông báo nào",
		rongMoTa: "CRM báo ở đây mỗi sáng khi có việc cần bạn.",
		loiTieuDe: "Không tải được thông báo",
		loiMoTa: "Thử lại sau giây lát.",
		thuLai: "Thử lại",
	},
	trang: {
		tieuDe: "Thông báo",
		moTa: "Mọi điều CRM đã báo cho bạn trong 90 ngày qua.",
		loc: { tatCa: "Tất cả", chuaDoc: "Chưa đọc" },
		daDocHetTieuDe: "Bạn đã đọc hết",
		daDocHetMoTa: "Thông báo mới hiện ở đây mỗi sáng.",
		xemTatCa: "Xem tất cả",
		xemThem: "Xem thêm",
		taiLoiTieuDe: "Không tải được thông báo",
		taiLoiMoTa: "Danh sách chưa tải được. Thử lại sau giây lát.",
	},
};

export function thongBaoMessages(locale: Locale): ThongBaoMessages {
	return locale === "vi" ? vi : en;
}
