export type MucTuTin = "cao" | "vua" | "thap";

export type PhamVi = "tat-ca" | "toi-dan" | "theo-doi";

export type BoMau = { khoa: string; ten: string };

export const BO = {
	goc: { khoa: "goc", ten: "OneHub" },
	kd: { khoa: "bp:kd", ten: "Khối Kinh doanh" },
	kdBac: { khoa: "pb:kd-bac", ten: "Phòng Kinh doanh Doanh nghiệp miền Bắc" },
	kdNam: { khoa: "pb:kd-nam", ten: "Phòng Kinh doanh miền Nam" },
	cskh: { khoa: "pb:cskh", ten: "Phòng Chăm sóc khách hàng" },
	keToan: { khoa: "pb:ke-toan", ten: "Phòng Kế toán" },
	nhanSu: { khoa: "pb:nhan-su", ten: "Phòng Nhân sự" },
} satisfies Record<string, BoMau>;

export const TOI = { id: "u-ha", ten: "Trần Thu Hà" };

export const BO_TOI_DAN = new Set<string>([BO.cskh.khoa]);
export const BO_THEO_DOI = new Set<string>([BO.goc.khoa, BO.kdNam.khoa]);

export type TraLoiMau = {
	id: string;
	nguoi: string;
	than: string;
	luc: string;
};

type KrMau = {
	id: string;
	ten: string;
	mucTieu: string;
	bo: BoMau;
	chu: string;
	kieu: "so" | "moc";
	donVi: string;
	dich: number;
	lan: { giaTri: number; tuTin: MucTuTin; ghiChu: string; tacGia?: string }[];
	traLoi?: TraLoiMau[];
};

