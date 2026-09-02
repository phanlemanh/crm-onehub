import type { Locale } from "@crm/ui/lib/locale";

const en = {
	title: "Deals",
	description: "Every partnership in the network.",
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
	empty: "No deals match this view.",
	emptyArchived: "No archived deals.",
	search: "Search deals by name or company…",
	created: (name: string) => `${name} added.`,
	create: {
		currency: "Currency",
		noDate: "No date yet",
		namePlaceholder: "Stripe — Comp AI",
		chooseOwner: "Choose an owner",
	},
	bulk: {
		reassigned: (n: string) => `${n} reassigned.`,
		moved: (n: string) => `${n} moved.`,
		archived: (n: string) => `${n} archived.`,
		restored: (n: string) => `${n} restored.`,
		deleted: (n: string) => `${n} deleted forever.`,
		confirmDelete: (n: string) => `Delete ${n} forever?`,
		deleteWarning:
			"Everything filed against them — activity, notes, the amounts in your pipeline — goes too. This cannot be undone.",
		closeLost: (n: string) => `Close ${n} as lost`,
		markUnqualified: (n: string) => `Mark ${n} as unqualified`,
		reasonPlaceholder: "Budget pulled for the quarter",
		nobody: "Nobody",
	},
};

export type DealMessages = typeof en;

const vi = {
	title: "Thoả thuận",
	description: "Mọi thoả thuận hợp tác trong mạng lưới.",
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
	empty: "Chưa có thoả thuận nào khớp bộ lọc này.",
	emptyArchived: "Chưa có thoả thuận nào đã lưu trữ.",
	search: "Tìm thoả thuận theo tên hoặc công ty…",
	created: (name: string) => `Đã thêm ${name}.`,
	create: {
		currency: "Tiền tệ",
		noDate: "Chưa có ngày",
		namePlaceholder: "Đất Xanh — OneHub",
		chooseOwner: "Chọn người phụ trách",
	},
	bulk: {
		reassigned: (n: string) => `Đã đổi người phụ trách cho ${n}.`,
		moved: (n: string) => `Đã chuyển ${n} sang công ty khác.`,
		archived: (n: string) => `Đã lưu trữ ${n}.`,
		restored: (n: string) => `Đã khôi phục ${n}.`,
		deleted: (n: string) => `Đã xoá vĩnh viễn ${n}.`,
		confirmDelete: (n: string) => `Xoá vĩnh viễn ${n}?`,
		deleteWarning:
			"Mọi thứ gắn với chúng — hoạt động, ghi chú, giá trị đang tính — mất theo. Việc này không hoàn tác được.",
		closeLost: (n: string) => `Chốt ${n} là không thành`,
		markUnqualified: (n: string) => `Đánh dấu ${n} là chưa phù hợp`,
		reasonPlaceholder: "Đối tác hoãn sang quý sau",
		nobody: "Không ai",
	},
} satisfies DealMessages;

const BANG = { en, vi } satisfies Record<Locale, DealMessages>;

export function dealMessages(locale: Locale): DealMessages {
	return BANG[locale] ?? BANG.en;
}
