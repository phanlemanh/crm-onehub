import {
	type KrMau,
	type MucTieuMau,
	type MucTuTin,
	NGUOI,
} from "../ban-mau-okr/du-lieu";

export const PHONG = {
	ten: "Kinh doanh",
	truong: NGUOI.hung,
	tuan: "12/10",
	nhanTuan: "Tuần 12/10 – 18/10",
	soCapNhat: 14,
	daCapNhat: 7,
	tongKr: 9,
	kyVong: 15,
} as const;

const kr = (
	id: string,
	ten: string,
	so: [number, number, number],
	donVi: string,
	tuTin: MucTuTin,
	capNhatLuc: string | null,
	ghiChu: string | null = null,
	imNgay = 0,
): KrMau => ({
	id,
	ten,
	phuTrach: id.endsWith("1") ? NGUOI.hung : NGUOI.mai,
	kieu: "so",
	khoiDiem: so[0],
	dich: so[1],
	hienTai: so[2],
	donVi,
	tuTin,
	capNhatLuc,
	ghiChu,
	imNgay,
});

export const MT_MANG_LUOI: MucTieuMau = {
	id: "kdm1",
	ten: "Mở rộng mạng lưới công ty đối tác ở phía Nam",
	donVi: "Kinh doanh",
	loai: "tham-vong",
	phuTrach: NGUOI.hung,
	gopVao: [],
	kr: [
		kr(
			"kdk1",
			"Thoả thuận ký mới ở TP.HCM",
			[0, 25, 9],
			"thoả thuận",
			"thap",
			"12/10",
			"Hai đối tác lớn dời ký sang tháng 11 vì chờ ngân sách năm sau.",
		),
		kr(
			"kdk2",
			"Công ty đối tác gia hạn hợp đồng",
			[60, 80, 68],
			"%",
			"cao",
			"12/10",
			"Gọi lại đủ nhóm hết hạn tháng 10.",
		),
		{
			...kr(
				"kdk3",
				"Mẫu hợp đồng đối tác mới được pháp chế duyệt",
				[0, 1, 0],
				"",
				"vua",
				"27/09",
				"Chờ pháp chế góp ý điều khoản thanh toán.",
				15,
			),
			kieu: "moc",
		},
	],
};

export const MT_KICH_HOAT: MucTieuMau = {
	id: "kdm2",
	ten: "Đối tác mới có giao dịch trong 30 ngày đầu",
	donVi: "Kinh doanh",
	loai: "cam-ket",
	phuTrach: NGUOI.mai,
	gopVao: [],
	kr: [
		kr(
			"kdk4",
			"Đối tác mới có giao dịch đầu tiên trong 30 ngày",
			[40, 70, 52],
			"%",
			"vua",
			"11/10",
			"Ba công ty mới chưa có tài khoản ngân hàng liên kết.",
		),
		kr("kdk5", "Buổi hướng dẫn tuần đầu", [0, 40, 12], "buổi", "cao", "12/10"),
		kr("kdk6", "Công ty mới gọi tổng đài", [0, 30, 6], "cuộc", "cao", "09/10"),
	],
};

export const MT_BAO_CAO: MucTieuMau = {
	id: "kdm3",
	ten: "Đội đọc được số thoả thuận mỗi sáng",
	donVi: "Kinh doanh",
	loai: "tham-vong",
	phuTrach: NGUOI.hung,
	gopVao: [],
	kr: [
		kr(
			"kdk7",
			"Bảng số sáng tự dựng từ CRM",
			[0, 5, 1],
			"bảng",
			"cao",
			"12/10",
		),
		kr("kdk8", "Thoả thuận có bước kế tiếp", [50, 90, 61], "%", "vua", "10/10"),
		kr(
			"kdk9",
			"Thoả thuận quá hạn được đóng",
			[0, 60, 14],
			"thoả thuận",
			"cao",
			"12/10",
		),
	],
};

const krCua = (mt: MucTieuMau, id: string): KrMau => {
	const k = mt.kr.find((x) => x.id === id);
	if (!k) throw new Error(`thiếu KR mẫu ${id}`);
	return k;
};

export type LyDoBan =
	| { loai: "tu-tin-tut"; tu: MucTuTin; xuong: MucTuTin }
	| { loai: "im"; ngay: number }
	| { loai: "ghi-chu-moi" };

export type DongHop = { kr: KrMau; mucTieu: MucTieuMau; lyDo: LyDoBan[] };

export const DANG_BAN: DongHop[] = [
	{
		kr: krCua(MT_MANG_LUOI, "kdk1"),
		mucTieu: MT_MANG_LUOI,
		lyDo: [{ loai: "tu-tin-tut", tu: "vua", xuong: "thap" }],
	},
	{
		kr: krCua(MT_MANG_LUOI, "kdk3"),
		mucTieu: MT_MANG_LUOI,
		lyDo: [{ loai: "im", ngay: 15 }],
	},
	{
		kr: krCua(MT_KICH_HOAT, "kdk4"),
		mucTieu: MT_KICH_HOAT,
		lyDo: [{ loai: "ghi-chu-moi" }],
	},
];

