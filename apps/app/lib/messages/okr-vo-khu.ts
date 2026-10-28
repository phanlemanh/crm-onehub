import type { Locale } from "@crm/ui/lib/locale";

const vi = {
	nhom: {
		okr: "OKR",
		baoCao: "Báo cáo",
	},
	muc: {
		cuaToi: "Của tôi",
		capNhatGanDay: "Cập nhật gần đây",
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
		menu: {
			thuoc: "Thuộc",
			cungCap: "Cùng cấp",
			trucThuoc: "Trực thuộc",
			doiBo: (ten: string) => `${ten} — đổi sang bộ khác`,
			demMucTieu: (n: number) => `${n} mục tiêu`,
			chuaCoRieng: "chưa có mục tiêu riêng",
		},
		rongBoPhan: {
			tieuDe: (bo: string, chuKy: string) =>
				`${bo} chưa có mục tiêu riêng trong ${chuKy}`,
			chiSangMenu: (bo: string) =>
				`Mục tiêu của các phòng ban nằm ở bộ của từng phòng — bấm ${bo} trên dòng vị trí để sang.`,
		},
		daBo: (n: number) => `Đã bỏ (${n})`,
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
		so: {
			dangTai: "Đang tải số của bộ…",
			ngayConLai: "Ngày còn lại",
			den: (ngay: string) => `đến ${ngay}`,
			batDau: (ngay: string) => `Bắt đầu ${ngay}`,
			daKetThuc: (ngay: string) => `Đã kết thúc ${ngay}`,
			loi: {
				tieuDe: "Không tải được số của bộ",
				moTa: "Bảng mục tiêu bên dưới vẫn dùng được.",
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
		capNhatGanDay: "Recent updates",
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
		menu: {
			thuoc: "Belongs to",
			cungCap: "Same level",
			trucThuoc: "Under it",
			doiBo: (ten: string) => `${ten} — switch to another set`,
			demMucTieu: (n: number) =>
				n === 1 ? "1 objective" : `${n} objectives`,
			chuaCoRieng: "no objectives of its own",
		},
		rongBoPhan: {
			tieuDe: (bo: string, chuKy: string) =>
				`${bo} has no objectives of its own in ${chuKy}`,
			chiSangMenu: (bo: string) =>
				`Department objectives live in each department's set — click ${bo} in the breadcrumb to go there.`,
		},
		daBo: (n: number) => `Dropped (${n})`,
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
		so: {
			dangTai: "Loading this set's numbers…",
			ngayConLai: "Days left",
			den: (ngay: string) => `until ${ngay}`,
			batDau: (ngay: string) => `Starts ${ngay}`,
			daKetThuc: (ngay: string) => `Ended ${ngay}`,
			loi: {
				tieuDe: "Couldn't load this set's numbers",
				moTa: "The objectives table below still works.",
			},
		},
	},
};

export function okrVoKhuMessages(locale: Locale): OkrVoKhuMessages {
	return locale === "en" ? en : vi;
}
