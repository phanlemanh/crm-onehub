import type { MucTuTin } from "@crm/ui/components/okr-status";
import type { KrMau, LanCapNhat } from "../lich-su-moi-lan-cap-nhat/du-lieu";

export type LanKr = LanCapNhat & { ghiHo?: string };

export type KrNgan = Omit<KrMau, "lan"> & { lan: LanKr[] };

export const NGUOI = {
	chu: "Lê Thị Minh Phương",
	truongDonVi: "Trần Văn Long",
	donVi: "Phòng Kinh doanh miền Trung và Tây Nguyên",
} as const;

const MUC_TIEU = {
	phanPhoi:
		"Mở rộng mạng lưới phân phối độc quyền ra toàn bộ các tỉnh miền Trung và Tây Nguyên trước mùa cao điểm Tết",
	doanhSo: "Tăng doanh số kênh đại lý ở miền Trung lên gấp đôi so với quý 3",
} as const;

const lan = (
	checkInId: string,
	luc: string,
	giaTri: number | null,
	tuTin: MucTuTin,
	ghiChu: string | null,
): LanKr => ({ checkInId, luc, giaTri, tuTin, ghiChu, camXuc: {} });

export const KR_DAI_LY: KrNgan = {
	id: "kr-dai-ly-cap-1",
	tieuDe:
		"Tăng số đại lý cấp 1 ký hợp đồng phân phối độc quyền khu vực miền Trung và Tây Nguyên",
	mucTieu: MUC_TIEU.phanPhoi,
	chuTen: NGUOI.chu,
	kieu: "so",
	donVi: "đại lý",
	batDau: 4,
	dich: 24,
	han: "13/12/2026",
	lan: [
		lan(
			"ci-dl-01",
			"2026-09-16T09:10:00+07:00",
			5,
			"cao",
			"Ký với đại lý Hoà Phát ở Quảng Nam.",
		),
		lan(
			"ci-dl-02",
			"2026-09-18T16:30:00+07:00",
			6,
			"cao",
			"Thêm đại lý ở Tam Kỳ.",
		),
		lan("ci-dl-03", "2026-09-23T10:05:00+07:00", 7, "cao", null),
		lan(
			"ci-dl-04",
			"2026-09-30T14:20:00+07:00",
			8,
			"vua",
			"Đại lý Kon Tum xin thêm một tuần để xem điều khoản độc quyền.",
		),
		lan(
			"ci-dl-05",
			"2026-10-02T17:45:00+07:00",
			8,
			"vua",
			"Chưa ký thêm; đang chờ hai bản hợp đồng có dấu.",
		),
		lan(
			"ci-dl-06",
			"2026-10-07T08:40:00+07:00",
			10,
			"vua",
			"Hai đại lý Gia Lai và Đắk Lắk ký cùng ngày.",
		),
		lan(
			"ci-dl-07",
			"2026-10-09T15:15:00+07:00",
			10,
			"thap",
			"Đối thủ chào chiết khấu cao hơn 3% ở Buôn Ma Thuột; cần phòng Tài chính duyệt hỗ trợ vận chuyển để giữ đại lý.",
		),
		lan(
			"ci-dl-08",
			"2026-10-14T11:00:00+07:00",
			11,
			"vua",
			"Giữ được Buôn Ma Thuột nhờ hỗ trợ vận chuyển.",
		),
		lan(
			"ci-dl-09",
			"2026-10-20T09:30:00+07:00",
			12,
			"vua",
			"Ký với đại lý Quy Nhơn; Pleiku và Huế đang đàm phán.",
		),
	],
};

export const KR_DAI_LY_DA_CAP_NHAT: KrNgan = {
	...KR_DAI_LY,
	lan: [
		...KR_DAI_LY.lan,
		lan(
			"ci-dl-10",
			"2026-10-27T10:20:00+07:00",
			13,
			"vua",
			"Pleiku ký; Huế hẹn ký tuần sau.",
		),
	],
};

export const LAN_VUA_GUI: LanKr = lan(
	"ci-dl-moi",
	"2026-10-28T14:05:00+07:00",
	14,
	"vua",
	"Huế ký sớm; còn sáu tỉnh chưa có đại lý độc quyền.",
);

