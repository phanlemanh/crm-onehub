export type DongTasksMau =
	| {
			loai: "viec";
			id: string;
			nhan: string;
			congTy: string;
			han: string;
	  }
	| {
			loai: "buoc";
			id: string;
			nhan: string;
			congTy: string;
			han: string;
			quaHan: boolean;
	  }
	| {
			loai: "im";
			id: string;
			congTy: string;
			goiY: string;
			han: string;
	  }
	| {
			loai: "moc";
			id: string;
			congTy: string;
			goiY: string;
			han: string;
	  };

export type ThoaThuanMau = {
	id: string;
	ten: string;
	congTy: string;
	giaiDoan: string;
	tuLuc: string;
	ty: number;
	giaTri: string;
};

export type DongSlackMau = { congTy: string; goiY: string };

export type NhomSlackMau = { ten: string; dong: DongSlackMau[] };

export const DONG_TASKS: DongTasksMau[] = [
	{
		loai: "viec",
		id: "v1",
		nhan: "Gọi lại chị Thương về báo giá",
		congTy: "Sông Hồng Land",
		han: "hôm qua",
	},
	{
		loai: "buoc",
		id: "b1",
		nhan: "Ký hợp đồng khung",
		congTy: "Nhà Xanh",
		han: "20/09",
		quaHan: true,
	},
	{
		loai: "im",
		id: "i1",
		congTy: "Sunrise",
		goiY: "Giao bước «Mở tài khoản»",
		han: "im 9 ngày",
	},
	{
		loai: "buoc",
		id: "b2",
		nhan: "Đào tạo nền tảng",
		congTy: "One Mount",
		han: "22/09",
		quaHan: false,
	},
	{
		loai: "moc",
		id: "m1",
		congTy: "One Mount",
		goiY: "3/8 bước xong",
		han: "ngày 14/30",
	},
	{
		loai: "buoc",
		id: "b3",
		nhan: "Cài đặt tài khoản môi giới",
		congTy: "Phú Gia",
		han: "24/09",
		quaHan: false,
	},
	{
		loai: "buoc",
		id: "b4",
		nhan: "Buổi hỏi đáp đầu tiên",
		congTy: "Đất Việt",
		han: "25/09",
		quaHan: false,
	},
];

export const MO_TA_TASKS = "2 quá hạn · 3 sắp hạn · 1 kế hoạch im";

export const THOA_THUAN_MO: ThoaThuanMau[] = [
	{
		id: "d1",
		ten: "Gói phân phối Q4",
		congTy: "One Mount",
		giaiDoan: "Đàm phán",
		tuLuc: "6 ngày",
		ty: 100,
		giaTri: "2,4 tỷ ₫",
	},
	{
		id: "d2",
		ten: "Mở rộng kênh môi giới",
		congTy: "Sunrise",
		giaiDoan: "Đề xuất",
		tuLuc: "11 ngày",
		ty: 62,
		giaTri: "1,5 tỷ ₫",
	},
	{
		id: "d3",
		ten: "Thử nghiệm 3 tháng",
		congTy: "Phú Gia",
		giaiDoan: "Đánh giá",
		tuLuc: "2 ngày",
		ty: 25,
		giaTri: "600 tr ₫",
	},
];

export const KE_HOACH = {
	congTy: "Sunrise",
	khuon: "Đối tác môi giới",
	ngay: "12/30",
	buoc: "2/8",
	im: "9 ngày",
	camTrich: "Hương Lê",
};

export const BUOC_KE_HOACH = [
	{ id: "k1", nhan: "Ký hợp đồng khung", nguoi: "Hương Lê", xong: true },
	{ id: "k2", nhan: "Gửi bộ tài liệu", nguoi: "Tuấn Đỗ", xong: true },
	{ id: "k3", nhan: "Mở tài khoản", nguoi: null, xong: false },
	{ id: "k4", nhan: "Đào tạo nền tảng", nguoi: "Hương Lê", xong: false },
];

export const NGUOI_THEO_DOI = ["Hương Lê", "Tuấn Đỗ"];

export const BAN_THAN = "Trịnh Cẩm Thương";

export const LOI_CHAO =
	"Chào Thương, sáng nay có 6 việc 30 ngày đầu cần bạn để ý.";

export const NHOM_SLACK: NhomSlackMau[] = [
	{
		ten: "Quá hạn",
		dong: [{ congTy: "Nhà Xanh", goiY: "Ký hợp đồng khung, trễ 2 ngày" }],
	},
	{
		ten: "Sắp hạn",
		dong: [
			{ congTy: "One Mount", goiY: "Đào tạo nền tảng, hạn hôm nay" },
			{ congTy: "Phú Gia", goiY: "Cài đặt tài khoản môi giới, hạn 24/09" },
			{ congTy: "Đất Việt", goiY: "Buổi hỏi đáp đầu tiên, hạn 25/09" },
		],
	},
	{
		ten: "Kế hoạch im",
		dong: [{ congTy: "Sunrise", goiY: "im 9 ngày, giao bước «Mở tài khoản»" }],
	},
	{
		ten: "Mốc ngày",
		dong: [{ congTy: "One Mount", goiY: "ngày 14/30, 3/8 bước xong" }],
	},
];

export const NHOM_SLACK_TRAN: NhomSlackMau[] = [
	{
		ten: "Quá hạn",
		dong: [
			{ congTy: "Nhà Xanh", goiY: "Ký hợp đồng khung, trễ 2 ngày" },
			{ congTy: "Hải Âu", goiY: "Gửi bộ tài liệu, trễ 4 ngày" },
			{ congTy: "Minh Long", goiY: "Mở tài khoản, trễ 1 ngày" },
		],
	},
	{
		ten: "Sắp hạn",
		dong: [
			{ congTy: "One Mount", goiY: "Đào tạo nền tảng, hạn hôm nay" },
			{ congTy: "Phú Gia", goiY: "Cài đặt tài khoản môi giới, hạn 24/09" },
			{ congTy: "Đất Việt", goiY: "Buổi hỏi đáp đầu tiên, hạn 25/09" },
			{ congTy: "Sao Mai", goiY: "Ký hợp đồng khung, hạn 25/09" },
		],
	},
	{
		ten: "Kế hoạch im",
		dong: [
			{ congTy: "Sunrise", goiY: "im 9 ngày, giao bước «Mở tài khoản»" },
			{ congTy: "Bình Minh", goiY: "im 7 ngày, giao bước «Đào tạo nền tảng»" },
		],
	},
	{
		ten: "Mốc ngày",
		dong: [
			{ congTy: "One Mount", goiY: "ngày 14/30, 3/8 bước xong" },
			{ congTy: "Hải Âu", goiY: "ngày 7/30, 1/8 bước xong" },
			{ congTy: "Sao Mai", goiY: "ngày 21/30, 6/8 bước xong" },
		],
	},
];

export const LOI_CHAO_TRAN =
	"Chào Thương, sáng nay có 12 việc 30 ngày đầu cần bạn để ý.";

export const TRAN_TOI_DA = 10;
