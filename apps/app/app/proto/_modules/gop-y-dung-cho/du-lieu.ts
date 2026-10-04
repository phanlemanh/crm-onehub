import { NGUOI } from "../ban-mau-okr/du-lieu";
import { CSKH_1, type MucTieuDu, THEO_DON_VI } from "../muc-tieu-va-kr/du-lieu";

export const STATE = {
	hienTai: "ST-hien-tai",
	aDanhSach: "ST-a-danh-sach",
	aLoc: "ST-a-loc",
	bChiTiet: "ST-b-chi-tiet",
	bBienNhan: "ST-b-bien-nhan",
	bChuaGoi: "ST-b-chua-goi",
	bDangDoc: "ST-b-dang-doc",
	bRong: "ST-b-rong",
	bLoi: "ST-b-loi",
	bHetLuot: "ST-b-het-luot",
	bTat: "ST-b-tat",
	bHopSua: "ST-b-hop-sua",
	bHopSuaKr: "ST-b-hop-sua-kr",
} as const;

export type TrangThaiKara =
	| "co-gop-y"
	| "bien-nhan"
	| "chua-goi"
	| "dang-doc"
	| "rong"
	| "loi"
	| "het-luot"
	| "tat";

const KARA_CUA_STATE = new Map<string, TrangThaiKara>([
	[STATE.bChiTiet, "co-gop-y"],
	[STATE.bBienNhan, "bien-nhan"],
	[STATE.bChuaGoi, "chua-goi"],
	[STATE.bDangDoc, "dang-doc"],
	[STATE.bRong, "rong"],
	[STATE.bLoi, "loi"],
	[STATE.bHetLuot, "het-luot"],
	[STATE.bTat, "tat"],
]);

export function karaCuaState(state: string): TrangThaiKara | undefined {
	return KARA_CUA_STATE.get(state);
}

const NGAY_CAP_NHAT = "28/11";

export const DONG_HN: MucTieuDu = {
	id: "dong-hn",
	ten: "Mạng lưới đối tác khu Đông Hà Nội đủ dày để tự chạy",
	donVi: "Kinh doanh",
	loai: "tham-vong",
	phuTrach: NGUOI.hung,
	gopVao: [],
	trangThai: "cong-bo",
	viSao:
		"Long Biên và Gia Lâm có nhiều công ty vừa đổi văn phòng sau khi cầu Tứ Liên thông xe. Ai có mặt trước sáu tháng này sẽ giữ được khu.",
	kr: [
		{
			id: "dhn-k1",
			ten: "Đạt số giao dịch",
			phuTrach: NGUOI.khoa,
			kieu: "so",
			khoiDiem: 0,
			dich: 1000,
			hienTai: 420,
			donVi: "giao dịch",
			tuTin: "vua",
			capNhatLuc: NGAY_CAP_NHAT,
			ghiChu: null,
			imNgay: 0,
		},
		{
			id: "dhn-k2",
			ten: "Công ty đối tác ký mới ở Long Biên và Gia Lâm",
			phuTrach: NGUOI.hung,
			kieu: "so",
			khoiDiem: 0,
			dich: 40,
			hienTai: 18,
			donVi: "công ty",
			tuTin: "vua",
			capNhatLuc: NGAY_CAP_NHAT,
			ghiChu: null,
			imNgay: 0,
		},
		{
			id: "dhn-k3",
			ten: "Tổ chức sự kiện ra mắt ở Long Biên",
			phuTrach: NGUOI.mai,
			kieu: "moc",
			khoiDiem: 0,
			dich: 1,
			hienTai: 0,
			donVi: "",
			tuTin: "cao",
			capNhatLuc: NGAY_CAP_NHAT,
			ghiChu: null,
			imNgay: 0,
		},
	],
};

export type GopYMau =
	| {
			id: string;
			loai: "viet-lai";
			krId: string;
			truoc: string;
			sau: string;
			lyDo: string;
	  }
	| {
			id: string;
			loai: "hoi";
			krId: string | null;
			cau: string;
			tomTat: string;
			loiDi: string;
			loiDiDen: "kr-moi" | "sua-kr";
	  };

export const GOP_Y: readonly GopYMau[] = [
	{
		id: "g-doi-trong",
		loai: "hoi",
		krId: null,
		cau: "Cả ba KR đều đếm số lượng. Chưa KR nào đo đối tác có ở lại hay không, nên có thể đạt đủ số mà mạng lưới vẫn rỗng.",
		tomTat: "bộ KR thiếu KR đối trọng",
		loiDi: "Thêm KR đối trọng",
		loiDiDen: "kr-moi",
	},
	{
		id: "g-ten-k1",
		loai: "viet-lai",
		krId: "dhn-k1",
		truoc: "Đạt số giao dịch",
		sau: "Đạt 1.000 giao dịch trong quý ở khu Đông Hà Nội",
		lyDo: "Tên chưa có đích và phạm vi; người đọc danh sách không biết bao nhiêu là đủ.",
	},
	{
		id: "g-viec-k3",
		loai: "hoi",
		krId: "dhn-k3",
		cau: "Đây là một việc cần làm, chưa phải kết quả. Kết quả có thể là số đối tác đăng ký trong hai tuần sau sự kiện.",
		tomTat: "KR này là việc, chưa phải kết quả",
		loiDi: "Sửa KR này",
		loiDiDen: "sua-kr",
	},
];

export const LY_DO_KARA =
	"Kara đọc tên, «vì sao lúc này» và 3 KR của Mục tiêu này. Kara chỉ đọc dữ liệu OKR, không đọc hồ sơ đối tác hay hộp thư.";

export const DOC_LUC = "09:12 hôm nay";

const SO_GOP_Y_CHO = new Map<string, number>([
	[DONG_HN.id, GOP_Y.length],
	[CSKH_1.id, 1],
]);

export function soGopYCho(mucTieuId: string): number {
	return SO_GOP_Y_CHO.get(mucTieuId) ?? 0;
}

export const DANH_SACH: MucTieuDu[] = [DONG_HN, ...THEO_DON_VI];

export const DANH_SACH_LOC: MucTieuDu[] = DANH_SACH.filter(
	(mt) => soGopYCho(mt.id) > 0,
);
