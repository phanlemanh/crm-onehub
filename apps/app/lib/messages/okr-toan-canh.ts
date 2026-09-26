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
		tuTin: "Mức tự tin",
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
	hopTuan: {
		cachXem: "Họp tuần",
		tuan: (ngay: string) => `Tuần ${ngay}`,
		daCapNhat: (a: string, b: string) => `đã cập nhật ${a}/${b} KR`,
		dangBan: "Đáng bàn tuần này",
		xepTheo:
			"Xếp theo: tự tin tụt, rồi KR im lâu nhất, rồi ghi chú mới. Mỗi dòng là một KR — bảng không liệt kê người chưa cập nhật.",
		cotKr: "KR và vì sao đáng bàn",
		cotTienDo: "Tiến độ",
		cotGhiChu: "Ghi chú mới nhất",
		phuTrach: (ten: string) => `Phụ trách ${ten}`,
		tut: (tu: string, den: string) => `Tụt từ ${tu} xuống ${den}`,
		im: (n: string) => `Im ${n} ngày`,
		ghiChuMoi: "Ghi chú mới",
		conLai: (n: string) => `Còn lại ${n} KR — không có gì mới`,
		yenAng: "Tuần này không KR nào đáng bàn",
		yenAngMoTa:
			"Không KR nào tụt mức tự tin, không KR nào im lâu, không có ghi chú mới từ đầu tuần trước.",
		tuanDau: "Chưa có lần cập nhật nào để bàn",
		tuanDauMoTa:
			"Bảng họp tuần xếp KR theo mức tự tin tụt, KR im và ghi chú mới — từ sau lần cập nhật tuần đầu tiên.",
		loi: "Không dựng được bảng họp tuần. OKR của đơn vị vẫn xem được ở cách xem Danh sách.",
	},
	toanCanh: {
		tienDoTB: "Tiến độ trung bình",
		leRa: (n: string) => `Lẽ ra đã tới ${n}%`,
		chuaCoVach: "Chưa có mục tiêu công bố để so",
		vuaCongBo: "Mục tiêu vừa công bố, chưa có kỳ vọng để so",
		donViCongBo: "Đơn vị đã công bố OKR",
		chuaDat: (ten: string) => `${ten} chưa đặt`,
		tatCaDaDat: "Mọi đơn vị đã có mục tiêu công bố",
		daCapNhat: "KR đã cập nhật tuần này",
		tuTinThap: "KR tự tin thấp",
		soTuanTruoc: (n: string) => `Tuần trước ${n}`,
		theoDonVi: "Theo đơn vị",
		theoDonViMoTa:
			"Bộ phận in đậm và gộp số của các phòng ban thụt vào bên dưới.",
		cotDonVi: "Đơn vị",
		cotTienDo: "Tiến độ",
		cotTuTin: "Tự tin cao · vừa · thấp",
		cotDangBan: "Đáng bàn",
		cotMucTieu: "Mục tiêu",
		cotKr: "Số KR",
		banTut: (n: string) => `${n} KR tụt mức tự tin`,
		banIm: (n: string) => `${n} KR im lâu`,
		banGhiChu: (n: string) => `${n} KR có ghi chú mới`,
		heatmap: "Mức tự tin theo tuần",
		heatmapMoTa:
			"Mỗi ô là phần trăm KR báo tự tin cao trong số KR có cập nhật tuần đó.",
		suKhoe: "Sức khoẻ chương trình",
		tuanDau: "Chưa có số để so",
		tuanDauMoTa:
			"Tiến độ hiện ở đây khi các đơn vị công bố mục tiêu của kỳ này.",
		loi: "Không dựng được toàn cảnh. Số của từng đơn vị vẫn xem được ở Theo đơn vị.",
	},
	sucKhoe: {
		moTa: "Để biết nên kèm đơn vị nào — không để chấm điểm người. Bộ phận gộp số của các phòng ban thụt vào bên dưới.",
		krDangTinh: "KR đang tính",
		chuaCongBo: "KR của mục tiêu chưa công bố",
		chuaCongBoMoTa: "Khởi điểm chưa khoá vì mục tiêu còn nháp",
		chuaNoiKenh: "Người chưa nối kênh nhắc",
		chuaNoiKenhMoTa: "Không nhận được tin nhắc buổi sáng qua Zalo hay Slack",
		dungTuan: "KR cập nhật đúng tuần vừa qua",
		dungTuanMoTa:
			"Có lần cập nhật cho tuần vừa qua, trên số KR thuộc mục tiêu đã công bố",
		krIm: "KR im lâu",
		krImMoTa: "Không có lần cập nhật nào từ hai tuần trở lên",
		chuaCoTruong: "Chưa có trưởng",
		khongQuyen: "Chỉ quản trị xem được sức khoẻ chương trình",
		khongQuyenMoTa: "Tiến độ của mọi đơn vị vẫn xem được ở Toàn cảnh.",
		loi: "Không tính được sức khoẻ chương trình. Toàn cảnh vẫn xem được.",
	},
	dienBien: {
		tab: "Diễn biến",
		chonKr: "Chọn KR",
		bieuDo: (ten: string) => `Diễn biến của ${ten} theo tuần`,
		dich: (so: string) => `Đích ${so}`,
		tuTinTheoTuan: "Mức tự tin theo tuần",
		chuaCo: "Chưa có lần cập nhật nào",
		chuaCoMoTa: (ngay: string) =>
			`Đường giá trị và mức tự tin hiện ở đây từ lần cập nhật đầu tiên, tuần bắt đầu Thứ Hai ${ngay}.`,
		chuaCongBoMoTa:
			"Mục tiêu còn nháp. Lần cập nhật đầu tiên mở ra trong tuần mục tiêu được công bố.",
		loi: "Không tải được diễn biến của KR này.",
		khongKr: "Mục tiêu này chưa có KR nào.",
	},
	khoiCuaToi: {
		tieuDe: "OKR của bạn",
		moTa: "KR bạn phụ trách trong kỳ, đáng lo nhất lên đầu.",
		tieuDeNguoi: "KR người này phụ trách",
		cotKr: "KR và mục tiêu",
		moOkr: "Mở OKR",
		rong: "Bạn chưa phụ trách KR nào trong kỳ này.",
		rongNguoi: "Người này chưa phụ trách KR nào trong kỳ này.",
		conNua: (n: string) => `và ${n} KR khác`,
		loi: "Không tải được KR của bạn.",
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
		tuTin: "Confidence",
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
	hopTuan: {
		cachXem: "Weekly meeting",
		tuan: (ngay: string) => `Week of ${ngay}`,
		daCapNhat: (a: string, b: string) => `${a} of ${b} KRs updated`,
		dangBan: "Worth discussing this week",
		xepTheo:
			"Sorted by: confidence dropped, then the longest-silent KR, then new notes. Each row is a KR — the board never lists who hasn't updated.",
		cotKr: "KR and why it's worth discussing",
		cotTienDo: "Progress",
		cotGhiChu: "Latest note",
		phuTrach: (ten: string) => `Owned by ${ten}`,
		tut: (tu: string, den: string) => `Dropped from ${tu} to ${den}`,
		im: (n: string) => `Silent for ${n} days`,
		ghiChuMoi: "New note",
		conLai: (n: string) => `${n} other KRs — nothing new`,
		yenAng: "Nothing worth discussing this week",
		yenAngMoTa:
			"No KR dropped in confidence, none has gone silent, and there are no new notes since the start of last week.",
		tuanDau: "No updates to discuss yet",
		tuanDauMoTa:
			"The meeting board sorts KRs by dropped confidence, silence and new notes — starting after the first weekly update.",
		loi: "Couldn't build the meeting board. The unit's OKRs are still in the List view.",
	},
	toanCanh: {
		tienDoTB: "Average progress",
		leRa: (n: string) => `Expected ${n}% by now`,
		chuaCoVach: "No published objectives to compare yet",
		vuaCongBo: "Objectives just published, no expected pace yet",
		donViCongBo: "Units with published OKRs",
		chuaDat: (ten: string) => `${ten} not set yet`,
		tatCaDaDat: "Every unit has published objectives",
		daCapNhat: "KRs updated this week",
		tuTinThap: "Low-confidence KRs",
		soTuanTruoc: (n: string) => `Last week ${n}`,
		theoDonVi: "By unit",
		theoDonViMoTa:
			"Divisions are bold and roll up the departments indented below them.",
		cotDonVi: "Unit",
		cotTienDo: "Progress",
		cotTuTin: "Confidence high · medium · low",
		cotDangBan: "Worth discussing",
		cotMucTieu: "Objectives",
		cotKr: "KRs",
		banTut: (n: string) => `${n} KRs dropped in confidence`,
		banIm: (n: string) => `${n} KRs silent for long`,
		banGhiChu: (n: string) => `${n} KRs with new notes`,
		heatmap: "Confidence by week",
		heatmapMoTa:
			"Each cell is the share of KRs reporting high confidence among the KRs updated that week.",
		suKhoe: "Program health",
		tuanDau: "Nothing to compare yet",
		tuanDauMoTa:
			"Progress shows here once units publish their objectives for this cycle.",
		loi: "Couldn't build the overview. Each unit's numbers are still in By unit.",
	},
	sucKhoe: {
		moTa: "To see which units need support — not to grade people. Divisions roll up the departments indented below them.",
		krDangTinh: "KRs counted",
		chuaCongBo: "KRs on unpublished objectives",
		chuaCongBoMoTa:
			"Baseline not locked because the objective is still a draft",
		chuaNoiKenh: "People without a reminder channel",
		chuaNoiKenhMoTa: "Don't get the morning reminder on Zalo or Slack",
		dungTuan: "KRs updated for last week",
		dungTuanMoTa:
			"Have an update for the week just gone, out of the KRs on published objectives",
		krIm: "Silent KRs",
		krImMoTa: "No update for two weeks or more",
		chuaCoTruong: "No head",
		khongQuyen: "Only admins can see program health",
		khongQuyenMoTa: "Every unit's progress is still in Overview.",
		loi: "Couldn't compute program health. The overview still works.",
	},
	dienBien: {
		tab: "History",
		chonKr: "Choose a KR",
		bieuDo: (ten: string) => `Weekly history of ${ten}`,
		dich: (so: string) => `Target ${so}`,
		tuTinTheoTuan: "Confidence by week",
		chuaCo: "No updates yet",
		chuaCoMoTa: (ngay: string) =>
			`The value line and confidence show here from the first update, in the week starting Monday ${ngay}.`,
		chuaCongBoMoTa:
			"The objective is still a draft. The first update opens in the week it is published.",
		loi: "Couldn't load this KR's history.",
		khongKr: "This objective has no KRs yet.",
	},
	khoiCuaToi: {
		tieuDe: "Your OKRs",
		moTa: "KRs you own this cycle, the most worrying first.",
		tieuDeNguoi: "KRs this person owns",
		cotKr: "KR and objective",
		moOkr: "Open OKRs",
		rong: "You don't own any KRs this cycle.",
		rongNguoi: "This person doesn't own any KRs this cycle.",
		conNua: (n: string) => `and ${n} more KRs`,
		loi: "Couldn't load your KRs.",
	},
	thuLai: "Try again",
	tienDoLeRa: (ten: string, p: string, k: string) =>
		`Progress of ${ten}: ${p}%, expected ${k}% by now`,
};

const BANG = { en, vi } satisfies Record<Locale, OkrToanCanhMessages>;

export function okrToanCanhMessages(locale: Locale): OkrToanCanhMessages {
	return BANG[locale];
}
