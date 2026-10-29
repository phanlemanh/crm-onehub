import type { MucTuTin, NhipOkr } from "@crm/ui/components/okr-status";

export const DUONG = "/proto/bo-okr-chi-don-vi";

export const TEN_KY = "Quý 4 2026";

export type KrBcd = {
	id: string;
	ten: string;
	phuTrach: string;
	giaTri: string;
	tienDo: number;
	nhip: NhipOkr;
	tuTin: MucTuTin | null;
};

export type MucTieuBcd = {
	id: string;
	ten: string;
	loai: "Cam kết" | "Thử thách" | "Học tập";
	phuTrach: string;
	tienDo: number;
	nhip: NhipOkr;
	canBan: boolean;
	daBo: boolean;
	kr: KrBcd[];
};

export type CapDon = "goc" | "bo-phan" | "phong-ban";

export type DonBcd = {
	khoa: string;
	ten: string;
	cap: CapDon;
	cha: string | null;
	truong: string | null;
	soMucTieu: number;
	tienDo: number | null;
	kyVong: number | null;
	soKr: number;
	daCapNhat: number;
	tuTinThap: number;
};

const don = (
	khoa: string,
	ten: string,
	cap: CapDon,
	cha: string | null,
	truong: string | null,
	so: Omit<DonBcd, "khoa" | "ten" | "cap" | "cha" | "truong">,
): DonBcd => ({ khoa, ten, cap, cha, truong, ...so });

export const CAY: DonBcd[] = [
	don("goc", "OneHub", "goc", null, null, {
		soMucTieu: 0,
		tienDo: null,
		kyVong: null,
		soKr: 0,
		daCapNhat: 0,
		tuTinThap: 0,
	}),
	don("bp:kd", "Khối Kinh doanh", "bo-phan", "goc", "Trần Quang Vinh", {
		soMucTieu: 2,
		tienDo: 46,
		kyVong: 31,
		soKr: 7,
		daCapNhat: 4,
		tuTinThap: 1,
	}),
	don(
		"pb:kd-bac",
		"Kinh doanh miền Bắc",
		"phong-ban",
		"bp:kd",
		"Đỗ Minh Khôi",
		{
			soMucTieu: 3,
			tienDo: 38,
			kyVong: 31,
			soKr: 10,
			daCapNhat: 6,
			tuTinThap: 2,
		},
	),
	don("pb:kd-nam", "Kinh doanh miền Nam", "phong-ban", "bp:kd", "Lý Thanh Hà", {
		soMucTieu: 4,
		tienDo: 52,
		kyVong: 31,
		soKr: 13,
		daCapNhat: 9,
		tuTinThap: 0,
	}),
	don(
		"pb:kd-cs",
		"Chăm sóc khách hàng và Hỗ trợ đối tác doanh nghiệp",
		"phong-ban",
		"bp:kd",
		"Nguyễn Thị Thu Thảo",
		{
			soMucTieu: 3,
			tienDo: 27,
			kyVong: 31,
			soKr: 11,
			daCapNhat: 3,
			tuTinThap: 4,
		},
	),
	don("pb:kd-mkt", "Marketing", "phong-ban", "bp:kd", null, {
		soMucTieu: 4,
		tienDo: 41,
		kyVong: 31,
		soKr: 12,
		daCapNhat: 7,
		tuTinThap: 1,
	}),
	don("bp:vh", "Khối Vận hành", "bo-phan", "goc", "Phạm Đức Anh", {
		soMucTieu: 1,
		tienDo: 63,
		kyVong: 31,
		soKr: 3,
		daCapNhat: 3,
		tuTinThap: 0,
	}),
	don("pb:vh-kho", "Kho vận", "phong-ban", "bp:vh", "Vũ Hải Đăng", {
		soMucTieu: 4,
		tienDo: 35,
		kyVong: 31,
		soKr: 12,
		daCapNhat: 5,
		tuTinThap: 3,
	}),
	don("pb:vh-dp", "Điều phối vận tải", "phong-ban", "bp:vh", "Hoàng Gia Bảo", {
		soMucTieu: 3,
		tienDo: 44,
		kyVong: 31,
		soKr: 9,
		daCapNhat: 9,
		tuTinThap: 0,
	}),
	don("bp:ht", "Khối Hỗ trợ", "bo-phan", "goc", "Lê Hoàng Phương Nga", {
		soMucTieu: 0,
		tienDo: null,
		kyVong: null,
		soKr: 0,
		daCapNhat: 0,
		tuTinThap: 0,
	}),
	don("pb:ht-tc", "Tài chính", "phong-ban", "bp:ht", "Bùi Thị Ngọc Anh", {
		soMucTieu: 3,
		tienDo: 57,
		kyVong: 31,
		soKr: 8,
		daCapNhat: 8,
		tuTinThap: 0,
	}),
	don("pb:ht-ns", "Nhân sự", "phong-ban", "bp:ht", "Trịnh Văn Long", {
		soMucTieu: 3,
		tienDo: 22,
		kyVong: 31,
		soKr: 9,
		daCapNhat: 2,
		tuTinThap: 3,
	}),
	don("pb:ht-pc", "Pháp chế", "phong-ban", "bp:ht", null, {
		soMucTieu: 4,
		tienDo: 30,
		kyVong: 31,
		soKr: 10,
		daCapNhat: 4,
		tuTinThap: 1,
	}),
	don("pb:dl", "Trung tâm Dữ liệu", "phong-ban", "goc", "Cao Nhật Minh", {
		soMucTieu: 2,
		tienDo: 49,
		kyVong: 31,
		soKr: 6,
		daCapNhat: 5,
		tuTinThap: 0,
	}),
];

