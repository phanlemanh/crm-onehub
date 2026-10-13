import type { NghiaTrangThai } from "@crm/ui/lib/status-tone";

export type TrangThaiViec =
	| "chua-lam"
	| "dang-lam"
	| "cho-danh-gia"
	| "xong"
	| "huy";

export const NHAN_TRANG_THAI = {
	"chua-lam": "Chưa làm",
	"dang-lam": "Đang làm",
	"cho-danh-gia": "Chờ đánh giá",
	xong: "Xong",
	huy: "Đã huỷ",
} satisfies Record<TrangThaiViec, string>;

export const NGHIA_TRANG_THAI = {
	"chua-lam": "nhap",
	"dang-lam": "dangChay",
	"cho-danh-gia": "cho",
	xong: "xong",
} satisfies Record<Exclude<TrangThaiViec, "huy">, NghiaTrangThai>;

export type ViecMau = {
	id: string;
	tieuDe: string;
	trangThai: TrangThaiViec;
	han: string | null;
	quaHan: boolean;
	banGhi: string | null;
	nguoiGiao: string;
	nguoiThucHien: string;
};

export const TOI = "Phạm Thu Hà";

export const VIEC_QUA_HAN: ViecMau = {
	id: "v1",
	tieuDe: "Gửi bảng phí mới cho anh Tuấn",
	trangThai: "chua-lam",
	han: "Quá hạn 2 ngày",
	quaHan: true,
	banGhi: "Thoả thuận An Phát · gói đại lý",
	nguoiGiao: "Lê Quang Vinh",
	nguoiThucHien: TOI,
};

export const VIEC_DANG_LAM: ViecMau = {
	id: "v2",
	tieuDe: "Gọi xác nhận lịch đào tạo tuần đầu",
	trangThai: "dang-lam",
	han: "Hôm nay",
	quaHan: false,
	banGhi: "Kế hoạch 30 ngày · Công ty Minh Long",
	nguoiGiao: "Lê Quang Vinh",
	nguoiThucHien: TOI,
};

export const VIEC_GIAO_CHO_TOI: ViecMau[] = [
	VIEC_QUA_HAN,
	VIEC_DANG_LAM,
	{
		id: "v3",
		tieuDe: "Kiểm hồ sơ pháp lý bản cuối",
		trangThai: "cho-danh-gia",
		han: "Thứ Hai 20/10",
		quaHan: false,
		banGhi: "Thoả thuận Hưng Thịnh · môi giới khu Đông",
		nguoiGiao: "Nguyễn Hải Yến",
		nguoiThucHien: TOI,
	},
	{
		id: "v4",
		tieuDe: "Đọc lại ghi chú buổi gặp quý trước",
		trangThai: "chua-lam",
		han: null,
		quaHan: false,
		banGhi: null,
		nguoiGiao: TOI,
		nguoiThucHien: TOI,
	},
];

export const VIEC_TOI_GIAO: ViecMau[] = [
	{
		id: "v5",
		tieuDe: "Chuẩn bị hợp đồng mẫu cho đối tác mới",
		trangThai: "dang-lam",
		han: "Thứ Sáu 17/10",
		quaHan: false,
		banGhi: "Thoả thuận An Phát · gói đại lý",
		nguoiGiao: TOI,
		nguoiThucHien: "Trần Minh Khoa",
	},
];

export const VIEC_DANG_THEO_DOI: ViecMau[] = [
	{
		id: "v6",
		tieuDe: "Hoàn tất mở tài khoản giao dịch",
		trangThai: "chua-lam",
		han: "Thứ Tư 15/10",
		quaHan: false,
		banGhi: "Kế hoạch 30 ngày · Công ty Minh Long",
		nguoiGiao: "Lê Quang Vinh",
		nguoiThucHien: "Đỗ Thảo",
	},
];

export const SO_DA_XONG = 2;
export const SO_DA_HUY = 1;

export type VetMau = {
	ai: string;
	lam: string;
	luc: string;
	nguon: string;
};

