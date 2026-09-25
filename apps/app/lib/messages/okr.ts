import type { Locale } from "@crm/ui/lib/locale";

const vi = {
	khu: "Mục tiêu",
	tabNhan: "Khu mục tiêu",
	tab: {
		"cua-toi": "Của tôi",
		"theo-don-vi": "Theo đơn vị",
		"toan-canh": "Toàn cảnh",
	},
	tieuDe: {
		"cua-toi": "OKR của tôi",
		"theo-don-vi": "OKR theo đơn vị",
		"toan-canh": "Toàn cảnh OKR",
	},
	moTa: {
		"cua-toi":
			"Mục tiêu bạn phụ trách hoặc tham gia, và mục tiêu có KR bạn phụ trách.",
		"theo-don-vi":
			"Bộ OKR của từng đơn vị trong chu kỳ, và cách chúng góp vào nhau.",
		"toan-canh": "Cả công ty trong một màn.",
	},
	chuKy: "Chu kỳ",
	loaiChuKy: { nam: "Năm", quy: "Quý" },
	goc: "Toàn công ty",
	donVi: "Đơn vị",
	cap: {
		goc: "Cả công ty",
		bp: "Bộ phận",
		pb: "Phòng ban",
		nguoi: "Cá nhân",
	},
	chuaXep: "Chưa xếp vào bộ phận",
	truong: "Trưởng",
	chuaCoTruong: "Chưa có trưởng",
	demMucTieu: (n: number) => (n === 0 ? "chưa đặt" : `${n} mục tiêu`),
	demDonVi: (mt: number, kr: number) => `${mt} mục tiêu · ${kr} KR`,
	cachXem: "Cách xem",
	danhSach: "Danh sách",
	cayCanChinh: "Cây căn chỉnh",
	themMucTieu: "Thêm mục tiêu",
	nhapBangTinh: "Nhập từ bảng tính",
	phuTrach: "Phụ trách",
	gopVao: (n: number) => `góp vào ${n} chỗ`,
	cuaToi: "Của tôi",
	kieu: {
		"tang-toi": "Tăng tới",
		"giam-xuong": "Giảm xuống",
		"giu-tren": "Giữ trên",
		"giu-duoi": "Giữ dưới",
		moc: "Mốc",
		"phan-tram": "Phần trăm",
	},
	loai: { "cam-ket": "Cam kết", "tham-vong": "Tham vọng" },
	trangThai: { nhap: "Nháp", "cong-bo": "Đã công bố", "da-bo": "Đã bỏ" },
	tinhTrang: {
		"dung-nhip": "Đúng nhịp",
		"cham-nhip": "Chậm nhịp",
		truot: "Trượt",
		"chua-co-ky-vong": "Chưa công bố",
	},
	moc: {
		xong: "Xong",
		chuaXong: "Chưa xong",
		daXong: "Đã xong",
		dangCho: "Mốc, chưa xong",
	},
	cot: { ten: "KR", phuTrach: "Phụ trách", tienDo: "Tiến độ", dich: "Đích" },
	chuaCoKr: "Mục tiêu này chưa có KR.",
	cotCay: {
		ten: "Mục tiêu và KR",
		tienDo: "Tiến độ",
		trangThai: "Trạng thái",
	},
	tienDoCua: (ten: string, p: number) => `Tiến độ ${ten}: ${p}%`,
	chuaCanChinh: "Chưa căn chỉnh vào đâu",
	lapLai: "cũng hiện ở chỗ góp kia",
	dangTai: "Đang tải OKR…",
	loi: {
		title: "Không tải được OKR",
		body: "Máy chủ không trả lời. Thử lại, hoặc chọn đơn vị khác.",
		action: "Thử lại",
	},
	chuaChuKy: {
		title: "Quản trị chưa mở chu kỳ",
		quanTri: "Mở chu kỳ đầu tiên ở Cài đặt › Chương trình OKR.",
		nguoiKhac: "Khi quản trị mở chu kỳ, OKR của các đơn vị sẽ hiện ở đây.",
		action: "Mở Cài đặt OKR",
	},
	rong: {
		chuaDat: "chưa đặt OKR cho",
		body: "Trưởng đơn vị thêm từng mục tiêu, hoặc nhập cả bộ từ bảng tính.",
		chuaTruong:
			"Đơn vị này chưa có trưởng. Gán trưởng ở Cài đặt › Tổ chức để đơn vị tự đặt OKR của mình.",
		ganTruong: "Gán trưởng",
	},
	cuaToiRong: {
		title: "Bạn chưa phụ trách mục tiêu hay KR nào",
		body: "OKR của đơn vị bạn nằm ở Theo đơn vị.",
		action: "Sang Theo đơn vị",
	},
	toanCanh: {
		title: "Toàn cảnh mở ở lượt 5",
		body: "Lượt này có Của tôi và Theo đơn vị.",
	},
};

