export type TuTin = "cao" | "vua" | "thap";

export type LyDo =
	| { loai: "tut"; tu: TuTin; den: TuTin }
	| { loai: "im"; soNgay: number }
	| { loai: "ghi-chu" };

export type LanCapNhat = {
	ngay: string;
	giaTri: number;
	tuTin: TuTin;
	ghiChu: string | null;
};

export type KrHop = {
	id: string;
	tieuDe: string;
	mucTieuId: string;
	chuTen: string;
	batDau: number;
	dich: number;
	donViDo: string;
	lyDo: LyDo[];
	lan: [LanCapNhat, ...LanCapNhat[]];
};

export type MucTieuHop = { id: string; tieuDe: string };

export type PhanBang = "dang-ban" | "con-lai";

export type MucDoi =
	| { loai: "lan-dau"; den: number; donViDo: string }
	| { loai: "chua-doi"; den: number; donViDo: string; ngayTruoc: string }
	| {
			loai: "tang" | "giam";
			chenh: number;
			tu: number;
			den: number;
			donViDo: string;
			ngayTruoc: string;
	  };

export const HOP = {
	phanTram: 100,
	ghiChuToiDa: 200,
	dongMoSan: 2,
	viTriNganMoSan: 2,
} as const;

export const BO_OKR = {
	donVi: "Kinh doanh miền Bắc",
	chuKy: "Quý 4 · 2026",
	tuan: "19/10",
	dauTuanTruoc: "12/10",
	vuaGui: "Vừa xong",
	ketThuc: "31/12",
	ngayConLai: "65",
} as const;

export const NHAN_TU_TIN = {
	cao: "cao",
	vua: "vừa",
	thap: "thấp",
} as const satisfies Record<TuTin, string>;

export const MUC_TIEU: MucTieuHop[] = [
	{
		id: "mt-1",
		tieuDe:
			"Mở rộng mạng lưới đại lý phân phối tại các tỉnh miền Bắc và Bắc Trung Bộ",
	},
	{
		id: "mt-2",
		tieuDe: "Tăng doanh thu định kỳ từ khách hàng doanh nghiệp vừa và nhỏ",
	},
	{
		id: "mt-3",
		tieuDe: "Nâng chất lượng chăm sóc sau bán để giữ chân khách hàng cũ",
	},
	{
		id: "mt-4",
		tieuDe: "Rút ngắn chu kỳ bán hàng từ lúc báo giá tới lúc ký hợp đồng",
	},
	{
		id: "mt-5",
		tieuDe: "Đưa nhân viên kinh doanh mới vào nhịp trong 60 ngày đầu",
	},
];

