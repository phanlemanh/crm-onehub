import type { MucTuTin, NhipOkr } from "@crm/ui/components/okr-status";

export const DUONG = "/proto/bo-okr-co-so";

export type KrBco = {
	id: string;
	ten: string;
	phuTrach: string;
	giaTri: string;
	tienDo: number;
	nhip: NhipOkr;
	tuTin: MucTuTin | null;
};

export type MucTieuBco = {
	id: string;
	ten: string;
	loai: "Cam kết" | "Thử thách";
	phuTrach: string;
	tienDo: number;
	nhip: NhipOkr;
	canBan: boolean;
	kr: KrBco[];
};

export type HangSoBco = {
	tienDo: number | null;
	kyVong: number | null;
	daCapNhat: number;
	soKr: number;
	tuTinThap: number;
};

export type ChuKyBco = {
	ten: string;
	batDau: string;
	ketThuc: string;
};

export const CHU_KY: ChuKyBco = {
	ten: "Quý 4 2026",
	batDau: "2026-10-01",
	ketThuc: "2026-12-31",
};

export const HOM_NAY = "2026-10-25";

export const DON_VI = {
	phongBan: {
		ten: "Chăm sóc khách hàng và Hỗ trợ đối tác doanh nghiệp",
		cha: "Khối Vận hành",
		truong: "Nguyễn Thị Thu Thảo",
	},
	boPhan: {
		ten: "Khối Vận hành",
		cha: "OneHub",
		truong: "Trần Quang Vinh",
	},
	caNhan: {
		ten: "Lê Hoàng Phương Nga",
		cha: "Chăm sóc khách hàng và Hỗ trợ đối tác doanh nghiệp",
		truong: null,
	},
} as const;

const kr = (
	id: string,
	ten: string,
	phuTrach: string,
	giaTri: string,
	tienDo: number,
	nhip: NhipOkr,
	tuTin: MucTuTin | null,
): KrBco => ({ id, ten, phuTrach, giaTri, tienDo, nhip, tuTin });

