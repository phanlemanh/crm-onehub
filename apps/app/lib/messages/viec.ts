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
		dangGiao: "Assigning…",
		loi: "Couldn't assign. Check the fields and try again.",
	},
	khoi: { tieuDe: "Work" },
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
		dangGiao: "Đang giao…",
		loi: "Chưa giao được. Kiểm lại các ô rồi thử lại.",
	},
	khoi: { tieuDe: "Việc" },
};

const BANG = { en, vi } satisfies Record<Locale, ViecMessages>;

export type { ViecMessages };

export function viecMessages(locale: Locale): ViecMessages {
	return BANG[locale];
}
