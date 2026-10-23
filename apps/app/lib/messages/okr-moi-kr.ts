import type { Locale } from "@crm/ui/lib/locale";

const vi = {
	muc: "Mọi KR",
	tieuDe: "Mọi KR",
	moTa: "Mọi KR của cả công ty trong chu kỳ, lọc theo tình trạng, đơn vị và người phụ trách.",
	locTinhTrang: "Lọc theo tình trạng",
	cot: {
		kr: "KR",
		donVi: "Đơn vị",
		phuTrach: "Phụ trách",
		tienDo: "Tiến độ",
		tinhTrang: "Tình trạng",
	},
	mat: {
		donVi: "Đơn vị",
		nguoi: "Người phụ trách",
	},
	tong: "Tổng số KR",
	loi: "Không tải được danh sách KR.",
	rong: "Chu kỳ này chưa có KR nào đã công bố.",
	rongMoTa: "KR hiện ở đây khi một bộ OKR của đơn vị được công bố.",
	veBoOkr: "Về Bộ OKR",
	khongKhop: "Không KR nào khớp bộ lọc.",
	khongKhopMoTa: "Bỏ bớt một bộ lọc để thấy thêm KR.",
	boLoc: "Bỏ lọc",
	oTruot: "KR trượt",
	oTruotMoTa: "Bấm để xem danh sách",
};

type OkrMoiKrMessages = typeof vi;

const en: OkrMoiKrMessages = {
	muc: "All KRs",
	tieuDe: "All KRs",
	moTa: "Every company KR in the cycle, filtered by status, unit and owner.",
	locTinhTrang: "Filter by status",
	cot: {
		kr: "KR",
		donVi: "Unit",
		phuTrach: "Owner",
		tienDo: "Progress",
		tinhTrang: "Status",
	},
	mat: {
		donVi: "Unit",
		nguoi: "Owner",
	},
	tong: "Total KRs",
	loi: "Couldn't load the KR list.",
	rong: "No KR has been published in this cycle yet.",
	rongMoTa: "KRs show up here once a unit publishes its OKR set.",
	veBoOkr: "Back to OKR sets",
	khongKhop: "No KR matches these filters.",
	khongKhopMoTa: "Remove a filter to see more KRs.",
	boLoc: "Clear filters",
	oTruot: "Off-track KRs",
	oTruotMoTa: "Open the list",
};

export function okrMoiKrMessages(locale: Locale): OkrMoiKrMessages {
	return locale === "en" ? en : vi;
}
