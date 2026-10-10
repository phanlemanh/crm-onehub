import type { Locale } from "@crm/ui/lib/locale";

const en = {
	noun: "deal",
	title: "Deals",
	description: "The pipeline, and everything that has already closed.",
	headers: {
		name: "Deal",
		company: "Company",
		stage: "Stage",
		amount: "Amount",
		owner: "Owner",
		closeDate: "Close date",
		created: "Created",
		lastActivity: "Last activity",
		archived: "Archived",
	},
	labels: {
		createdDate: "Created date",
		archivedDate: "Archived date",
	},
	facets: {
		owner: "Owner",
		unassigned: "Unassigned",
		stage: "Stage",
		closing: "Closing",
	},
	tabs: {
		all: "All deals",
		open: "Open",
		closed: "Closed",
	},
	closing: "Closing",
	empty: "No deals yet.",
	emptyArchived: "No archived deals.",
	search: "Search deals by name or company…",
	created: (name: string) => `${name} added.`,
	archivedToggle: "Archived",
	meta: {
		count: (n: string) => `${n} deals`,
		openPipeline: "open pipeline",
		notCounted: (n: string, cur: string) => `${n} not counted (no ${cur} rate)`,
	},
	create: {
		title: "New deal",
		newButton: "New deal",
		description:
			"Every deal belongs to a company and has someone's name against it.",
		name: "Name",
		company: "Company",
		owner: "Owner",
		stage: "Stage",
		amount: "Amount",
		closeDate: "Expected close date",
		currency: "Currency",
		noDate: "No date yet",
		namePlaceholder: "Stripe — OneHub",
		chooseOwner: "Choose an owner",
		stageHint:
			"A new deal is an open deal — close it from the pipeline once there is an outcome to record.",
		submit: "Add deal",
		cancel: "Cancel",
		currencyLoading: "Loading the reporting currency…",
		currencyLoadFailed:
			"Couldn't load the reporting currency — pick a currency next to the amount to enter it.",
	},
	bulk: {
		reassigned: (n: string) => `${n} reassigned.`,
		moved: (n: string) => `${n} moved.`,
		archived: (n: string) => `${n} archived.`,
		restored: (n: string) => `${n} restored.`,
		deleted: (n: string) => `${n} deleted forever.`,
		confirmDelete: (n: string) => `Delete ${n} forever?`,
		changeStage: "Change stage",
		save: "Save",
		cancel: "Cancel",
		deleteWarning:
			"Everything filed against them — activity, notes, the amounts in your pipeline — goes too. This cannot be undone.",
		sameReason:
			"The same reason goes on every one of them, so keep it to what they have in common.",
		closeLost: (n: string) => `Close ${n} as lost`,
		reasonPlaceholder: "Budget pulled for the quarter",
		nobody: "Nobody",
	},
	view: {
		label: "View",
		table: "Table",
		board: "Board",
	},
	board: {
		label: "Deals by stage",
		errorTitle: "The board did not load",
		errorBody: "Nothing changed. Try again in a moment.",
		retry: "Try again",
		loading: "Loading…",
		pickedUp: (name: string) => `Picked up ${name}.`,
		over: (stage: string) => `Over ${stage}.`,
		dropped: (stage: string) => `Dropped on ${stage}.`,
		droppedOutside: "Dropped outside the board. Nothing changed.",
		cancelled: "Move cancelled. Nothing changed.",
	},
};

export type DealMessages = typeof en;

