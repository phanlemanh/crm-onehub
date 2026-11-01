import type { LyDoLoi } from "@/lib/ly-do-loi";

export type DoiTuong =
	| "deal"
	| "lien-he"
	| "cong-ty"
	| "ke-hoach"
	| "muc-tieu"
	| "kr"
	| "so-kr";

export type TrangNgan = "dang-tai" | "loi" | "du";

export type MauNgan = {
	ten: string;
	tieuDe: string;
	moTa: string;
	oSo: readonly { nhan: string; giaTri: string }[];
	the: readonly { id: string; nhan: string; doan: readonly string[] }[];
	theGiuaThan: boolean;
	loi: { lyDo: LyDoLoi; tieuDe?: string; moTa?: string; nut?: string };
};

export const DOI_TUONG: readonly DoiTuong[] = [
	"deal",
	"lien-he",
	"cong-ty",
	"ke-hoach",
	"muc-tieu",
	"kr",
	"so-kr",
];

export const TRANG: readonly TrangNgan[] = ["dang-tai", "loi", "du"];

export const NHAN_TRANG = {
	"dang-tai": "đang tải",
	loi: "lỗi tải",
	du: "đủ dữ liệu",
} satisfies Record<TrangNgan, string>;

export const MAU = {
	deal: {
		ten: "Deal",
		tieuDe:
			"Gia hạn hợp đồng phân phối miền Trung — Công ty Cổ phần Thương mại Dịch vụ Hải Vân 2027",
		moTa: "Công ty Cổ phần Thương mại Dịch vụ Hải Vân · Đàm phán",
		oSo: [
			{ nhan: "Giá trị", giaTri: "1.250.000.000 ₫" },
			{ nhan: "Ngày chốt", giaTri: "15/12/2026" },
			{ nhan: "Xác suất", giaTri: "60%" },
		],
		the: [
			{
				id: "tong-quan",
				nhan: "Tổng quan",
				doan: [
					"Khách đề nghị chiết khấu 4% cho đơn trên 500 triệu.",
					"Bên mua cần bản hợp đồng song ngữ trước 30/11.",
				],
			},
			{
				id: "hoat-dong",
				nhan: "Hoạt động",
				doan: [
					"28/10 · Gọi điện với chị Lan — chốt lịch gặp.",
					"25/10 · Gửi báo giá lần 2.",
				],
			},
		],
		theGiuaThan: false,
		loi: { lyDo: "mat-ket-noi" },
	},
	"lien-he": {
		ten: "Liên hệ",
		tieuDe: "Nguyễn Thị Phương Lan",
		moTa: "Trưởng phòng mua hàng · Hải Vân",
		oSo: [
			{ nhan: "Deal mở", giaTri: "3" },
			{ nhan: "Lần chạm gần nhất", giaTri: "28/10" },
		],
		the: [
			{
				id: "tong-quan",
				nhan: "Tổng quan",
				doan: [
					"Ưu tiên liên lạc qua Zalo buổi sáng.",
					"Phụ trách ba vùng: Đà Nẵng, Huế, Quảng Nam.",
				],
			},
			{ id: "thu", nhan: "Thư", doan: ["Re: Báo giá phân phối quý I/2027"] },
		],
		theGiuaThan: false,
		loi: { lyDo: "khong-quyen" },
	},
	"cong-ty": {
		ten: "Công ty",
		tieuDe: "Công ty Cổ phần Thương mại Dịch vụ Hải Vân",
		moTa: "haivan.vn · Phân phối hàng tiêu dùng · Đà Nẵng",
		oSo: [
			{ nhan: "Deal", giaTri: "5" },
			{ nhan: "Liên hệ", giaTri: "12" },
			{ nhan: "Doanh thu năm", giaTri: "3,4 tỷ ₫" },
		],
		the: [
			{
				id: "tong-quan",
				nhan: "Tổng quan",
				doan: ["Đối tác phân phối cấp 1 từ 2023."],
			},
			{
				id: "ke-hoach",
				nhan: "Kế hoạch",
				doan: ["Onboarding đại lý mới — bước 3/7."],
			},
		],
		theGiuaThan: false,
		loi: { lyDo: "khong-con" },
	},
	"ke-hoach": {
		ten: "Kế hoạch",
		tieuDe: "Onboarding đại lý Hải Vân — 30 ngày đầu",
		moTa: "Theo khuôn «Đại lý cấp 1» · Bắt đầu 12/10/2026",
		oSo: [
			{ nhan: "Bước xong", giaTri: "3/7" },
			{ nhan: "Trễ hạn", giaTri: "1" },
		],
		the: [
			{
				id: "buoc",
				nhan: "Các bước",
				doan: [
					"Ký hợp đồng — xong",
					"Đào tạo bán hàng — đang làm",
					"Trưng bày điểm bán — chưa bắt đầu",
				],
			},
		],
		theGiuaThan: false,
		loi: { lyDo: "mat-ket-noi" },
	},
	"muc-tieu": {
		ten: "Mục tiêu",
		tieuDe:
			"Mở rộng mạng lưới phân phối miền Trung lên 40 đại lý hoạt động trước quý II/2027",
		moTa: "Khối Kinh doanh · Quý IV/2026",
		oSo: [
			{ nhan: "Tiến độ", giaTri: "58%" },
			{ nhan: "KR đến hạn", giaTri: "2" },
		],
		the: [
			{
				id: "okr",
				nhan: "OKR",
				doan: [
					"KR1 · Ký mới 12 đại lý — 7/12",
					"KR2 · Doanh số đại lý mới đạt 2 tỷ — 0,9 tỷ",
				],
			},
			{
				id: "trao-doi",
				nhan: "Trao đổi",
				doan: ["Anh Minh: cần thêm ngân sách trưng bày cho Quảng Ngãi."],
			},
		],
		theGiuaThan: false,
		loi: { lyDo: "khong-con" },
	},
	kr: {
		ten: "KR",
		tieuDe:
			"Ký mới 12 đại lý cấp 1 tại các tỉnh duyên hải miền Trung có doanh số tháng đầu trên 50 triệu",
		moTa: "Mục tiêu: Mở rộng mạng lưới phân phối miền Trung",
		oSo: [
			{ nhan: "Hiện tại", giaTri: "7 / 12" },
			{ nhan: "Cập nhật gần nhất", giaTri: "28/10" },
		],
		the: [
			{
				id: "viec",
				nhan: "Việc",
				doan: ["Gặp đại lý Tam Kỳ — 05/11", "Gửi hồ sơ năng lực cho Quy Nhơn"],
			},
			{
				id: "bang-chung",
				nhan: "Bằng chứng",
				doan: ["Hợp đồng đại lý Hội An (PDF)"],
			},
		],
		theGiuaThan: true,
		loi: {
			lyDo: "khong-con",
			tieuDe: "Không thấy KR",
			moTa: "KR này đã bị gỡ khỏi mục tiêu hoặc bạn không còn xem được.",
			nut: "Về mục tiêu",
		},
	},
	"so-kr": {
		ten: "Số KR",
		tieuDe: "Số đại lý mới ký trong quý",
		moTa: "Đếm deal giai đoạn «Đã ký» có nhãn «Đại lý mới»",
		oSo: [
			{ nhan: "Số đã chụp", giaTri: "7" },
			{ nhan: "Ngày chụp", giaTri: "31/10" },
		],
		the: [],
		theGiuaThan: false,
		loi: {
			lyDo: "mat-ket-noi",
			tieuDe: "Không tải được số",
			moTa: "Máy chủ không trả lời. Thử lại sau ít phút.",
			nut: "Thử lại",
		},
	},
} satisfies Record<DoiTuong, MauNgan>;

export const st = (dt: DoiTuong, tt: TrangNgan) => `ST-${dt}-${tt}`;

export const ST_SO_KR_CU = {
	dangTai: "ST-kr-cu-moi-dang-tai",
	loi: "ST-kr-cu-moi-loi",
} as const;