type OkrMessages = typeof vi;

const en: OkrMessages = {
	khu: "Objectives",
	tabNhan: "Objectives area",
	tab: {
		"cua-toi": "Mine",
		"theo-don-vi": "By unit",
		"toan-canh": "Overview",
	},
	tieuDe: {
		"cua-toi": "My OKRs",
		"theo-don-vi": "OKRs by unit",
		"toan-canh": "OKR overview",
	},
	moTa: {
		"cua-toi":
			"Objectives you own or take part in, and objectives with a key result you own.",
		"theo-don-vi":
			"Each unit's OKRs for the cycle, and how they contribute to each other.",
		"toan-canh": "The whole company on one screen.",
	},
	chuKy: "Cycle",
	loaiChuKy: { nam: "Year", quy: "Quarter" },
	goc: "Whole company",
	donVi: "Unit",
	cap: {
		goc: "Whole company",
		bp: "Division",
		pb: "Department",
		nguoi: "Person",
	},
	chuaXep: "Not in a division",
	truong: "Head",
	chuaCoTruong: "No head",
	demMucTieu: (n: number) =>
		n === 0 ? "none set" : n === 1 ? "1 objective" : `${n} objectives`,
	demDonVi: (mt: number, kr: number) =>
		`${mt} ${mt === 1 ? "objective" : "objectives"} · ${kr} ${kr === 1 ? "KR" : "KRs"}`,
	cachXem: "View",
	danhSach: "List",
	cayCanChinh: "Alignment tree",
	themMucTieu: "Add objective",
	nhapBangTinh: "Import from spreadsheet",
	phuTrach: "Owner",
	gopVao: (n: number) =>
		n === 1 ? "contributes to 1 place" : `contributes to ${n} places`,
	cuaToi: "Mine",
	kieu: {
		"tang-toi": "Increase to",
		"giam-xuong": "Decrease to",
		"giu-tren": "Stay above",
		"giu-duoi": "Stay below",
		moc: "Milestone",
		"phan-tram": "Percentage",
	},
	loai: { "cam-ket": "Committed", "tham-vong": "Aspirational" },
	trangThai: { nhap: "Draft", "cong-bo": "Published", "da-bo": "Dropped" },
	tinhTrang: {
		"dung-nhip": "On track",
		"cham-nhip": "Behind",
		truot: "Off track",
		"chua-co-ky-vong": "Not published",
	},
	moc: {
		xong: "Done",
		chuaXong: "Not done",
		daXong: "Done",
		dangCho: "Milestone, not done",
	},
	cot: { ten: "KR", phuTrach: "Owner", tienDo: "Progress", dich: "Target" },
	chuaCoKr: "This objective has no KRs yet.",
	cotCay: {
		ten: "Objectives and KRs",
		tienDo: "Progress",
		trangThai: "Status",
	},
	tienDoCua: (ten: string, p: number) => `${ten} progress: ${p}%`,
	chuaCanChinh: "Not aligned to anything",
	lapLai: "also shown under its other target",
	dangTai: "Loading OKRs…",
	loi: {
		title: "Couldn't load OKRs",
		body: "The server didn't respond. Try again, or pick another unit.",
		action: "Try again",
	},
	chuaChuKy: {
		title: "No cycle is open yet",
		quanTri: "Open the first cycle in Settings › OKR program.",
		nguoiKhac: "Once an admin opens a cycle, each unit's OKRs will show here.",
		action: "Open OKR settings",
	},
	rong: {
		chuaDat: "has no OKRs for",
		body: "The unit head adds objectives one by one, or imports the whole set from a spreadsheet.",
		chuaTruong:
			"This unit has no head. Assign one in Settings › Organization so the unit can set its own OKRs.",
		ganTruong: "Assign a head",
	},
	cuaToiRong: {
		title: "You don't own any objectives or KRs",
		body: "Your unit's OKRs are under By unit.",
		action: "Go to By unit",
	},
	toanCanh: {
		title: "Overview opens in a later release",
		body: "This release has Mine and By unit.",
	},
};

const BANG = { en, vi } satisfies Record<Locale, OkrMessages>;

export function okrMessages(locale: Locale): OkrMessages {
	return BANG[locale];
}
