import type { NghiaTrangThai } from "@crm/ui/lib/status-tone";

export type TrangThaiMo = "chua-lam" | "dang-lam" | "cho-danh-gia";

export type Cot = TrangThaiMo | "xong";

export const THU_TU_COT: Cot[] = [
	"chua-lam",
	"dang-lam",
	"cho-danh-gia",
	"xong",
];

export const NHAN_COT = {
	"chua-lam": "Chưa làm",
	"dang-lam": "Đang làm",
	"cho-danh-gia": "Chờ đánh giá",
	xong: "Xong",
} satisfies Record<Cot, string>;

export const NGHIA_COT = {
	"chua-lam": "nhap",
	"dang-lam": "dangChay",
	"cho-danh-gia": "cho",
	xong: "xong",
} satisfies Record<Cot, NghiaTrangThai>;

export const DONG_TU = {
	"chua-lam": "Về «Chưa làm»",
	"dang-lam": "Bắt đầu",
	"cho-danh-gia": "Gửi đánh giá",
	xong: "Đánh dấu xong",
} satisfies Record<Cot, string>;

export type TheMau = {
	id: string;
	tieuDe: string;
	cot: Cot;
	han: string | null;
	quaHan: boolean;
	nguoiThucHien: string;
	chuyenDuoc: Cot[];
	con: { xong: number; tong: number } | null;
	cha: string | null;
};

export const TOI = "Phạm Thu Hà";

const GT_TU_CHUA_LAM: Cot[] = ["dang-lam", "cho-danh-gia", "xong"];
const GT_TU_DANG_LAM: Cot[] = ["chua-lam", "cho-danh-gia", "xong"];

export const VIEC_CHA: TheMau = {
	id: "p1",
	tieuDe: "Triển khai đại lý An Phát tháng 11",
	cot: "dang-lam",
	han: "31/10",
	quaHan: false,
	nguoiThucHien: TOI,
	chuyenDuoc: GT_TU_DANG_LAM,
	con: { xong: 1, tong: 3 },
	cha: null,
};

export const BANG_GIAO_CHO_TOI: TheMau[] = [
	{
		id: "v1",
		tieuDe: "Gửi bảng phí mới cho anh Tuấn",
		cot: "chua-lam",
		han: "10/10",
		quaHan: true,
		nguoiThucHien: TOI,
		chuyenDuoc: GT_TU_CHUA_LAM,
		con: null,
		cha: null,
	},
	{
		id: "k3",
		tieuDe: "Đặt lịch đào tạo môi giới đợt 1",
		cot: "chua-lam",
		han: "20/10",
		quaHan: false,
		nguoiThucHien: TOI,
		chuyenDuoc: GT_TU_CHUA_LAM,
		con: null,
		cha: VIEC_CHA.tieuDe,
	},
	{
		id: "v2",
		tieuDe: "Gọi lại chị Lan về hợp đồng đại lý",
		cot: "chua-lam",
		han: null,
		quaHan: false,
		nguoiThucHien: TOI,
		chuyenDuoc: GT_TU_CHUA_LAM,
		con: null,
		cha: null,
	},
	VIEC_CHA,
	{
		id: "v3",
		tieuDe: "Rà danh sách môi giới chưa kích hoạt",
		cot: "dang-lam",
		han: "15/10",
		quaHan: false,
		nguoiThucHien: TOI,
		chuyenDuoc: GT_TU_DANG_LAM,
		con: null,
		cha: null,
	},
	{
		id: "v4",
		tieuDe: "Báo cáo doanh số quý 3 cho phòng tài chính",
		cot: "cho-danh-gia",
		han: "14/10",
		quaHan: false,
		nguoiThucHien: TOI,
		chuyenDuoc: [],
		con: null,
		cha: null,
	},
	{
		id: "v5",
		tieuDe: "Cập nhật hồ sơ pháp lý công ty Bình Minh",
		cot: "xong",
		han: "12/10",
		quaHan: false,
		nguoiThucHien: TOI,
		chuyenDuoc: [],
		con: null,
		cha: null,
	},
];

export const SO_XONG_TONG = 6;

export const SO_HUY = 1;

