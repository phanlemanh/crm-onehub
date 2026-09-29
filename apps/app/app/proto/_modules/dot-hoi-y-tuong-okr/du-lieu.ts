export type KetLuan = "chon" | "de-sau" | "khong-lam" | "da-co";

export type LoaiChuDe = "chu-de" | "y-la";

export type NguoiHoiY = { id: string; ten: string; donVi: string };

export type SoLieuMau = {
	id: string;
	nhan: string;
	giaTri: string;
	ghiChu: string;
};

export type YMau = {
	id: string;
	noiDung: string;
	viSao: string;
	doBangGi: string;
	tacGia: NguoiHoiY;
	dongY: number;
};

export type CauTrich = { yId: string; cau: string };

export type NoiBanTruoc = number | "moi";

export type ChuDeMau = {
	id: string;
	loai: LoaiChuDe;
	ten: string;
	yIds: string[];
	soNguoi: number;
	soDonVi: number;
	dongY: number;
	trich: CauTrich[];
	ketLuan: KetLuan | null;
	lyDo: string;
	cauMucTieu: string;
	noiBanTruoc: NoiBanTruoc | null;
};

export type CauVietTruoc = { so: number; cau: string };

export type HangDoPhu = {
	id: string;
	ten: string;
	cap: "goc" | "bo-phan" | "phong-ban" | "chua-xep";
	theoNgay: (number | null)[];
};

export const NHAN_KET_LUAN = {
	chon: "Chọn",
	"de-sau": "Để sau",
	"khong-lam": "Không làm",
	"da-co": "Đã có",
} satisfies Record<KetLuan, string>;

export const THU_TU_KET_LUAN: KetLuan[] = [
	"chon",
	"de-sau",
	"khong-lam",
	"da-co",
];

export const TRAN = {
	yMoiNguoi: 3,
	soLieu: { it: 1, nhieu: 5 },
	noiDung: { it: 10, nhieu: 300 },
	viSao: 500,
	doBangGi: 200,
	cauVietTruoc: { it: 3, nhieu: 5, kyTu: 200 },
	lyDo: { it: 10, nhieu: 1000 },
} as const;

const nguoi = (id: string, ten: string, donVi: string): NguoiHoiY => ({
	id,
	ten,
	donVi,
});

export const NGUOI = {
	dang: nguoi("le-hai-dang", "Lê Hải Đăng", "Sản phẩm số"),
	trang: nguoi("pham-thu-trang", "Phạm Thu Trang", "Sản phẩm số"),
	van: nguoi("cao-thanh-van", "Cao Thanh Vân", "Chăm sóc đối tác"),
	bao: nguoi("tran-quoc-bao", "Trần Quốc Bảo", "Kinh doanh miền Bắc"),
	nhi: nguoi("hoang-yen-nhi", "Hoàng Yến Nhi", "Kinh doanh miền Bắc"),
	tam: nguoi("ly-thanh-tam", "Lý Thanh Tâm", "Kinh doanh miền Nam"),
	phuc: nguoi("huynh-gia-phuc", "Huỳnh Gia Phúc", "Kinh doanh miền Nam"),
	ha: nguoi("vu-thu-ha", "Vũ Thu Hà", "Chăm sóc đối tác"),
	linh: nguoi("ta-my-linh", "Tạ Mỹ Linh", "Marketing"),
	son: nguoi("dinh-cong-son", "Đinh Công Sơn", "Kho vận"),
	hong: nguoi("to-thi-hong", "Tô Thị Hồng", "Kho vận"),
	hung: nguoi("chu-van-hung", "Chu Văn Hùng", "Điều phối vận tải"),
	uyen: nguoi("nghiem-thu-uyen", "Nghiêm Thu Uyên", "Điều phối vận tải"),
	thu: nguoi("doan-thi-thu", "Đoàn Thị Thu", "Tài chính"),
	vy: nguoi("ninh-thao-vy", "Ninh Thảo Vy", "Nhân sự"),
	viet: nguoi("lu-quoc-viet", "Lữ Quốc Việt", "Pháp chế"),
	anh: nguoi("vo-duc-anh", "Võ Đức Anh", "Sản phẩm số"),
} as const;

