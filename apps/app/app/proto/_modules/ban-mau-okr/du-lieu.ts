export type MucTuTin = "cao" | "vua" | "thap";

export type LoaiMucTieu = "cam-ket" | "tham-vong";

export type NguoiMau = { id: string; ten: string };

export type KrMau = {
	id: string;
	ten: string;
	phuTrach: NguoiMau;
	kieu: "so" | "moc";
	khoiDiem: number;
	dich: number;
	hienTai: number;
	donVi: string;
	tuTin: MucTuTin;
	capNhatLuc: string | null;
	ghiChu: string | null;
	imNgay: number;
};

export type NoiGopMau = { donVi: string; mucTieu: string; kr: string | null };

export type MucTieuMau = {
	id: string;
	ten: string;
	donVi: string;
	loai: LoaiMucTieu;
	phuTrach: NguoiMau;
	gopVao: NoiGopMau[];
	kr: KrMau[];
};

export type DonViMau = {
	id: string;
	ten: string;
	cap: "goc" | "bo-phan" | "phong-ban";
	truong: NguoiMau | null;
	con: DonViMau[];
};

export const KY = {
	ten: "Quý 4 · 2026",
	tuan: "Tuần 6/10",
	homNay: "Thứ Hai 30/11",
	kyVong: 47,
	hanCapNhat: "hết hôm nay",
} as const;

export const CHU_KY_KHAC = [
	"Năm 2026",
	"Quý 4 · 2026",
	"Quý 3 · 2026",
] as const;

const n = (id: string, ten: string): NguoiMau => ({ id, ten });

export const NGUOI = {
	lan: n("lan", "Nguyễn Thị Lan"),
	hung: n("hung", "Trần Văn Hùng"),
	mai: n("mai", "Lê Thanh Mai"),
	duc: n("duc", "Phạm Minh Đức"),
	thao: n("thao", "Võ Phương Thảo"),
	khoa: n("khoa", "Đặng Anh Khoa"),
	nga: n("nga", "Bùi Thu Nga"),
	tuan: n("tuan", "Hoàng Quốc Tuấn"),
	son: n("son", "Đỗ Hải Sơn"),
} as const;

export const TOI = NGUOI.nga;

export const CAY_DON_VI: DonViMau = {
	id: "onehub",
	ten: "OneHub",
	cap: "goc",
	truong: NGUOI.son,
	con: [
		{
			id: "kinhdoanh",
			ten: "Kinh doanh",
			cap: "bo-phan",
			truong: NGUOI.lan,
			con: [
				{
					id: "kd1",
					ten: "Kinh doanh vùng 1",
					cap: "phong-ban",
					truong: NGUOI.hung,
					con: [],
				},
				{
					id: "kd2",
					ten: "Kinh doanh vùng 2",
					cap: "phong-ban",
					truong: NGUOI.duc,
					con: [],
				},
			],
		},
		{
			id: "vanhanh",
			ten: "Vận hành",
			cap: "bo-phan",
			truong: null,
			con: [
				{
					id: "cskh",
					ten: "Chăm sóc khách hàng",
					cap: "phong-ban",
					truong: NGUOI.thao,
					con: [],
				},
				{
					id: "kho",
					ten: "Kho vận",
					cap: "phong-ban",
					truong: null,
					con: [],
				},
			],
		},
		{
			id: "taichinh",
			ten: "Tài chính",
			cap: "bo-phan",
			truong: NGUOI.khoa,
			con: [
				{
					id: "ketoan",
					ten: "Kế toán",
					cap: "phong-ban",
					truong: NGUOI.khoa,
					con: [],
				},
			],
		},
	],
};

export const CHUA_XEP: DonViMau[] = [
	{ id: "phapche", ten: "Pháp chế", cap: "phong-ban", truong: null, con: [] },
];

