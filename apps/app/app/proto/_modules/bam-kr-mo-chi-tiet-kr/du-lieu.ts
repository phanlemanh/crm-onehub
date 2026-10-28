export type TuTin = "cao" | "vua" | "thap";

export type LanCapNhatMau = {
	ngay: string;
	so: string;
	tuTin: TuTin;
	ghiChu: string;
};

export type KrMau = {
	id: string;
	tieuDe: string;
	chuTen: string;
	hienTai: string;
	dich: string;
	tienDo: number;
	tuTin: TuTin;
	lan: [LanCapNhatMau, ...LanCapNhatMau[]];
};

export type MucTieuMau = {
	id: string;
	tieuDe: string;
	donVi: string;
	chuTen: string;
	tienDo: number;
	kr: [KrMau, ...KrMau[]];
};

export type KrTrongMucTieu = { kr: KrMau; mucTieu: MucTieuMau };

export type ViecMau = {
	id: string;
	tieuDe: string;
	han: string;
	mucTieuId: string;
	krId: string | null;
};

export const CHU_KY = { ten: "Quý 4 · 2026", tuan: "19/10" } as const;

export const NGUOI_XEM = "Trần Quốc Bảo";

export const MUC_TIEU: [MucTieuMau, MucTieuMau, MucTieuMau] = [
	{
		id: "mt-1",
		tieuDe: "Mở rộng mạng lưới đối tác miền Bắc",
		donVi: "Kinh doanh vùng 1",
		chuTen: "Trần Quốc Bảo",
		tienDo: 38,
		kr: [
			{
				id: "kr-1",
				tieuDe: "Ký 12 hợp đồng đối tác mới",
				chuTen: "Trần Quốc Bảo",
				hienTai: "4 hợp đồng",
				dich: "12",
				tienDo: 33,
				tuTin: "thap",
				lan: [
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
				hienTai: "1,9 tỷ",
				dich: "4,5 tỷ",
				tienDo: 42,
				tuTin: "vua",
				lan: [
					{
						ngay: "17/10, 14:10",
						so: "1,9 tỷ",
						tuTin: "vua",
						ghiChu: "Đơn tháng 10 đúng nhịp, chờ hai đơn lớn cuối tháng",
					},
				],
			},
			{
				id: "kr-3",
				tieuDe: "Đào tạo 30 nhân viên đối tác về sản phẩm mới",
				chuTen: "Trần Quốc Bảo",
				hienTai: "14 người",
				dich: "30",
				tienDo: 47,
				tuTin: "cao",
				lan: [
					{
						ngay: "15/10, 16:00",
						so: "14 người",
						tuTin: "cao",
						ghiChu: "Hai lớp ở Hà Nội xong, lớp Nam Định ngày 28/10",
					},
				],
			},
		],
	},
	{
		id: "mt-2",
		tieuDe: "Giữ chân đối tác hiện có",
		donVi: "Kinh doanh vùng 1",
		chuTen: "Nguyễn Thị Lan",
		tienDo: 61,
		kr: [
			{
				id: "kr-4",
				tieuDe: "Tỷ lệ gia hạn hợp đồng đạt 90%",
				chuTen: "Trần Quốc Bảo",
				hienTai: "84%",
				dich: "90%",
				tienDo: 70,
				tuTin: "vua",
				lan: [
					{
						ngay: "18/10, 11:20",
						so: "84%",
						tuTin: "vua",
						ghiChu: "Ba đối tác xin giảm giá, đang trình giám đốc",
					},
				],
			},
			{
				id: "kr-5",
				tieuDe: "Thời gian xử lý khiếu nại dưới 48 giờ",
				chuTen: "Phạm Minh Đức",
				hienTai: "52 giờ",
				dich: "48 giờ",
				tienDo: 52,
				tuTin: "thap",
				lan: [
					{
						ngay: "14/10, 08:45",
						so: "52 giờ",
						tuTin: "thap",
						ghiChu: "Thiếu một người trực ca tối",
					},
				],
			},
		],
	},
	{
		id: "mt-3",
		tieuDe: "Đưa OKR quý vào vận hành hằng tuần",
		donVi: "OneHub",
		chuTen: "Lê Hoàng Nam",
		tienDo: 55,
		kr: [
			{
				id: "kr-6",
				tieuDe: "100% phòng ban có ít nhất một lần cập nhật mỗi tuần",
				chuTen: "Lê Hoàng Nam",
				hienTai: "7/9 phòng ban",
				dich: "9/9",
				tienDo: 78,
				tuTin: "cao",
				lan: [
					{
						ngay: "19/10, 09:00",
						so: "7/9 phòng ban",
						tuTin: "cao",
						ghiChu: "Hai phòng mới vào nhịp từ tuần sau",
					},
				],
			},
		],
	},
];

export const KR_CUA_TOI = MUC_TIEU.flatMap((mt) =>
	mt.kr
		.filter((k) => k.chuTen === NGUOI_XEM)
		.map((k) => ({ kr: k, mucTieu: mt })),
);

export const VIEC: ViecMau[] = [
	{
		id: "v-1",
		tieuDe: "Bạn được giao phụ trách KR",
		han: "hôm nay",
		mucTieuId: "mt-1",
		krId: "kr-3",
	},
	{
		id: "v-2",
		tieuDe: "Cập nhật trễ 6 ngày",
		han: "quá hạn",
		mucTieuId: "mt-2",
		krId: "kr-4",
	},
	{
		id: "v-3",
		tieuDe: "Mục tiêu chờ bạn duyệt",
		han: "21/10",
		mucTieuId: "mt-2",
		krId: null,
	},
];

export const CAP_CHU: { cu: string; moi: string; noi: string }[] = [
	{ cu: "Cập nhật tuần", moi: "Cập nhật", noi: "Ngăn KR, Của tôi, tin nhắc" },
	{
		cu: "Tuần này chưa có Cập nhật tuần nào",
		moi: "Tuần này chưa có lần cập nhật nào",
		noi: "Tóm tắt tuần ở Họp tuần",
	},
	{
		cu: "… ít nhất một lần Cập nhật tuần.",
		moi: "… ít nhất một lần cập nhật.",
		noi: "Tóm tắt tuần ở Họp tuần",
	},
	{
		cu: "Lớp 3: dòng tóm gọn Cập nhật tuần",
		moi: "Lớp 3: dòng tóm gọn lần cập nhật",
		noi: "Soạn OKR",
	},
];

export const CHU_GIU = [
	"KR đã cập nhật tuần này",
	"Cần cập nhật tuần này",
	"Ngày cập nhật",
];

export function timKr(id: string | null): KrTrongMucTieu {
	for (const mt of MUC_TIEU) {
		const kr = mt.kr.find((k) => k.id === id);
		if (kr) return { kr, mucTieu: mt };
	}
	return { kr: MUC_TIEU[0].kr[0], mucTieu: MUC_TIEU[0] };
}

export function timMucTieu(id: string | null): MucTieuMau {
	return MUC_TIEU.find((m) => m.id === id) ?? MUC_TIEU[0];
}
