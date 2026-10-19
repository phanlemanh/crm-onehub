import type { DongTinHieu } from "@/components/tin-hieu/danh-sach-tin-hieu";
import type { TinHieuMessages } from "@/lib/messages/tin-hieu";

export const STATE = {
	dsCo: "ST-ds-co",
	dsEn: "ST-ds-en",
	dsXacNhanXoa: "ST-ds-xac-nhan-xoa",
	dsXoaKhoa: "ST-ds-xoa-khoa",
	dsXoaHong: "ST-ds-xoa-hong",
	dsDaXoa: "ST-ds-da-xoa",
	dsRong: "ST-ds-rong",
	hopTrong: "ST-hop-trong",
	hopDangGo: "ST-hop-dang-go",
	hopQuaTran: "ST-hop-qua-tran",
	hopQuaTranEn: "ST-hop-qua-tran-en",
	hopLoi: "ST-hop-loi",
	hopDaGui: "ST-hop-da-gui",
} as const;

export const MAN_MAU = "/okr/kr";
export const MUON_LAM_MAU = "Cập nhật số tuần này cho KR của tôi";
export const DA_XAY_RA_MAU =
	"Mở cập nhật KR không thấy số tuần trước\nPhải mở tab khác để xem tuần trước mình nhập bao nhiêu.";

export function dongMau(m: TinHieuMessages): DongTinHieu[] {
	return [
		{
			id: "t41",
			ma: "crm-41",
			tieuDe: "Mở cập nhật KR không thấy số tuần trước",
			muonLam: "Cập nhật số tuần này cho KR của tôi",
			man: "/okr/cm9x2k4lq0001/kr/cm9x2k4lq0007",
			guiLuc: "2026-10-16T02:14:00Z",
			coTheXoa: true,
			trangThai: {
				nhan: m.nhan.choLayVe,
				cau: m.trangThai.choKeoVe,
				nghia: "nhap",
			},
		},
		{
			id: "t38",
			ma: "crm-38",
			tieuDe: "Tài liệu quy trình tuyển dụng tìm không ra khi gõ «tuyển»",
			muonLam: "Tìm quy trình tuyển dụng để gửi cho ứng viên",
			man: "/tai-lieu/quy-trinh-tuyen-dung",
			guiLuc: "2026-10-15T08:40:00Z",
			coTheXoa: false,
			trangThai: {
				nhan: m.nhan.choGom,
				cau: m.trangThai.choGom,
				nghia: "nhap",
			},
		},
		{
			id: "t35",
			ma: "crm-35",
			tieuDe: "Muốn thấy OKR của phòng khác để căn chỉnh",
			muonLam: "Căn chỉnh OKR phòng tôi với phòng Kinh doanh",
			man: "/okr",
			guiLuc: "2026-10-14T03:05:00Z",
			coTheXoa: false,
			trangThai: {
				nhan: m.nhan.dangLam,
				cau: m.cauSauGom.hang
					.replace("{tenViec}", "Xem OKR phòng ban khác")
					.replace("{trangThai}", m.nhan.dangLam),
				nghia: "dangChay",
				khongDich: true,
			},
		},
		{
			id: "t31",
			ma: "crm-31",
			tieuDe:
				"Thêm thành viên mới mà không thấy họ trong danh sách phòng ban ngay, phải tải lại trang mới hiện",
			muonLam: "Thêm người mới vào phòng Kinh doanh",
			man: "/settings/members",
			guiLuc: "2026-10-13T09:30:00Z",
			coTheXoa: false,
			trangThai: {
				nhan: m.nhan.daGiao,
				cau: m.cauSauGom.hang
					.replace("{tenViec}", "Thành viên hiện ngay sau khi thêm")
					.replace("{trangThai}", m.nhan.daGiao),
				nghia: "xong",
				khongDich: true,
			},
		},
	];
}
