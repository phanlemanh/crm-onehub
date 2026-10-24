import type { Locale } from "@crm/ui/lib/locale";

const vi = {
	nhom: {
		okr: "OKR",
		baoCao: "Báo cáo",
	},
	muc: {
		cuaToi: "Của tôi",
		boOkr: "Bộ OKR",
		layYKien: "Lấy ý kiến",
		sucKhoe: "Sức khoẻ",
		soDo: "Sơ đồ",
	},
	chuongTrinh: "Chương trình OKR",
	soDo: {
		tieuDe: "Sơ đồ",
		moTa: "Bộ OKR của từng đơn vị góp vào mục tiêu công ty ra sao trong chu kỳ.",
		soDoGopVao: "Sơ đồ góp vào",
		toanManHinh: "Toàn màn hình",
		thoatToanManHinh: "Thoát toàn màn hình",
		veCaCongTy: "Về sơ đồ cả công ty",
		daiCongCu: "Công cụ sơ đồ",
	},
	veSoDo: "Về Sơ đồ",
	boOkr: {
		loc: {
			nhan: "Phạm vi",
			"tat-ca": "Tất cả",
			"toi-dan": "Tôi dẫn",
			"theo-doi": "Đang theo dõi",
		},
		cot: {
			bo: "Bộ OKR của",
			truong: "Trưởng",
			mucTieu: "Mục tiêu",
			tienDo: "Tiến độ",
			tuTinThap: "KR tự tin thấp",
		},
		rongLoc: {
			tieuDe: (loc: string) => `Không có bộ OKR nào trong «${loc}»`,
			than: "Bộ lọc này không khớp bộ OKR nào trong chu kỳ.",
			nut: "Về Tất cả",
		},
		loi: {
			tieuDe: "Không tải được danh sách Bộ OKR",
			moTa: "Máy chủ không trả danh sách. Thử lại sau giây lát.",
		},
		viTri: "Bộ OKR",
		the: {
			nhan: "Phần của bộ OKR",
			"danh-sach": "OKR",
			viec: "Việc",
		},
		viec: {
			cot: {
				tieuDe: "Việc",
				nguoiLam: "Người làm",
				han: "Hạn",
				xong: "Trạng thái",
			},
			daXong: "Đã xong",
			chuaXong: "Chưa xong",
			rong: {
				tieuDe: "Bộ OKR này chưa có việc nào",
				than: "Việc gắn vào KR của các mục tiêu trong bộ sẽ hiện ở đây.",
			},
			loi: {
				tieuDe: "Không tải được việc của bộ OKR",
				moTa: "Máy chủ không trả danh sách việc. Thử lại sau giây lát.",
			},
		},
	},
};

type OkrVoKhuMessages = typeof vi;

const en: OkrVoKhuMessages = {
	nhom: {
		okr: "OKR",
		baoCao: "Reports",
	},
	muc: {
		cuaToi: "Mine",
		boOkr: "OKR sets",
		layYKien: "Call for ideas",
		sucKhoe: "Health",
		soDo: "Map",
	},
	chuongTrinh: "OKR program",
	soDo: {
		tieuDe: "Map",
		moTa: "How each unit's OKR set contributes to company objectives in the cycle.",
		soDoGopVao: "Contribution map",
		toanManHinh: "Full screen",
		thoatToanManHinh: "Exit full screen",
		veCaCongTy: "Back to company map",
		daiCongCu: "Map tools",
	},
	veSoDo: "Back to Map",
	boOkr: {
		loc: {
			nhan: "Scope",
			"tat-ca": "All",
			"toi-dan": "I lead",
			"theo-doi": "Following",
		},
		cot: {
			bo: "OKR set of",
			truong: "Lead",
			mucTieu: "Objectives",
			tienDo: "Progress",
			tuTinThap: "Low-confidence KRs",
		},
		rongLoc: {
			tieuDe: (loc: string) => `No OKR sets in "${loc}"`,
			than: "This filter matches no OKR set in the cycle.",
			nut: "Back to All",
		},
		loi: {
			tieuDe: "Couldn't load OKR sets",
			moTa: "The server didn't return the list. Try again in a moment.",
		},
		viTri: "OKR sets",
		the: {
			nhan: "Parts of the OKR set",
			"danh-sach": "OKRs",
			viec: "Tasks",
		},
		viec: {
			cot: {
				tieuDe: "Task",
				nguoiLam: "Assignee",
				han: "Due",
				xong: "Status",
			},
			daXong: "Done",
			chuaXong: "Open",
			rong: {
				tieuDe: "This OKR set has no tasks yet",
				than: "Tasks attached to the KRs of this set's objectives show up here.",
			},
			loi: {
				tieuDe: "Couldn't load tasks",
				moTa: "The server didn't return the tasks. Try again in a moment.",
			},
		},
	},
};

export function okrVoKhuMessages(locale: Locale): OkrVoKhuMessages {
	return locale === "en" ? en : vi;
}