const vi = {
	noun: "thoả thuận",
	title: "Thoả thuận",
	description: "Những thoả thuận đang theo, và những gì đã chốt xong.",
	headers: {
		name: "Tên",
		company: "Công ty",
		stage: "Giai đoạn",
		amount: "Giá trị",
		owner: "Phụ trách",
		closeDate: "Ngày chốt",
		created: "Ngày tạo",
		lastActivity: "Hoạt động gần nhất",
		archived: "Ngày lưu trữ",
	},
	labels: {
		createdDate: "Ngày tạo",
		archivedDate: "Ngày lưu trữ",
	},
	facets: {
		owner: "Phụ trách",
		unassigned: "Chưa giao",
		stage: "Giai đoạn",
		closing: "Hạn chốt",
	},
	tabs: {
		all: "Tất cả",
		open: "Đang mở",
		closed: "Đã chốt",
	},
	closing: "Sắp chốt",
	empty: "Chưa có thoả thuận nào.",
	emptyArchived: "Chưa có thoả thuận nào đã lưu trữ.",
	search: "Tìm thoả thuận theo tên hoặc công ty…",
	created: (name: string) => `Đã thêm ${name}.`,
	archivedToggle: "Đã lưu trữ",
	meta: {
		count: (n: string) => `${n} thoả thuận`,
		openPipeline: "đang mở",
		notCounted: (n: string, cur: string) =>
			`${n} chưa tính (thiếu tỉ giá ${cur})`,
	},
	create: {
		title: "Thoả thuận mới",
		newButton: "Thoả thuận mới",
		description:
			"Mỗi thoả thuận thuộc về một công ty và có một người đứng tên phụ trách.",
		name: "Tên",
		company: "Công ty",
		owner: "Phụ trách",
		stage: "Giai đoạn",
		amount: "Giá trị",
		closeDate: "Ngày dự kiến chốt",
		currency: "Tiền tệ",
		noDate: "Chưa có ngày",
		namePlaceholder: "Đất Xanh — OneHub",
		chooseOwner: "Chọn người phụ trách",
		stageHint:
			"Thoả thuận mới là thoả thuận đang mở — chốt nó khi đã có kết quả để ghi lại.",
		submit: "Thêm thoả thuận",
		cancel: "Huỷ",
		currencyLoading: "Đang tải đồng tiền báo cáo…",
		currencyLoadFailed:
			"Không tải được đồng tiền báo cáo — chọn đồng tiền bên cạnh để nhập số tiền.",
	},
	bulk: {
		reassigned: (n: string) => `Đã đổi người phụ trách cho ${n}.`,
		moved: (n: string) => `Đã chuyển ${n} sang công ty khác.`,
		archived: (n: string) => `Đã lưu trữ ${n}.`,
		restored: (n: string) => `Đã khôi phục ${n}.`,
		deleted: (n: string) => `Đã xoá vĩnh viễn ${n}.`,
		confirmDelete: (n: string) => `Xoá vĩnh viễn ${n}?`,
		changeStage: "Đổi giai đoạn",
		save: "Lưu",
		cancel: "Huỷ",
		deleteWarning:
			"Mọi thứ gắn với chúng — hoạt động, ghi chú, giá trị đang tính — mất theo. Việc này không hoàn tác được.",
		sameReason:
			"Cùng một lý do ghi cho tất cả, nên chỉ nêu phần chung của chúng.",
		closeLost: (n: string) => `Chốt ${n} là không thành`,
		reasonPlaceholder: "Đối tác hoãn sang quý sau",
		nobody: "Không ai",
	},
	view: {
		label: "Cách xem",
		table: "Bảng",
		board: "Bảng cột",
	},
	board: {
		label: "Thoả thuận theo giai đoạn",
		errorTitle: "Không tải được bảng cột",
		errorBody: "Chưa có gì thay đổi. Thử lại sau giây lát.",
		retry: "Thử lại",
		loading: "Đang tải…",
		pickedUp: (name: string) => `Đã nhấc ${name}.`,
		over: (stage: string) => `Đang ở trên ${stage}.`,
		dropped: (stage: string) => `Đã thả vào ${stage}.`,
		droppedOutside: "Đã thả ra ngoài bảng. Không đổi gì.",
		cancelled: "Đã huỷ kéo. Không đổi gì.",
	},
} satisfies DealMessages;

const BANG = { en, vi } satisfies Record<Locale, DealMessages>;

export function dealMessages(locale: Locale): DealMessages {
	return BANG[locale] ?? BANG.en;
}
