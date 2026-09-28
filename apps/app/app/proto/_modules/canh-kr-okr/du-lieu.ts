import { NGUOI, type NguoiMau } from "../ban-mau-okr/du-lieu";

export type KieuKrCanh = "so" | "moc";

export type KrCanh = {
	id: string;
	ten: string;
	phuTrach: NguoiMau;
	kieu: KieuKrCanh;
	so: string;
	tienDo: number;
	xong: boolean;
};

export type ViecMau = {
	id: string;
	loai: "viec";
	tieuDe: string;
	nguoiLam: NguoiMau;
	daRoi?: boolean;
	han: string | null;
	quaHan?: boolean;
	xong: boolean;
};

export type SangKienMau = {
	id: string;
	loai: "chien-dich" | "ke-hoach";
	ten: string;
	trangThai: "dang-chay" | "da-dong" | "da-luu-tru" | "da-xoa";
	chiTiet: string;
};

export type DongCanh = ViecMau | SangKienMau;

export type BangChungMau = {
	id: string;
	tenMien: string;
	url: string;
	ghiChu: string;
	nguoi: NguoiMau;
	ngay: string;
};

export type GhiNhanMau = {
	id: string;
	loai: "ghi-nhan";
	nguoiGui: NguoiMau;
	nguoiNhan: NguoiMau[];
	kr: string | null;
	loi: string;
	luc: string;
};

export type BinhLuanMau = {
	id: string;
	loai: "binh-luan";
	nguoi: NguoiMau;
	kr: string | null;
	noiDung: string;
	luc: string;
};

export type MauOkr = {
	id: string;
	ten: string;
	cap: "Bộ phận" | "Phòng ban" | "Cá nhân";
	apCho: string;
	soKr: number;
	daDung: number;
	luuTru: boolean;
	cauMucTieu: string;
	kr: { ten: string; kieu: string; donVi: string }[];
};

export const MUC_TIEU = {
	ten: "Đối tác mới được đỡ trọn tháng đầu",
	donVi: "Chăm sóc khách hàng",
	ky: "Quý 4 · 2026",
};

export const KR_CANH: KrCanh[] = [
	{
		id: "k1",
		ten: "Thời gian phản hồi đối tác, trung vị",
		phuTrach: NGUOI.nga,
		kieu: "so",
		so: "3,5 giờ",
		tienDo: 75,
		xong: false,
	},
	{
		id: "k2",
		ten: "Đối tác chấm hài lòng từ 4/5",
		phuTrach: NGUOI.nga,
		kieu: "so",
		so: "74%",
		tienDo: 56,
		xong: false,
	},
	{
		id: "k3",
		ten: "Bộ câu hỏi thường gặp công bố cho đối tác",
		phuTrach: NGUOI.nga,
		kieu: "moc",
		so: "Xong",
		tienDo: 100,
		xong: true,
	},
	{
		id: "k4",
		ten: "Công ty mới có buổi gặp tuần đầu",
		phuTrach: NGUOI.thao,
		kieu: "so",
		so: "64%",
		tienDo: 64,
		xong: false,
	},
];

export const DEM_VIEC: Record<
	string,
	{ xong: number; tong: number; sangKien: number }
> = {
	k1: { xong: 2, tong: 4, sangKien: 1 },
	k2: { xong: 0, tong: 1, sangKien: 1 },
	k3: { xong: 1, tong: 1, sangKien: 0 },
	k4: { xong: 0, tong: 0, sangKien: 0 },
};

export const BANG_CHUNG_K3: BangChungMau[] = [
	{
		id: "b1",
		tenMien: "docs.google.com",
		url: "https://docs.google.com/document/d/faq-doi-tac",
		ghiChu: "Bản đã pháp chế duyệt, công bố trên cổng đối tác 20/11",
		nguoi: NGUOI.nga,
		ngay: "20/11",
	},
];

export const DONG_K1: DongCanh[] = [
	{
		id: "v1",
		loai: "viec",
		tieuDe: "Xếp ca trực tối cho tuần cao điểm",
		nguoiLam: NGUOI.nga,
		han: "16/11",
		xong: true,
	},
	{
		id: "v2",
		loai: "viec",
		tieuDe: "Mẫu trả lời nhanh cho 10 câu hỏi hay gặp",
		nguoiLam: NGUOI.khoa,
		han: "20/11",
		xong: true,
	},
	{
		id: "v3",
		loai: "viec",
		tieuDe: "Gọi lại 20 đối tác phản hồi chậm tháng 10",
		nguoiLam: NGUOI.thao,
		han: "28/11",
		quaHan: true,
		xong: false,
	},
	{
		id: "v4",
		loai: "viec",
		tieuDe: "Đo thời gian phản hồi theo kênh Zalo và email",
		nguoiLam: NGUOI.mai,
		han: null,
		xong: false,
	},
	{
		id: "s1",
		loai: "ke-hoach",
		ten: "Kế hoạch 30 ngày — Công ty Nhà Xanh Thủ Đức",
		trangThai: "dang-chay",
		chiTiet: "Ngày 12/30 · 7/15 bước xong",
	},
];