export const BANG_DANG_THEO_DOI: TheMau[] = [
	{
		id: "t1",
		tieuDe: "Chuẩn bị hợp đồng khung Hải Đăng",
		cot: "dang-lam",
		han: "18/10",
		quaHan: false,
		nguoiThucHien: "Lê Minh Quân",
		chuyenDuoc: [],
		con: null,
		cha: null,
	},
	{
		id: "t2",
		tieuDe: "Xác minh giấy phép kinh doanh đối tác mới",
		cot: "chua-lam",
		han: "22/10",
		quaHan: false,
		nguoiThucHien: "Nguyễn Hải Yến",
		chuyenDuoc: [],
		con: null,
		cha: null,
	},
];

export type ConMau = {
	id: string;
	tieuDe: string;
	nguoiThucHien: string;
	nhan: string;
	nghia: NghiaTrangThai | null;
};

export const VIEC_CON: ConMau[] = [
	{
		id: "k1",
		tieuDe: "Ký phụ lục hoa hồng với An Phát",
		nguoiThucHien: "Lê Minh Quân",
		nhan: "Xong",
		nghia: "xong",
	},
	{
		id: "k2",
		tieuDe: "Mở tài khoản đại lý trên hệ thống",
		nguoiThucHien: "Nguyễn Hải Yến",
		nhan: "Đang làm",
		nghia: "dangChay",
	},
	{
		id: "k3",
		tieuDe: "Đặt lịch đào tạo môi giới đợt 1",
		nguoiThucHien: TOI,
		nhan: "Chưa làm",
		nghia: "nhap",
	},
	{
		id: "k4",
		tieuDe: "Gửi bộ tài liệu bán hàng bản cũ",
		nguoiThucHien: "Lê Minh Quân",
		nhan: "Đã huỷ",
		nghia: null,
	},
];

export const NGUOI_CHON = [
	{ value: "toi", label: "Tôi" },
	{ value: "quan", label: "Lê Minh Quân" },
	{ value: "yen", label: "Nguyễn Hải Yến" },
];

export const CHU = {
	tieuDeTrang: "Việc của tôi",
	moTaTrang:
		"Việc người khác giao cho bạn, việc bạn giao và việc bạn đang theo dõi.",
	giaoViec: "Giao việc",
	kieuXem: "Kiểu xem",
	danhSach: "Danh sách",
	bang: "Bảng",
	nhomGiaoChoToi: "Giao cho tôi",
	nhomToiGiao: "Tôi giao",
	nhomTheoDoi: "Đang theo dõi",
	nhanBang: "Bảng việc theo trạng thái",
	chuyenSang: "Chuyển sang…",
	chuyenSangCua: (tieuDe: string) => `Chuyển «${tieuDe}» sang`,
	choDanhGiaKhoa: "Chỉ người giao xử lý việc đang chờ đánh giá.",
	conXong: (xong: number, tong: number) => `${xong}/${tong} việc con xong`,
	thuoc: (cha: string) => `Thuộc: ${cha}`,
	xongCu: (n: number) => `Xem ${n} việc xong cũ hơn ở Danh sách`,
	daHuy: (n: number) => `Đã huỷ (${n})`,
	rongCot: "Chưa có việc",
	loiTieuDe: "Không tải được bảng việc",
	loiMoTa: "Máy chủ không trả lời. Thử lại sau ít phút.",
	thuLai: "Thử lại",
	tuChoiTieuDe: "Không chuyển được việc",
	tuChoiMoTa:
		"Không chuyển được việc từ «Huỷ» sang «Đang làm». Bảng đã tải lại theo trạng thái mới nhất.",
	hoiDongTieuDe: "Đánh dấu xong việc cha?",
	hoiDongThan: (n: number) =>
		`Việc này còn ${n} việc con chưa xong. Vẫn đánh dấu xong?`,
	hoiDongNut: "Vẫn đánh dấu xong",
	thoi: "Thôi",
	viecCon: (xong: number, tong: number) => `Việc con (${xong}/${tong})`,
	themViecCon: "Thêm việc con",
	tieuDeViecCon: "Tiêu đề việc con",
	goiYTieuDe: "Ví dụ: Gửi hợp đồng cho phòng pháp chế…",
	nguoiThucHien: "Người thực hiện",
	han: "Hạn",
	them: "Thêm",
	thuocViec: "Thuộc việc",
	trangThai: "Trạng thái",
	nguoiGiao: "Người giao",
	ganVoi: "Gắn với",
	chiTiet: "Chi tiết",
};
