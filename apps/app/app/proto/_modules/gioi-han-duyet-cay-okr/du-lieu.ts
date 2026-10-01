export type NguoiMau = { id: string; ten: string };

const n = (id: string, ten: string): NguoiMau => ({ id, ten });

export const NGUOI = {
	quan: n("quan", "Vũ Đình Quân"),
	minh: n("minh", "Lê Minh"),
	ha: n("ha", "Trần Hà"),
	trang: n("trang", "Phạm Thu Trang"),
	ngoc: n("ngoc", "Ngô Bảo Ngọc"),
	tuan: n("tuan", "Đinh Văn Tuấn"),
	linh: n("linh", "Hồ Mỹ Linh"),
	phuc: n("phuc", "Lâm Gia Phúc"),
	yen: n("yen", "Mai Hải Yến"),
	khang: n("khang", "Tạ Minh Khang"),
} as const;

export const CONG_TY = "Hải Đăng Logistics";

export const KY = "Quý 4 · 2026";

const GIO_VN = new Intl.DateTimeFormat("vi-VN", {
	day: "2-digit",
	month: "2-digit",
	timeZone: "Asia/Ho_Chi_Minh",
});

export function ngay(iso: string): string {
	const phan = GIO_VN.formatToParts(new Date(iso));
	const lay = (loai: Intl.DateTimeFormatPartTypes) =>
		phan.find((p) => p.type === loai)?.value ?? "";
	return `${lay("day")}/${lay("month")}`;
}

export type KrMau = {
	id: string;
	ten: string;
	phuTrach: NguoiMau;
	so: string;
	tienDo: number;
};

export type MucTieuMau = {
	id: string;
	ten: string;
	donVi: string;
	loai: "Cam kết" | "Tham vọng";
	phuTrach: NguoiMau;
	kr: KrMau[];
};

export const MT_GIOI_HAN: MucTieuMau = {
	id: "mt-phap-che",
	ten: "Hoàn tất rà soát hợp đồng thuê kho với đối tác Tân Cảng",
	donVi: "Pháp chế",
	loai: "Cam kết",
	phuTrach: NGUOI.trang,
	kr: [
		{
			id: "k1",
			ten: "Rà xong 18 hợp đồng thuê kho còn hiệu lực",
			phuTrach: NGUOI.trang,
			so: "11/18",
			tienDo: 61,
		},
		{
			id: "k2",
			ten: "Chốt phụ lục giá thuê năm 2027 với Tân Cảng",
			phuTrach: NGUOI.ngoc,
			so: "Chưa xong",
			tienDo: 0,
		},
	],
};

export const NGUOI_XEM = [NGUOI.ngoc, NGUOI.tuan] as const;

export const MT_DUYET: MucTieuMau = {
	id: "mt-kho-binh-duong",
	ten: "Mở rộng kho Bình Dương",
	donVi: "Kinh doanh vùng 1",
	loai: "Cam kết",
	phuTrach: NGUOI.ha,
	kr: [
		{
			id: "k1",
			ten: "Ký hợp đồng thuê 12.000 m² kho Tân Uyên",
			phuTrach: NGUOI.ha,
			so: "Chưa xong",
			tienDo: 0,
		},
		{
			id: "k2",
			ten: "Đưa 30 chủ hàng mới vào kho Bình Dương",
			phuTrach: NGUOI.linh,
			so: "0 → 30",
			tienDo: 0,
		},
		{
			id: "k3",
			ten: "Giữ tỉ lệ giao đúng hẹn trên 96%",
			phuTrach: NGUOI.tuan,
			so: "94% → 96%",
			tienDo: 0,
		},
	],
};

export const GUI_DUYET_LUC = "2026-09-29T02:15:00Z";

export const TRA_LAI_LUC = "2026-09-28T09:40:00Z";

export const LY_DO_TRA_LAI =
	"KR 2 chưa nói rõ chủ hàng mới tính từ lúc ký hay lúc nhập kho lần đầu — ghi rõ rồi gửi lại.";

export const LY_DO_DANG_GO = "Thiếu KR";

export const LY_DO_TOI_THIEU = 10;
export const LY_DO_TOI_DA = 500;
export const NGUOI_XEM_TOI_DA = 20;

export type ViecDuyet = {
	id: string;
	loai: "cho-duyet" | "cap-nhat" | "nhac-ten";
	cau: string;
	ten?: string;
	chiTiet: string;
};

