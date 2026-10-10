import type { Locale } from "@crm/ui/lib/locale";

const en = {
	trang: {
		tieuDe: "Roadmap",
		moTa: "What the product team is building for OneHub Center, where each piece stands and which milestone it is due for. This page is read-only — to change the plan, tell the product team.",
	},
	thanhCongCu: {
		tim: "Search by description or code…",
		cachXem: "View",
		bang: "Table",
		bangCot: "Board",
		mocXem: "Milestones",
		chiaCot: "Columns by",
		chiaTrangThai: "Status",
		chiaNhom: "Group",
		chiaLoTrinh: "Roadmap",
		daBac: "Declined",
		bangCotNhan: "Work by column",
	},
	vongDoi: {
		chuaXong: "Not done",
		daGiao: "Shipped",
		xepLaiSau: "Parked",
		tatCa: "All",
	},
	nhom: {
		chuaBatDau: "Not started",
		dangLam: "In progress",
		daGiao: "Shipped",
		khac: "Other",
	},
	cot: {
		viec: "Work",
		loTrinh: "Roadmap",
		trangThai: "Status",
		moc: "Milestone",
	},
	loc: {
		loTrinh: "Roadmap",
		nhom: "Group",
		moc: "Milestone",
		treMoc: "Past milestone",
		chuaHenMoc: "No milestone yet",
		khongNhom: "No group",
		vongDoi: "Item status",
	},
	moc: {
		conNgay: (n: string) => `${n} days left`,
		homNay: "today",
		tre: (n: string) => `${n} days late`,
		lechKeHoach: (n: string) => `${n} plan mismatches`,
		xem: "Show",
	},
	tre: {
		tieuDe: (n: string) =>
			`${n} items are past their milestone and not shipped`,
		moTa: "These items belong to a milestone that has passed, and the plan does not record them as shipped.",
		nut: "Show late items",
	},
	hoSo: {
		trangThai: "Status",
		moc: "Milestone",
		loTrinh: "Roadmap",
		nhom: "Group",
		theoLoi:
			"This status comes from a note in the plan; nobody has confirmed the work yet.",
		lech: "Plan and reality disagree",
		chiTiet: "Details",
		keHoachGhi: "Plan says",
		thanhCongKhi: "Counts as done when",
		viSao: "Why",
		canXongTruoc: "Needs to finish first",
		dangCho: "Waiting on this item",
	},
	daBac: {
		moTa: "Items the plan considered and decided not to do, with the reason.",
		cotViec: "Declined item",
		cotLoTrinh: "Roadmap",
	},
	trong: {
		khongKhopTieuDe: "No items",
		khongKhopMoTa: "No item matches the current filters.",
		khongDaBacTieuDe: "No declined items yet",
		khongDaBacMoTa: "The plan has not recorded any declined item.",
		tepVangTieuDe: "Could not load the roadmap",
		tepVangMoTa:
			"This OneHub Center build does not carry the roadmap. Tell the product team.",
		chuaCoKhoiTieuDe: "No roadmap here yet",
		chuaCoKhoiMoTa: "This page has no roadmap data yet. Tell the product team.",
		khoiHongTieuDe: "Could not load the roadmap",
		khoiHongMoTa:
			"The roadmap data is damaged, so the page stays empty rather than show something wrong. Tell the product team.",
	},
	canhBao: {
		khuonMoiTieuDe: "Part of this page may be missing",
		khuonMoiMoTa:
			"The roadmap data is newer than this page; what the page does understand is still correct.",
		loLoiTieuDe: "Could not load roadmap",
		loLoiMoTa: "The other roadmaps still show below. Tell the product team.",
	},
	chiTiet: "Details for the product team",
	meta: (n: string, giao: string, tong: string) =>
		`${n} items · ${giao}/${tong} shipped within the filters`,
	metaTre: (n: string) => ` · ${n} past milestone`,
};

export type LoTrinhMessages = typeof en;

