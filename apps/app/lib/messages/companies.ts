import type { Locale } from "@crm/ui/lib/locale";

const en = {
	headers: {
		name: "Company",
		domain: "Domain",
		industry: "Industry",
		owner: "Owner",
		contacts: "Contacts",
		openDeals: "Open deals",
		created: "Created",
		lastActivity: "Last activity",
		enrichment: "Enrichment",
		archived: "Archived",
	},
	labels: {
		createdDate: "Created date",
		archivedDate: "Archived date",
		enrichmentStatus: "Enrichment status",
	},
	facets: {
		owner: "Owner",
		unassigned: "Unassigned",
		industry: "Industry",
		enrichment: "Enrichment",
		activity: "Activity",
	},
	noun: "company",
	created: (name: string) => `${name} added.`,
	nounPlural: "companies",
	title: "Companies",
	description: "Every company in the network.",
	empty: "No companies yet.",
	emptyArchived: "No archived companies.",
	search: "Search companies by name or domain…",
	archivedToggle: "Archived",
	nenTang: (ten: string) =>
		`This is a ${ten} page, not the company's own website. Leave it empty if the company has no site of its own.`,
	create: {
		title: "New company",
		newButton: "New company",
		description:
			"Give it a name and a domain. Kara fills in the logo, description, industry, address and socials.",
		name: "Name",
		namePlaceholder: "Stripe",
		domain: "Domain",
		domainPlaceholder: "stripe.com",
		domainHint:
			"A full URL is fine — it is reduced to the bare host, which has to be unique. Facebook, Zalo or LinkedIn pages are not accepted here.",
		owner: "Owner",
		unassigned: "Unassigned",
		submit: "Add company",
		cancel: "Cancel",
	},
	bulk: {
		reassigned: (n: string) => `${n} reassigned.`,
		enriching: (n: string) => `Looking up ${n} — the table will update.`,
		archived: (n: string) => `${n} archived.`,
		restored: (n: string) => `${n} restored.`,
		deleted: (n: string) => `${n} deleted forever.`,
		confirmDelete: (n: string) => `Delete ${n} forever?`,
	},
};

export type CompanyMessages = typeof en;

const vi = {
	headers: {
		name: "Tên",
		domain: "Tên miền",
		industry: "Ngành",
		owner: "Phụ trách",
		contacts: "Số lượng cá nhân",
		openDeals: "Số thoả thuận đang mở",
		created: "Ngày tạo",
		lastActivity: "Hoạt động gần nhất",
		enrichment: "Bổ sung dữ liệu",
		archived: "Ngày lưu trữ",
	},
	labels: {
		createdDate: "Ngày tạo",
		archivedDate: "Ngày lưu trữ",
		enrichmentStatus: "Trạng thái bổ sung dữ liệu",
	},
	facets: {
		owner: "Phụ trách",
		unassigned: "Chưa giao",
		industry: "Ngành",
		enrichment: "Bổ sung dữ liệu",
		activity: "Hoạt động",
	},
	noun: "công ty",
	created: (name: string) => `Đã thêm ${name}.`,
	nounPlural: "công ty",
	title: "Công ty",
	description: "Mọi công ty trong mạng lưới.",
	empty: "Chưa có công ty nào.",
	emptyArchived: "Chưa có công ty nào đã lưu trữ.",
	search: "Tìm công ty theo tên hoặc tên miền…",
	archivedToggle: "Đã lưu trữ",
	nenTang: (ten: string) =>
		`Đây là trang ${ten}, không phải trang web của công ty. Để trống nếu công ty chưa có trang web riêng.`,
	create: {
		title: "Công ty mới",
		newButton: "Công ty mới",
		description:
			"Chỉ cần tên và tên miền. Kara sẽ tự điền logo, mô tả, ngành, địa chỉ và mạng xã hội.",
		name: "Tên",
		namePlaceholder: "Đất Xanh",
		domain: "Tên miền",
		domainPlaceholder: "datxanh.vn",
		domainHint:
			"Dán cả đường dẫn cũng được — hệ thống rút về tên miền gốc, và tên miền đó phải là duy nhất. Trang Facebook, Zalo hay LinkedIn không dùng được ở đây.",
		owner: "Phụ trách",
		unassigned: "Chưa giao",
		submit: "Thêm công ty",
		cancel: "Huỷ",
	},
	bulk: {
		reassigned: (n: string) => `Đã đổi người phụ trách cho ${n}.`,
		enriching: (n: string) => `Đang tra cứu ${n} — bảng sẽ tự cập nhật.`,
		archived: (n: string) => `Đã lưu trữ ${n}.`,
		restored: (n: string) => `Đã khôi phục ${n}.`,
		deleted: (n: string) => `Đã xoá vĩnh viễn ${n}.`,
		confirmDelete: (n: string) => `Xoá vĩnh viễn ${n}?`,
	},
} satisfies CompanyMessages;

const BANG = { en, vi } satisfies Record<Locale, CompanyMessages>;

export function companyMessages(locale: Locale): CompanyMessages {
	return BANG[locale];
}
