export type NguoiMau = { id: string; ten: string };

export type BuocMau = {
	id: string;
	nhan: string;
	boPhan: string;
	nguoi: NguoiMau | null;
	han: string;
	xong: boolean;
	quaHan: boolean;
};

export type GhiDanhMau = {
	id: string;
	ten: string;
	bac: [string | null, string | null, string | null, string | null];
};

export type VetMau = {
	id: string;
	nguoi: string;
	cau: string;
	luc: string;
	laGhiChu: boolean;
};

export const NGUOI = {
	manh: { id: "u1", ten: "Phan Lê Mạnh" },
	thuong: { id: "u2", ten: "Trịnh Cẩm Thương" },
	tuan: { id: "u3", ten: "Tuấn Đỗ" },
} satisfies Record<string, NguoiMau>;

export const KE_HOACH = {
	doiTac: "One Mount",
	khuon: "Sàn giao dịch",
	batDau: "10/09/2026",
	mucTieu: "30 ngày",
	ngay: "12/30",
	camTrich: NGUOI.manh,
};

export const BUOC_CO_DU_LIEU: BuocMau[] = [
	{
		id: "b1",
		nhan: "Kickoff",
		boPhan: "Kinh doanh",
		nguoi: NGUOI.manh,
		han: "12/09/2026",
		xong: true,
		quaHan: false,
	},
	{
		id: "b2",
		nhan: "Thiết lập tài khoản",
		boPhan: "Sản phẩm công nghệ",
		nguoi: null,
		han: "20/09/2026",
		xong: false,
		quaHan: true,
	},
	{
		id: "b3",
		nhan: "Đào tạo sử dụng",
		boPhan: "Đào tạo",
		nguoi: NGUOI.thuong,
		han: "22/09/2026",
		xong: false,
		quaHan: false,
	},
	{
		id: "b4",
		nhan: "Chuyển dữ liệu tin đăng cũ",
		boPhan: "Sản phẩm công nghệ",
		nguoi: null,
		han: "26/09/2026",
		xong: false,
		quaHan: false,
	},
	{
		id: "b5",
		nhan: "Giao dịch đầu tiên",
		boPhan: "Đối tác thành công",
		nguoi: NGUOI.tuan,
		han: "09/10/2026",
		xong: false,
		quaHan: false,
	},
];

export const GHI_DANH: GhiDanhMau[] = [
	{ id: "g1", ten: "Trịnh Cẩm Thương", bac: ["22/09", "22/09", null, null] },
	{ id: "g2", ten: "Tuấn Đỗ", bac: [null, null, null, null] },
	{ id: "g3", ten: "Nguyễn Hải Yến", bac: ["15/09", "18/09", "21/09", null] },
];

const HO = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Vũ", "Đặng", "Bùi"];
const TEN = [
	"An",
	"Bình",
	"Chi",
	"Dũng",
	"Giang",
	"Hà",
	"Khánh",
	"Linh",
	"Minh",
	"Ngọc",
];

export const GHI_DANH_80: GhiDanhMau[] = Array.from({ length: 80 }, (_, i) => ({
	id: `n${i}`,
	ten: `${HO[i % HO.length]} ${TEN[(i * 3) % TEN.length]} ${i + 1}`,
	bac: [
		i % 2 === 0 ? "14/09" : null,
		i % 3 === 0 ? "18/09" : null,
		i % 5 === 0 ? "21/09" : null,
		i % 11 === 0 ? "22/09" : null,
	],
}));

export const BAC = [
	"Có tài khoản",
	"Xong khoá học",
	"Hoạt động",
	"Giao dịch đầu",
];

export const VET: VetMau[] = [
	{
		id: "v1",
		nguoi: "Trịnh Cẩm Thương",
		cau: "ghi chú: Đối tác xin dời buổi đào tạo sang chiều thứ Năm.",
		luc: "Hôm nay 09:14",
		laGhiChu: true,
	},
	{
		id: "v2",
		nguoi: "Phan Lê Mạnh",
		cau: "giao «Đào tạo sử dụng» cho Trịnh Cẩm Thương",
		luc: "Hôm qua 16:02",
		laGhiChu: false,
	},
	{
		id: "v3",
		nguoi: "Phan Lê Mạnh",
		cau: "đổi hạn «Chuyển dữ liệu tin đăng cũ» 22/09 → 26/09",
		luc: "Hôm qua 15:40",
		laGhiChu: false,
	},
	{
		id: "v4",
		nguoi: "Phan Lê Mạnh",
		cau: "đánh dấu «Kickoff» xong",
		luc: "12/09 10:30",
		laGhiChu: false,
	},
	{
		id: "v5",
		nguoi: "Phan Lê Mạnh",
		cau: "tạo kế hoạch từ khuôn Sàn giao dịch",
		luc: "10/09 08:00",
		laGhiChu: false,
	},
];

export const HANG_NEN = [
	{
		doiTac: "One Mount",
		tac: "Thiết lập tài khoản",
		im: "3n",
		buoc: "1/5",
		ngay: "12/30",
	},
	{
		doiTac: "Nhà Mới",
		tac: "Đào tạo sử dụng",
		im: "—",
		buoc: "2/4",
		ngay: "5/30",
	},
	{
		doiTac: "OneHub Market Center",
		tac: "Kickoff",
		im: "8n",
		buoc: "0/4",
		ngay: "9/30",
	},
];
