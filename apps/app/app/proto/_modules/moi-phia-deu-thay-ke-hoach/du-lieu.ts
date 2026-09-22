export type KeHoachCongTyMau = {
	id: string;
	ten: string;
	ngay: string;
	buoc: string;
	tacO: string | null;
	camTrich: string;
	dong: boolean;
};

export type DongTasksMau = {
	id: string;
	loai: "viec" | "buoc";
	nhan: string;
	congTy: string;
	han: string;
	quaHan: boolean;
};

export type CotMau = { ten: string; the: string[] };

export const CONG_TY = {
	ten: "One Mount",
	linhVuc: "Bất động sản",
	thanhPho: "Hà Nội",
};

export const KE_HOACH_CONG_TY: KeHoachCongTyMau[] = [
	{
		id: "p1",
		ten: "Onboarding One Mount",
		ngay: "7/30",
		buoc: "3/8",
		tacO: "Đào tạo nền tảng",
		camTrich: "Hương Lê",
		dong: false,
	},
	{
		id: "p2",
		ten: "Onboarding đợt thử 2025",
		ngay: "30/30",
		buoc: "6/6",
		tacO: null,
		camTrich: "Tuấn Đỗ",
		dong: true,
	},
];

export const DONG_TASKS: DongTasksMau[] = [
	{
		id: "t1",
		loai: "buoc",
		nhan: "Ký hợp đồng khung",
		congTy: "Nhà Xanh",
		han: "2 ngày trước",
		quaHan: true,
	},
	{
		id: "t2",
		loai: "viec",
		nhan: "Gọi lại chị Thương về báo giá",
		congTy: "Sông Hồng Land",
		han: "hôm qua",
		quaHan: true,
	},
	{
		id: "t3",
		loai: "buoc",
		nhan: "Đào tạo nền tảng",
		congTy: "One Mount",
		han: "hôm nay",
		quaHan: false,
	},
	{
		id: "t4",
		loai: "buoc",
		nhan: "Cài đặt tài khoản môi giới",
		congTy: "Phú Gia",
		han: "trong 3 ngày",
		quaHan: false,
	},
];

export const COT_NGUOI_GIAO: CotMau[] = [
	{ ten: "Hương Lê", the: ["One Mount", "Nhà Xanh"] },
	{ ten: "Tuấn Đỗ", the: ["Nhà Xanh", "Phú Gia"] },
	{ ten: "Chưa giao", the: ["Sông Hồng Land"] },
	{ ten: "Xong", the: ["Đất Việt"] },
];

export const THANH_VIEN = ["Hương Lê", "Tuấn Đỗ", "Trịnh Cẩm Thương"];