export const HOI_Y = {
	congTy: "Hải Đăng Logistics",
	chuKy: "Năm 2027",
	pha: "Lập kế hoạch",
	nguoiChon: NGUOI.dang,
	cauHoi:
		"Nếu là CEO, theo bạn mục tiêu nào quan trọng mà công ty cần thực hiện trong năm tới?",
	loiMo:
		"Năm 2026 chúng ta chạy gần đủ kế hoạch nhưng giữ đối tác cũ kém hơn năm trước. Trước khi tôi đặt mục tiêu cho năm 2027, tôi muốn nghe từ người đang làm hằng ngày: nếu ngồi ghế của tôi, bạn sẽ dồn sức vào đâu? Viết thẳng, kể cả điều bạn nghĩ tôi không muốn nghe.",
	moLuc: "11:00 thứ Hai 07/12",
	han: "17:00 thứ Ba 08/12",
	conLai: "còn 30 giờ",
	niemPhongLuc: "14:20 thứ Hai 07/12",
	congBoLuc: "10:00 thứ Hai 14/12",
	daHieuLuc: "09:12 thứ Ba 15/12",
	thanhVien: 39,
	daGop: 14,
	soY: 23,
} as const;

export const SO_LIEU: SoLieuMau[] = [
	{
		id: "doanh-thu",
		nhan: "Doanh thu 2026 so kế hoạch",
		giaTri: "92%",
		ghiChu: "Thiếu chủ yếu ở hàng lạnh miền Nam",
	},
	{
		id: "hop-dong",
		nhan: "Số hợp đồng mới",
		giaTri: "184",
		ghiChu: "Cao nhất từ trước tới nay",
	},
	{
		id: "quay-lai",
		nhan: "Khách quay lại",
		giaTri: "61%",
		ghiChu: "Năm 2025 là 70%",
	},
	{
		id: "giao-hang",
		nhan: "Thời gian giao trung bình",
		giaTri: "2,4 ngày",
		ghiChu: "Hàng lạnh 1,8 ngày, hàng khô 2,7 ngày",
	},
];

export const CHU_KY_MO_DUOC = ["Năm 2027", "Quý 1 · 2027"] as const;

export const NGUOI_CHON_DUOC: NguoiHoiY[] = [NGUOI.dang, NGUOI.trang];

export const Y_CUA_TOI: YMau[] = [
	{
		id: "toi-1",
		noiDung:
			"Gọi lại mọi đối tác ngừng gửi hàng quá 60 ngày, trước khi họ ký với bên khác",
		viSao:
			"Quý 3 mình mất 11 đối tác mà không ai hỏi vì sao. Ba trong số đó chỉ cần một cuộc gọi.",
		doBangGi: "Số đối tác gửi hàng lại trong 90 ngày sau cuộc gọi",
		tacGia: NGUOI.van,
		dongY: 6,
	},
	{
		id: "toi-2",
		noiDung: "Cho tài xế chụp biên nhận ngay trên điện thoại, bỏ chứng từ giấy",
		viSao:
			"Chứng từ giấy về văn phòng chậm 3–5 ngày nên đối soát với đối tác trễ theo.",
		doBangGi: "Số ngày từ lúc giao tới lúc đối soát xong",
		tacGia: NGUOI.van,
		dongY: 4,
	},
];

