import type { DongTinHieu } from "@/components/tin-hieu/danh-sach-tin-hieu";
import type { DongTatCa } from "@/lib/tin-hieu/loc-tat-ca";
import { DONG_MAU } from "../gui-tin-hieu-trong-crm/du-lieu";
import { DONG_TAT_CA } from "../moi-tin-hieu-cho-quan-tri/du-lieu";

export const STATE = {
	coMenu: "ST-tat-ca-co-menu",
	vuaLuuTru: "ST-tat-ca-vua-luu-tru",
	luuTruLoi: "ST-tat-ca-luu-tru-loi",
	daLuuTruCo: "ST-da-luu-tru-co",
	daLuuTruRong: "ST-da-luu-tru-rong",
	cuaToiDaLuuTru: "ST-cua-toi-da-luu-tru",
} as const;

const QUAN_TRI = { id: "u-quan-tri", ten: "Đỗ Minh Quân" };

export const DONG_DANG_DUNG: DongTatCa[] = DONG_TAT_CA;

export const DONG_VUA_LUU_TRU: DongTatCa[] = DONG_TAT_CA.filter(
	(d) => d.ma !== "crm-9",
);

export const DONG_LOI: DongTatCa[] = DONG_TAT_CA.map((d) =>
	d.ma === "crm-9"
		? {
				...d,
				daKeoVe: true,
				trangThai: {
					khoa: "cho-gom",
					nhan: "Chờ gom",
					cau: "Đội sản phẩm đã lấy về — chờ gom nhóm",
					nghia: "nhap",
				},
			}
		: d,
);

export const DONG_DA_LUU_TRU: DongTatCa[] = [
	{
		id: "r12",
		ma: "crm-12",
		tieuDe: "test test",
		muonLam: "thử nút gửi",
		man: "/dashboard",
		guiLuc: "2026-11-12T01:05:00Z",
		nguoiGui: { id: "u-lan", ten: "Nguyễn Thị Lan" },
		phongBan: { id: "pb-kd", ten: "Kinh doanh" },
		trangThai: {
			khoa: "cho-lay-ve",
			nhan: "Chờ lấy về",
			cau: "Đã nhận — chờ đội sản phẩm lấy về",
			nghia: "nhap",
		},
		daKeoVe: false,
		luuTru: { luc: "2026-11-12T02:14:00Z", nguoi: QUAN_TRI },
	},
	{
		id: "r11",
		ma: "crm-11",
		tieuDe: "Không lọc được thoả thuận theo người phụ trách",
		muonLam: "Xem các thoả thuận của nhóm tôi",
		man: "/deals",
		guiLuc: "2026-11-11T09:02:00Z",
		nguoiGui: { id: "u-lan", ten: "Nguyễn Thị Lan" },
		phongBan: { id: "pb-kd", ten: "Kinh doanh" },
		trangThai: {
			khoa: "cho-lay-ve",
			nhan: "Chờ lấy về",
			cau: "Đã nhận — chờ đội sản phẩm lấy về",
			nghia: "nhap",
		},
		daKeoVe: false,
		luuTru: { luc: "2026-11-11T10:40:00Z", nguoi: null },
	},
];

export const DONG_CUA_TOI: DongTinHieu[] = [
	{
		id: "t42",
		man: "/dashboard",
		guiLuc: "2026-11-12T01:05:00Z",
		ma: "crm-42",
		tieuDe: "test test",
		muonLam: "thử nút gửi",
		coTheXoa: true,
		trangThai: {
			nhan: "Đã lưu trữ",
			cau: "Quản trị đã lưu trữ tín hiệu này — đội sản phẩm sẽ không xem xét nó.",
			nghia: "ketThuc",
		},
	},
	...DONG_MAU.map((d) => ({
		...d,
		trangThai: {
			nhan: d.coTheXoa ? "Đã nhận" : "Đang xem xét",
			cau: d.coTheXoa
				? "Đội sản phẩm chưa mở. Bạn còn xoá được."
				: "Đội sản phẩm đang xếp nó cùng những điều tương tự. Theo dõi tiến độ ở đây.",
			nghia: "nhap" as const,
		},
	})),
];
