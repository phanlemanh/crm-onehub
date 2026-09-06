import type { Locale } from "@crm/ui/lib/locale";

const en = {
	luot: {
		locGiaLoc: "Filter run outcomes",
		moiKetCuc: "All outcomes",
		thanhCong: "Succeeded",
		hong: "Failed",
		dangChay: "Running",
		dangXep: "Queued",
		choDuyet: "Waiting for approval",
		daDung: "Cancelled",
		soHieu: (so: string) => `Run #${so}`,
		banSo: (so: string) => `· Version ${so}`,
		soViecNgoai: (so: string) =>
			so === "1" ? `${so} external action` : `${so} external actions`,
		chayLai: "Retry",
		dung: "Stop",
		dungHoi: "Stop this run?",
		dungMoTa:
			"The agent stops where it is and the run is recorded as cancelled. Anything it has already done — a note, a task, a Slack message — stays done.",
		chayTiep: "Keep running",
		dungLuot: "Stop run",
		trong: "No runs match this outcome.",
		buoc: "event",
		moc: "Trigger",
		nguoiMo: "Initiated by",
		model: "Model",
		ban: "Version",
		catBot: (hien: string, tong: string) =>
			`Showing the first ${hien} of ${tong} steps. This run is too long to display in full.`,
		dangChayDo: "In progress",
	},
	trangThai: {
		SUCCEEDED: "Succeeded",
		FAILED: "Failed",
		RUNNING: "Running",
		QUEUED: "Queued",
		WAITING_FOR_APPROVAL: "Waiting for approval",
		CANCELLED: "Cancelled",
		MANUAL: "Manual",
		SCHEDULE: "Schedule",
		EVENT: "Event",
		WEBHOOK: "Webhook",
	},
	hoatDong: {
		locThayDoi: "Filter activity",
		moiThayDoi: "All changes",
		tacNhanDoi: "Agent changes",
		yeuCauChay: "Run requests",
		xuatRa: "Export",
		gio: "Time",
		thayDoi: "Change",
		nguoiLam: "Actor",
		yeuCau: "Request",
		nguoiLamNgan: "Actor · ",
		yeuCauNgan: "Request · ",
		trong: "No changes match this filter.",
	},
};

export type TroChuyenMessages = typeof en;

const vi = {
	luot: {
		locGiaLoc: "Lọc kết cục lượt chạy",
		moiKetCuc: "Mọi kết cục",
		thanhCong: "Xong",
		hong: "Hỏng",
		dangChay: "Đang chạy",
		dangXep: "Đang xếp",
		choDuyet: "Chờ duyệt",
		daDung: "Đã dừng",
		soHieu: (so: string) => `Lượt #${so}`,
		banSo: (so: string) => `· Bản ${so}`,
		soViecNgoai: (so: string) => `${so} việc ra ngoài`,
		chayLai: "Chạy lại",
		dung: "Dừng",
		dungHoi: "Dừng lượt chạy này?",
		dungMoTa:
			"Tác nhân dừng ngay tại chỗ và lượt chạy được ghi là đã dừng. Những gì nó đã làm xong — một bản ghi chú, một việc, một tin Slack — vẫn còn đó.",
		chayTiep: "Cứ chạy tiếp",
		dungLuot: "Dừng lượt chạy",
		trong: "Không lượt chạy nào có kết cục này.",
		buoc: "bước",
		moc: "Mốc kích hoạt",
		nguoiMo: "Người mở",
		model: "Model",
		ban: "Bản",
		catBot: (hien: string, tong: string) =>
			`Đang hiện ${hien} bước đầu trong ${tong}. Lượt chạy này dài quá nên không hiện hết được.`,
		dangChayDo: "Đang chạy",
	},
	trangThai: {
		SUCCEEDED: "Xong",
		FAILED: "Hỏng",
		RUNNING: "Đang chạy",
		QUEUED: "Đang xếp",
		WAITING_FOR_APPROVAL: "Chờ duyệt",
		CANCELLED: "Đã dừng",
		MANUAL: "Chạy tay",
		SCHEDULE: "Theo lịch",
		EVENT: "Theo sự kiện",
		WEBHOOK: "Từ webhook",
	},
	hoatDong: {
		locThayDoi: "Lọc thay đổi",
		moiThayDoi: "Mọi thay đổi",
		tacNhanDoi: "Tác nhân đổi",
		yeuCauChay: "Yêu cầu chạy",
		xuatRa: "Xuất ra",
		gio: "Giờ",
		thayDoi: "Thay đổi",
		nguoiLam: "Người làm",
		yeuCau: "Yêu cầu",
		nguoiLamNgan: "Người làm · ",
		yeuCauNgan: "Yêu cầu · ",
		trong: "Không thay đổi nào khớp bộ lọc này.",
	},
} satisfies TroChuyenMessages;

const BANG = { en, vi } satisfies Record<Locale, TroChuyenMessages>;

export function troChuyenMessages(locale: Locale): TroChuyenMessages {
	return BANG[locale];
}
