export type TuTin = "cao" | "vua" | "thap";

export type LyDo =
	| { loai: "tut"; tu: string; den: string }
	| { loai: "im"; soNgay: number }
	| { loai: "ghi-chu" };

export type LanCapNhat = {
	ngay: string;
	so: string;
	tuTin: TuTin;
	ghiChu: string;
};

export type KrMau = {
	id: string;
	tieuDe: string;
	chuTen: string;
	so: string;
	dich: string;
	tienDo: number;
	doi: string | null;
	tuTin: TuTin | null;
	ghiChu: string | null;
	tuanNay: boolean;
	lyDo: LyDo[];
	lichSu: LanCapNhat[];
};

export type MucTieuMau = {
	id: string;
	ten: string;
	tienDo: number;
	kr: KrMau[];
};

export const BO = {
	ten: "Kinh doanh vùng 1",
	chuKy: "Quý 4 · 2026",
	tuan: "19/10",
	ketThuc: "31/12",
	ngayConLai: "69",
} as const;

export const MUC_TIEU: MucTieuMau[] = [
	{
		id: "mt-1",
		ten: "Mở rộng mạng lưới đối tác miền Bắc",
		tienDo: 37,
		kr: [
			{
				id: "kr-1",
				tieuDe: "Ký 12 hợp đồng đối tác mới",
				chuTen: "Trần Quốc Bảo",
				so: "4 hợp đồng",
				dich: "12",
				tienDo: 33,
				doi: "+1",
				tuTin: "thap",
				ghiChu:
					"Hai đối tác lớn lùi lịch ký sang tháng 11, đang chờ pháp chế duyệt mẫu mới",
				tuanNay: true,
				lyDo: [{ loai: "tut", tu: "vừa", den: "thấp" }],
				lichSu: [
					{
						ngay: "16/10, 09:30",
						so: "4 hợp đồng",
						tuTin: "thap",
						ghiChu:
							"Hai đối tác lớn lùi lịch ký sang tháng 11, đang chờ pháp chế duyệt mẫu mới",
					},
					{
						ngay: "09/10, 10:05",
						so: "3 hợp đồng",
						tuTin: "vua",
						ghiChu: "Ký thêm một đối tác ở Hải Phòng",
					},
				],
			},
			{
				id: "kr-2",
				tieuDe: "Doanh thu qua đối tác đạt 4,5 tỷ",
				chuTen: "Nguyễn Thị Lan",
				so: "1,8 tỷ",
				dich: "4,5 tỷ",
				tienDo: 41,
				doi: null,
				tuTin: "vua",
				ghiChu: null,
				tuanNay: false,
				lyDo: [{ loai: "im", soNgay: 16 }],
				lichSu: [
					{
						ngay: "02/10, 15:10",
						so: "1,8 tỷ",
						tuTin: "vua",
						ghiChu: "Chưa có hoá đơn tháng 10",
					},
				],
			},
		],
	},
	{
		id: "mt-2",
		ten: "Giữ chân đối tác hiện có",
		tienDo: 63,
		kr: [
			{
				id: "kr-3",
				tieuDe: "Tỉ lệ đối tác hoạt động trên 70%",
				chuTen: "Đỗ Minh Khoa",
				so: "58%",
				dich: "70%",
				tienDo: 58,
				doi: "+6%",
				tuTin: "cao",
				ghiChu:
					"Đã gọi lại 14 đối tác im lặng, 9 đối tác quay lại đăng sản phẩm",
				tuanNay: true,
				lyDo: [{ loai: "ghi-chu" }],
				lichSu: [
					{
						ngay: "17/10, 14:20",
						so: "58%",
						tuTin: "cao",
						ghiChu:
							"Đã gọi lại 14 đối tác im lặng, 9 đối tác quay lại đăng sản phẩm",
					},
				],
			},
			{
				id: "kr-4",
				tieuDe: "Đào tạo 30 đối tác dùng cổng mới",
				chuTen: "Phạm Thu Trang",
				so: "19 đối tác",
				dich: "30",
				tienDo: 62,
				doi: "+3",
				tuTin: "cao",
				ghiChu: "Đúng lịch, thêm một buổi cho miền Trung",
				tuanNay: true,
				lyDo: [],
				lichSu: [],
			},
			{
				id: "kr-5",
				tieuDe: "Thời gian phản hồi đối tác dưới 4 giờ",
				chuTen: "Đỗ Minh Khoa",
				so: "3,6 giờ",
				dich: "4 giờ",
				tienDo: 70,
				doi: null,
				tuTin: "cao",
				ghiChu: "Ổn định",
				tuanNay: false,
				lyDo: [],
				lichSu: [],
			},
		],
	},
];

export const MOI_KR = MUC_TIEU.flatMap((m) => m.kr);
export const DANG_BAN = MOI_KR.filter((k) => k.lyDo.length > 0);
export const CHUA_CAP_NHAT = MOI_KR.filter((k) => !k.tuanNay);
