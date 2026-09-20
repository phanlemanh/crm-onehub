export type HangDanhMuc = {
	id: string;
	doiTac: string;
	ngay: number;
	tran: number;
	tacO: string;
	boPhan: string;
	imNgay: number;
	camTrich: string;
	buocXong: number;
	buocTong: number;
};

export const HANG_DANH_MUC: readonly HangDanhMuc[] = [
	{
		id: "kh-1",
		doiTac: "Sàn Bất động sản An Khang",
		ngay: 21,
		tran: 30,
		tacO: "Chuyển dữ liệu",
		boPhan: "Kỹ thuật",
		imNgay: 9,
		camTrich: "Hà",
		buocXong: 3,
		buocTong: 5,
	},
	{
		id: "kh-2",
		doiTac: "Công ty Môi giới Thành Đạt",
		ngay: 12,
		tran: 30,
		tacO: "Hoàn thành khoá học",
		boPhan: "Đào tạo",
		imNgay: 3,
		camTrich: "Dũng",
		buocXong: 1,
		buocTong: 6,
	},
	{
		id: "kh-3",
		doiTac: "Nhà đất Phương Nam Group Hà Nội",
		ngay: 4,
		tran: 30,
		tacO: "Có tài khoản",
		boPhan: "Vận hành",
		imNgay: 0,
		camTrich: "Hà",
		buocXong: 2,
		buocTong: 5,
	},
];

export type BuocMau = {
	id: string;
	nhan: string;
	boPhan: string;
	nguoi: string | null;
	han: string;
	xong: boolean;
	quaHan: boolean;
};

export const BUOC_MAU: readonly BuocMau[] = [
	{
		id: "b1",
		nhan: "Ký biên bản bàn giao",
		boPhan: "Vận hành",
		nguoi: "Hà",
		han: "02/09",
		xong: true,
		quaHan: false,
	},
	{
		id: "b2",
		nhan: "Mở tài khoản cho môi giới",
		boPhan: "Vận hành",
		nguoi: "Hà",
		han: "05/09",
		xong: true,
		quaHan: false,
	},
	{
		id: "b3",
		nhan: "Lớp dùng nền tảng buổi một",
		boPhan: "Đào tạo",
		nguoi: "Dũng",
		han: "09/09",
		xong: true,
		quaHan: false,
	},
	{
		id: "b4",
		nhan: "Chuyển dữ liệu tin đăng cũ",
		boPhan: "Kỹ thuật",
		nguoi: null,
		han: "12/09",
		xong: false,
		quaHan: true,
	},
	{
		id: "b5",
		nhan: "Phổ biến chính sách nền tảng",
		boPhan: "Đào tạo",
		nguoi: "Dũng",
		han: "16/09",
		xong: false,
		quaHan: true,
	},
];

export type BacMau = {
	id: string;
	nhan: string;
	dat: number;
};

export const MAU_SO = 40;

export const BAC_MAU: readonly BacMau[] = [
	{ id: "tk", nhan: "Có tài khoản", dat: 34 },
	{ id: "kh", nhan: "Hoàn thành khoá học", dat: 22 },
	{ id: "hd", nhan: "Hoạt động trên nền tảng", dat: 12 },
	{ id: "gd", nhan: "Phát sinh giao dịch", dat: 3 },
];