export const VIEC_CUA_TOI: ViecDuyet[] = [
	{
		id: "v1",
		loai: "cho-duyet",
		cau: "Chờ bạn duyệt:",
		ten: MT_DUYET.ten,
		chiTiet: `${NGUOI.ha.ten} gửi ${ngay(GUI_DUYET_LUC)} · Kinh doanh vùng 1`,
	},
	{
		id: "v2",
		loai: "cho-duyet",
		cau: "Chờ bạn duyệt:",
		ten: "Giảm 15% chi phí vận chuyển nội tỉnh",
		chiTiet: `${NGUOI.yen.ten} gửi ${ngay("2026-09-27T03:00:00Z")} · Kinh doanh vùng 2`,
	},
	{
		id: "v3",
		loai: "cap-nhat",
		cau: "Cập nhật 3 KR của bạn tuần này",
		chiTiet: "Hạn hết thứ Sáu",
	},
	{
		id: "v4",
		loai: "nhac-ten",
		cau: `${NGUOI.khang.ten} nhắc tên bạn`,
		chiTiet: "Trong «Tăng doanh thu kho lạnh Long An»",
	},
];

export type DonViCay = {
	id: string;
	ten: string;
	con?: DonViCay[];
};

export const CAY_TO_CHUC: DonViCay[] = [
	{
		id: "goc",
		ten: CONG_TY,
		con: [
			{
				id: "khoi-kd",
				ten: "Khối Kinh doanh",
				con: [
					{ id: "kd1", ten: "Kinh doanh vùng 1" },
					{ id: "kd2", ten: "Kinh doanh vùng 2" },
					{ id: "kd3", ten: "Kinh doanh vùng 3" },
				],
			},
			{
				id: "khoi-ht",
				ten: "Khối Hỗ trợ",
				con: [
					{ id: "phap-che", ten: "Pháp chế" },
					{ id: "cskh", ten: "Chăm sóc khách hàng" },
				],
			},
		],
	},
];

export const PHONG_BAN_CHON = {
	id: "kd1",
	ten: "Kinh doanh vùng 1",
	boPhan: "Khối Kinh doanh",
	truong: NGUOI.ha,
	nguoi: [NGUOI.ha, NGUOI.linh, NGUOI.tuan],
	okrMo: 4,
} as const;

export type MucTieuChuyen = {
	id: string;
	ten: string;
	chiTiet: string;
	hong?: string;
};

export const MUC_TIEU_CHUYEN: MucTieuChuyen[] = [
	{
		id: "c1",
		ten: MT_DUYET.ten,
		chiTiet: `3 KR · Chờ duyệt · ${NGUOI.ha.ten}`,
	},
	{
		id: "c2",
		ten: "Tăng 25% sản lượng hàng lạnh qua cảng Cát Lái",
		chiTiet: `4 KR · Đã công bố · ${NGUOI.ha.ten}`,
	},
	{
		id: "c3",
		ten: "Tối ưu tuyến giao nội thành Thủ Đức",
		chiTiet: `2 KR · Đã công bố · ${NGUOI.linh.ten}`,
		hong: "Đã bỏ",
	},
	{
		id: "c4",
		ten: "Chuẩn hoá báo giá cho chủ hàng vừa và nhỏ",
		chiTiet: `3 KR · Nháp · ${NGUOI.tuan.ten}`,
	},
];

export const DON_VI_NHAN = [
	{ value: "kd2", label: "Kinh doanh vùng 2", hint: "Khối Kinh doanh" },
	{ value: "kd3", label: "Kinh doanh vùng 3", hint: "Khối Kinh doanh" },
	{ value: "phap-che", label: "Pháp chế", hint: "Khối Hỗ trợ" },
	{ value: "cskh", label: "Chăm sóc khách hàng", hint: "Khối Hỗ trợ" },
];

export type LyDoMoCoi = "luu-tru" | "khong-ai-sua" | "da-roi";

export type MucMoCoi = {
	id: string;
	ten: string;
	donVi: string;
	lyDo: LyDoMoCoi;
	chiTiet: string;
};

export const MO_COI: MucMoCoi[] = [
	{
		id: "o1",
		ten: "Chuẩn hoá quy trình nhận hàng ca đêm",
		donVi: "Kho vận Củ Chi",
		lyDo: "luu-tru",
		chiTiet: `lưu trữ ngày ${ngay("2026-09-12T08:00:00Z")}`,
	},
	{
		id: "o2",
		ten: "Giảm 20% hàng hư hỏng khi bốc xếp",
		donVi: "Kho vận Long An",
		lyDo: "khong-ai-sua",
		chiTiet: "chưa có trưởng ở cả hai cấp",
	},
	{
		id: "o3",
		ten: "Ký 5 hợp đồng khung với chủ hàng FDI",
		donVi: "Kinh doanh vùng 2",
		lyDo: "da-roi",
		chiTiet: `${NGUOI.phuc.ten} rời ngày ${ngay("2026-09-20T08:00:00Z")}`,
	},
];
