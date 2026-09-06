import type { Locale } from "@crm/ui/lib/locale";

const en = {
	thanhBen: {
		hoiThoai: "Chats",
		hoiThoaiMoi: "New agent chat",
		danhSachHoiThoai: "Agent chats",
		chuaDatTen: "Untitled chat",
		trongBayNgay: "No chats in the last 7 days.",
		tacNhanCuaDoi: "Team agents",
		nhom: {
			Today: "Today",
			Yesterday: "Yesterday",
			"Last 7 days": "Last 7 days",
		},
		dangMoDieuHuong: "Loading agent navigation…",
	},
	trang: {
		dangMoHoiThoai: "Opening chat…",
		tieuDeHoiThoai: "Chat",
		tieuDeMotHoiThoai: "Agent chat",
		tieuDeDanhSach: "Agents",
		tieuDeMotTacNhan: "Team agent",
	},
	nha: {
		chaoHoi: (ten: string) => `What can I help with, ${ten}?`,
		tenThayThe: "there",
		moTa: "Ask about your CRM, tag a record or integration, or describe an agent to build to automate a task.",
		riengTu:
			"Chats and agent drafts stay private to you. Deploying an agent makes it available to the whole team.",
		goiY: "Suggested agents",
		goiYMuc: [
			"Brief every deal owner before a renewal call",
			"Flag deals with no activity for 14 days",
			"Hand new customers from Sales to Onboarding",
		],
	},
	doi: {
		tieuDe: "Team agents",
		moTa: "Durable automations created from private agent-builder chats.",
		khongMoTa: "No description",
		soLuotChay: (so: string) => `${so} runs`,
		trong: "No team agents yet",
		trongMoTa:
			"Create one from a private chat, then review its access before deploying it.",
		moHoiThoai: "Open chat",
	},
};

export type KhungMessages = typeof en;

const vi = {
	thanhBen: {
		hoiThoai: "Hội thoại",
		hoiThoaiMoi: "Hội thoại dựng tác nhân mới",
		danhSachHoiThoai: "Các hội thoại dựng tác nhân",
		chuaDatTen: "Hội thoại chưa đặt tên",
		trongBayNgay: "Không có hội thoại nào trong 7 ngày qua.",
		tacNhanCuaDoi: "Tác nhân của đội",
		nhom: {
			Today: "Hôm nay",
			Yesterday: "Hôm qua",
			"Last 7 days": "7 ngày qua",
		},
		dangMoDieuHuong: "Đang mở thanh điều hướng…",
	},
	trang: {
		dangMoHoiThoai: "Đang mở hội thoại…",
		tieuDeHoiThoai: "Hội thoại",
		tieuDeMotHoiThoai: "Hội thoại dựng tác nhân",
		tieuDeDanhSach: "Tác nhân",
		tieuDeMotTacNhan: "Tác nhân của đội",
	},
	nha: {
		chaoHoi: (ten: string) => `${ten} cần gì hôm nay?`,
		tenThayThe: "bạn",
		moTa: "Hỏi về CRM của bạn, gắn thẻ một bản ghi hay một kết nối, hoặc tả một tác nhân cần dựng để lo hộ một việc.",
		riengTu:
			"Hội thoại và bản nháp tác nhân chỉ mình bạn thấy. Đưa một tác nhân vào chạy thì cả đội dùng được.",
		goiY: "Tác nhân gợi ý",
		goiYMuc: [
			"Tóm tắt cho người phụ trách trước mỗi cuộc gọi gia hạn",
			"Nêu tên thoả thuận nằm im 14 ngày",
			"Bàn giao khách mới từ Kinh doanh sang Khởi tạo",
		],
	},
	doi: {
		tieuDe: "Tác nhân của đội",
		moTa: "Việc tự động bền, dựng ra từ những hội thoại riêng của từng người.",
		khongMoTa: "Chưa có mô tả",
		soLuotChay: (so: string) => `${so} lượt chạy`,
		trong: "Đội chưa có tác nhân nào",
		trongMoTa:
			"Dựng một tác nhân từ hội thoại riêng, soát lại quyền của nó, rồi mới đưa vào chạy.",
		moHoiThoai: "Mở hội thoại",
	},
} satisfies KhungMessages;

const BANG = { en, vi } satisfies Record<Locale, KhungMessages>;

export function khungMessages(locale: Locale): KhungMessages {
	return BANG[locale];
}