const KR: KrMau[] = [
	{
		id: "kr-1",
		ten: "Doanh thu định kỳ hằng tháng đạt 4,2 tỷ đồng",
		mucTieu: "Tăng trưởng doanh thu bền vững",
		bo: BO.goc,
		chu: "Lê Hải Đăng",
		kieu: "so",
		donVi: "tỷ đồng",
		dich: 4.2,
		lan: [
			{
				giaTri: 3.1,
				tuTin: "vua",
				ghiChu:
					"Hai hợp đồng lớn ở miền Nam lùi sang tháng sau, phần còn lại đúng kế hoạch.",
			},
			{ giaTri: 2.9, tuTin: "vua", ghiChu: "" },
			{
				giaTri: 2.7,
				tuTin: "cao",
				ghiChu: "Đã chốt gói gia hạn của ba khách hàng doanh nghiệp.",
			},
		],
	},
	{
		id: "kr-2",
		traLoi: [
			{
				id: "tl-1",
				nguoi: "Lê Hải Đăng",
				than: "Gửi anh danh sách khách dưới sáu tháng trước thứ Hai nhé, mình xem cùng trong buổi họp.",
				luc: "1 giờ trước",
			},
			{
				id: "tl-2",
				nguoi: "Trần Thu Hà",
				than: "Dạ, em gửi trong chiều nay.",
				luc: "40 phút trước",
			},
		],
		ten: "Tỷ lệ khách hàng rời bỏ dưới 3% mỗi quý",
		mucTieu: "Giữ chân khách hàng hiện có",
		bo: BO.cskh,
		chu: "Trần Thu Hà",
		kieu: "so",
		donVi: "%",
		dich: 3,
		lan: [
			{
				giaTri: 3.6,
				tuTin: "thap",
				ghiChu:
					"Tuần này mất thêm hai khách gói nhỏ vì chuyển sang đối thủ giá rẻ. Cần bàn phương án giữ chân trong buổi họp tuần, nhất là nhóm khách đang dùng dưới sáu tháng.",
			},
			{
				giaTri: 3.4,
				tuTin: "vua",
				ghiChu: "Đang gọi lại từng khách có dấu hiệu rời.",
			},
			{ giaTri: 3.1, tuTin: "vua", ghiChu: "" },
		],
	},
	{
		id: "kr-3",
		ten: "Thời gian phản hồi yêu cầu đầu tiên dưới 2 giờ",
		mucTieu: "Giữ chân khách hàng hiện có",
		bo: BO.cskh,
		chu: "Phạm Minh Tuấn",
		kieu: "so",
		donVi: "giờ",
		dich: 2,
		lan: [
			{
				giaTri: 1.8,
				tuTin: "cao",
				ghiChu: "Ca trực tối đã chạy đủ người.",
				tacGia: "Trần Thu Hà",
			},
			{ giaTri: 2.4, tuTin: "vua", ghiChu: "Thiếu một người ca tối." },
			{ giaTri: 2.6, tuTin: "thap", ghiChu: "" },
		],
	},
	{
		id: "kr-4",
		ten: "Ra mắt cổng hỗ trợ tự phục vụ cho khách hàng doanh nghiệp",
		mucTieu: "Giữ chân khách hàng hiện có",
		bo: BO.cskh,
		chu: "Nguyễn Thị Lan",
		kieu: "moc",
		donVi: "",
		dich: 1,
		lan: [
			{
				giaTri: 0,
				tuTin: "vua",
				ghiChu: "Bản thử nội bộ xong, chờ duyệt nội dung.",
			},
			{ giaTri: 0, tuTin: "cao", ghiChu: "" },
		],
	},
	{
		id: "kr-5",
		traLoi: [
			{
				id: "tl-3",
				nguoi: "Bùi Gia Huy",
				than: "Sáu hồ sơ pháp chế cần anh hỗ trợ đẩy không?",
				luc: "Hôm qua 17:05",
			},
		],
		ten: "Ký mới 40 hợp đồng doanh nghiệp vừa và nhỏ",
		mucTieu: "Mở rộng tập khách hàng doanh nghiệp miền Nam",
		bo: BO.kdNam,
		chu: "Võ Thanh Tâm",
		kieu: "so",
		donVi: "hợp đồng",
		dich: 40,
		lan: [
			{
				giaTri: 17,
				tuTin: "vua",
				ghiChu: "Tuần này ký 4, có 6 hồ sơ chờ pháp chế.",
			},
			{ giaTri: 13, tuTin: "vua", ghiChu: "" },
			{ giaTri: 11, tuTin: "thap", ghiChu: "Hai nhân viên mới chưa đủ việc." },
		],
	},
	{
		id: "kr-6",
		ten: "Tỷ lệ chuyển đổi từ dùng thử sang trả phí đạt 25%",
		mucTieu: "Mở rộng tập khách hàng doanh nghiệp miền Nam",
		bo: BO.kdNam,
		chu: "Đỗ Ngọc Ánh",
		kieu: "so",
		donVi: "%",
		dich: 25,
		lan: [
			{ giaTri: 19, tuTin: "vua", ghiChu: "" },
			{ giaTri: 18, tuTin: "vua", ghiChu: "Thử kịch bản gọi ngày thứ ba." },
		],
	},
	{
		id: "kr-7",
		ten: "Pipeline doanh nghiệp miền Bắc đạt 12 tỷ đồng giá trị cơ hội đủ điều kiện",
		mucTieu: "Đưa OneHub vào các tập đoàn có trên 500 nhân viên ở miền Bắc",
		bo: BO.kdBac,
		chu: "Hoàng Quốc Việt",
		kieu: "so",
		donVi: "tỷ đồng",
		dich: 12,
		lan: [
			{
				giaTri: 8.4,
				tuTin: "cao",
				ghiChu: "Thêm hai cơ hội từ hội thảo ngân hàng.",
			},
			{ giaTri: 7.1, tuTin: "cao", ghiChu: "" },
			{ giaTri: 6.5, tuTin: "vua", ghiChu: "" },
		],
	},
	{
		id: "kr-8",
		ten: "Biên lợi nhuận gộp toàn khối đạt 38%",
		mucTieu: "Kinh doanh có lãi ở mọi phòng",
		bo: BO.kd,
		chu: "Bùi Gia Huy",
		kieu: "so",
		donVi: "%",
		dich: 38,
		lan: [
			{
				giaTri: 34,
				tuTin: "vua",
				ghiChu: "Chiết khấu cuối quý kéo biên xuống.",
			},
			{ giaTri: 35, tuTin: "cao", ghiChu: "" },
		],
	},
	{
		id: "kr-9",
		ten: "Đóng sổ kế toán tháng trong 5 ngày làm việc",
		mucTieu: "Số liệu tài chính đúng hạn",
		bo: BO.keToan,
		chu: "Lý Thị Mai",
		kieu: "so",
		donVi: "ngày",
		dich: 5,
		lan: [
			{ giaTri: 6, tuTin: "vua", ghiChu: "" },
			{
				giaTri: 7,
				tuTin: "thap",
				ghiChu: "Chờ đối chiếu hoá đơn của hai nhà cung cấp.",
			},
		],
	},
	{
		id: "kr-10",
		ten: "Tuyển đủ 12 vị trí kinh doanh trước tuần 8",
		mucTieu: "Đủ người cho kế hoạch quý 4",
		bo: BO.nhanSu,
		chu: "Đặng Thuỳ Linh",
		kieu: "so",
		donVi: "người",
		dich: 12,
		lan: [
			{
				giaTri: 7,
				tuTin: "vua",
				ghiChu: "Ba ứng viên nhận lời, đi làm từ đầu tháng.",
			},
			{ giaTri: 4, tuTin: "vua", ghiChu: "" },
		],
	},
	{
		id: "kr-11",
		ten: "Chỉ số hài lòng khách hàng sau mỗi cuộc gọi đạt 4,6/5",
		mucTieu: "Khách hàng hài lòng với mọi lần liên hệ",
		bo: BO.goc,
		chu: "Trần Thu Hà",
		kieu: "so",
		donVi: "điểm",
		dich: 4.6,
		lan: [
			{ giaTri: 4.4, tuTin: "cao", ghiChu: "" },
			{ giaTri: 4.3, tuTin: "cao", ghiChu: "Khảo sát mới chạy đủ một tuần." },
		],
	},
];