export const GOP_KHOI_KINH_DOANH = { soMucTieu: 16, tienDo: 41 };

export const donCua = (khoa: string): DonBcd => {
	const d = CAY.find((x) => x.khoa === khoa);
	if (!d) throw new Error(`proto bo-okr-chi-don-vi: không có đơn vị ${khoa}`);
	return d;
};

export type LanCan = {
	cha: DonBcd | null;
	cungCap: DonBcd[];
	trucThuoc: DonBcd[];
};

export function lanCan(khoa: string): LanCan {
	const d = donCua(khoa);
	const cha = d.cha === null ? null : donCua(d.cha);
	const cungCap =
		d.cha === null
			? []
			: CAY.filter(
					(x) => x.cha === d.cha && x.khoa !== d.khoa && x.cap === d.cap,
				);
	return {
		cha,
		cungCap,
		trucThuoc: CAY.filter((x) => x.cha === d.khoa),
	};
}

const kr = (
	id: string,
	ten: string,
	phuTrach: string,
	giaTri: string,
	tienDo: number,
	nhip: NhipOkr,
	tuTin: MucTuTin | null,
): KrBcd => ({ id, ten, phuTrach, giaTri, tienDo, nhip, tuTin });

export const MUC_TIEU_KHOI: MucTieuBcd[] = [
	{
		id: "k1",
		ten: "Doanh thu đối tác doanh nghiệp tăng trưởng bền, không dồn vào một tháng cuối quý",
		loai: "Cam kết",
		phuTrach: "Trần Quang Vinh",
		tienDo: 52,
		nhip: "dung-nhip",
		canBan: false,
		daBo: false,
		kr: [
			kr(
				"k1r1",
				"Doanh thu ký mới từ đối tác doanh nghiệp",
				"Trần Quang Vinh",
				"7,8 / 15 tỷ ₫",
				52,
				"dung-nhip",
				"cao",
			),
			kr(
				"k1r2",
				"Tỷ trọng doanh thu tháng 12 trên cả quý",
				"Lý Thanh Hà",
				"38 / ≤ 40 %",
				61,
				"dung-nhip",
				"vua",
			),
			kr(
				"k1r3",
				"Hợp đồng gia hạn trước hạn ít nhất 30 ngày",
				"Đỗ Minh Khôi",
				"21 / 40",
				52,
				"dung-nhip",
				"vua",
			),
			kr(
				"k1r4",
				"Đối tác chiến lược có kế hoạch tài khoản ký chung",
				"Trần Quang Vinh",
				"3 / 8",
				38,
				"cham-nhip",
				null,
			),
		],
	},
	{
		id: "k2",
		ten: "Mỗi phòng kinh doanh đọc chung một phễu, không ai phải hỏi lại số của phòng khác",
		loai: "Thử thách",
		phuTrach: "Trần Quang Vinh",
		tienDo: 40,
		nhip: "cham-nhip",
		canBan: true,
		daBo: false,
		kr: [
			kr(
				"k2r1",
				"Phòng dùng chung định nghĩa giai đoạn thoả thuận",
				"Lý Thanh Hà",
				"3 / 4 phòng",
				75,
				"dung-nhip",
				"cao",
			),
			kr(
				"k2r2",
				"Thoả thuận quá hạn bước kế tiếp trên 14 ngày",
				"Đỗ Minh Khôi",
				"41 / ≤ 15",
				18,
				"truot",
				"thap",
			),
			kr(
				"k2r3",
				"Báo cáo tuần của khối tự sinh, không chép tay",
				"Trần Quang Vinh",
				"Chưa xong",
				0,
				"moc-chua",
				"vua",
			),
		],
	},
	{
		id: "k3",
		ten: "Mở văn phòng đại diện ở Đà Nẵng trong quý",
		loai: "Thử thách",
		phuTrach: "Trần Quang Vinh",
		tienDo: 10,
		nhip: "truot",
		canBan: false,
		daBo: true,
		kr: [
			kr(
				"k3r1",
				"Thuê được mặt bằng",
				"Trần Quang Vinh",
				"Chưa xong",
				0,
				"moc-chua",
				null,
			),
		],
	},
];