export const LICH_SU: VetMau[] = [
	{
		ai: TOI,
		lam: "chuyển «Chưa làm» sang «Đang làm»",
		luc: "09:12 hôm nay",
		nguon: "qua Zalo",
	},
	{
		ai: "Lê Quang Vinh",
		lam: "đổi hạn từ 12/10 sang 13/10",
		luc: "17:40 hôm qua",
		nguon: "trên màn",
	},
	{
		ai: "Lê Quang Vinh",
		lam: "giao việc cho Phạm Thu Hà",
		luc: "10:05 ngày 10/10",
		nguon: "trên màn",
	},
];

export type SuKienMau = { id: string; loai: string; chu: string; luc: string };

export const DONG_SU_KIEN: SuKienMau[] = [
	{
		id: "s1",
		loai: "Ghi chú",
		chu: "Đối tác muốn thêm điều khoản hoàn phí trong 30 ngày đầu.",
		luc: "Hôm qua",
	},
	{
		id: "s2",
		loai: "Cuộc gọi",
		chu: "Gọi anh Tuấn 12 phút — chốt lịch gặp thứ Năm.",
		luc: "11/10",
	},
	{
		id: "s3",
		loai: "Đổi giai đoạn",
		chu: "Từ «Tiếp cận» sang «Đàm phán».",
		luc: "08/10",
	},
];

export const NGUOI_CHON = [
	{ value: "toi", label: "Tôi" },
	{ value: "khoa", label: "Trần Minh Khoa" },
	{ value: "thao", label: "Đỗ Thảo" },
	{ value: "yen", label: "Nguyễn Hải Yến" },
];

export const CHU = {
	tieuDeTrang: "Việc của tôi",
	moTaTrang:
		"Việc người khác giao cho bạn, việc bạn giao, và việc bạn đang theo dõi.",
	giaoViec: "Giao việc",
	toi: "Tôi",
	nhomGiaoChoToi: "Giao cho tôi",
	nhomToiGiao: "Tôi giao",
	nhomTheoDoi: "Đang theo dõi",
	cotViec: "Việc",
	cotTrangThai: "Trạng thái",
	cotHan: "Hạn",
	cotGan: "Gắn với",
	cotNguoiGiao: "Người giao",
	daXong: (n: number) => `Đã xong (${n})`,
	daHuy: (n: number) => `Đã huỷ (${n})`,
	rongTieuDe: "Chưa có việc nào giao cho bạn",
	rongMoTa:
		"Việc người khác giao cho bạn sẽ hiện ở đây, cùng việc bạn tự giao cho mình.",
	loiTieuDe: "Không tải được danh sách việc",
	loiMoTa: "Máy chủ không trả lời. Danh sách việc của bạn vẫn còn nguyên.",
	khongGan: "Việc riêng",
	khoiViec: "Việc",
	tabChiTiet: "Chi tiết",
	tabLichSu: "Lịch sử",
	nguoiGiao: "Người giao",
	nguoiThucHien: "Người thực hiện",
	nguoiTheoDoi: "Người theo dõi",
	han: "Hạn",
	ganVoi: "Gắn với",
	batDau: "Bắt đầu",
	guiDanhGia: "Gửi đánh giá",
	xong: "Xong",
	lamLai: "Làm lại",
	huy: "Huỷ",
	moLai: "Mở lại",
	xoa: "Xoá",
	chiXem: "Chỉ người giao và người thực hiện đổi được trạng thái.",
	loaiGhiChu: "Ghi chú",
	loaiViec: "Việc",
	tieuDeViec: "Việc cần làm…",
	moTaViec: "Thêm mô tả…",
	chonHan: "Chọn hạn",
	theoDoiThem: "Thêm người theo dõi",
	dangGiao: "Đang giao…",
	loiTao:
		"Không giao được việc — máy chủ không trả lời. Chữ bạn gõ vẫn còn, thử lại.",
	phuongAnTron: "Lối khác — trộn việc vào dòng sự kiện theo ngày tạo",
	mayKhuyen:
		"Máy khuyên khối «Việc» ghim đầu thẻ (state ST-khoi-viec-ban-ghi): việc là thứ phải làm, nên đứng trên; trộn theo ngày tạo thì việc giao tuần trước trôi khỏi tầm mắt.",
};
