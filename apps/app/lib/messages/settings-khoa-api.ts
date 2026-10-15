import type { Locale } from "@crm/ui/lib/locale";

const en = {
	trang: {
		tieuDeTab: "API Keys",
		tieuDe: "API Keys",
		moTa: "Personal keys for calling the API of OneHub Center. A regular key acts as you — anything it can read or change is exactly what you can.",
	},
	bang: {
		ten: "Name",
		chuaDatTen: "Untitled key",
		khoa: "Key",
		ngayTao: "Created",
		dungLanCuoi: "Last used",
		dungLanCuoiDayDu: "Last used date",
		chuaDung: "Never",
		hetHan: "Expires",
		khongHetHan: "Never",
		hanhDong: "Actions",
		tim: "Search by name…",
		trong: "No API keys yet.",
		loaiKeoTinHieu: "Signals only",
	},
	thuHoi: {
		nhan: "Revoke",
		khoaNay: "this API key",
		choKhoa: (ten: string) => `Revoke ${ten}`,
		moTa: "Anything using it stops working immediately. This cannot be undone.",
		huy: "Cancel",
		xong: "API key revoked.",
	},
	tao: {
		nut: "New API key",
		tieuDe: "New API key",
		moTa: "Acts as you. Anything it can read or change is exactly what you can.",
		moTaQuanTri: "Choose what the key is for, then name it.",
		ten: "Name",
		tenGoiY: "CI pipeline",
		tenMoTa: "Something you will recognise later, like where it runs.",
		hetHan: "Expires",
		han30: "30 days",
		han90: "90 days",
		han365: "1 year",
		khongHetHan: "No expiration",
		taoKhoa: "Create key",
		huy: "Cancel",
		loai: "Key for",
		loaiToanQuyen: "Everything you can do",
		loaiToanQuyenMoTa:
			"Acts as you. Anything it can read or change is exactly what you can.",
		loaiKeoTinHieu: "Only pulling signals into the repo",
		loaiKeoTinHieuMoTa:
			"For the daily schedule. It can pull signals and nothing else — it cannot sign in, read records or create keys.",
	},
	daTao: {
		keoTinHieu:
			"This key can only pull signals into the repo. Put it in the schedule's secret CRM_KHOA_KEO_TIN_HIEU.",
		daTao: "created",
		khoaNay: "API key",
		moTa: "Copy it now. Nobody, including us, can show it to you again.",
		nhanChep: "API key",
		xong: "Done",
	},
};

export type KhoaApiMessages = typeof en;

const vi = {
	trang: {
		tieuDeTab: "Khoá API",
		tieuDe: "Khoá API",
		moTa: "Khoá cá nhân để gọi API của OneHub Center. Khoá thường hành động thay bạn — nó đọc và sửa được đúng những gì bạn đọc và sửa được.",
	},
	bang: {
		ten: "Tên",
		chuaDatTen: "Khoá chưa đặt tên",
		khoa: "Khoá",
		ngayTao: "Ngày tạo",
		dungLanCuoi: "Dùng lần cuối",
		dungLanCuoiDayDu: "Ngày dùng lần cuối",
		chuaDung: "Chưa dùng",
		hetHan: "Hết hạn",
		khongHetHan: "Không hết hạn",
		hanhDong: "Hành động",
		tim: "Tìm theo tên…",
		trong: "Chưa có khoá API nào.",
		loaiKeoTinHieu: "Chỉ kéo tín hiệu",
	},
	thuHoi: {
		nhan: "Thu hồi",
		khoaNay: "khoá API này",
		choKhoa: (ten: string) => `Thu hồi ${ten}`,
		moTa: "Mọi thứ đang dùng nó dừng chạy ngay. Không lấy lại được.",
		huy: "Huỷ",
		xong: "Đã thu hồi khoá API.",
	},
	tao: {
		nut: "Khoá API mới",
		tieuDe: "Khoá API mới",
		moTa: "Khoá hành động thay bạn. Nó đọc và sửa được đúng những gì bạn đọc và sửa được.",
		moTaQuanTri: "Chọn khoá dùng để làm gì, rồi đặt tên.",
		ten: "Tên",
		tenGoiY: "Máy chạy CI",
		tenMoTa: "Đặt tên để sau này bạn nhận ra nó, ví dụ chỗ nó chạy.",
		hetHan: "Hết hạn",
		han30: "30 ngày",
		han90: "90 ngày",
		han365: "1 năm",
		khongHetHan: "Không hết hạn",
		taoKhoa: "Tạo khoá",
		huy: "Huỷ",
		loai: "Khoá dùng để",
		loaiToanQuyen: "Mọi việc bạn làm được",
		loaiToanQuyenMoTa:
			"Khoá hành động thay bạn. Nó đọc và sửa được đúng những gì bạn đọc và sửa được.",
		loaiKeoTinHieu: "Chỉ kéo tín hiệu về kho",
		loaiKeoTinHieuMoTa:
			"Cho lịch chạy hằng ngày. Khoá chỉ kéo được tín hiệu — không đăng nhập, không đọc bản ghi, không tạo khoá.",
	},
	daTao: {
		keoTinHieu:
			"Khoá này chỉ kéo được tín hiệu về kho. Đặt nó vào bí mật CRM_KHOA_KEO_TIN_HIEU của lịch chạy.",
		daTao: "vừa được tạo",
		khoaNay: "Khoá API",
		moTa: "Chép nó ngay bây giờ. Không ai, kể cả chúng tôi, hiện lại nó cho bạn được nữa.",
		nhanChep: "Khoá API",
		xong: "Đóng",
	},
} satisfies KhoaApiMessages;

const BANG = { en, vi } satisfies Record<Locale, KhoaApiMessages>;

export function khoaApiMessages(locale: Locale): KhoaApiMessages {
	return BANG[locale];
}
