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
		boThayDoi: {
			tieuDe: "Discard what you typed?",
			than: "What you typed in this box will be lost.",
			tiepTuc: "Keep editing",
			bo: "Discard",
		},
	},
	carousel: {
		itemRole: "item",
		previousSlide: "Previous item",
		nextSlide: "Next item",
	},
	inlineCitation: {
		previousSource: "Previous source",
		nextSource: "Next source",
		sources: "Sources",
	},
	proposedChange: {
		edit: "Edit",
		undo: "Undo",
	},
	kara: {
		why: "Why?",
		whyTitle: "What Kara based this on",
		readAt: (t: string) => `Read at ${t}`,
		trace: "changed via Kara",
		traceDescription: "This value was changed from a Kara suggestion",
	},
	aiFeedback: {
		useful: "Useful",
		notUseful: "Not useful",
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
	promptInput: {
		submit: "Send",
		stop: "Stop",
		placeholder: "What would you like to know?",
		uploadFiles: "Upload files",
		addAttachments: "Add photos or files",
		takeScreenshot: "Take screenshot",
		errorAccept: "No files match the accepted types.",
		errorFileSize: "All files exceed the maximum size.",
		errorMaxFiles: "Too many files. Some were not added.",
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
		drag: (title: string) => `Drag ${title}`,
	},
	soTien: {
		docLa: "Reads as",
		format: (example: string) =>
			`Can't read this number. Use a comma between thousands and a period before decimals — for example ${example}.`,
		otherLocale: (example: string) =>
			`This number is written the Vietnamese way. Here a comma separates thousands and a period comes before decimals — for example ${example}.`,
		fractionNone: (currency: string, example: string) =>
			`${currency} has no decimals — type a whole amount, for example ${example}.`,
		fractionMax: (currency: string, digits: string) =>
			`${currency} takes at most ${digits} decimal places.`,
		negative: "The amount can't be negative.",
		tooLarge: "That amount is too large to record.",
		canDongTien: "Choose a currency to read this amount.",
	},
	tienDo: {
		nhan: "Progress",
		coVach: (nhan: string, p: string, k: string) =>
			`${nhan}: ${p}%, expected ${k}% by now`,
		khongVach: (nhan: string, p: string) => `${nhan}: ${p}%`,
		leRa: (k: string) => `Expected ${k}% by now`,
	},
	okr: {
		tuTinCao: "High confidence",
		tuTinVua: "Medium confidence",
		tuTinThap: "Low confidence",
		dungNhip: "On track",
		chamNhip: "Behind",
		truot: "Off track",
		chuaCoKyVong: "No baseline yet",
		mocXong: "Done",
		mocChua: "Milestone, not done",
	},
	heatmap: {
		donVi: "Unit",
		chuaCo: "no data",
		chuGiai:
			"The more a cell stands out from the background, the more KRs had high confidence.",
		oRong: "week not reached yet, or nobody updated",
	},
	chuKy: {
		hienTai: "current",
		daDong: "closed",
	},
	chep: {
		nhan: (ten: string) => `Copy ${ten}`,
		xong: (ten: string) => `${ten} copied.`,
		hong: (ten: string) => `Could not copy the ${ten}. Select it instead.`,
	},
	bieuDo: {
		giaTri: "Value",
		leRa: "Expected",
		tuan: "Week",
		chuGiai:
			"Solid line: value at each weekly update. Dashed line: expected by then. Horizontal line: target.",
	},
	saveBar: {
		hienDanhSach: "Show the list",
		anDanhSach: "Hide the list",
		cuonThem: "Scroll the list to see the rest",
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
		boThayDoi: {
			tieuDe: "Bỏ những gì vừa nhập?",
			than: "Những gì bạn vừa nhập trong hộp này sẽ mất.",
			tiepTuc: "Tiếp tục sửa",
			bo: "Bỏ",
		},
	},
	carousel: {
		itemRole: "mục",
		previousSlide: "Mục trước",
		nextSlide: "Mục sau",
	},
	inlineCitation: {
		previousSource: "Nguồn trước",
		nextSource: "Nguồn sau",
		sources: "Nguồn",
	},
	proposedChange: {
		edit: "Sửa",
		undo: "Hoàn tác",
	},
	kara: {
		why: "Vì sao?",
		whyTitle: "Kara dựa trên gì",
		readAt: (t: string) => `Đọc lúc ${t}`,
		trace: "đổi theo Kara",
		traceDescription: "Giá trị này đổi theo đề xuất của Kara",
	},
	aiFeedback: {
		useful: "Hữu ích",
		notUseful: "Không hữu ích",
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
	promptInput: {
		submit: "Gửi",
		stop: "Dừng",
		placeholder: "Bạn muốn biết gì?",
		uploadFiles: "Tải tệp lên",
		addAttachments: "Thêm ảnh hoặc tệp",
		takeScreenshot: "Chụp màn hình",
		errorAccept: "Không tệp nào đúng loại được nhận.",
		errorFileSize: "Mọi tệp đều vượt cỡ tối đa.",
		errorMaxFiles: "Quá nhiều tệp. Một số tệp chưa được thêm.",
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
		drag: (title: string) => `Kéo ${title}`,
	},
	soTien: {
		docLa: "Đọc là",
		format: (example: string) =>
			`Chưa đọc được số này. Dấu chấm ngăn hàng nghìn, dấu phẩy đứng trước phần lẻ — ví dụ ${example}.`,
		otherLocale: (example: string) =>
			`Số này viết theo kiểu tiếng Anh. Ở đây dấu chấm ngăn hàng nghìn, dấu phẩy đứng trước phần lẻ — ví dụ ${example}.`,
		fractionNone: (currency: string, example: string) =>
			`${currency} không có phần lẻ — gõ số tròn, ví dụ ${example}.`,
		fractionMax: (currency: string, digits: string) =>
			`${currency} có tối đa ${digits} chữ số lẻ.`,
		negative: "Số tiền không được âm.",
		tooLarge: "Số này quá lớn để lưu.",
		canDongTien: "Chọn đồng tiền để đọc số này.",
	},
	tienDo: {
		nhan: "Tiến độ",
		coVach: (nhan: string, p: string, k: string) =>
			`${nhan}: ${p}%, lẽ ra đã tới ${k}%`,
		khongVach: (nhan: string, p: string) => `${nhan}: ${p}% tiến độ`,
		leRa: (k: string) => `Lẽ ra đã tới ${k}%`,
	},
	okr: {
		tuTinCao: "Tự tin cao",
		tuTinVua: "Tự tin vừa",
		tuTinThap: "Tự tin thấp",
		dungNhip: "Đúng nhịp",
		chamNhip: "Chậm nhịp",
		truot: "Trượt",
		chuaCoKyVong: "Chưa có kỳ vọng",
		mocXong: "Đã xong",
		mocChua: "Mốc, chưa xong",
	},
	heatmap: {
		donVi: "Đơn vị",
		chuaCo: "chưa có",
		chuGiai: "Ô càng nổi khỏi nền, càng nhiều KR tự tin cao.",
		oRong: "tuần chưa tới hoặc chưa ai cập nhật",
	},
	chuKy: {
		hienTai: "hiện tại",
		daDong: "đã đóng",
	},
	chep: {
		nhan: (ten: string) => `Chép ${ten}`,
		xong: (ten: string) => `Đã chép ${ten}.`,
		hong: (ten: string) => `Không chép được ${ten}. Bôi đen rồi chép tay.`,
	},
	bieuDo: {
		giaTri: "Giá trị",
		leRa: "Lẽ ra",
		tuan: "Tuần",
		chuGiai:
			"Đường liền: giá trị mỗi lần cập nhật tuần. Đường đứt: lẽ ra đã tới. Vạch ngang: đích.",
	},
	saveBar: {
		hienDanhSach: "Xem danh sách",
		anDanhSach: "Ẩn danh sách",
		cuonThem: "Cuộn danh sách để xem phần còn lại",
	},
} satisfies Messages;

const BANG = { en, vi } satisfies Record<Locale, Messages>;

export function messages(locale: Locale = DEFAULT_LOCALE): Messages {
	return BANG[locale] ?? BANG[DEFAULT_LOCALE];
}
