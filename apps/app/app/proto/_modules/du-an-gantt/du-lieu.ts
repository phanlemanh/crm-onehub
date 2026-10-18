import type {
	GanttDuAnLich,
	GanttDuAnMoc,
	GanttDuAnViec,
} from "@crm/ui/components/gantt-du-an";

export const HOM_NAY = "2026-10-16";

export const LICH: GanttDuAnLich = {
	ngayNghiTuan: [6, 7],
	ngayLe: ["2026-10-26"],
};

export type DuAnMau = {
	id: string;
	ten: string;
	soViec: number;
	soXong: number;
	khoang: string;
	mocKe: string | null;
	mocTre: boolean;
	nguoiTao: string;
};

export const DU_AN_MO: DuAnMau[] = [
	{
		id: "da-1",
		ten: "Triển khai Ngân hàng An Phát",
		soViec: 7,
		soXong: 1,
		khoang: "19/10 – 06/11",
		mocKe: "Go-live · 30/10",
		mocTre: false,
		nguoiTao: "Lan Nguyễn",
	},
	{
		id: "da-2",
		ten: "Ra mắt gói đại lý quý 4",
		soViec: 5,
		soXong: 0,
		khoang: "26/10 – 20/11",
		mocKe: "Ra mắt · 20/11",
		mocTre: false,
		nguoiTao: "Minh Trần",
	},
];

export const DU_AN_DONG: DuAnMau[] = [
	{
		id: "da-3",
		ten: "Triển khai Công ty Bảo Tín",
		soViec: 6,
		soXong: 6,
		khoang: "01/09 – 26/09",
		mocKe: null,
		mocTre: false,
		nguoiTao: "Lan Nguyễn",
	},
];

export const VIEC: GanttDuAnViec[] = [
	{
		id: "v-hop",
		tieuDe: "Họp khởi động với ngân hàng",
		chaId: null,
		batDau: "2026-10-19",
		han: "2026-10-19",
		nghia: "xong",
		suaDuoc: true,
		phaiCho: [],
	},
	{
		id: "v-hd",
		tieuDe: "Ký hợp đồng triển khai",
		chaId: null,
		batDau: "2026-10-20",
		han: "2026-10-21",
		nghia: "dangChay",
		suaDuoc: true,
		phaiCho: ["v-hop"],
	},
	{
		id: "v-dl",
		tieuDe: "Chuẩn bị dữ liệu khách hàng",
		chaId: null,
		batDau: "2026-10-22",
		han: "2026-10-28",
		nghia: "nhap",
		suaDuoc: true,
		phaiCho: ["v-hd"],
	},
	{
		id: "v-dl-1",
		tieuDe: "Xuất danh sách chi nhánh",
		chaId: "v-dl",
		batDau: "2026-10-22",
		han: "2026-10-23",
		nghia: "nhap",
		suaDuoc: true,
		phaiCho: [],
	},
	{
		id: "v-dl-2",
		tieuDe: "Đối soát mã nhân viên",
		chaId: "v-dl",
		batDau: "2026-10-27",
		han: "2026-10-28",
		nghia: "nhap",
		suaDuoc: false,
		phaiCho: ["v-dl-1"],
	},
	{
		id: "v-dt",
		tieuDe: "Đào tạo nhân viên quan hệ khách hàng",
		chaId: null,
		batDau: "2026-10-29",
		han: "2026-10-29",
		nghia: "nhap",
		suaDuoc: false,
		phaiCho: ["v-dl"],
	},
	{
		id: "v-tl",
		tieuDe: "Gửi tài liệu hướng dẫn",
		chaId: null,
		batDau: null,
		han: null,
		nghia: "nhap",
		suaDuoc: true,
		phaiCho: [],
	},
];

export const MOC: GanttDuAnMoc[] = [
	{ id: "m-go", ten: "Go-live", ngay: "2026-10-30", tre: false, cho: ["v-dt"] },
];

export function viecDaDoi(): GanttDuAnViec[] {
	return VIEC.map((v) => {
		if (v.id === "v-hd") return { ...v, han: "2026-10-23" };
		if (v.id === "v-dl")
			return { ...v, batDau: "2026-10-27", han: "2026-10-30" };
		if (v.id === "v-dt")
			return { ...v, batDau: "2026-11-02", han: "2026-11-02" };
		return v;
	});
}

export const MOC_TRE: GanttDuAnMoc[] = [
	{ id: "m-go", ten: "Go-live", ngay: "2026-10-30", tre: true, cho: ["v-dt"] },
];

