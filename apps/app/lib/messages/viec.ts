import type { Locale } from "@crm/ui/lib/locale";

const en = {
	trangThai: {
		CHUA_LAM: "Not started",
		DANG_LAM: "In progress",
		CHO_DANH_GIA: "Awaiting review",
		XONG: "Done",
		HUY: "Cancelled",
	},
	daXong: "Done ({n})",
	daHuy: "Cancelled ({n})",
	khongHan: "No due date",
	oSoan: {
		loai: "Work item",
		tieuDe: "What needs doing?",
		nguoiThucHien: "Assignee",
		toi: "Me",
		han: "Due",
		chonHan: "Pick a date",
		nguoiTheoDoi: "Followers",
		khongTheoDoi: "No one",
		timNguoi: "Search people",
		khongAi: "No one matches",
		giao: "Assign",
		huy: "Cancel",
		dangGiao: "Assigning…",
		loi: "Couldn't assign. Check the fields and try again.",
	},
	khoi: { tieuDe: "Work" },
	trang: {
		tieuDe: "My work",
		moTa: "Work assigned to you, work you assigned, and work you follow.",
		giaoViec: "Assign work",
	},
	nhom: {
		"giao-cho-toi": "Assigned to me",
		"toi-giao": "I assigned",
		"dang-theo-doi": "Following",
	},
	cot: {
		viec: "Work",
		trangThai: "Status",
		han: "Due",
		banGhi: "Linked to",
		nguoiGiao: "Assigned by",
		nguoiThucHien: "Assignee",
	},
	rong: {
		"giao-cho-toi": "Nothing assigned to you yet",
		"toi-giao": "You haven't assigned any work",
		"dang-theo-doi": "You aren't following any work",
		moTa: "Assign work from here or from a deal, company, person or 30-day plan.",
	},
	loi: {
		tieuDe: "Couldn't load your work",
		moTa: "The server didn't answer. Try again in a moment.",
	},
	khongGan: "Not linked",
};

type ViecMessages = typeof en;

const vi: ViecMessages = {
	trangThai: {
		CHUA_LAM: "Chưa làm",
		DANG_LAM: "Đang làm",
		CHO_DANH_GIA: "Chờ đánh giá",
		XONG: "Đã xong",
		HUY: "Đã huỷ",
	},
	daXong: "Đã xong ({n})",
	daHuy: "Đã huỷ ({n})",
	khongHan: "Không hạn",
	oSoan: {
		loai: "Việc",
		tieuDe: "Cần làm gì?",
		nguoiThucHien: "Người thực hiện",
		toi: "Tôi",
		han: "Hạn",
		chonHan: "Chọn ngày",
		nguoiTheoDoi: "Người theo dõi",
		khongTheoDoi: "Không ai",
		timNguoi: "Tìm người",
		khongAi: "Không có ai khớp",
		giao: "Giao việc",
		huy: "Huỷ",
		dangGiao: "Đang giao…",
		loi: "Chưa giao được. Kiểm lại các ô rồi thử lại.",
	},
	khoi: { tieuDe: "Việc" },
	trang: {
		tieuDe: "Việc của tôi",
		moTa: "Việc người khác giao cho bạn, việc bạn giao, và việc bạn đang theo dõi.",
		giaoViec: "Giao việc",
	},
	nhom: {
		"giao-cho-toi": "Giao cho tôi",
		"toi-giao": "Tôi giao",
		"dang-theo-doi": "Đang theo dõi",
	},
	cot: {
		viec: "Việc",
		trangThai: "Trạng thái",
		han: "Hạn",
		banGhi: "Gắn với",
		nguoiGiao: "Người giao",
		nguoiThucHien: "Người thực hiện",
	},
	rong: {
		"giao-cho-toi": "Chưa có việc nào giao cho bạn",
		"toi-giao": "Bạn chưa giao việc nào",
		"dang-theo-doi": "Bạn chưa theo dõi việc nào",
		moTa: "Giao việc ở đây hoặc từ một thoả thuận, công ty, cá nhân hay kế hoạch 30 ngày.",
	},
	loi: {
		tieuDe: "Không tải được danh sách việc",
		moTa: "Máy chủ chưa trả lời. Thử lại sau giây lát.",
	},
	khongGan: "Chưa gắn bản ghi",
};

const BANG = { en, vi } satisfies Record<Locale, ViecMessages>;

export type { ViecMessages };

export function viecMessages(locale: Locale): ViecMessages {
	return BANG[locale];
}
