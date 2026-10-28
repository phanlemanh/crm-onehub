export type TuTin = "cao" | "vua" | "thap";

export type KrCanCapNhat = {
	id: string;
	tieuDe: string;
	mucTieu: string;
	bo: string;
	hienTai: string;
	lanTruoc: string | null;
	tuTin: TuTin | null;
};

export const CHU_KY = {
	ten: "Quý 4/2026",
	tuan: "26/10",
	han: "01/11",
} as const;

export const NGUOI = "Trần Thị Minh Anh";

export const BO = {
	vung1: "Kinh doanh vùng 1",
	doiTac: "Phát triển mạng lưới đối tác miền Bắc và miền Trung",
	onehub: "OneHub",
} as const;

export const CAN_CAP_NHAT: [KrCanCapNhat, KrCanCapNhat, ...KrCanCapNhat[]] = [
	{
		id: "kr-ky-moi",
		tieuDe: "Ký 12 hợp đồng đối tác mới",
		mucTieu: "Mở rộng mạng lưới đối tác ở các tỉnh phía Bắc",
		bo: BO.vung1,
		hienTai: "4 hợp đồng",
		lanTruoc: "16/10",
		tuTin: "thap",
	},
	{
		id: "kr-doanh-thu",
		tieuDe: "Doanh thu từ đối tác mới đạt 3,5 tỷ đồng trong quý",
		mucTieu: "Mở rộng mạng lưới đối tác ở các tỉnh phía Bắc",
		bo: BO.vung1,
		hienTai: "1,2 tỷ ₫",
		lanTruoc: "19/10",
		tuTin: "vua",
	},
	{
		id: "kr-gia-han",
		tieuDe: "Tỷ lệ đối tác gia hạn hợp đồng năm thứ hai đạt 85%",
		mucTieu: "Giữ chân đối tác lâu năm",
		bo: BO.vung1,
		hienTai: "71%",
		lanTruoc: "12/10",
		tuTin: "vua",
	},
	{
		id: "kr-dao-tao",
		tieuDe:
			"Hoàn tất chương trình đào tạo sản phẩm cho toàn bộ 40 đại lý cấp một ở Nghệ An, Hà Tĩnh và Quảng Bình",
		mucTieu: "Đại lý cấp một tự bán được gói doanh nghiệp",
		bo: BO.doiTac,
		hienTai: "18 đại lý",
		lanTruoc: "05/10",
		tuTin: "cao",
	},
	{
		id: "kr-ho-so",
		tieuDe: "100% hồ sơ đối tác có đủ giấy phép kinh doanh",
		mucTieu: "Đại lý cấp một tự bán được gói doanh nghiệp",
		bo: BO.doiTac,
		hienTai: "62%",
		lanTruoc: null,
		tuTin: null,
	},
	{
		id: "kr-nps",
		tieuDe: "Điểm hài lòng của đối tác (NPS) từ 40 trở lên",
		mucTieu: "OneHub là nơi đối tác muốn làm việc lâu dài",
		bo: BO.onehub,
		hienTai: "36",
		lanTruoc: "19/10",
		tuTin: "vua",
	},
	{
		id: "kr-phan-hoi",
		tieuDe: "Thời gian phản hồi yêu cầu của đối tác dưới 4 giờ làm việc",
		mucTieu: "OneHub là nơi đối tác muốn làm việc lâu dài",
		bo: BO.onehub,
		hienTai: "5,5 giờ",
		lanTruoc: "19/10",
		tuTin: "thap",
	},
];

export const DA_CAP_NHAT = 3;

export const DON_VI_DAN = [
	{
		ten: BO.vung1,
		tomTat: "4 mục tiêu · 11 KR · trung bình 38%",
		nhip: "6 KR đúng nhịp · 3 KR chậm nhịp · 2 KR trượt",
	},
];

export const KR_PHU_TRACH = [
	{
		mucTieu: "Mở rộng mạng lưới đối tác ở các tỉnh phía Bắc",
		bo: BO.vung1,
		kr: [CAN_CAP_NHAT[0], CAN_CAP_NHAT[1]],
	},
	{
		mucTieu: "Đại lý cấp một tự bán được gói doanh nghiệp",
		bo: BO.doiTac,
		kr: CAN_CAP_NHAT.filter((k) => k.bo === BO.doiTac),
	},
];