export const Y_NGUOI_KHAC: YMau[] = [
	{
		id: "y-1",
		noiDung:
			"Cam kết giao hàng lạnh nội thành trong 24 giờ, trễ thì hoàn phí vận chuyển",
		viSao:
			"Đối tác bán lẻ so mình với bên chuyên hàng lạnh, họ không so với bên chở hàng khô.",
		doBangGi: "Tỷ lệ đơn lạnh giao trong 24 giờ",
		tacGia: NGUOI.tam,
		dongY: 9,
	},
	{
		id: "y-2",
		noiDung:
			"Mỗi đối tác lớn có một người chăm sóc cố định, không chuyền qua tổng đài",
		viSao: "",
		doBangGi: "Tỷ lệ gia hạn của 50 đối tác lớn nhất",
		tacGia: NGUOI.ha,
		dongY: 7,
	},
	{
		id: "y-3",
		noiDung:
			"Nhân viên mới ở kho được kèm 2 tuần trước khi tự nhận ca, có người hướng dẫn riêng",
		viSao:
			"Tháng 10 có 4 lần xếp nhầm hàng, cả 4 lần đều là người mới vào dưới 1 tuần.",
		doBangGi: "Số sự cố xếp nhầm trên 1.000 đơn",
		tacGia: NGUOI.son,
		dongY: 5,
	},
	{
		id: "y-4",
		noiDung: "Mở tuyến sang Lào và Campuchia cho hàng nông sản",
		viSao: "Ba đối tác ở Tây Nguyên đã hỏi hai lần trong năm.",
		doBangGi: "",
		tacGia: NGUOI.phuc,
		dongY: 3,
	},
	{
		id: "y-5",
		noiDung:
			"Mỗi quý, cả văn phòng đi theo xe giao hàng một ngày để hiểu tài xế gặp gì",
		viSao:
			"Phần lớn quy trình do người chưa từng đi giao viết ra, nên tài xế tự làm cách khác.",
		doBangGi: "",
		tacGia: NGUOI.uyen,
		dongY: 2,
	},
	{
		id: "y-6",
		noiDung:
			"Đừng đặt thêm mục tiêu doanh thu nữa, năm nay mọi người đã quá tải rồi",
		viSao:
			"Ba người ở Điều phối nghỉ việc trong quý 3, cả ba đều nói lý do là tăng ca.",
		doBangGi: "Số giờ tăng ca trung bình mỗi người mỗi tháng",
		tacGia: NGUOI.hung,
		dongY: 8,
	},
	{
		id: "y-7",
		noiDung: "Cho đối tác tự xem đơn đang ở đâu mà không phải gọi điện hỏi",
		viSao: "Một nửa cuộc gọi đến tổng đài là hỏi đơn tới đâu rồi.",
		doBangGi: "Số cuộc gọi hỏi tình trạng đơn mỗi tuần",
		tacGia: NGUOI.ha,
		dongY: 6,
	},
	{
		id: "y-8",
		noiDung:
			"Gộp ba bảng giá đang dùng song song thành một, công khai cho đối tác",
		viSao:
			"Cùng một tuyến mà ba nhân viên báo ba giá, đối tác hỏi lại là mất niềm tin.",
		doBangGi: "Số báo giá phải sửa lại sau khi gửi",
		tacGia: NGUOI.nhi,
		dongY: 4,
	},
	{
		id: "y-9",
		noiDung: "Đối soát công nợ với đối tác xong trong 5 ngày đầu tháng",
		viSao:
			"Hiện mất gần ba tuần, tiền về chậm nên tháng nào cũng phải vay ngắn hạn.",
		doBangGi: "Số ngày từ cuối tháng tới lúc đối soát xong",
		tacGia: NGUOI.thu,
		dongY: 3,
	},
	{
		id: "y-10",
		noiDung:
			"Không nhận thêm đối tác nhỏ lẻ ở miền Trung cho tới khi có kho riêng",
		viSao:
			"Đơn nhỏ ở miền Trung đi ghép xe nên lỗ trên từng chuyến, lại hay trễ.",
		doBangGi: "Biên lợi nhuận của tuyến miền Trung",
		tacGia: NGUOI.phuc,
		dongY: 2,
	},
	{
		id: "y-11",
		noiDung:
			"Tài xế được đánh giá lại lộ trình sau mỗi tuần, không chỉ nghe điều phối",
		viSao: "",
		doBangGi: "Số lộ trình được sửa theo góp ý của tài xế",
		tacGia: NGUOI.uyen,
		dongY: 5,
	},
	{
		id: "y-12",
		noiDung:
			"Hợp đồng mẫu dưới 200 triệu thì không cần Pháp chế duyệt từng bản",
		viSao:
			"Pháp chế đang là chỗ tắc: hợp đồng nhỏ chờ cùng hàng với hợp đồng lớn.",
		doBangGi: "Số ngày từ báo giá tới ký",
		tacGia: NGUOI.viet,
		dongY: 4,
	},
	{
		id: "y-13",
		noiDung:
			"Mỗi quý tuyển đủ người trước mùa cao điểm, không tuyển gấp khi đã quá tải",
		viSao: "Tháng 11 năm nào cũng tuyển vội, người mới vào đúng lúc bận nhất.",
		doBangGi: "Số vị trí còn trống lúc vào mùa cao điểm",
		tacGia: NGUOI.vy,
		dongY: 3,
	},
	{
		id: "y-14",
		noiDung: "Đo độ lạnh trong xe theo thời gian thực và gửi cho đối tác xem",
		viSao:
			"Đối tác dược phẩm yêu cầu chứng minh nhiệt độ suốt tuyến mới chịu ký.",
		doBangGi: "Số đối tác dược phẩm ký mới",
		tacGia: NGUOI.bao,
		dongY: 5,
	},
	{
		id: "y-15",
		noiDung: "Bỏ họp giao ban sáng thứ Hai, thay bằng cập nhật viết trong CRM",
		viSao: "Cả phòng mất hai giờ mỗi tuần để nghe việc của người khác.",
		doBangGi: "",
		tacGia: NGUOI.linh,
		dongY: 1,
	},
];