export const VIEC_CUA_TOI = [
	{
		id: "v-hd",
		tieuDe: "Ký hợp đồng triển khai",
		duAn: "Triển khai Ngân hàng An Phát",
		gan: null,
		han: "21/10",
	},
	{
		id: "v-goi",
		tieuDe: "Gọi lại anh Minh về gói đại lý",
		duAn: null,
		gan: "Thoả thuận Bảo Tín",
		han: "20/10",
	},
	{
		id: "v-dt",
		tieuDe: "Đào tạo nhân viên quan hệ khách hàng",
		duAn: "Triển khai Ngân hàng An Phát",
		gan: null,
		han: "29/10",
	},
	{
		id: "v-rieng",
		tieuDe: "Chuẩn bị báo cáo tuần",
		duAn: null,
		gan: null,
		han: "17/10",
	},
];

export const NGAY_LE = [
	{ ngay: "26/10/2026", ten: "Nghỉ bù" },
	{ ngay: "01/01/2027", ten: "Tết Dương lịch" },
];

export const CHU = {
	viec: "Việc",
	phamVi: "Phạm vi",
	cuaToi: "Của tôi",
	tatCaDuAn: "Tất cả dự án",
	duAnDangMo: "Dự án đang mở",
	taoDuAnMo: "Tạo dự án…",
	moTaCuaToi: "Việc bạn làm, bạn giao và bạn theo dõi.",
	moTaTatCa: "Mọi đợt triển khai đang mở và đã đóng.",
	moTaMotDuAn: "Việc của một đợt triển khai, xếp lịch trên Gantt.",
	giaoViec: "Giao việc",
	cotViec: "Việc",
	dongDuAn: (ten: string) => `Dự án: ${ten}`,
	thaoTacDuAn: "Thao tác dự án",
	suaDuAn: "Sửa dự án",
	themMoc: "Thêm mốc",
	trangDuAn: "Dự án",
	moTaDuAn: "Gom việc của một đợt triển khai và xếp lịch trên Gantt.",
	taoDuAn: "Tạo dự án",
	cotTen: "Dự án",
	cotTienDo: "Tiến độ",
	cotKhoang: "Khoảng ngày",
	cotMoc: "Mốc kế",
	cotNguoiTao: "Người tạo",
	daDong: (n: number) => `Đã đóng (${n})`,
	tienDo: (x: number, y: number) => `${x}/${y} việc xong`,
	tre: "trễ",
	chuaCoDuAn: "Chưa có dự án",
	chuaCoDuAnMoTa: "Một dự án gom việc của một đợt triển khai có đầu có cuối.",
	loiDs: "Không tải được danh sách dự án",
	loiLich: "Không tải được lịch dự án",
	loiMoTa: "Máy chủ không trả lời. Thử lại sau giây lát.",
	themViec: "Thêm việc",
	duAnChuaCoViec: "Dự án chưa có việc",
	duAnChuaCoViecMoTa:
		"Thêm việc với ngày bắt đầu và hạn để thấy chúng trên Gantt.",
	kieuXem: "Kiểu xem",
	gantt: "Gantt",
	danhSach: "Danh sách",
	bang: "Bảng",
	daDongDong: "Dự án đã đóng. Việc trong dự án vẫn đổi trạng thái được.",
	moLai: "Mở lại",
	daDoi: "Đã dời 2 việc",
	hoiDongTieuDe: "Đóng dự án?",
	hoiDongThan: "Dự án còn 5 việc chưa xong. Vẫn đóng?",
	dong: "Đóng dự án",
	thoi: "Thôi",
	tenDuAn: "Tên dự án",
	moTa: "Mô tả",
	tao: "Tạo",
	huy: "Huỷ",
	batDau: "Bắt đầu",
	han: "Hạn",
	duAn: "Dự án",
	phaiCho: (n: number) => `Phải chờ (${n})`,
	themPhaiCho: "Thêm việc phải chờ",
	loiVong:
		"Phụ thuộc này tạo vòng: «Chuẩn bị dữ liệu khách hàng» → «Ký hợp đồng triển khai» → «Chuẩn bị dữ liệu khách hàng».",
	lichLamViec: "Lịch làm việc",
	lichMoTa: "Ngày công ty nghỉ. Tự dời bỏ qua các ngày này.",
	nghiTuan: "Ngày nghỉ trong tuần",
	nghiTuanMoTa:
		"Đổi ngày nghỉ không dời việc đã xếp; lần dời sau mới tính theo lịch mới.",
	ngayLe: "Ngày lễ",
	ngayLeMoTa: "Quản trị thêm từng ngày; Gantt tô nền các ngày này.",
	themNgayLe: "Thêm ngày lễ",
	xoaNgayLe: (ten: string) => `Xoá ngày lễ ${ten}`,
	khongDuQuyen: "Không đủ quyền. Chỉ chủ và quản trị đổi lịch làm việc.",
	thu: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
	thuDayDu: [
		"Thứ Hai",
		"Thứ Ba",
		"Thứ Tư",
		"Thứ Năm",
		"Thứ Sáu",
		"Thứ Bảy",
		"Chủ nhật",
	],
} as const;