export const MUC_TIEU_PHONG_BAN: MucTieuBco[] = [
	{
		id: "m1",
		ten: "Đối tác doanh nghiệp mới được đỡ trọn ba mươi ngày đầu, không ai phải hỏi lại hai lần cùng một câu",
		loai: "Cam kết",
		phuTrach: "Nguyễn Thị Thu Thảo",
		tienDo: 58,
		nhip: "cham-nhip",
		canBan: true,
		kr: [
			kr(
				"m1k1",
				"Thời gian phản hồi đối tác, trung vị",
				"Lê Hoàng Phương Nga",
				"3,5 / 2 giờ",
				72,
				"dung-nhip",
				"cao",
			),
			kr(
				"m1k2",
				"Đối tác chấm hài lòng từ 4/5 trở lên trong khảo sát cuối tháng đầu",
				"Lê Hoàng Phương Nga",
				"74 / 85 %",
				56,
				"cham-nhip",
				"vua",
			),
			kr(
				"m1k3",
				"Bộ câu hỏi thường gặp công bố cho đối tác",
				"Phạm Đức Anh",
				"Chưa xong",
				0,
				"moc-chua",
				"thap",
			),
			kr(
				"m1k4",
				"Công ty mới có buổi gặp trong tuần đầu",
				"Nguyễn Thị Thu Thảo",
				"64 / 100 %",
				64,
				"dung-nhip",
				"vua",
			),
		],
	},
	{
		id: "m2",
		ten: "Ca trực tối ổn định cho cả ba vùng",
		loai: "Cam kết",
		phuTrach: "Phạm Đức Anh",
		tienDo: 81,
		nhip: "dung-nhip",
		canBan: false,
		kr: [
			kr(
				"m2k1",
				"Ca tối có ít nhất hai người trực",
				"Phạm Đức Anh",
				"26 / 30 ca",
				87,
				"dung-nhip",
				"cao",
			),
			kr(
				"m2k2",
				"Phiếu tồn quá 24 giờ",
				"Võ Minh Khôi",
				"4 / 0 phiếu",
				75,
				"dung-nhip",
				"cao",
			),
			kr(
				"m2k3",
				"Quy trình bàn giao ca viết xong và ký",
				"Phạm Đức Anh",
				"Xong",
				100,
				"moc-xong",
				"cao",
			),
		],
	},
	{
		id: "m3",
		ten: "Giảm phiếu khiếu nại lặp lại về hoá đơn điện tử",
		loai: "Thử thách",
		phuTrach: "Võ Minh Khôi",
		tienDo: 22,
		nhip: "truot",
		canBan: true,
		kr: [
			kr(
				"m3k1",
				"Phiếu khiếu nại hoá đơn mở lại trong 7 ngày",
				"Võ Minh Khôi",
				"31 / 10 %",
				18,
				"truot",
				"thap",
			),
			kr(
				"m3k2",
				"Mẫu trả lời hoá đơn có trong Kho tài liệu",
				"Đặng Thị Hồng Nhung",
				"12 / 40 mẫu",
				30,
				"cham-nhip",
				"thap",
			),
			kr(
				"m3k3",
				"Đối tác dùng cổng tự tra hoá đơn",
				"Võ Minh Khôi",
				"140 / 900 đối tác",
				16,
				"truot",
				null,
			),
		],
	},
	{
		id: "m4",
		ten: "Mọi cuộc gọi đến được ghi vào CRM trong ngày",
		loai: "Cam kết",
		phuTrach: "Đặng Thị Hồng Nhung",
		tienDo: 66,
		nhip: "dung-nhip",
		canBan: false,
		kr: [
			kr(
				"m4k1",
				"Cuộc gọi có bản ghi liên hệ",
				"Đặng Thị Hồng Nhung",
				"88 / 100 %",
				88,
				"dung-nhip",
				"cao",
			),
			kr(
				"m4k2",
				"Cuộc gọi gắn đúng thoả thuận",
				"Đặng Thị Hồng Nhung",
				"44 / 100 %",
				44,
				"cham-nhip",
				"vua",
			),
		],
	},
	{
		id: "m5",
		ten: "Đội mới vào làm được ca độc lập sau hai tuần",
		loai: "Thử thách",
		phuTrach: "Nguyễn Thị Thu Thảo",
		tienDo: 35,
		nhip: "cham-nhip",
		canBan: false,
		kr: [
			kr(
				"m5k1",
				"Người mới qua bài kiểm tra ca độc lập",
				"Nguyễn Thị Thu Thảo",
				"2 / 6 người",
				33,
				"cham-nhip",
				null,
			),
			kr(
				"m5k2",
				"Lộ trình học hai tuần có trong Học tập",
				"Lê Hoàng Phương Nga",
				"Chưa xong",
				0,
				"moc-chua",
				"vua",
			),
		],
	},
	{
		id: "m6",
		ten: "Chuẩn bị chương trình tri ân đối tác cuối năm",
		loai: "Thử thách",
		phuTrach: "Lê Hoàng Phương Nga",
		tienDo: 0,
		nhip: "chua-co-ky-vong",
		canBan: false,
		kr: [],
	},
];

export const MUC_TIEU_CA_NHAN: MucTieuBco[] = [
	MUC_TIEU_PHONG_BAN[0] as MucTieuBco,
];

export const SO_PHONG_BAN: HangSoBco = {
	tienDo: 46,
	kyVong: 27,
	daCapNhat: 9,
	soKr: 14,
	tuTinThap: 3,
};

export const SO_BO_PHAN: HangSoBco = {
	tienDo: 52,
	kyVong: 27,
	daCapNhat: 21,
	soKr: 33,
	tuTinThap: 5,
};

export const SO_CHUA_CONG_BO: HangSoBco = {
	tienDo: null,
	kyVong: null,
	daCapNhat: 0,
	soKr: 0,
	tuTinThap: 0,
};