export const THU_TU_XAO_CHO_CAO_THANH_VAN = [
	"y-9",
	"y-4",
	"y-12",
	"y-1",
	"y-15",
	"y-6",
	"y-2",
	"y-11",
	"y-3",
	"y-14",
	"y-7",
	"y-10",
	"y-5",
	"y-13",
	"y-8",
] as const;

export const SO_Y_HIEN_TRUOC = 10;

export const Y_TOI_DA_DONG_Y = "y-2";

export const Y_CHUA_GOM: YMau[] = [
	{
		id: "g-1",
		noiDung: "Làm lại bảng giá hàng lạnh theo khung giờ, giờ thấp điểm rẻ hơn",
		viSao: "Xe lạnh chạy rỗng một nửa sau 14 giờ.",
		doBangGi: "Tỷ lệ lấp đầy xe lạnh buổi chiều",
		tacGia: NGUOI.nhi,
		dongY: 3,
	},
	{
		id: "g-2",
		noiDung: "Tự động nhắc đối tác sắp hết hạn hợp đồng trước 30 ngày",
		viSao: "",
		doBangGi: "Số hợp đồng gia hạn đúng hạn",
		tacGia: NGUOI.bao,
		dongY: 5,
	},
	{
		id: "g-3",
		noiDung: "Thưởng quý cho kho có ít sự cố hàng hỏng nhất",
		viSao:
			"Kho nào cũng nói mình cẩn thận, nhưng số hàng hỏng chênh nhau gấp ba.",
		doBangGi: "Tỷ lệ hàng hỏng theo kho",
		tacGia: NGUOI.hong,
		dongY: 1,
	},
	{
		id: "g-4",
		noiDung:
			"Pháp chế duyệt mẫu hợp đồng một lần, không duyệt lại từng hợp đồng",
		viSao: "Mỗi hợp đồng mới chờ duyệt trung bình 6 ngày.",
		doBangGi: "Số ngày từ báo giá tới ký",
		tacGia: NGUOI.viet,
		dongY: 2,
	},
	{
		id: "g-5",
		noiDung: "Đổi tên công ty cho trẻ hơn",
		viSao: "",
		doBangGi: "",
		tacGia: NGUOI.anh,
		dongY: 0,
	},
];

