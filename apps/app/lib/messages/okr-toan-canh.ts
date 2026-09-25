import type { Locale } from "@crm/ui/lib/locale";

const vi = {
	cay: {
		donVi: "Cây đơn vị",
		canChinh: "Cây căn chỉnh toàn công ty",
		chuaCanChinh: "Chưa căn chỉnh vào đâu",
		cungHien: "cũng hiện ở chỗ góp kia",
	},
	loc: {
		phuTrach: "Người phụ trách",
		loai: "Loại",
		trangThai: "Trạng thái",
		boLoc: "Bỏ lọc",
		khongKhop: "Không mục tiêu nào khớp bộ lọc",
		khongKhopMoTa:
			"Đổi hoặc bỏ bớt bộ lọc để thấy lại mục tiêu của đơn vị này.",
	},
	nguoi: {
		phongBanChinh: "Phòng ban chính",
		chuaCoPhongBan: "Chưa có phòng ban",
		quanLy: "Quản lý trực tiếp",
		khongQuanLy: "Chưa có quản lý",
	},
	toanCanh: {
		tienDoTB: "Tiến độ trung bình",
		leRa: (n: string) => `Lẽ ra đã tới ${n}%`,
		chuaCoVach: "Chưa có mục tiêu công bố để so",
		donViCongBo: "Đơn vị đã công bố OKR",
		chuaDat: (ten: string) => `${ten} chưa đặt`,
		tatCaDaDat: "Mọi đơn vị đã có mục tiêu công bố",
		theoDonVi: "Theo đơn vị",
		theoDonViMoTa:
			"Bộ phận in đậm và gộp số của các phòng ban thụt vào bên dưới.",
		cotDonVi: "Đơn vị",
		cotTienDo: "Tiến độ",
		cotMucTieu: "Mục tiêu",
		cotKr: "Số KR",
		suKhoe: "Sức khoẻ chương trình",
		tuanDau: "Chưa có số để so",
		tuanDauMoTa:
			"Tiến độ hiện ở đây khi các đơn vị công bố mục tiêu của kỳ này.",
		loi: "Không dựng được toàn cảnh. Số của từng đơn vị vẫn xem được ở Theo đơn vị.",
	},
	sucKhoe: {
		moTa: "Để biết nên kèm đơn vị nào — không để chấm điểm người. Bộ phận gộp số của các phòng ban thụt vào bên dưới.",
		krDangTinh: "KR đang tính",
		krDangTinhMoTa: "Thuộc mục tiêu đã công bố",
		chuaCongBo: "KR của mục tiêu chưa công bố",
		chuaCongBoMoTa: "Khởi điểm chưa khoá vì mục tiêu còn nháp",
		chuaNoiKenh: "Người chưa nối kênh nhắc",
		chuaNoiKenhMoTa: "Không nhận được tin nhắc buổi sáng qua Zalo hay Slack",
		chuaCoTruong: "Chưa có trưởng",
		khongQuyen: "Chỉ quản trị xem được sức khoẻ chương trình",
		khongQuyenMoTa: "Tiến độ của mọi đơn vị vẫn xem được ở Toàn cảnh.",
		loi: "Không tính được sức khoẻ chương trình. Toàn cảnh vẫn xem được.",
	},
	thuLai: "Thử lại",
	tienDoLeRa: (ten: string, p: string, k: string) =>
		`Tiến độ ${ten}: ${p}%, lẽ ra đã tới ${k}%`,
};

export type OkrToanCanhMessages = typeof vi;

const en: OkrToanCanhMessages = {
	cay: {
		donVi: "Unit tree",
		canChinh: "Company-wide alignment tree",
		chuaCanChinh: "Not aligned anywhere",
		cungHien: "also shown where it contributes",
	},
	loc: {
		phuTrach: "Owner",
		loai: "Type",
		trangThai: "Status",
		boLoc: "Clear filters",
		khongKhop: "No objectives match these filters",
		khongKhopMoTa:
			"Change or clear a filter to see this unit's objectives again.",
	},
	nguoi: {
		phongBanChinh: "Primary department",
		chuaCoPhongBan: "No department",
		quanLy: "Direct manager",
		khongQuanLy: "No manager",
	},
	toanCanh: {
		tienDoTB: "Average progress",
		leRa: (n: string) => `Expected ${n}% by now`,
		chuaCoVach: "No published objectives to compare yet",
		donViCongBo: "Units with published OKRs",
		chuaDat: (ten: string) => `${ten} not set yet`,
		tatCaDaDat: "Every unit has published objectives",
		theoDonVi: "By unit",
		theoDonViMoTa:
			"Divisions are bold and roll up the departments indented below them.",
		cotDonVi: "Unit",
		cotTienDo: "Progress",
		cotMucTieu: "Objectives",
		cotKr: "KRs",
		suKhoe: "Program health",
		tuanDau: "Nothing to compare yet",
		tuanDauMoTa:
			"Progress shows here once units publish their objectives for this cycle.",
		loi: "Couldn't build the overview. Each unit's numbers are still in By unit.",
	},
	sucKhoe: {
		moTa: "To see which units need support — not to grade people. Divisions roll up the departments indented below them.",
		krDangTinh: "KRs counted",
		krDangTinhMoTa: "On published objectives",
		chuaCongBo: "KRs on unpublished objectives",
		chuaCongBoMoTa:
			"Baseline not locked because the objective is still a draft",
		chuaNoiKenh: "People without a reminder channel",
		chuaNoiKenhMoTa: "Don't get the morning reminder on Zalo or Slack",
		chuaCoTruong: "No head",
		khongQuyen: "Only admins can see program health",
		khongQuyenMoTa: "Every unit's progress is still in Overview.",
		loi: "Couldn't compute program health. The overview still works.",
	},
	thuLai: "Try again",
	tienDoLeRa: (ten: string, p: string, k: string) =>
		`Progress of ${ten}: ${p}%, expected ${k}% by now`,
};

const BANG = { en, vi } satisfies Record<Locale, OkrToanCanhMessages>;

export function okrToanCanhMessages(locale: Locale): OkrToanCanhMessages {
	return BANG[locale];
}