export const DONG_GOC_MAT: DongCanh[] = [
	{
		id: "s2",
		loai: "ke-hoach",
		ten: "Kế hoạch 30 ngày — Công ty Địa ốc Phú Gia",
		trangThai: "da-luu-tru",
		chiTiet: "Công ty đã lưu trữ",
	},
	{
		id: "s3",
		loai: "ke-hoach",
		ten: "Kế hoạch 30 ngày",
		trangThai: "da-xoa",
		chiTiet: "Bản ghi gốc đã xoá",
	},
	{
		id: "v5",
		loai: "viec",
		tieuDe: "Rà danh sách đối tác chờ tài khoản",
		nguoiLam: NGUOI.tuan,
		daRoi: true,
		han: "30/11",
		xong: false,
	},
];

export const LUA_CHON_KE_HOACH = [
	{
		id: "p1",
		label: "Công ty Nhà Xanh Thủ Đức",
		hint: "Ngày 12/30 · Đỗ Hải Sơn cầm trịch",
	},
	{
		id: "p2",
		label: "Công ty Bất động sản Sao Mai",
		hint: "Ngày 4/30 · Lê Thanh Mai cầm trịch",
	},
	{
		id: "p3",
		label: "Công ty Địa ốc Phú Gia",
		hint: "Ngày 27/30 · Trần Văn Hùng cầm trịch",
	},
];

export const TRAO_DOI: (GhiNhanMau | BinhLuanMau)[] = [
	{
		id: "t1",
		loai: "binh-luan",
		nguoi: NGUOI.thao,
		kr: "Thời gian phản hồi đối tác, trung vị",
		noiDung: "Tuần này ca tối có đủ người chưa @Bùi Thu Nga?",
		luc: "Thứ Ba 17/11, 09:12",
	},
	{
		id: "t2",
		loai: "ghi-nhan",
		nguoiGui: NGUOI.thao,
		nguoiNhan: [NGUOI.nga, NGUOI.khoa],
		kr: "Bộ câu hỏi thường gặp công bố cho đối tác",
		loi: "Cảm ơn Nga và Khoa đã đẩy bộ câu hỏi qua pháp chế trong một tuần — đối tác mới hỏi lại ít hẳn.",
		luc: "Thứ Sáu 20/11, 16:40",
	},
	{
		id: "t3",
		loai: "binh-luan",
		nguoi: NGUOI.nga,
		kr: null,
		noiDung: "Đã đủ, từ 16/11 trực đến 21h.",
		luc: "Thứ Sáu 20/11, 17:05",
	},
];

export const MAU_OKR: MauOkr[] = [
	{
		id: "m1",
		ten: "Phòng kinh doanh — mở rộng mạng lưới",
		cap: "Phòng ban",
		apCho: "3 phòng ban",
		soKr: 3,
		daDung: 2,
		luuTru: false,
		cauMucTieu: "Mạng lưới môi giới của phòng lớn và hoạt động đều hơn",
		kr: [
			{
				ten: "Môi giới mới ghi danh đạt bậc 1",
				kieu: "Tăng tới",
				donVi: "người",
			},
			{
				ten: "Thoả thuận chốt được mỗi tháng",
				kieu: "Tăng tới",
				donVi: "thoả thuận",
			},
			{ ten: "Tỷ lệ môi giới rời sau 60 ngày", kieu: "Giữ dưới", donVi: "%" },
		],
	},
	{
		id: "m2",
		ten: "Phòng hỗ trợ — đỡ đối tác tháng đầu",
		cap: "Phòng ban",
		apCho: "Mọi phòng ban",
		soKr: 3,
		daDung: 1,
		luuTru: false,
		cauMucTieu: "Đối tác mới được đỡ trọn tháng đầu",
		kr: [
			{
				ten: "Thời gian phản hồi đối tác, trung vị",
				kieu: "Giảm xuống",
				donVi: "giờ",
			},
			{ ten: "Đối tác chấm hài lòng từ 4/5", kieu: "Tăng tới", donVi: "%" },
			{ ten: "Bộ câu hỏi thường gặp công bố", kieu: "Mốc", donVi: "" },
		],
	},
	{
		id: "m3",
		ten: "Bộ phận — một mục tiêu năm",
		cap: "Bộ phận",
		apCho: "Mọi bộ phận",
		soKr: 2,
		daDung: 0,
		luuTru: false,
		cauMucTieu: "Bộ phận góp phần rõ vào mục tiêu năm của OneHub",
		kr: [
			{ ten: "Doanh thu bộ phận", kieu: "Tăng tới", donVi: "tỷ đồng" },
			{ ten: "Chi phí trên doanh thu", kieu: "Giữ dưới", donVi: "%" },
		],
	},
];