export const CHU_DE_GOM: ChuDeMau[] = [
	{
		id: "cd-quay-lai",
		loai: "chu-de",
		ten: "Kéo đối tác cũ quay lại",
		yIds: ["toi-1", "y-2", "g-6", "g-7"],
		soNguoi: 8,
		soDonVi: 5,
		dongY: 14,
		trich: [
			{
				yId: "toi-1",
				cau: "Quý 3 mình mất 11 đối tác mà không ai hỏi vì sao.",
			},
			{
				yId: "y-2",
				cau: "Mỗi đối tác lớn có một người chăm sóc cố định, không chuyền qua tổng đài.",
			},
		],
		ketLuan: "chon",
		lyDo: "Mất khách cũ tốn hơn tìm khách mới, và 8 người ở 5 đơn vị cùng thấy điều đó. Tôi giữ đích gia hạn nhưng đổi cách nói: đo bằng số đối tác quay lại, không chỉ tỷ lệ gia hạn.",
		cauMucTieu: "Đối tác đã rời đi quay lại gửi hàng với chúng ta",
		noiBanTruoc: 2,
	},
	{
		id: "cd-hang-lanh",
		loai: "chu-de",
		ten: "Giao hàng lạnh nhanh hơn",
		yIds: ["y-1", "g-8", "g-9"],
		soNguoi: 6,
		soDonVi: 3,
		dongY: 12,
		trich: [
			{
				yId: "y-1",
				cau: "Đối tác bán lẻ so mình với bên chuyên hàng lạnh.",
			},
			{
				yId: "g-8",
				cau: "Xe lạnh miền Nam chạy tuyến dài quá, hàng tới nơi đã hết độ tươi.",
			},
		],
		ketLuan: "chon",
		lyDo: "Hàng lạnh là chỗ thiếu doanh thu lớn nhất năm nay, và đây là điều đối tác bán lẻ hỏi đầu tiên khi ký.",
		cauMucTieu: "Giao hàng lạnh nội vùng trong 24 giờ cho mọi đối tác bán lẻ",
		noiBanTruoc: 1,
	},
	{
		id: "cd-chung-tu",
		loai: "chu-de",
		ten: "Bỏ chứng từ giấy",
		yIds: ["toi-2", "g-10"],
		soNguoi: 4,
		soDonVi: 3,
		dongY: 7,
		trich: [
			{
				yId: "toi-2",
				cau: "Chứng từ giấy về văn phòng chậm 3–5 ngày nên đối soát trễ theo.",
			},
			{
				yId: "g-10",
				cau: "Kế toán nhập lại tay từng biên nhận.",
			},
		],
		ketLuan: "de-sau",
		lyDo: "Tôi đồng ý là cần. Nhưng hệ thống kho mới xong vào quý 2; làm chứng từ số trước lúc đó là làm hai lần. Tôi để sang quý 3 và sẽ hỏi lại đúng nhóm đã góp ý này.",
		cauMucTieu: "",
		noiBanTruoc: null,
	},
	{
		id: "cd-nguoi-moi",
		loai: "chu-de",
		ten: "Người mới học việc bài bản",
		yIds: ["y-3", "g-3", "g-11"],
		soNguoi: 5,
		soDonVi: 2,
		dongY: 9,
		trich: [
			{
				yId: "y-3",
				cau: "Tháng 10 có 4 lần xếp nhầm hàng, cả 4 lần đều là người mới.",
			},
			{
				yId: "g-11",
				cau: "Tài xế mới không biết tuyến nào phải gọi trước cho kho nhận.",
			},
		],
		ketLuan: "chon",
		lyDo: "Bốn lần xếp nhầm trong tháng 10 đều ở người mới. Tôi không có câu nào về việc này trong bản viết trước, và đó là chỗ tôi đã sai.",
		cauMucTieu: "Người mới ở kho và đội xe tự làm chắc tay sau hai tuần",
		noiBanTruoc: null,
	},
	{
		id: "cd-theo-doi",
		loai: "chu-de",
		ten: "Đối tác tự xem đơn đang ở đâu",
		yIds: ["y-7", "g-12"],
		soNguoi: 3,
		soDonVi: 2,
		dongY: 6,
		trich: [
			{
				yId: "y-7",
				cau: "Một nửa cuộc gọi đến tổng đài là hỏi đơn tới đâu rồi.",
			},
			{
				yId: "g-12",
				cau: "Đối tác muốn một đường link gửi cho khách của họ.",
			},
		],
		ketLuan: "da-co",
		lyDo: "",
		cauMucTieu: "",
		noiBanTruoc: null,
	},
];

