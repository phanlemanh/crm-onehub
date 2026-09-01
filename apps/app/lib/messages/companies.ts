import type { Locale } from "@/lib/locale/locale";

const MESSAGES = {
	en: {
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
		title: "Companies",
		description: "Every company in the network.",
		showing: (from: number, to: number, total: number) =>
			`Showing ${from}–${to} of ${total}`,
		noResults: "No results",
		empty: "No companies match this view.",
		emptyArchived: "No archived companies.",
	},
	vi: {
		headers: {
			name: "Tên",
			domain: "Tên miền",
			industry: "Ngành",
			owner: "Phụ trách",
			contacts: "Cá nhân",
			openDeals: "Thoả thuận mở",
			created: "Ngày tạo",
			lastActivity: "Hoạt động cuối",
			enrichment: "Bổ sung",
			archived: "Lưu trữ",
		},
		labels: {
			createdDate: "Ngày tạo",
			archivedDate: "Ngày lưu trữ",
			enrichmentStatus: "Trạng thái bổ sung",
		},
		facets: {
			owner: "Phụ trách",
			unassigned: "Chưa giao",
			industry: "Ngành",
			enrichment: "Bổ sung",
			activity: "Hoạt động",
		},
		title: "Công ty",
		description: "Mọi công ty trong mạng lưới.",
		showing: (from: number, to: number, total: number) =>
			`Đang xem ${from}–${to} trong ${total}`,
		noResults: "Không có kết quả",
		empty: "Chưa có công ty nào khớp bộ lọc này.",
		emptyArchived: "Chưa có công ty nào đã lưu trữ.",
	},
} as const;

export type CompanyMessages = (typeof MESSAGES)[Locale];

export function companyMessages(locale: Locale): CompanyMessages {
	return MESSAGES[locale];
}