export const DANG_BAN: KrHop[] = [
	{
		id: "kr-a",
		tieuDe: "Ký 12 hợp đồng đại lý cấp 1 mới tại Thanh Hoá, Nghệ An và Hà Tĩnh",
		mucTieuId: "mt-1",
		chuTen: "Trần Quốc Bảo",
		batDau: 0,
		dich: 12,
		donViDo: "hợp đồng",
		lyDo: [{ loai: "tut", tu: "vua", den: "thap" }],
		lan: [
			{
				ngay: "16/10",
				giaTri: 4,
				tuTin: "thap",
				ghiChu:
					"Hai đại lý lớn ở Nghệ An lùi lịch ký sang tháng 11 vì chờ pháp chế duyệt mẫu hợp đồng mới",
			},
			{
				ngay: "09/10",
				giaTri: 4,
				tuTin: "vua",
				ghiChu: "Đã gặp ba đại lý ở Hà Tĩnh, hẹn ký trước 20/10",
			},
		],
	},
	{
		id: "kr-b",
		tieuDe: "Doanh thu định kỳ hằng tháng từ nhóm SME đạt 1,8 tỷ đồng",
		mucTieuId: "mt-2",
		chuTen: "Nguyễn Thị Lan",
		batDau: 0,
		dich: 1.8,
		donViDo: "tỷ đồng",
		lyDo: [{ loai: "tut", tu: "cao", den: "vua" }, { loai: "ghi-chu" }],
		lan: [
			{
				ngay: "17/10",
				giaTri: 1.08,
				tuTin: "vua",
				ghiChu:
					"Ba khách lớn hoãn gia hạn tới khi có bảng giá 2027, đã hẹn gặp lại tuần sau",
			},
			{
				ngay: "10/10",
				giaTri: 1.17,
				tuTin: "cao",
				ghiChu: "Thêm hai khách ở Bắc Ninh",
			},
		],
	},
	{
		id: "kr-c",
		tieuDe: "Tỉ lệ khách hàng gia hạn hợp đồng năm đạt 85%",
		mucTieuId: "mt-3",
		chuTen: "Lê Minh Châu",
		batDau: 60,
		dich: 85,
		donViDo: "%",
		lyDo: [{ loai: "tut", tu: "vua", den: "thap" }],
		lan: [
			{
				ngay: "15/10",
				giaTri: 64,
				tuTin: "thap",
				ghiChu:
					"Hai khách ở Hải Phòng chuyển sang đối thủ vì giá, cần chính sách giữ khách trước 31/10",
			},
			{
				ngay: "08/10",
				giaTri: 68,
				tuTin: "vua",
				ghiChu: null,
			},
		],
	},
	{
		id: "kr-d",
		tieuDe:
			"Số ngày trung bình từ báo giá tới ký hợp đồng giảm từ 45 xuống 30 ngày",
		mucTieuId: "mt-4",
		chuTen: "Phạm Văn Đức",
		batDau: 45,
		dich: 30,
		donViDo: "ngày",
		lyDo: [{ loai: "im", soNgay: 21 }],
		lan: [
			{
				ngay: "28/09",
				giaTri: 41,
				tuTin: "vua",
				ghiChu: "Bắt đầu đo từ CRM, số liệu tháng 9 còn thiếu hai đội",
			},
		],
	},
	{
		id: "kr-e",
		tieuDe:
			"100% nhân viên kinh doanh mới hoàn thành lộ trình đào tạo sản phẩm trong 30 ngày",
		mucTieuId: "mt-5",
		chuTen: "Hoàng Thu Hà",
		batDau: 0,
		dich: 100,
		donViDo: "%",
		lyDo: [{ loai: "im", soNgay: 14 }],
		lan: [
			{
				ngay: "05/10",
				giaTri: 40,
				tuTin: "vua",
				ghiChu: "Lớp tháng 10 dời một tuần vì thiếu phòng học",
			},
			{ ngay: "28/09", giaTri: 40, tuTin: "vua", ghiChu: null },
		],
	},
	{
		id: "kr-f",
		tieuDe: "Mở 4 điểm trưng bày sản phẩm tại siêu thị điện máy cấp tỉnh",
		mucTieuId: "mt-1",
		chuTen: "Đỗ Thanh Tùng",
		batDau: 0,
		dich: 4,
		donViDo: "điểm",
		lyDo: [{ loai: "im", soNgay: 10 }],
		lan: [
			{
				ngay: "09/10",
				giaTri: 1,
				tuTin: "vua",
				ghiChu: "Điểm ở Vinh đã mở, đang chờ mặt bằng ở Thanh Hoá",
			},
			{ ngay: "25/09", giaTri: 0, tuTin: "vua", ghiChu: null },
		],
	},
	{
		id: "kr-g",
		tieuDe: "Chuyển đổi 25% khách dùng thử sang gói trả phí trong quý",
		mucTieuId: "mt-2",
		chuTen: "Vũ Ngọc Anh",
		batDau: 0,
		dich: 25,
		donViDo: "%",
		lyDo: [{ loai: "ghi-chu" }],
		lan: [
			{
				ngay: "18/10",
				giaTri: 15,
				tuTin: "cao",
				ghiChu:
					"Chiến dịch gọi lại khách dùng thử hiệu quả, tuần này thêm 9 khách trả phí",
			},
			{
				ngay: "11/10",
				giaTri: 12,
				tuTin: "cao",
				ghiChu: "Bắt đầu gọi lại nhóm dùng thử tháng 9",
			},
		],
	},
	{
		id: "kr-h",
		tieuDe: "Điểm hài lòng sau hỗ trợ đạt 4,6 trên 5",
		mucTieuId: "mt-3",
		chuTen: "Lê Minh Châu",
		batDau: 4,
		dich: 4.6,
		donViDo: "điểm",
		lyDo: [{ loai: "ghi-chu" }],
		lan: [
			{
				ngay: "17/10",
				giaTri: 4.3,
				tuTin: "cao",
				ghiChu: "Đã rút thời gian phản hồi phiếu hỗ trợ xuống dưới 4 giờ",
			},
			{ ngay: "10/10", giaTri: 4.2, tuTin: "cao", ghiChu: null },
		],
	},
	{
		id: "kr-i",
		tieuDe: "Tỉ lệ nhân viên mới chốt hợp đồng đầu tiên trong 60 ngày đạt 70%",
		mucTieuId: "mt-5",
		chuTen: "Hoàng Thu Hà",
		batDau: 0,
		dich: 70,
		donViDo: "%",
		lyDo: [{ loai: "ghi-chu" }],
		lan: [
			{
				ngay: "16/10",
				giaTri: 35,
				tuTin: "vua",
				ghiChu: "Cặp kèm với người cũ giúp hai bạn mới chốt đơn đầu tiên",
			},
			{ ngay: "09/10", giaTri: 28, tuTin: "vua", ghiChu: null },
		],
	},
];

