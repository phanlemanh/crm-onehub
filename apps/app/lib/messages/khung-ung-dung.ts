import type { Locale } from "@crm/ui/lib/locale";

const en = {
	rail: {
		overview: "Overview",
		chat: "Chat",
		companies: "Companies",
		contacts: "Contacts",
		deals: "Deals",
		campaigns: "Campaigns",
		onboarding: "First 30 days",
		settings: "Settings",
	},
	nav: {
		primary: "Primary",
		mobile: "Mobile navigation",
		mobileChat: "Navigation and agent chats",
		title: "Navigation",
		close: "Close navigation",
		open: "Open navigation",
	},
	header: {
		homepage: "Homepage",
		accountMenu: "Account menu",
		lightMode: "Light mode",
		darkMode: "Dark mode",
		signOut: "Sign out",
		signOutFailed: "Could not sign out.",
		loading: "Loading workspace header…",
		otherLocale: "Tiếng Việt",
	},
	switcher: {
		title: "Search",
		description: "Jump to a company, contact or deal",
		placeholder: "Search companies, contacts and deals…",
		typeMore: "Type at least two characters.",
		noMatch: "Nothing matches.",
		results: "Results",
		groups: { company: "Companies", contact: "Contacts", deal: "Deals" },
	},
	enrichment: {
		enriching: "Enriching",
		enrichingCount: (n: string) => `Enriching ${n}`,
		enrichingNow: "Enriching now",
		emptyTitle: "Nothing right now",
		emptyBody:
			"New companies and contacts show up here while your agents look them up.",
		moreQueued: (n: string) => `${n} more queued`,
		showAll: "Show all",
		loadMore: "Load more",
		hide: "Hide",
		show: "Show",
		bookedOne: "1 record is booked for a later look",
		bookedMany: (n: string) => `${n} records are booked for a later look`,
		bookedMore: (n: string) => `${n} more are booked but not listed here`,
	},
};

export type KhungUngDungMessages = typeof en;

const vi = {
	rail: {
		overview: "Tổng quan",
		chat: "Hội thoại",
		companies: "Công ty",
		contacts: "Cá nhân",
		deals: "Thoả thuận",
		campaigns: "Chiến dịch",
		onboarding: "30 ngày đầu",
		settings: "Cài đặt",
	},
	nav: {
		primary: "Điều hướng chính",
		mobile: "Điều hướng trên máy nhỏ",
		mobileChat: "Điều hướng và hội thoại",
		title: "Điều hướng",
		close: "Đóng điều hướng",
		open: "Mở điều hướng",
	},
	header: {
		homepage: "Trang chủ",
		accountMenu: "Menu tài khoản",
		lightMode: "Nền sáng",
		darkMode: "Nền tối",
		signOut: "Đăng xuất",
		signOutFailed: "Chưa đăng xuất được.",
		loading: "Đang tải thanh đầu…",
		otherLocale: "English",
	},
	switcher: {
		title: "Tìm nhanh",
		description: "Nhảy tới một công ty, cá nhân hay thoả thuận",
		placeholder: "Tìm công ty, cá nhân, thoả thuận…",
		typeMore: "Gõ ít nhất hai ký tự.",
		noMatch: "Không có gì khớp.",
		results: "Kết quả",
		groups: { company: "Công ty", contact: "Cá nhân", deal: "Thoả thuận" },
	},
	enrichment: {
		enriching: "Đang tra cứu",
		enrichingCount: (n: string) => `Đang tra cứu ${n}`,
		enrichingNow: "Đang tra cứu lúc này",
		emptyTitle: "Chưa có gì",
		emptyBody:
			"Công ty và cá nhân mới hiện ở đây trong lúc tác nhân tra cứu về họ.",
		moreQueued: (n: string) => `Còn ${n} đang xếp hàng`,
		showAll: "Hiện tất cả",
		loadMore: "Tải thêm",
		hide: "Ẩn",
		show: "Hiện",
		bookedOne: "1 bản ghi hẹn tra cứu sau",
		bookedMany: (n: string) => `${n} bản ghi hẹn tra cứu sau`,
		bookedMore: (n: string) => `Còn ${n} bản ghi nữa chưa liệt kê ở đây`,
	},
} satisfies KhungUngDungMessages;

const BANG = { en, vi } satisfies Record<Locale, KhungUngDungMessages>;

export function khungUngDungMessages(locale: Locale): KhungUngDungMessages {
	return BANG[locale];
}