export const Y_LA: ChuDeMau = {
	id: "yla-di-xe",
	loai: "y-la",
	ten: "Mỗi quý, cả văn phòng đi theo xe giao hàng một ngày để hiểu tài xế gặp gì",
	yIds: ["y-5"],
	soNguoi: 1,
	soDonVi: 1,
	dongY: 2,
	trich: [
		{
			yId: "y-5",
			cau: "Phần lớn quy trình do người chưa từng đi giao viết ra.",
		},
	],
	ketLuan: "khong-lam",
	lyDo: "",
	cauMucTieu: "",
	noiBanTruoc: null,
};

export type YRutGon = { noiDung: string; tacGia: NguoiHoiY };

export const Y_RUT_GON = new Map<string, YRutGon>([
	[
		"toi-1",
		{
			noiDung: "Gọi lại đối tác ngừng gửi hàng quá 60 ngày",
			tacGia: NGUOI.van,
		},
	],
	[
		"toi-2",
		{ noiDung: "Tài xế chụp biên nhận trên điện thoại", tacGia: NGUOI.van },
	],
	[
		"y-1",
		{ noiDung: "Giao hàng lạnh nội thành trong 24 giờ", tacGia: NGUOI.tam },
	],
	[
		"y-2",
		{
			noiDung: "Mỗi đối tác lớn có một người chăm sóc cố định",
			tacGia: NGUOI.ha,
		},
	],
	["y-3", { noiDung: "Kèm người mới ở kho 2 tuần", tacGia: NGUOI.son }],
	["y-5", { noiDung: "Cả văn phòng đi theo xe một ngày", tacGia: NGUOI.uyen }],
	["y-7", { noiDung: "Đối tác tự xem đơn đang ở đâu", tacGia: NGUOI.ha }],
	["g-3", { noiDung: "Thưởng quý cho kho ít hàng hỏng", tacGia: NGUOI.hong }],
	["g-6", { noiDung: "Ưu đãi riêng cho đối tác quay lại", tacGia: NGUOI.bao }],
	[
		"g-7",
		{ noiDung: "Hỏi lý do mỗi lần đối tác không gia hạn", tacGia: NGUOI.linh },
	],
	["g-8", { noiDung: "Rút tuyến xe lạnh miền Nam", tacGia: NGUOI.phuc }],
	["g-9", { noiDung: "Thêm một kho lạnh ở Bình Dương", tacGia: NGUOI.hung }],
	["g-10", { noiDung: "Biên nhận điện tử cho kế toán", tacGia: NGUOI.thu }],
	["g-11", { noiDung: "Sổ tay tuyến cho tài xế mới", tacGia: NGUOI.uyen }],
	[
		"g-12",
		{ noiDung: "Đường link theo dõi đơn cho khách", tacGia: NGUOI.linh },
	],
]);