export const MUC_TIEU_PHONG: MucTieuBcd[] = [
	{
		id: "p1",
		ten: "Khách hàng miền Bắc mua lại trong chín mươi ngày",
		loai: "Cam kết",
		phuTrach: "Đỗ Minh Khôi",
		tienDo: 44,
		nhip: "dung-nhip",
		canBan: false,
		daBo: false,
		kr: [
			kr(
				"p1r1",
				"Tỷ lệ mua lại trong 90 ngày",
				"Đỗ Minh Khôi",
				"31 / 45 %",
				69,
				"dung-nhip",
				"cao",
			),
			kr(
				"p1r2",
				"Khách hàng có người chăm sóc riêng",
				"Trương Bảo Ngọc",
				"120 / 300",
				40,
				"cham-nhip",
				"vua",
			),
			kr(
				"p1r3",
				"Gọi lại sau đơn đầu trong 7 ngày",
				"Trương Bảo Ngọc",
				"62 / 90 %",
				69,
				"dung-nhip",
				"vua",
			),
		],
	},
	{
		id: "p2",
		ten: "Đội bán hàng mới tự chốt đơn đầu tiên trong tháng thứ hai",
		loai: "Học tập",
		phuTrach: "Đỗ Minh Khôi",
		tienDo: 33,
		nhip: "cham-nhip",
		canBan: true,
		daBo: false,
		kr: [
			kr(
				"p2r1",
				"Người mới chốt đơn đầu trong 60 ngày",
				"Phan Văn Tài",
				"2 / 6",
				33,
				"cham-nhip",
				"thap",
			),
			kr(
				"p2r2",
				"Buổi đi cùng người cũ mỗi tuần",
				"Đỗ Minh Khôi",
				"14 / 24",
				58,
				"dung-nhip",
				"vua",
			),
		],
	},
	{
		id: "p3",
		ten: "Danh sách khách hàng sạch trùng",
		loai: "Cam kết",
		phuTrach: "Trương Bảo Ngọc",
		tienDo: 38,
		nhip: "cham-nhip",
		canBan: false,
		daBo: false,
		kr: [
			kr(
				"p3r1",
				"Bản ghi trùng còn lại",
				"Trương Bảo Ngọc",
				"410 / ≤ 50",
				21,
				"truot",
				"thap",
			),
			kr(
				"p3r2",
				"Công ty có mã số thuế",
				"Phan Văn Tài",
				"71 / 95 %",
				75,
				"dung-nhip",
				"cao",
			),
		],
	},
];
