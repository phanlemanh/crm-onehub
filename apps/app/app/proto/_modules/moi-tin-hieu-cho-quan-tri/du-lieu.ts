import type { BaSo, DongTatCa } from "@/lib/tin-hieu/loc-tat-ca";

export const STATE = {
	cuaToiQuanTri: "ST-cua-toi-quan-tri",
	tatCaCo: "ST-tat-ca-co",
	tatCaThieu: "ST-tat-ca-thieu",
	tatCaKhongBanVe: "ST-tat-ca-khong-ban-ve",
	tatCaRong: "ST-tat-ca-rong",
	tatCaDangTai: "ST-tat-ca-dang-tai",
	tatCaLoi: "ST-tat-ca-loi",
	tatCaKhongQuyen: "ST-tat-ca-khong-quyen",
	hopBaoTruoc: "ST-hop-bao-truoc",
} as const;

const KD = { id: "pb-kd", ten: "Kinh doanh" };
const NS = { id: "pb-ns", ten: "Nhân sự" };
const KT = { id: "pb-kt", ten: "Kế toán" };
const LAN = { id: "u-lan", ten: "Nguyễn Thị Lan" };
const MINH = { id: "u-minh", ten: "Trần Văn Minh" };
const HA = { id: "u-ha", ten: "Lê Thu Hà" };
const QUANG = { id: "u-quang", ten: "Phạm Quang" };

const CHO_LAY_VE = {
	khoa: "cho-lay-ve",
	nhan: "Chờ lấy về",
	cau: "Đã nhận — chờ đội sản phẩm lấy về",
	nghia: "nhap" as const,
};
const CHO_GOM = {
	khoa: "cho-gom",
	nhan: "Chờ gom",
	cau: "Đội sản phẩm đã lấy về — chờ gom nhóm",
	nghia: "nhap" as const,
};

export const DONG_TAT_CA: DongTatCa[] = [
	{
		id: "t9",
		ma: "crm-9",
		tieuDe: "Không lọc được thoả thuận theo người phụ trách",
		muonLam: "Xem các thoả thuận của nhóm tôi",
		man: "/deals",
		guiLuc: "2026-11-11T08:20:00Z",
		nguoiGui: LAN,
		phongBan: KD,
		trangThai: CHO_LAY_VE,
	},
	{
		id: "t8",
		ma: "crm-8",
		tieuDe: "Ô ngày nghỉ phép không nhận ngày lễ",
		muonLam: "Ghi ngày nghỉ cho nhân viên",
		man: "/okr/kr",
		guiLuc: "2026-11-10T02:05:00Z",
		nguoiGui: HA,
		phongBan: NS,
		trangThai: CHO_LAY_VE,
	},
	{
		id: "t7",
		ma: "crm-7",
		tieuDe: "Mở cập nhật KR không thấy số tuần trước",
		muonLam: "Cập nhật số tuần này cho KR của tôi",
		man: "/okr/kr",
		guiLuc: "2026-11-06T03:40:00Z",
		nguoiGui: MINH,
		phongBan: KD,
		trangThai: {
			khoa: "nhom-chua-cat",
			nhan: "Đã vào nhóm",
			cau: "Đã vào nhóm «Cập nhật KR» — chờ chọn vào lộ trình",
			nghia: "nhap",
		},
	},
	{
		id: "t6",
		ma: "crm-6",
		tieuDe: "Báo cáo tuần không tải được tệp Excel",
		muonLam: "Gửi báo cáo tuần cho trưởng phòng",
		man: "/tai-lieu",
		guiLuc: "2026-10-30T09:10:00Z",
		nguoiGui: QUANG,
		phongBan: KT,
		trangThai: {
			khoa: "dang-lam",
			nhan: "Đang làm",
			cau: "Thành việc «Xuất báo cáo tuần» — đang làm",
			nghia: "dangChay",
		},
	},
	{
		id: "t5",
		ma: "crm-5",
		tieuDe: "Nút Gửi tín hiệu che mất ô tìm kiếm trên điện thoại",
		muonLam: "Tìm một liên hệ",
		man: "/contacts",
		guiLuc: "2026-10-28T01:00:00Z",
		nguoiGui: LAN,
		phongBan: KD,
		trangThai: {
			khoa: "da-giao",
			nhan: "Đã giao",
			cau: "Thành việc «Sửa thanh đầu trang điện thoại» — đã giao",
			nghia: "xong",
		},
	},
	{
		id: "t4",
		ma: "crm-4",
		tieuDe: "Muốn xem OKR của phòng khác",
		muonLam: "So OKR với phòng Kinh doanh",
		man: "/okr",
		guiLuc: "2026-10-22T07:30:00Z",
		nguoiGui: HA,
		phongBan: NS,
		trangThai: {
			khoa: "le",
			nhan: "Không thành việc",
			cau: "Không thành việc — đã có ở «Toàn cảnh OKR»",
			nghia: "nhap",
		},
	},
	{
		id: "t3",
		ma: "crm-3",
		tieuDe: "Không đổi được ảnh đại diện",
		muonLam: "Cập nhật hồ sơ của tôi",
		man: "/settings/profile",
		guiLuc: "2026-10-20T04:15:00Z",
		nguoiGui: null,
		phongBan: null,
		trangThai: CHO_GOM,
	},
];

export const DONG_THIEU: DongTatCa[] = DONG_TAT_CA.filter(
	(d) => d.nguoiGui === null || d.ma === "crm-9" || d.ma === "crm-8",
).map((d) => (d.ma === "crm-8" ? { ...d, phongBan: null } : d));

export const DONG_KHONG_BAN_VE: DongTatCa[] = DONG_TAT_CA.map((d) => ({
	...d,
	trangThai: d.ma === "crm-9" || d.ma === "crm-8" ? CHO_LAY_VE : CHO_GOM,
}));

export const BA_SO: BaSo = {
	trongKy: 7,
	soPhong: 3,
	khongPhong: 1,
	quaHan: 5,
	chuaCoCho: 1,
};

export const BA_SO_RONG: BaSo = {
	trongKy: 0,
	soPhong: 0,
	khongPhong: 0,
	quaHan: 0,
	chuaCoCho: 0,
};