export type BoSungKhiDu = {
	chuDeId: string;
	lyDo?: string;
	noiBanTruoc?: NoiBanTruoc;
};

export const BO_SUNG_KHI_DU: BoSungKhiDu[] = [
	{
		chuDeId: "cd-theo-doi",
		lyDo: "Sản phẩm số đang làm trang theo dõi đơn trong quý 4 · 2026, ra mắt tháng 1. Không cần thành mục tiêu năm.",
	},
	{
		chuDeId: "yla-di-xe",
		lyDo: "Ý đúng về tinh thần nhưng không phải mục tiêu của công ty. Tôi chuyển cho Nhân sự làm thành hoạt động quý, không đo bằng OKR.",
	},
	{ chuDeId: "cd-nguoi-moi", noiBanTruoc: "moi" },
];

export const BAN_VIET_TRUOC: CauVietTruoc[] = [
	{ so: 1, cau: "Giao hàng lạnh nội vùng trong 24 giờ cho mọi đối tác bán lẻ" },
	{ so: 2, cau: "Giữ ít nhất 85% đối tác gia hạn hợp đồng" },
	{ so: 3, cau: "Mở văn phòng đại diện ở Đà Nẵng" },
	{ so: 4, cau: "Mỗi kho có một người phụ trách an toàn đã qua đào tạo" },
];

export const NHAP_VIET_TRUOC = [
	"Giao hàng lạnh nội vùng trong 24 giờ cho mọi đối tác bán lẻ",
	"Giữ ít nhất 85% đối tác gia hạn hợp đồng",
	"",
];

export const NGAY_DO_PHU = [
	{ id: "0712", nhan: "T2 07/12" },
	{ id: "0812", nhan: "T3 08/12" },
] as const;

export const DO_PHU_DANG_MO: HangDoPhu[] = [
	{ id: "goc", ten: "Toàn công ty", cap: "goc", theoNgay: [36, null] },
	{
		id: "kinh-doanh",
		ten: "Khối Kinh doanh",
		cap: "bo-phan",
		theoNgay: [47, null],
	},
	{
		id: "kd-bac",
		ten: "Kinh doanh miền Bắc",
		cap: "phong-ban",
		theoNgay: [60, null],
	},
	{
		id: "kd-nam",
		ten: "Kinh doanh miền Nam",
		cap: "phong-ban",
		theoNgay: [40, null],
	},
	{
		id: "cham-soc",
		ten: "Chăm sóc đối tác",
		cap: "phong-ban",
		theoNgay: [75, null],
	},
	{ id: "marketing", ten: "Marketing", cap: "phong-ban", theoNgay: [25, null] },
	{
		id: "van-hanh",
		ten: "Khối Vận hành",
		cap: "bo-phan",
		theoNgay: [31, null],
	},
	{ id: "kho-van", ten: "Kho vận", cap: "phong-ban", theoNgay: [40, null] },
	{
		id: "dieu-phoi",
		ten: "Điều phối vận tải",
		cap: "phong-ban",
		theoNgay: [50, null],
	},
	{ id: "san-pham", ten: "Sản phẩm số", cap: "phong-ban", theoNgay: [0, null] },
	{ id: "ho-tro", ten: "Khối Hỗ trợ", cap: "bo-phan", theoNgay: [25, null] },
	{ id: "tai-chinh", ten: "Tài chính", cap: "phong-ban", theoNgay: [33, null] },
	{ id: "nhan-su", ten: "Nhân sự", cap: "phong-ban", theoNgay: [33, null] },
	{ id: "phap-che", ten: "Pháp chế", cap: "phong-ban", theoNgay: [0, null] },
];

export const DO_PHU_HET_HAN: HangDoPhu[] = DO_PHU_DANG_MO.map((h) => ({
	...h,
	theoNgay: [h.theoNgay[0] ?? 0, Math.min(100, (h.theoNgay[0] ?? 0) + 45)],
}));