export const CON_LAI: DongHop[] = [
	{ kr: krCua(MT_MANG_LUOI, "kdk2"), mucTieu: MT_MANG_LUOI, lyDo: [] },
	{ kr: krCua(MT_KICH_HOAT, "kdk5"), mucTieu: MT_KICH_HOAT, lyDo: [] },
	{ kr: krCua(MT_KICH_HOAT, "kdk6"), mucTieu: MT_KICH_HOAT, lyDo: [] },
	{ kr: krCua(MT_BAO_CAO, "kdk7"), mucTieu: MT_BAO_CAO, lyDo: [] },
	{ kr: krCua(MT_BAO_CAO, "kdk8"), mucTieu: MT_BAO_CAO, lyDo: [] },
	{ kr: krCua(MT_BAO_CAO, "kdk9"), mucTieu: MT_BAO_CAO, lyDo: [] },
];

export type NguonMau = {
	id: string;
	kr: string;
	mucTieu: string;
	ngay: string;
	giaTri: string;
	truoc: string;
	tuTin: MucTuTin;
	ghiChu: string | null;
};

const NGUON = {
	n1: {
		id: "n1",
		kr: "Thoả thuận ký mới ở TP.HCM",
		mucTieu: MT_MANG_LUOI.ten,
		ngay: "12/10",
		giaTri: "9 thoả thuận",
		truoc: "9 thoả thuận",
		tuTin: "thap",
		ghiChu: "Hai đối tác lớn dời ký sang tháng 11 vì chờ ngân sách năm sau.",
	},
	n2: {
		id: "n2",
		kr: "Thoả thuận ký mới ở TP.HCM",
		mucTieu: MT_MANG_LUOI.ten,
		ngay: "05/10",
		giaTri: "9 thoả thuận",
		truoc: "7 thoả thuận",
		tuTin: "vua",
		ghiChu: "Tuần này ký thêm 2, còn hai công ty đang xem giá.",
	},
	n3: {
		id: "n3",
		kr: "Công ty đối tác gia hạn hợp đồng",
		mucTieu: MT_MANG_LUOI.ten,
		ngay: "12/10",
		giaTri: "68%",
		truoc: "64%",
		tuTin: "cao",
		ghiChu: "Gọi lại đủ nhóm hết hạn tháng 10.",
	},
	n4: {
		id: "n4",
		kr: "Đối tác mới có giao dịch đầu tiên trong 30 ngày",
		mucTieu: MT_KICH_HOAT.ten,
		ngay: "11/10",
		giaTri: "52%",
		truoc: "52%",
		tuTin: "vua",
		ghiChu: "Ba công ty mới chưa có tài khoản ngân hàng liên kết.",
	},
	n5: {
		id: "n5",
		kr: "Thoả thuận quá hạn được đóng",
		mucTieu: MT_BAO_CAO.ten,
		ngay: "12/10",
		giaTri: "14 thoả thuận",
		truoc: "8 thoả thuận",
		tuTin: "cao",
		ghiChu: null,
	},
} satisfies Record<string, NguonMau>;

export type CauMau = { id: string; van: string; nguon: NguonMau[] };

export const CAU: CauMau[] = [
	{
		id: "c1",
		van: "Tuần 12/10 phòng có 14 lần cập nhật trên 7/9 KR; 3 KR đáng bàn, các KR còn lại giữ hoặc tăng.",
		nguon: [NGUON.n1, NGUON.n3, NGUON.n5],
	},
	{
		id: "c2",
		van: "Thoả thuận ký mới ở TP.HCM đứng ở 9 trên đích 25 suốt hai tuần, mức tự tin tụt từ vừa xuống thấp; ghi chú nói hai đối tác lớn dời ký sang tháng 11.",
		nguon: [NGUON.n1, NGUON.n2],
	},
	{
		id: "c3",
		van: "Đối tác mới có giao dịch trong 30 ngày đứng ở 52%, ghi chú mới nêu ba công ty chưa liên kết tài khoản ngân hàng.",
		nguon: [NGUON.n4],
	},
	{
		id: "c4",
		van: "Tỷ lệ gia hạn lên 68%, tăng 4 điểm; thoả thuận quá hạn được đóng tăng từ 8 lên 14.",
		nguon: [NGUON.n3, NGUON.n5],
	},
];

export const MA_BO_CAU = [
	"nguon-ngoai-goi",
	"so-lech",
	"sai-chieu",
	"noi-ve-nguoi",
	"tu-cam",
	"trung-cau",
] as const;

export type MaBoCau = (typeof MA_BO_CAU)[number];

export const NHAN_MA_BO = {
	"nguon-ngoai-goi": "Dẫn nguồn ngoài phòng",
	"so-lech": "Số lệch với nguồn",
	"sai-chieu": "Sai chiều tăng giảm",
	"noi-ve-nguoi": "Nêu tên người",
	"tu-cam": "Dùng từ cấm",
	"trung-cau": "Trùng câu trước",
} satisfies Record<MaBoCau, string>;

