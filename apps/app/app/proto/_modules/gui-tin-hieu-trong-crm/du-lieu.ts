import type { DongTinHieu } from "@/components/tin-hieu/danh-sach-tin-hieu";

export const STATE = {
	nut: "ST-nut",
	hopTrong: "ST-hop-trong",
	hopDangGo: "ST-hop-dang-go",
	hopDangGui: "ST-hop-dang-gui",
	hopDaGui: "ST-hop-da-gui",
	hopQuaTran: "ST-hop-qua-tran",
	hopLoi: "ST-hop-loi",
	dsCo: "ST-ds-co",
	dsRong: "ST-ds-rong",
	dsDangTai: "ST-ds-dang-tai",
	dsKhongDocBanVe: "ST-ds-khong-doc-ban-ve",
	dsXacNhanXoa: "ST-ds-xac-nhan-xoa",
	dsLoi: "ST-ds-loi",
} as const;

export const MAN_MAU = "/okr/kr";

export const CHU_MAU =
	"Mở cập nhật KR không thấy số tuần trước\nPhải mở tab khác để xem tuần trước mình nhập bao nhiêu rồi mới điền được số tuần này.";

export const DONG_MAU: DongTinHieu[] = [
	{
		id: "t41",
		ma: "crm-41",
		tieuDe: "Mở cập nhật KR không thấy số tuần trước",
		man: "/okr/kr",
		guiLuc: "2026-10-16T02:14:00Z",
		coTheXoa: true,
		trangThai: {
			nhan: "Chờ lấy về",
			cau: "Đã nhận — chờ đội sản phẩm lấy về",
			nghia: "nhap",
		},
	},
	{
		id: "t38",
		ma: "crm-38",
		tieuDe: "Tài liệu quy trình tuyển dụng tìm không ra khi gõ «tuyển»",
		man: "/tai-lieu",
		guiLuc: "2026-10-15T08:40:00Z",
		coTheXoa: false,
		trangThai: {
			nhan: "Chờ gom",
			cau: "Đội sản phẩm đã lấy về — chờ gom nhóm",
			nghia: "nhap",
		},
	},
	{
		id: "t35",
		ma: "crm-35",
		tieuDe: "Muốn thấy OKR của phòng khác để căn chỉnh",
		man: "/okr",
		guiLuc: "2026-10-14T09:02:00Z",
		coTheXoa: false,
		trangThai: {
			nhan: "Để sau",
			cau: "vào nhóm Trưởng phòng ban căn chỉnh OKR với phòng khác — để sau: chờ chu kỳ quý I",
			nghia: "nhap",
		},
	},
	{
		id: "t30",
		ma: "crm-30",
		tieuDe: "Nhắc buổi sáng qua Zalo đến muộn hơn giờ đã chọn",
		man: "/reminders",
		guiLuc: "2026-10-14T01:20:00Z",
		coTheXoa: false,
		trangThai: {
			nhan: "Đang làm",
			cau: "vào nhóm Nhân viên nhận nhắc đúng giờ đã chọn → việc Z4 → hồ sơ nhac-dung-gio-zalo: đang làm",
			nghia: "dangChay",
		},
	},
	{
		id: "t22",
		ma: "crm-22",
		tieuDe: "Không biết bấm vào đâu để xem lộ trình việc của phòng mình",
		man: "/",
		guiLuc: "2026-10-14T00:45:00Z",
		coTheXoa: false,
		trangThai: {
			nhan: "Đã có việc",
			cau: "đã có việc đã giao: trang-lo-trinh-trong-crm (đã giao)",
			nghia: "xong",
		},
	},
	{
		id: "t19",
		ma: "crm-19",
		tieuDe: "Cảm ơn, màn OKR mới dễ dùng hơn nhiều",
		man: "/okr",
		guiLuc: "2026-10-14T00:30:00Z",
		coTheXoa: false,
		trangThai: {
			nhan: "Không thành việc",
			cau: "lẻ — lời cảm ơn, không đòi thay đổi gì",
			nghia: "nhap",
		},
	},
];

export function dongTheoState(state: string): DongTinHieu[] {
	if (state === STATE.dsRong) return [];
	if (state === STATE.dsKhongDocBanVe)
		return DONG_MAU.map((d) => ({
			...d,
			trangThai: {
				nhan: d.coTheXoa ? "Chờ lấy về" : "Chờ gom",
				cau: d.coTheXoa
					? "Đã nhận — chờ đội sản phẩm lấy về"
					: "Đội sản phẩm đã lấy về — chờ gom nhóm",
				nghia: "nhap",
			},
		}));
	return DONG_MAU;
}