export const CON_LAI: KrHop[] = [
	{
		id: "kr-j",
		tieuDe: "Tổ chức 6 buổi hội thảo giới thiệu sản phẩm cho đại lý",
		mucTieuId: "mt-1",
		chuTen: "Trần Quốc Bảo",
		batDau: 0,
		dich: 6,
		donViDo: "buổi",
		lyDo: [],
		lan: [
			{
				ngay: "06/10",
				giaTri: 3,
				tuTin: "cao",
				ghiChu: "Xong hội thảo ở Nam Định",
			},
			{ ngay: "29/09", giaTri: 2, tuTin: "cao", ghiChu: null },
		],
	},
	{
		id: "kr-k",
		tieuDe: "Giá trị hợp đồng trung bình đạt 120 triệu đồng",
		mucTieuId: "mt-2",
		chuTen: "Nguyễn Thị Lan",
		batDau: 80,
		dich: 120,
		donViDo: "triệu đồng",
		lyDo: [],
		lan: [
			{ ngay: "08/10", giaTri: 104, tuTin: "cao", ghiChu: null },
			{ ngay: "01/10", giaTri: 100, tuTin: "cao", ghiChu: null },
		],
	},
	{
		id: "kr-l",
		tieuDe: "Giảm số phiếu hỗ trợ tồn quá 3 ngày xuống dưới 10 phiếu",
		mucTieuId: "mt-3",
		chuTen: "Lê Minh Châu",
		batDau: 40,
		dich: 10,
		donViDo: "phiếu",
		lyDo: [],
		lan: [
			{
				ngay: "07/10",
				giaTri: 18,
				tuTin: "cao",
				ghiChu: "Đội ca tối đã xử lý hết phiếu tồn tuần trước",
			},
			{ ngay: "30/09", giaTri: 22, tuTin: "cao", ghiChu: null },
		],
	},
	{
		id: "kr-m",
		tieuDe: "100% báo giá gửi khách qua CRM thay cho email",
		mucTieuId: "mt-4",
		chuTen: "Phạm Văn Đức",
		batDau: 0,
		dich: 100,
		donViDo: "%",
		lyDo: [],
		lan: [
			{
				ngay: "09/10",
				giaTri: 90,
				tuTin: "cao",
				ghiChu: "Còn đội Hải Dương gửi bằng email",
			},
			{ ngay: "02/10", giaTri: 90, tuTin: "cao", ghiChu: null },
		],
	},
	{
		id: "kr-n",
		tieuDe:
			"Mỗi nhân viên mới có người kèm cặp được phân công ngay trong tuần đầu",
		mucTieuId: "mt-5",
		chuTen: "Hoàng Thu Hà",
		batDau: 0,
		dich: 100,
		donViDo: "%",
		lyDo: [],
		lan: [
			{
				ngay: "08/10",
				giaTri: 100,
				tuTin: "cao",
				ghiChu: "Đủ người kèm cho cả lớp tháng 10",
			},
		],
	},
];