export type TrangThaiBan =
	| "da-hien"
	| "qua-kiem-an"
	| "giu-lai"
	| "khong-lam-duoc"
	| "dang-soan"
	| "chua-cap-nhat";

export type HangQuanTri = {
	id: string;
	phong: string;
	nac: "bat" | "an";
	trangThai: TrangThaiBan;
	cau: number | null;
	bo: number | null;
	huuIch: number | null;
	khongHuuIch: number | null;
};

export const QUAN_TRI: HangQuanTri[] = [
	{
		id: "kd",
		phong: "Kinh doanh",
		nac: "bat",
		trangThai: "da-hien",
		cau: 4,
		bo: 0,
		huuIch: 5,
		khongHuuIch: 1,
	},
	{
		id: "kd2",
		phong: "Kinh doanh vùng 2",
		nac: "bat",
		trangThai: "giu-lai",
		cau: 3,
		bo: 6,
		huuIch: null,
		khongHuuIch: null,
	},
	{
		id: "cskh",
		phong: "Chăm sóc khách hàng",
		nac: "an",
		trangThai: "qua-kiem-an",
		cau: 5,
		bo: 1,
		huuIch: null,
		khongHuuIch: null,
	},
	{
		id: "mkt",
		phong: "Marketing",
		nac: "an",
		trangThai: "khong-lam-duoc",
		cau: null,
		bo: null,
		huuIch: null,
		khongHuuIch: null,
	},
	{
		id: "ketoan",
		phong: "Kế toán",
		nac: "bat",
		trangThai: "dang-soan",
		cau: null,
		bo: null,
		huuIch: null,
		khongHuuIch: null,
	},
	{
		id: "kho",
		phong: "Kho vận",
		nac: "bat",
		trangThai: "chua-cap-nhat",
		cau: null,
		bo: null,
		huuIch: null,
		khongHuuIch: null,
	},
];

export type CauBoMau = { van: string; ma: MaBoCau; chiTiet: string };

export const BAN_MO = {
	phong: "Kinh doanh vùng 2",
	tuan: "12/10",
	con: [
		{
			van: "Tuần 12/10 phòng có 6 lần cập nhật trên 5 KR; 2 KR đáng bàn.",
			nguon: "Cập nhật 12/10 · Thoả thuận ký mới ở Bình Dương",
		},
		{
			van: "Thoả thuận ký mới ở Bình Dương lên 6 trên đích 10, mức tự tin giữ cao.",
			nguon: "Cập nhật 12/10 · Thoả thuận ký mới ở Bình Dương",
		},
		{
			van: "Đầu mối ký hằng tuần vẫn ở 2 tỉnh, ghi chú nói chờ tuyển thêm một người.",
			nguon: "Cập nhật 11/10 · Tỉnh có đầu mối ký hằng tuần",
		},
	],
	bo: [
		{
			van: "Doanh thu thoả thuận mới của cả bộ phận Kinh doanh đạt 3,2 tỷ.",
			ma: "nguon-ngoai-goi",
			chiTiet: "Câu dẫn một lần cập nhật của Kinh doanh vùng 1.",
		},
		{
			van: "Thoả thuận ký mới ở Bình Dương đạt 8 trên đích 10.",
			ma: "so-lech",
			chiTiet: "Câu nói 8, lần cập nhật 12/10 ghi 6.",
		},
		{
			van: "Số tỉnh có đầu mối ký hằng tuần tăng trong tuần.",
			ma: "sai-chieu",
			chiTiet: "Giá trị giữ nguyên 2 tỉnh, mức tự tin cũng không đổi.",
		},
		{
			van: "Phạm Minh Đức đang giữ nhịp ký ở Bình Dương.",
			ma: "noi-ve-nguoi",
			chiTiet: "Câu nêu họ tên một thành viên.",
		},
		{
			van: "Kết quả tuần này thật tuyệt vời, chắc chắn sẽ vượt đích.",
			ma: "tu-cam",
			chiTiet: "Chứa «chắc chắn», không có trong ghi chú nào.",
		},
		{
			van: "Thoả thuận ký mới ở Bình Dương lên 6 trên đích 10, mức tự tin giữ cao.",
			ma: "trung-cau",
			chiTiet: "Trùng nguyên văn câu 2.",
		},
	] satisfies CauBoMau[],
};

export type ViecSang = { nhom: string; dong: string[] };

export const VIEC_SANG: ViecSang[] = [
	{
		nhom: "Việc của bạn hôm nay",
		dong: [
			"Gọi lại Công ty Minh Phát · hẹn ký lúc 10:00",
			"Thoả thuận Nam Long quá hạn 3 ngày · cập nhật bước kế",
		],
	},
	{
		nhom: "OKR",
		dong: ["Cập nhật tuần: còn 2 KR của bạn chưa cập nhật"],
	},
];