const LUC = [
	[
		"2 giờ trước",
		"3 giờ trước",
		"Hôm nay 08:15",
		"Hôm qua 17:40",
		"Hôm qua 16:05",
		"Hôm qua 10:05",
		"Thứ Bảy 24/10 · 11:20",
		"Thứ Sáu 23/10 · 18:02",
		"Thứ Sáu 23/10 · 09:30",
		"Thứ Năm 22/10 · 15:45",
		"Thứ Năm 22/10 · 08:10",
	],
	[
		"Thứ Sáu 16/10 · 17:20",
		"Thứ Sáu 16/10 · 11:02",
		"Thứ Năm 15/10 · 16:30",
		"Thứ Năm 15/10 · 08:45",
		"Thứ Tư 14/10 · 14:10",
		"Thứ Ba 13/10 · 18:25",
		"Thứ Ba 13/10 · 09:00",
		"Thứ Hai 12/10 · 16:40",
		"Thứ Hai 12/10 · 10:00",
		"Thứ Hai 12/10 · 08:30",
		"Chủ Nhật 11/10 · 21:15",
	],
	[
		"Thứ Sáu 9/10 · 17:00",
		"Thứ Năm 8/10 · 15:20",
		"Thứ Năm 8/10 · 09:40",
		"Thứ Tư 7/10 · 11:05",
		"Thứ Ba 6/10 · 16:45",
		"Thứ Hai 5/10 · 10:30",
	],
];

export type DongTin = {
	id: string;
	krId: string;
	nguoi: string;
	thayCho: string | null;
	kr: string;
	mucTieu: string;
	bo: BoMau;
	giaTri: string;
	tuTin: MucTuTin;
	ghiChu: string;
	luc: string;
	tuan: number;
	moiNhat: boolean;
	traLoi: TraLoiMau[];
};

const so = (n: number) =>
	new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 }).format(n);

function giaTri(kr: KrMau, n: number): string {
	if (kr.kieu === "moc") return n >= 1 ? "Đã xong" : "Chưa xong";
	return `${so(n)} / ${so(kr.dich)} ${kr.donVi}`;
}

export const DONG_TIN: DongTin[] = KR.flatMap((kr) =>
	kr.lan.map((lan, tuan) => {
		const tacGia = lan.tacGia ?? kr.chu;
		return {
			id: `${kr.id}-t${tuan}`,
			krId: kr.id,
			nguoi: tacGia,
			thayCho: tacGia === kr.chu ? null : kr.chu,
			kr: kr.ten,
			mucTieu: kr.mucTieu,
			bo: kr.bo,
			giaTri: giaTri(kr, lan.giaTri),
			tuTin: lan.tuTin,
			ghiChu: lan.ghiChu,
			luc: "",
			tuan,
			moiNhat: tuan === 0,
			traLoi: tuan === 0 ? (kr.traLoi ?? []) : [],
		};
	}),
)
	.sort((a, b) => a.tuan - b.tuan || a.id.localeCompare(b.id))
	.map((d, i, ds) => {
		const thu = ds.slice(0, i).filter((x) => x.tuan === d.tuan).length;
		return { ...d, luc: LUC[d.tuan]?.[thu] ?? "" };
	});

export function khopPhamVi(d: DongTin, p: PhamVi): boolean {
	if (p === "toi-dan") return BO_TOI_DAN.has(d.bo.khoa);
	if (p === "theo-doi") return BO_THEO_DOI.has(d.bo.khoa);
	return true;
}

export const TONG_THAT = { "tat-ca": 214, "toi-dan": 31, "theo-doi": 47 };
export const CO_TRANG = 20;
