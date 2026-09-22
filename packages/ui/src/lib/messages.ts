import { DEFAULT_LOCALE, type Locale } from "./locale";

const en = {
	table: {
		clearFilters: "Clear",
		clearSelection: "Clear selection",
		selected: (count: string) => `${count} selected`,
		filters: "Filters",
		sort: "Sort",
		sortBy: "Sort by",
		detailColumn: "Detail",
		sortByDetail: "Expandable first",
		ascending: "Ascending",
		descending: "Descending",
		columns: "Columns",
		toggleColumns: "Toggle columns",
		selectAllRows: "Select every row on this page",
		selectRow: (label: string) => `Select ${label}`,
		selectRowFallback: "Select row",
		searchFacet: (label: string) => `Search ${label}…`,
		facetOptions: "Options",
		facetEmpty: "Nothing matches.",
		noResults: "No results found.",
	},
	pagination: {
		previous: "Previous",
		next: "Next",
		empty: "No results",
		showing: (from: string, to: string, total: string) =>
			`Showing ${from}–${to} of ${total}`,
	},
	messageScroller: {
		toEnd: "Scroll to end",
		toStart: "Scroll to start",
	},
	thongBao: {
		vung: "Notifications",
		dong: "Close notification",
	},
	macDinh: {
		chuaCoTin: "No messages yet",
		batDauTroChuyen: "Start a conversation to see messages here",
		daXong: "Done",
		thuLai: "Try again",
		chonMuc: "Select an option",
		timMuc: "Search…",
		khongKhop: "Nothing matches.",
		bangLenh: "Command Palette",
		timLenh: "Search for a command to run...",
		chonNgay: "Select a date",
		dangTai: "Loading",
		dangNghi: "Thinking",
	},
	dialog: {
		close: "Close",
	},
	carousel: {
		itemRole: "item",
		previousSlide: "Previous item",
		nextSlide: "Next item",
	},
	suggestion: {
		accept: "Accept",
		dismiss: "Dismiss",
	},
	spinner: {
		loading: "Loading",
	},
	datePicker: {
		clear: "Clear",
		previousMonth: "Go to the previous month",
		nextMonth: "Go to the next month",
		chooseMonth: "Choose the month",
		chooseYear: "Choose the year",
	},
	attendee: {
		accepted: "Accepted",
		declined: "Declined",
		tentative: "Maybe",
		needsAction: "No reply",
	},
	sortableList: {
		reorder: (label: string) => `Reorder ${label}`,
	},
	skeletonSwap: {
		loaded: (label: string) => `${label} loaded`,
	},
	reasoning: {
		thinking: "Thinking…",
		thoughtBrief: "Thought for a few seconds",
		thoughtFor: (seconds: string) => `Thought for ${seconds} seconds`,
	},
	chatMessage: {
		roleUser: "You",
		roleAssistant: "Assistant",
		previousBranch: "Previous branch",
		nextBranch: "Next branch",
		branchPage: (current: string, total: string) => `${current} of ${total}`,
		attachment: "attachment",
		unnamedImage: "Image",
		unnamedAttachment: "Attachment",
		removeAttachment: "Remove attachment",
		remove: "Remove",
	},
	chatTool: {
		failed: "This step failed",
	},
	threadMessage: {
		empty: "No message body.",
	},
	board: {
		empty: "Empty",
		more: (count: string) => `${count} more`,
	},
};

export type Messages = typeof en;

const vi = {
	table: {
		clearFilters: "Bỏ hết tiêu chí",
		clearSelection: "Bỏ chọn",
		selected: (count: string) => `Đã chọn ${count} dòng`,
		filters: "Lọc",
		sort: "Sắp xếp",
		sortBy: "Sắp xếp theo",
		detailColumn: "Chi tiết",
		sortByDetail: "Dòng có chi tiết lên trước",
		ascending: "Tăng dần",
		descending: "Giảm dần",
		columns: "Cột",
		toggleColumns: "Ẩn/hiện cột",
		selectAllRows: "Chọn tất cả dòng trên trang này",
		selectRow: (label: string) => `Chọn ${label}`,
		selectRowFallback: "Chọn dòng",
		searchFacet: (label: string) => `Tìm ${label}…`,
		facetOptions: "Các lựa chọn",
		facetEmpty: "Không có gì khớp.",
		noResults: "Không tìm thấy kết quả nào.",
	},
	pagination: {
		previous: "Trước",
		next: "Tiếp",
		empty: "Không có kết quả",
		showing: (from: string, to: string, total: string) =>
			`${from}–${to} trong số ${total}`,
	},
	messageScroller: {
		toEnd: "Xuống cuối",
		toStart: "Lên đầu",
	},
	thongBao: {
		vung: "Thông báo",
		dong: "Đóng thông báo",
	},
	macDinh: {
		chuaCoTin: "Chưa có tin nhắn nào",
		batDauTroChuyen: "Bắt đầu một cuộc trò chuyện để thấy tin nhắn ở đây",
		daXong: "Đã xong",
		thuLai: "Thử lại",
		chonMuc: "Chọn một mục",
		timMuc: "Tìm…",
		khongKhop: "Không có mục nào khớp.",
		bangLenh: "Bảng lệnh",
		timLenh: "Tìm một lệnh để chạy…",
		chonNgay: "Chọn ngày",
		dangTai: "Đang tải",
		dangNghi: "Đang nghĩ",
	},
	dialog: {
		close: "Đóng",
	},
	carousel: {
		itemRole: "mục",
		previousSlide: "Mục trước",
		nextSlide: "Mục sau",
	},
	suggestion: {
		accept: "Chấp nhận gợi ý",
		dismiss: "Từ chối gợi ý",
	},
	spinner: {
		loading: "Đang tải",
	},
	datePicker: {
		clear: "Xoá ngày",
		previousMonth: "Về tháng trước",
		nextMonth: "Sang tháng sau",
		chooseMonth: "Chọn tháng",
		chooseYear: "Chọn năm",
	},
	attendee: {
		accepted: "Nhận lời",
		declined: "Từ chối",
		tentative: "Có thể dự",
		needsAction: "Chưa trả lời",
	},
	sortableList: {
		reorder: (label: string) => `Đổi thứ tự ${label}`,
	},
	skeletonSwap: {
		loaded: (label: string) => `Đã tải xong ${label}`,
	},
	reasoning: {
		thinking: "Đang suy nghĩ…",
		thoughtBrief: "Đã nghĩ vài giây",
		thoughtFor: (seconds: string) => `Đã nghĩ trong ${seconds} giây`,
	},
	chatMessage: {
		roleUser: "Bạn",
		roleAssistant: "Trợ lý",
		previousBranch: "Nhánh trước",
		nextBranch: "Nhánh sau",
		branchPage: (current: string, total: string) => `${current} trên ${total}`,
		attachment: "tệp đính kèm",
		unnamedImage: "Ảnh",
		unnamedAttachment: "Tệp đính kèm",
		removeAttachment: "Xoá tệp đính kèm",
		remove: "Xoá",
	},
	chatTool: {
		failed: "Bước này lỗi",
	},
	threadMessage: {
		empty: "Thư không có nội dung.",
	},
	board: {
		empty: "Trống",
		more: (count: string) => `còn ${count} thẻ`,
	},
} satisfies Messages;

const BANG = { en, vi } satisfies Record<Locale, Messages>;

export function messages(locale: Locale = DEFAULT_LOCALE): Messages {
	return BANG[locale] ?? BANG[DEFAULT_LOCALE];
}