const kr = (
	id: string,
	ten: string,
	phuTrach: NguoiMau,
	so: [number, number, number],
	donVi: string,
	tuTin: MucTuTin,
	capNhatLuc: string | null,
	ghiChu: string | null = null,
	imNgay = 0,
): KrMau => ({
	id,
	ten,
	phuTrach,
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

export const MT_ONEHUB_1: MucTieuMau = {
	id: "o1",
	ten: "Mạng lưới đối tác đủ dày để tự kéo người mới vào",
	donVi: "OneHub",
	loai: "tham-vong",
	phuTrach: NGUOI.son,
	gopVao: [],
	kr: [
		kr(
			"o1k1",
			"Công ty ký thoả thuận hợp tác mới",
			NGUOI.lan,
			[0, 40, 17],
			"công ty",
			"vua",
			"23/11",
		),
		kr(
			"o1k2",
			"Cá nhân hoàn tất 30 ngày đầu",
			NGUOI.thao,
			[0, 300, 96],
			"cá nhân",
			"vua",
			"30/11",
		),
	],
};

export const MT_ONEHUB_2: MucTieuMau = {
	id: "o2",
	ten: "Cả công ty vận hành trên một công cụ",
	donVi: "OneHub",
	loai: "cam-ket",
	phuTrach: NGUOI.son,
	gopVao: [],
	kr: [
		kr(
			"o2k1",
			"Phòng ban cập nhật OKR mỗi tuần",
			NGUOI.khoa,
			[0, 100, 82],
			"%",
			"cao",
			"30/11",
		),
		kr(
			"o2k2",
			"Kế hoạch 30 ngày đóng đúng hạn",
			NGUOI.thao,
			[60, 90, 71],
			"%",
			"vua",
			"23/11",
		),
	],
};

export const MT_VANHANH: MucTieuMau = {
	id: "v1",
	ten: "Đối tác mới tự chạy được sau tháng đầu",
	donVi: "Vận hành",
	loai: "cam-ket",
	phuTrach: NGUOI.thao,
	gopVao: [
		{
			donVi: "OneHub",
			mucTieu: MT_ONEHUB_1.ten,
			kr: "Cá nhân hoàn tất 30 ngày đầu",
		},
	],
	kr: [
		kr(
			"v1k1",
			"Kế hoạch 30 ngày không có bước quá hạn",
			NGUOI.thao,
			[40, 80, 58],
			"%",
			"vua",
			"30/11",
		),
	],
};

export const MT_CSKH_1: MucTieuMau = {
	id: "c1",
	ten: "Đối tác mới được đỡ trọn tháng đầu",
	donVi: "Chăm sóc khách hàng",
	loai: "cam-ket",
	phuTrach: NGUOI.thao,
	gopVao: [
		{
			donVi: "OneHub",
			mucTieu: MT_ONEHUB_1.ten,
			kr: "Cá nhân hoàn tất 30 ngày đầu",
		},
		{ donVi: "Vận hành", mucTieu: MT_VANHANH.ten, kr: null },
	],
	kr: [
		kr(
			"c1k1",
			"Thời gian phản hồi đối tác, trung vị",
			NGUOI.nga,
			[8, 2, 3.5],
			"giờ",
			"cao",
			"23/11",
			"Trực ca tối từ 16/11, tuần này ổn định.",
		),
		kr(
			"c1k2",
			"Đối tác chấm hài lòng từ 4/5",
			NGUOI.nga,
			[60, 85, 74],
			"%",
			"vua",
			"23/11",
			"Hai công ty mới chấm thấp vì chờ tài khoản.",
		),
		{
			...kr(
				"c1k3",
				"Bộ câu hỏi thường gặp công bố cho đối tác",
				NGUOI.nga,
				[0, 1, 0],
				"",
				"thap",
				"15/11",
				"Chờ pháp chế duyệt điều khoản.",
				15,
			),
			kieu: "moc",
		},
		kr(
			"c1k4",
			"Công ty mới có buổi gặp tuần đầu",
			NGUOI.thao,
			[0, 100, 64],
			"%",
			"vua",
			"30/11",
		),
	],
};

export const MT_CSKH_2: MucTieuMau = {
	id: "c2",
	ten: "Đội tự đọc được số của mình mỗi tuần",
	donVi: "Chăm sóc khách hàng",
	loai: "tham-vong",
	phuTrach: NGUOI.thao,
	gopVao: [
		{
			donVi: "OneHub",
			mucTieu: MT_ONEHUB_2.ten,
			kr: "Phòng ban cập nhật OKR mỗi tuần",
		},
	],
	kr: [
		kr(
			"c2k1",
			"Báo cáo tuần tự dựng từ CRM",
			NGUOI.nga,
			[0, 12, 3],
			"báo cáo",
			"vua",
			"23/11",
			"Mới dựng xong khuôn đầu tiên.",
		),
	],
};

export const MT_KINHDOANH: MucTieuMau = {
	id: "k1",
	ten: "Mở rộng mạng lưới công ty ở phía Nam",
	donVi: "Kinh doanh",
	loai: "tham-vong",
	phuTrach: NGUOI.lan,
	gopVao: [
		{
			donVi: "OneHub",
			mucTieu: MT_ONEHUB_1.ten,
			kr: "Công ty ký thoả thuận hợp tác mới",
		},
	],
	kr: [
		kr(
			"k1k1",
			"Thoả thuận ký mới ở TP.HCM và Bình Dương",
			NGUOI.lan,
			[0, 25, 9],
			"thoả thuận",
			"vua",
			"30/11",
		),
	],
};

export const MT_KD1: MucTieuMau = {
	id: "kd1o",
	ten: "Mỗi quận trung tâm có ba công ty đối tác",
	donVi: "Kinh doanh vùng 1",
	loai: "tham-vong",
	phuTrach: NGUOI.hung,
	gopVao: [
		{
			donVi: "Kinh doanh",
			mucTieu: MT_KINHDOANH.ten,
			kr: "Thoả thuận ký mới ở TP.HCM và Bình Dương",
		},
	],
	kr: [
		kr(
			"kd1k1",
			"Quận có đủ ba công ty",
			NGUOI.hung,
			[2, 12, 5],
			"quận",
			"thap",
			"16/11",
			null,
			14,
		),
	],
};

export const MT_KD2: MucTieuMau = {
	id: "kd2o",
	ten: "Bình Dương có đầu mối ký hằng tuần",
	donVi: "Kinh doanh vùng 2",
	loai: "cam-ket",
	phuTrach: NGUOI.duc,
	gopVao: [
		{
			donVi: "Kinh doanh",
			mucTieu: MT_KINHDOANH.ten,
			kr: "Thoả thuận ký mới ở TP.HCM và Bình Dương",
		},
		{
			donVi: "OneHub",
			mucTieu: MT_ONEHUB_1.ten,
			kr: "Công ty ký thoả thuận hợp tác mới",
		},
	],
	kr: [
		kr(
			"kd2k1",
			"Thoả thuận ký mới ở Bình Dương",
			NGUOI.duc,
			[0, 10, 6],
			"thoả thuận",
			"cao",
			"30/11",
		),
	],
};

export const MT_KETOAN: MucTieuMau = {
	id: "kt1",
	ten: "Đóng sổ tháng trong năm ngày làm việc",
	donVi: "Kế toán",
	loai: "cam-ket",
	phuTrach: NGUOI.khoa,
	gopVao: [],
	kr: [
		kr(
			"kt1k1",
			"Ngày làm việc để đóng sổ tháng",
			NGUOI.khoa,
			[9, 5, 6],
			"ngày",
			"cao",
			"30/11",
		),
	],
};

export const MUC_TIEU_CUA_DON_VI = new Map<string, MucTieuMau[]>([
	["onehub", [MT_ONEHUB_1, MT_ONEHUB_2]],
	["kinhdoanh", [MT_KINHDOANH]],
	["kd1", [MT_KD1]],
	["kd2", [MT_KD2]],
	["vanhanh", [MT_VANHANH]],
	["cskh", [MT_CSKH_1, MT_CSKH_2]],
	["kho", []],
	["taichinh", []],
	["ketoan", [MT_KETOAN]],
	["phapche", []],
]);

export const MUC_TIEU_CUA_TOI: MucTieuMau[] = [MT_CSKH_1, MT_CSKH_2];

export const KR_CUA_TOI: { kr: KrMau; mucTieu: MucTieuMau }[] =
	MUC_TIEU_CUA_TOI.flatMap((mt) =>
		mt.kr
			.filter((k) => k.phuTrach.id === TOI.id)
			.map((k) => ({ kr: k, mucTieu: mt })),
	);

export type ViecMau = {
	id: string;
	cau: string;
	phu: string;
	loai: "cap-nhat" | "nhac-ten" | "im";
};

export const VIEC_CUA_TOI: ViecMau[] = [
	{
		id: "v1",
		cau: "4 KR chờ cập nhật tuần này",
		phu: "Hạn: hết hôm nay, Thứ Hai 30/11",
		loai: "cap-nhat",
	},
	{
		id: "v2",
		cau: "Võ Phương Thảo nhắc tên bạn ở KR «Đối tác chấm hài lòng từ 4/5»",
		phu: "2 giờ trước",
		loai: "nhac-ten",
	},
	{
		id: "v3",
		cau: "KR «Bộ câu hỏi thường gặp công bố cho đối tác» im 15 ngày",
		phu: "Cập nhật gần nhất 15/11",
		loai: "im",
	},
];

export type HangToanCanh = {
	id: string;
	ten: string;
	cap: "bo-phan" | "phong-ban";
	tienDo: number;
	tuTin: Record<MucTuTin, number>;
	daCapNhat: number;
	tongKr: number;
	dangBan: string | null;
	theoTuan: (number | null)[];
};

export const TUAN_CUA_KY = [
	"26/10",
	"02/11",
	"09/11",
	"16/11",
	"23/11",
	"30/11",
	"07/12",
	"14/12",
	"21/12",
	"28/12",
] as const;

export const TOAN_CANH: HangToanCanh[] = [
	{
		id: "kinhdoanh",
		ten: "Kinh doanh",
		cap: "bo-phan",
		tienDo: 38,
		tuTin: { cao: 3, vua: 5, thap: 2 },
		daCapNhat: 8,
		tongKr: 10,
		dangBan: "2 KR tự tin tụt tuần này",
		theoTuan: [null, 70, 60, 50, 40, 30, null, null, null, null],
	},
	{
		id: "kd1",
		ten: "Kinh doanh vùng 1",
		cap: "phong-ban",
		tienDo: 31,
		tuTin: { cao: 1, vua: 2, thap: 2 },
		daCapNhat: 3,
		tongKr: 5,
		dangBan: "1 KR im 14 ngày",
		theoTuan: [null, 60, 60, 40, 20, 20, null, null, null, null],
	},
	{
		id: "kd2",
		ten: "Kinh doanh vùng 2",
		cap: "phong-ban",
		tienDo: 52,
		tuTin: { cao: 2, vua: 3, thap: 0 },
		daCapNhat: 5,
		tongKr: 5,
		dangBan: null,
		theoTuan: [null, 80, 60, 60, 60, 40, null, null, null, null],
	},
	{
		id: "vanhanh",
		ten: "Vận hành",
		cap: "bo-phan",
		tienDo: 49,
		tuTin: { cao: 3, vua: 6, thap: 1 },
		daCapNhat: 7,
		tongKr: 10,
		dangBan: "3 KR chưa cập nhật tuần này",
		theoTuan: [null, 50, 50, 40, 40, 30, null, null, null, null],
	},
	{
		id: "cskh",
		ten: "Chăm sóc khách hàng",
		cap: "phong-ban",
		tienDo: 51,
		tuTin: { cao: 2, vua: 4, thap: 1 },
		daCapNhat: 3,
		tongKr: 7,
		dangBan: "Ghi chú mới: chờ pháp chế duyệt",
		theoTuan: [null, 60, 60, 40, 40, 30, null, null, null, null],
	},
	{
		id: "kho",
		ten: "Kho vận",
		cap: "phong-ban",
		tienDo: 44,
		tuTin: { cao: 1, vua: 2, thap: 0 },
		daCapNhat: 3,
		tongKr: 3,
		dangBan: null,
		theoTuan: [null, 30, 30, 30, 40, 30, null, null, null, null],
	},
	{
		id: "taichinh",
		ten: "Tài chính",
		cap: "bo-phan",
		tienDo: 61,
		tuTin: { cao: 4, vua: 1, thap: 0 },
		daCapNhat: 5,
		tongKr: 5,
		dangBan: null,
		theoTuan: [null, 80, 80, 80, 100, 80, null, null, null, null],
	},
	{
		id: "ketoan",
		ten: "Kế toán",
		cap: "phong-ban",
		tienDo: 61,
		tuTin: { cao: 4, vua: 1, thap: 0 },
		daCapNhat: 5,
		tongKr: 5,
		dangBan: null,
		theoTuan: [null, 80, 80, 80, 100, 80, null, null, null, null],
	},
];

export const LICH_SU_KR = [
	{
		luc: "30/11",
		nguoi: NGUOI.thao,
		cau: "nhắc tên bạn: «Nga xem lại hai công ty chấm thấp nhé»",
	},
	{
		luc: "23/11",
		nguoi: NGUOI.nga,
		cau: "cập nhật 74% · tự tin Vừa · «Hai công ty mới chấm thấp vì chờ tài khoản.»",
	},
	{ luc: "16/11", nguoi: NGUOI.nga, cau: "cập nhật 71% · tự tin Cao" },
	{ luc: "09/11", nguoi: NGUOI.nga, cau: "cập nhật 66% · tự tin Cao" },
	{ luc: "02/11", nguoi: NGUOI.thao, cau: "công bố mục tiêu, khởi điểm 60%" },
] as const;
