export type LoaiDong = "viet-lai" | "hoi" | "can-chinh";

export type DongMau = {
	id: string;
	loai: LoaiDong;
	o: string;
	truoc?: string;
	sau: string;
	lyDo: string;
};

export const MUC_TIEU = {
	ten: "Triển khai CRM mới cho Kinh doanh miền Bắc",
	viSao:
		"Quý 3 mất dấu 9 thoả thuận vì mỗi người ghi một nơi; đầu quý 1 là mùa ký lại hợp đồng năm.",
	donVi: "KD miền Bắc",
	phuTrach: "Trần Minh Hải",
	loai: "Cam kết",
};

export const DONG: DongMau[] = [
	{
		id: "d1",
		loai: "viet-lai",
		o: "Tên Mục tiêu",
		truoc: MUC_TIEU.ten,
		sau: "Không thoả thuận nào của miền Bắc bị mất dấu",
		lyDo: "Tên đang nói việc làm; câu mới nói kết quả mà việc đó phải mang lại.",
	},
	{
		id: "d2",
		loai: "viet-lai",
		o: "KR · Gọi 50 cuộc mỗi tuần",
		truoc: "Gọi 50 cuộc mỗi tuần",
		sau: "Khách mới hẹn gặp được sau cuộc gọi đầu",
		lyDo: "KR đang đếm việc làm; nên đo điều cuộc gọi mang lại.",
	},
	{
		id: "d3",
		loai: "hoi",
		o: "Các KR",
		sau: "«Thoả thuận chốt được» và «Doanh thu thoả thuận mới» có đang đo cùng một điều không?",
		lyDo: "Trùng ý",
	},
	{
		id: "d4",
		loai: "can-chinh",
		o: "Căn chỉnh",
		sau: "KR OneHub · Thoả thuận mới cả năm",
		lyDo: "Mục tiêu này góp thẳng vào số thoả thuận mới của cả công ty.",
	},
];

export const KR = {
	ten: "Thoả thuận chốt được",
	nguon: "Nguồn CRM · thoả thuận chốt được",
	khoi: "12",
	dich: "20",
	xuHuong: "Theo 4 tuần gần nhất (+1,5/tuần), cuối kỳ ước khoảng 23.",
};

export type NacMau = "tat" | "toan-cong-ty" | "danh-sach";

export const DON_VI = [
	{ id: "onehub", ten: "Cấp OneHub" },
	{ id: "kd-bac", ten: "KD miền Bắc" },
	{ id: "kd-nam", ten: "KD miền Nam" },
	{ id: "dieu-phoi", ten: "Điều phối vận tải" },
];

export type SoDoMau = {
	nac: "Bật" | "Chạy bóng";
	luot: number;
	daHien: number;
	sinhRa: number;
	nhan: number;
	sua: number;
	bac: number;
	boQua: number;
	hoanTac: number;
	p50: string;
	p90: string;
	biLoai: number;
	chiPhiMoiNhan: string;
};

export const SO_DO: SoDoMau[] = [
	{
		nac: "Bật",
		luot: 18,
		daHien: 52,
		sinhRa: 56,
		nhan: 31,
		sua: 12,
		bac: 40,
		boQua: 17,
		hoanTac: 6,
		p50: "6,8 s",
		p90: "12,4 s",
		biLoai: 7,
		chiPhiMoiNhan: "$0,014",
	},
	{
		nac: "Chạy bóng",
		luot: 64,
		daHien: 0,
		sinhRa: 171,
		nhan: 0,
		sua: 0,
		bac: 0,
		boQua: 0,
		hoanTac: 0,
		p50: "7,1 s",
		p90: "13,9 s",
		biLoai: 9,
		chiPhiMoiNhan: "—",
	},
];

export const LUOT = [
	{
		id: "l1",
		muc: "Không thoả thuận nào của miền Nam bị mất dấu",
		donVi: "KD miền Nam",
		nac: "Chạy bóng",
		dong: 3,
		biLoai: 1,
		doTre: "7,4 s",
		tien: "$0,017",
	},
	{
		id: "l2",
		muc: "Chuyến giao đúng hẹn ở mọi tuyến liên tỉnh",
		donVi: "Điều phối vận tải",
		nac: "Chạy bóng",
		dong: 2,
		biLoai: 0,
		doTre: "6,2 s",
		tien: "$0,015",
	},
	{
		id: "l3",
		muc: "Mọi khách lớn gia hạn trước tháng 3",
		donVi: "Cấp OneHub",
		nac: "Bật",
		dong: 4,
		biLoai: 1,
		doTre: "8,9 s",
		tien: "$0,019",
	},
];

export const DONG_LUOT = [
	{
		loai: "Viết lại tên Mục tiêu",
		truoc: "Mở rộng thị phần miền Nam",
		sau: "Không thoả thuận nào của miền Nam bị mất dấu",
		trangThai: "Qua bộ kiểm",
	},
	{
		loai: "Viết lại tên KR",
		truoc: "Gọi 60 cuộc mỗi tuần",
		sau: "Tăng thoả thuận chốt lên 30 mỗi quý",
		trangThai: "Bị loại · số mới (30)",
	},
	{
		loai: "Câu hỏi",
		truoc: "",
		sau: "KR «Doanh thu mới» có đích nhưng chưa có khởi điểm đo được — số 0 là thật?",
		trangThai: "Qua bộ kiểm",
	},
];