const vi: LoTrinhMessages = {
	trang: {
		tieuDe: "Lộ trình",
		moTa: "Việc đội sản phẩm đang làm cho OneHub Center, đang ở đâu và hẹn mốc nào. Trang chỉ để xem — muốn đổi kế hoạch, hãy báo đội sản phẩm.",
	},
	thanhCongCu: {
		tim: "Tìm việc theo câu mô tả hoặc mã…",
		cachXem: "Cách xem",
		bang: "Bảng",
		bangCot: "Bảng cột",
		mocXem: "Mốc",
		chiaCot: "Chia cột theo",
		chiaTrangThai: "Trạng thái",
		chiaNhom: "Nhóm",
		chiaLoTrinh: "Lộ trình",
		daBac: "Đã bác",
		bangCotNhan: "Việc theo cột",
	},
	vongDoi: {
		chuaXong: "Chưa xong",
		daGiao: "Đã giao",
		xepLaiSau: "Xếp lại sau",
		tatCa: "Tất cả",
	},
	nhom: {
		chuaBatDau: "Chưa bắt đầu",
		dangLam: "Đang làm",
		daGiao: "Đã giao",
		khac: "Khác",
	},
	cot: {
		viec: "Việc",
		loTrinh: "Lộ trình",
		trangThai: "Trạng thái",
		moc: "Mốc",
	},
	loc: {
		loTrinh: "Lộ trình",
		nhom: "Nhóm",
		moc: "Mốc",
		treMoc: "Trễ mốc",
		chuaHenMoc: "Chưa hẹn mốc",
		khongNhom: "Không nhóm",
		vongDoi: "Tình trạng việc",
	},
	moc: {
		conNgay: (n: string) => `còn ${n} ngày`,
		homNay: "hôm nay",
		tre: (n: string) => `Trễ ${n} ngày`,
		lechKeHoach: (n: string) => `${n} chỗ lệch kế hoạch`,
		xem: "Mở",
	},
	tre: {
		tieuDe: (n: string) => `${n} việc đã qua mốc mà chưa giao`,
		moTa: "Việc gắn một mốc đã qua mà kế hoạch chưa ghi là đã giao.",
		nut: "Xem việc trễ",
	},
	hoSo: {
		trangThai: "Trạng thái",
		moc: "Mốc",
		loTrinh: "Lộ trình",
		nhom: "Nhóm",
		theoLoi:
			"Trạng thái này lấy từ ghi chú trong kế hoạch, chưa có ai xác nhận việc đã làm.",
		lech: "Kế hoạch và thực tế đang lệch",
		chiTiet: "Chi tiết",
		keHoachGhi: "Kế hoạch ghi",
		thanhCongKhi: "Coi là thành công khi",
		viSao: "Vì sao",
		canXongTruoc: "Cần xong trước",
		dangCho: "Việc đang chờ việc này",
	},
	daBac: {
		moTa: "Việc kế hoạch đã cân nhắc và quyết không làm, kèm lý do.",
		cotViec: "Việc đã bác",
		cotLoTrinh: "Lộ trình",
	},
	trong: {
		khongKhopTieuDe: "Không có việc",
		khongKhopMoTa: "Không việc nào khớp bộ lọc đang chọn.",
		khongDaBacTieuDe: "Chưa có việc đã bác",
		khongDaBacMoTa: "Kế hoạch chưa ghi việc nào bị bác.",
		tepVangTieuDe: "Không tải được lộ trình",
		tepVangMoTa:
			"Bản OneHub Center đang chạy không mang theo lộ trình. Hãy báo đội sản phẩm.",
		chuaCoKhoiTieuDe: "Chưa có lộ trình ở đây",
		chuaCoKhoiMoTa: "Trang này chưa có dữ liệu lộ trình. Hãy báo đội sản phẩm.",
		khoiHongTieuDe: "Không tải được lộ trình",
		khoiHongMoTa:
			"Dữ liệu lộ trình bị hỏng nên trang không hiện, để khỏi hiện sai. Hãy báo đội sản phẩm.",
	},
	canhBao: {
		khuonMoiTieuDe: "Trang có thể thiếu một phần",
		khuonMoiMoTa:
			"Dữ liệu lộ trình mới hơn trang này; phần trang hiểu được vẫn đúng.",
		loLoiTieuDe: "Không tải được lộ trình",
		loLoiMoTa: "Các lộ trình khác vẫn hiện bên dưới. Hãy báo đội sản phẩm.",
	},
	chiTiet: "Chi tiết cho đội sản phẩm",
	meta: (n: string, giao: string, tong: string) =>
		`${n} việc · ${giao}/${tong} đã giao trong phạm vi lọc`,
	metaTre: (n: string) => ` · ${n} trễ mốc`,
};

export function loTrinhMessages(locale: Locale): LoTrinhMessages {
	return locale === "vi" ? vi : en;
}
