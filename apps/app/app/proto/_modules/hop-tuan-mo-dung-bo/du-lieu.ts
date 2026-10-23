export type TuTin = "cao" | "vua" | "thap";

export type LyDoHop =
	| { loai: "tut"; tu: string; den: string }
	| { loai: "im"; soNgay: number }
	| { loai: "ghi-chu" };

export type DongHopMau = {
	id: string;
	tieuDe: string;
	mucTieu: string;
	chuTen: string;
	tienDo: number;
	tuTin: TuTin | null;
	ghiChu: string | null;
	lyDo: LyDoHop[];
};

export type DonViCoKr = {
	khoa: string;
	ten: string;
	cap: "Bộ phận" | "Phòng ban";
	soKr: number;
	daCapNhat: number;
};

export const CHU_KY = {
	ten: "Quý 4 · 2026",
	batDau: "01/10",
	ketThuc: "31/12",
	tuan: "19/10",
	ngayConLai: "69",
	chuKyMoi: "Quý 1 · 2027",
	batDauMoi: "01/01",
} as const;

export const PHONG_BAN = "Kinh doanh vùng 1";
export const PHONG_BAN_RONG = "Chăm sóc đối tác";
export const GOC = "OneHub";

export const DANG_BAN: DongHopMau[] = [
	{
		id: "kr-1",
		tieuDe: "Ký 12 hợp đồng đối tác mới",
		mucTieu: "Mở rộng mạng lưới đối tác miền Bắc",
		chuTen: "Trần Quốc Bảo",
		tienDo: 33,
		tuTin: "thap",
		ghiChu:
			"Hai đối tác lớn lùi lịch ký sang tháng 11, đang chờ pháp chế duyệt mẫu mới",
		lyDo: [{ loai: "tut", tu: "vừa", den: "thấp" }],
	},
	{
		id: "kr-2",
		tieuDe: "Doanh thu qua đối tác đạt 4,5 tỷ",
		mucTieu: "Mở rộng mạng lưới đối tác miền Bắc",
		chuTen: "Nguyễn Thị Lan",
		tienDo: 41,
		tuTin: "vua",
		ghiChu: null,
		lyDo: [{ loai: "im", soNgay: 16 }],
	},
	{
		id: "kr-3",
		tieuDe: "Tỉ lệ đối tác hoạt động trên 70%",
		mucTieu: "Giữ chân đối tác hiện có",
		chuTen: "Đỗ Minh Khoa",
		tienDo: 58,
		tuTin: "cao",
		ghiChu: "Đã gọi lại 14 đối tác im lặng, 9 đối tác quay lại đăng sản phẩm",
		lyDo: [{ loai: "ghi-chu" }],
	},
];

export const CON_LAI: DongHopMau[] = [
	{
		id: "kr-4",
		tieuDe: "Đào tạo 30 đối tác dùng cổng mới",
		mucTieu: "Giữ chân đối tác hiện có",
		chuTen: "Phạm Thu Trang",
		tienDo: 62,
		tuTin: "thap",
		ghiChu: "Đúng lịch",
		lyDo: [],
	},
	{
		id: "kr-5",
		tieuDe: "Thời gian phản hồi đối tác dưới 4 giờ",
		mucTieu: "Giữ chân đối tác hiện có",
		chuTen: "Đỗ Minh Khoa",
		tienDo: 70,
		tuTin: "cao",
		ghiChu: null,
		lyDo: [],
	},
];

export const DON_VI_CO_KR: DonViCoKr[] = [
	{
		khoa: "bp:kinh-doanh",
		ten: "Kinh doanh",
		cap: "Bộ phận",
		soKr: 9,
		daCapNhat: 7,
	},
	{
		khoa: "bp:van-hanh",
		ten: "Vận hành",
		cap: "Bộ phận",
		soKr: 6,
		daCapNhat: 6,
	},
	{
		khoa: "bp:cong-nghe-va-du-lieu-doi-tac",
		ten: "Công nghệ và dữ liệu đối tác",
		cap: "Bộ phận",
		soKr: 4,
		daCapNhat: 1,
	},
	{
		khoa: "pb:phap-che",
		ten: "Pháp chế",
		cap: "Phòng ban",
		soKr: 2,
		daCapNhat: 2,
	},
];
