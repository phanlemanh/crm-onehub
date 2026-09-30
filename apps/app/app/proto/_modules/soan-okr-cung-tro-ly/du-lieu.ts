const NGAY_DAY_DU = new Intl.DateTimeFormat("vi-VN", {
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
});
const NGAY_NGAN = new Intl.DateTimeFormat("vi-VN", {
	day: "2-digit",
	month: "2-digit",
});
const SO_VI = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 });
const TIEN_VI = new Intl.NumberFormat("vi-VN", {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

export const dinhDang = {
	ngayDayDu: (d: Date) => NGAY_DAY_DU.format(d),
	ngayNgan: (d: Date) =>
		NGAY_NGAN.formatToParts(d)
			.filter((p) => p.type === "day" || p.type === "month")
			.map((p) => p.value)
			.join("/"),
	so: (n: number) => SO_VI.format(n),
	giay: (n: number) => `${SO_VI.format(n)} s`,
	usd: (n: number) => `$${TIEN_VI.format(n)}`,
} as const;

const ngay = (nam: number, thang: number, ngay: number) =>
	new Date(nam, thang - 1, ngay);

export const DON_VI = {
	ten: "Kinh doanh miền Bắc",
	cap: "Phòng ban",
	truong: "Trần Minh Hải",
	congTy: "Hải Đăng Logistics",
	soNguoi: 7,
} as const;

export const KY_SOAN = {
	ten: "Quý 1 · 2027",
	ngan: "Quý 1 2027",
	pha: "Đang lập kế hoạch",
	kyTruoc: "Quý 4 · 2026",
} as const;

export const TRAN = {
	cuocMoiKy: 3,
	luotMoiCuoc: 12,
	mucTieuMoiDonVi: 5,
	nghiToi: "01/11",
} as const;

export type KieuKr = "so" | "moc";

export type KrNhap = {
	id: string;
	ten: string;
	kieu: KieuKr;
	donVi: string;
	khoiDiem: number | null;
	nguonKhoiDiem: string;
	viSao: string;
};

export type MucTieuNhap = {
	id: string;
	stt: number;
	ten: string;
	loai: "cam-ket" | "tham-vong";
	viSao: string;
	canChinh: string;
	lyDoCanChinh: string;
	kr: KrNhap[];
};

export const BAN_NHAP: MucTieuNhap[] = [
	{
		id: "m1",
		stt: 1,
		ten: "Không hợp đồng năm nào của khách lớn miền Bắc rơi vào tay đối thủ",
		loai: "cam-ket",
		viSao:
			"Quý 1 là mùa ký lại hợp đồng năm; kỳ trước mất 2 trong 14 khách lớn vì hết hạn mà không ai theo.",
		canChinh: "KR Hải Đăng · Khách lớn gia hạn cả năm",
		lyDoCanChinh:
			"Chiến lược năm đặt giữ khách lớn là điều kiện của mọi mục tiêu tăng trưởng.",
		kr: [
			{
				id: "m1k1",
				ten: "Khách lớn ký lại hợp đồng năm trước 15/03",
				kieu: "so",
				donVi: "khách",
				khoiDiem: 0,
				nguonKhoiDiem: "14 khách lớn đang có hợp đồng hết hạn trong quý",
				viSao: "Đo kết quả giữ khách, không đo số cuộc gặp.",
			},
			{
				id: "m1k2",
				ten: "Khách lớn có buổi rà soát tuyến trước ngày hết hạn 30 ngày",
				kieu: "so",
				donVi: "khách",
				khoiDiem: 0,
				nguonKhoiDiem: "Kỳ trước không ghi buổi rà soát nào trên CRM",
				viSao: "Là việc dẫn tới ký lại; đối trọng cho KR trên để không ép giá.",
			},
			{
				id: "m1k3",
				ten: "Chuyến đúng hẹn với khách lớn",
				kieu: "so",
				donVi: "%",
				khoiDiem: 91,
				nguonKhoiDiem: "Quý 4 · 2026 đạt 91% theo bảng cập nhật tuần",
				viSao: "Khách lớn rời đi vì trễ hẹn nhiều hơn vì giá.",
			},
		],
	},
	{
		id: "m2",
		stt: 2,
		ten: "Tuyến Hà Nội – Hải Phòng thành nguồn khách mới ổn định",
		loai: "tham-vong",
		viSao:
			"Chiến lược năm nhắm cảng Hải Phòng là cửa ngõ thứ hai; tuyến này kỳ trước chỉ có 3 khách mới.",
		canChinh: "Mục tiêu Hải Đăng · Cảng Hải Phòng là cửa ngõ thứ hai",
		lyDoCanChinh: "Mục tiêu này góp thẳng vào số khách mới trên tuyến cảng.",
		kr: [
			{
				id: "m2k1",
				ten: "Khách mới ký trên tuyến Hà Nội – Hải Phòng",
				kieu: "so",
				donVi: "khách",
				khoiDiem: 3,
				nguonKhoiDiem: "Quý 4 · 2026 có 3 khách mới trên tuyến",
				viSao: "Số khách mới là kết quả trực tiếp của mục tiêu.",
			},
			{
				id: "m2k2",
				ten: "Chuyến ghép hàng chạy đủ tải trên tuyến",
				kieu: "so",
				donVi: "%",
				khoiDiem: 62,
				nguonKhoiDiem: "Điều phối vận tải báo 62% tháng 11",
				viSao: "Khách mới chỉ ở lại khi giá ghép hàng giữ được.",
			},
			{
				id: "m2k3",
				ten: "Báo giá gửi trong 24 giờ",
				kieu: "so",
				donVi: "%",
				khoiDiem: 70,
				nguonKhoiDiem: "CRM ghi 70% báo giá kỳ trước gửi trong 24 giờ",
				viSao: "Khách tuyến cảng chọn nhà xe nào báo giá trước.",
			},
		],
	},
	{
		id: "m3",
		stt: 3,
		ten: "Mọi thoả thuận của phòng đều có người theo tới cùng",
		loai: "cam-ket",
		viSao:
			"Quý 4 mất dấu 9 thoả thuận vì mỗi người ghi một nơi; đầu quý là lúc khách chốt ngân sách.",
		canChinh: "KR Hải Đăng · Cả công ty vận hành trên một công cụ",
		lyDoCanChinh: "Thoả thuận ghi trên CRM là cách cả công ty nhìn thấy nhau.",
		kr: [
			{
				id: "m3k1",
				ten: "Thoả thuận không cập nhật quá 14 ngày",
				kieu: "so",
				donVi: "thoả thuận",
				khoiDiem: 9,
				nguonKhoiDiem: "Quý 4 · 2026 có 9 thoả thuận mất dấu",
				viSao: "Đo điều phòng muốn tránh, không đo số lần nhắc.",
			},
			{
				id: "m3k2",
				ten: "Cả 7 người trong phòng ghi thoả thuận trên CRM",
				kieu: "moc",
				donVi: "",
				khoiDiem: null,
				nguonKhoiDiem: "Cây tổ chức: phòng có 7 người",
				viSao: "Mốc, xong hay chưa xong; là điều kiện của KR trên.",
			},
		],
	},
];

export const SO_KR = BAN_NHAP.reduce((t, m) => t + m.kr.length, 0);

export type GoiY = readonly [string, string];

export type CauHoiMoDau = { id: string; hoi: string; goiY: GoiY };

export const MO_DAU = {
	daBiet:
		"Kỳ trước phòng đạt 3 trong 4 KR, kỳ vọng chung 47%. Cấp trên nhắm «Cảng Hải Phòng là cửa ngõ thứ hai» và «Khách lớn gia hạn cả năm». Trước khi soạn, cho tôi hỏi ba điều:",
	cauHoi: [
		{
			id: "q1",
			hoi: "Quý 1 phòng ưu tiên giữ khách lớn hay mở tuyến mới?",
			goiY: ["Giữ khách lớn trước", "Mở tuyến Hải Phòng"],
		},
		{
			id: "q2",
			hoi: "Vấn đề nào của kỳ trước không được lặp lại?",
			goiY: ["Mất dấu thoả thuận", "Chuyến trễ hẹn"],
		},
		{
			id: "q3",
			hoi: "Phòng có bao nhiêu người theo khách lớn?",
			goiY: ["3 người", "Cả phòng"],
		},
	] satisfies CauHoiMoDau[],
} as const;

export type LuotChat = {
	id: string;
	tu: "nguoi" | "tro-ly";
	chu: string;
};

export const HOI_THOAI: LuotChat[] = [
	{
		id: "t1",
		tu: "nguoi",
		chu: "Giữ khách lớn trước. Mất dấu thoả thuận. Cả phòng.",
	},
	{
		id: "t2",
		tu: "tro-ly",
		chu: "Đã rõ. Tôi đưa bản nháp 3 Mục tiêu và 8 KR sang cột bên phải — mỗi dòng có một câu vì sao. Đích để bạn đặt; tôi chỉ ghi khởi điểm có trong dữ liệu.",
	},
];

export const HOI_THOAI_SUA: LuotChat[] = [
	...HOI_THOAI,
	{ id: "t3", tu: "nguoi", chu: "bỏ mục 2, mục 3 chuyển thành tham vọng" },
	{
		id: "t4",
		tu: "tro-ly",
		chu: "Đã bác Mục tiêu 2 cùng 3 KR con. Mục tiêu 3 chuyển sang loại Tham vọng; KR «Cả 7 người ghi thoả thuận trên CRM» chuyển lên Mục tiêu 1 vì giữ khách lớn cần cả phòng ghi cùng chỗ.",
	},
];

export const HOI_THOAI_BI_LOAI: LuotChat[] = [
	...HOI_THOAI.slice(0, 1),
	{
		id: "t2b",
		tu: "tro-ly",
		chu: "Đã đưa bản nháp sang cột bên phải. Tôi đã bỏ một KR vì có số không có trong dữ liệu («doanh thu tuyến cảng 4,2 tỉ») — nếu phòng có số đó, gõ cho tôi để tôi đưa lại.",
	},
];

export type CuocSoan = {
	id: string;
	ngay: Date;
	nguoiMo: string;
	dongNhan: number;
	dongTong: number;
	trangThai: "dang" | "da-dua-vao" | "bo-do";
};

export const CUOC: CuocSoan[] = [
	{
		id: "c3",
		ngay: ngay(2026, 11, 30),
		nguoiMo: "Trần Minh Hải",
		dongNhan: 0,
		dongTong: 11,
		trangThai: "dang",
	},
	{
		id: "c2",
		ngay: ngay(2026, 11, 27),
		nguoiMo: "Nguyễn Thị Lan",
		dongNhan: 9,
		dongTong: 12,
		trangThai: "da-dua-vao",
	},
	{
		id: "c1",
		ngay: ngay(2026, 11, 24),
		nguoiMo: "Trần Minh Hải",
		dongNhan: 2,
		dongTong: 10,
		trangThai: "bo-do",
	},
];

export const NHAN_TRANG_THAI_CUOC = {
	dang: "Đang soạn",
	"da-dua-vao": "Đã đưa vào",
	"bo-do": "Bỏ dở",
} as const satisfies Record<CuocSoan["trangThai"], string>;

export const DON_VI_CHON = [
	{ id: "hai-dang", ten: "Cấp Hải Đăng" },
	{ id: "kd-bac", ten: "Kinh doanh miền Bắc" },
	{ id: "kd-nam", ten: "Kinh doanh miền Nam" },
	{ id: "dieu-phoi", ten: "Điều phối vận tải" },
];

export type SoDoSoan = {
	nhan: string;
	bat: string;
	an: string;
};

const KHONG_CO = "—";
const { so, giay, usd } = dinhDang;

export const SO_DO_SOAN: SoDoSoan[] = [
	{ nhan: "Cuộc mở", bat: so(9), an: so(14) },
	{ nhan: "Cuộc tới «Đưa vào»", bat: so(6), an: KHONG_CO },
	{
		nhan: "Dòng nhận / sửa / bác",
		bat: [41, 12, 19].map(so).join(" / "),
		an: KHONG_CO,
	},
	{
		nhan: "Dòng bị loại (theo mã)",
		bat: `${so(4)} · SO-MOI ${so(3)}, DON-VI ${so(1)}`,
		an: so(11),
	},
	{
		nhan: "Mục tiêu nháp → công bố trong 14 ngày",
		bat: `${so(14)} / ${so(17)}`,
		an: KHONG_CO,
	},
	{ nhan: "Chi phí mỗi cuộc", bat: usd(0.21), an: usd(0.19) },
	{ nhan: "Độ trễ mỗi lượt p50", bat: giay(9.4), an: giay(9.8) },
	{ nhan: "Độ trễ mỗi lượt p90", bat: giay(18.1), an: giay(19.6) },
];

export type CuocGanDay = {
	id: string;
	donVi: string;
	nac: "Bật" | "Chế độ ẩn";
	luot: number;
	dong: number;
	biLoai: number;
	chiPhi: number;
	ngay: Date;
};

export const CUOC_GAN_DAY: CuocGanDay[] = [
	{
		id: "g1",
		donVi: "Kinh doanh miền Nam",
		nac: "Chế độ ẩn",
		luot: 5,
		dong: 10,
		biLoai: 1,
		chiPhi: 0.24,
		ngay: ngay(2026, 11, 29),
	},
	{
		id: "g2",
		donVi: "Kinh doanh miền Bắc",
		nac: "Bật",
		luot: 4,
		dong: 11,
		biLoai: 0,
		chiPhi: 0.19,
		ngay: ngay(2026, 11, 27),
	},
	{
		id: "g3",
		donVi: "Điều phối vận tải",
		nac: "Chế độ ẩn",
		luot: 6,
		dong: 9,
		biLoai: 2,
		chiPhi: 0.27,
		ngay: ngay(2026, 11, 26),
	},
];

export type DongNganCuoc = {
	id: string;
	loai: "Mục tiêu" | "KR";
	chu: string;
	trangThai: string;
	ma?: string;
};

export const DONG_NGAN_CUOC: DongNganCuoc[] = [
	{
		id: "n1",
		loai: "Mục tiêu",
		chu: "Không thoả thuận nào của miền Nam bị mất dấu",
		trangThai: "Qua bộ kiểm",
	},
	{
		id: "n2",
		loai: "KR",
		chu: "Thoả thuận không cập nhật quá 14 ngày",
		trangThai: "Qua bộ kiểm",
	},
	{
		id: "n3",
		loai: "KR",
		chu: "Doanh thu tuyến Sài Gòn – Cần Thơ đạt 3,8 tỉ",
		trangThai: "Bị loại",
		ma: "SO-MOI",
	},
	{
		id: "n4",
		loai: "Mục tiêu",
		chu: "Tuyến miền Tây có khách ghép hàng đều mỗi tuần",
		trangThai: "Qua bộ kiểm",
	},
];