export const KR_DAI_LY_VUA_GUI: KrNgan = {
	...KR_DAI_LY,
	lan: [...KR_DAI_LY.lan, LAN_VUA_GUI],
};

export const KR_MOC: KrNgan = {
	id: "kr-hop-dong-khung-da-nang",
	tieuDe:
		"Ký hợp đồng khung với tổng đại lý Đà Nẵng cho toàn bộ dòng sản phẩm gia dụng năm 2027",
	mucTieu: MUC_TIEU.phanPhoi,
	chuTen: NGUOI.chu,
	kieu: "moc",
	donVi: "",
	batDau: 0,
	dich: 1,
	han: "30/11/2026",
	lan: [
		lan(
			"ci-m-1",
			"2026-09-22T14:00:00+07:00",
			null,
			"cao",
			"Gửi bản nháp hợp đồng khung cho pháp chế hai bên.",
		),
		lan(
			"ci-m-2",
			"2026-10-05T10:15:00+07:00",
			null,
			"vua",
			"Tổng đại lý đề nghị đổi điều khoản thanh toán 45 ngày.",
		),
		lan(
			"ci-m-3",
			"2026-10-15T16:20:00+07:00",
			null,
			"vua",
			"Chốt thanh toán 30 ngày; chờ giám đốc hai bên ký.",
		),
	],
};

const KR_DOANH_SO: KrNgan = {
	id: "kr-doanh-so-dai-ly",
	tieuDe: "Doanh số bán qua đại lý cấp 1 khu vực miền Trung",
	mucTieu: MUC_TIEU.doanhSo,
	chuTen: "Nguyễn Hoàng Bảo Anh",
	kieu: "so",
	donVi: "tỷ đồng",
	batDau: 6,
	dich: 12,
	han: "13/12/2026",
	lan: [
		lan("ci-ds-1", "2026-09-29T09:00:00+07:00", 6.8, "cao", null),
		lan(
			"ci-ds-2",
			"2026-10-13T09:00:00+07:00",
			7.6,
			"vua",
			"Đơn Tết về chậm hai tuần.",
		),
		lan("ci-ds-3", "2026-10-20T09:00:00+07:00", 8.1, "vua", null),
	],
};

const KR_DIEM_BAN: KrNgan = {
	id: "kr-diem-ban",
	tieuDe: "Số điểm bán lẻ trưng bày đủ bộ nhận diện thương hiệu",
	mucTieu: MUC_TIEU.doanhSo,
	chuTen: "Đặng Quốc Việt",
	kieu: "so",
	donVi: "điểm bán",
	batDau: 40,
	dich: 200,
	han: "13/12/2026",
	lan: [
		lan("ci-db-1", "2026-10-06T15:00:00+07:00", 62, "cao", null),
		lan(
			"ci-db-2",
			"2026-10-26T15:00:00+07:00",
			95,
			"cao",
			"Đợt lắp kệ Quảng Ngãi xong.",
		),
	],
};

const KR_DAO_TAO: KrNgan = {
	id: "kr-dao-tao",
	tieuDe: "Tỷ lệ đại lý mới hoàn thành khoá đào tạo sản phẩm",
	mucTieu: MUC_TIEU.phanPhoi,
	chuTen: "Võ Thị Thanh Tâm",
	kieu: "so",
	donVi: "%",
	batDau: 0,
	dich: 90,
	han: "13/12/2026",
	lan: [
		lan("ci-dt-1", "2026-10-08T10:00:00+07:00", 35, "vua", null),
		lan("ci-dt-2", "2026-10-21T10:00:00+07:00", 50, "thap", "Lớp Huế hoãn."),
	],
};

export const DS_THUONG: readonly KrNgan[] = [
	KR_DAI_LY,
	KR_MOC,
	KR_DOANH_SO,
	KR_DIEM_BAN,
	KR_DAO_TAO,
];

export const DS_HOP_TUAN: readonly KrNgan[] = [
	KR_DOANH_SO,
	KR_DAI_LY,
	KR_DIEM_BAN,
	KR_MOC,
	KR_DAO_TAO,
];
