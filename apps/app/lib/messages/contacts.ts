import type { Locale } from "@crm/ui/lib/locale";

const en = {
	title: "Contacts",
	description: "Every person in the network.",
	headers: {
		name: "Name",
		title: "Title",
		email: "Email",
		company: "Company",
		owner: "Owner",
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
		company: "Company",
		activity: "Activity",
	},
	empty: "No contacts match this view.",
	emptyArchived: "No archived contacts.",
	search: "Search contacts by name or email…",
	noCompany: "No company",
	namePlaceholder: "Jane Cooper",
	created: (name: string) => `${name} added.`,
	bulk: {
		reassigned: (n: string) => `${n} reassigned.`,
		moved: (n: string) => `${n} moved.`,
		enriching: (n: string) => `Looking up ${n} — the table will update.`,
		archived: (n: string) => `${n} archived.`,
		restored: (n: string) => `${n} restored.`,
		deleted: (n: string) => `${n} deleted forever.`,
		confirmDelete: (n: string) => `Delete ${n} forever?`,
		deleteWarning:
			"Their email addresses are suppressed, so the inbox sync will not file them again. This cannot be undone.",
		nobody: "Nobody",
		chooseCompany: "Choose a company",
	},
};

export type ContactMessages = typeof en;

const vi = {
	title: "Cá nhân",
	description: "Mọi cá nhân trong mạng lưới.",
	headers: {
		name: "Tên",
		title: "Chức danh",
		email: "Email",
		company: "Công ty",
		owner: "Phụ trách",
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
		company: "Công ty",
		activity: "Hoạt động",
	},
	empty: "Chưa có cá nhân nào khớp bộ lọc này.",
	emptyArchived: "Chưa có cá nhân nào đã lưu trữ.",
	search: "Tìm cá nhân theo tên hoặc email…",
	noCompany: "Chưa thuộc công ty nào",
	namePlaceholder: "Nguyễn Thị Lan",
	created: (name: string) => `Đã thêm ${name}.`,
	bulk: {
		reassigned: (n: string) => `Đã đổi người phụ trách cho ${n}.`,
		moved: (n: string) => `Đã chuyển ${n} sang công ty khác.`,
		enriching: (n: string) => `Đang tra cứu ${n} — bảng sẽ tự cập nhật.`,
		archived: (n: string) => `Đã lưu trữ ${n}.`,
		restored: (n: string) => `Đã khôi phục ${n}.`,
		deleted: (n: string) => `Đã xoá vĩnh viễn ${n}.`,
		confirmDelete: (n: string) => `Xoá vĩnh viễn ${n}?`,
		deleteWarning:
			"Địa chỉ email của họ bị chặn, nên hộp thư sẽ không tự thêm lại. Việc này không hoàn tác được.",
		nobody: "Không ai",
		chooseCompany: "Chọn công ty",
	},
} satisfies ContactMessages;

const BANG = { en, vi } satisfies Record<Locale, ContactMessages>;

export function contactMessages(locale: Locale): ContactMessages {
	return BANG[locale] ?? BANG.en;
}
