import type { Locale } from "@crm/ui/lib/locale";

const en = {
	trang: {
		moTa: "Let your people sign in through your own identity provider. While one is configured, the sign-in page offers it instead of Google.",
	},
	bang: {
		nhaCungCap: "Provider",
		chuanSaml: "SAML",
		chuanOidc: "OpenID Connect",
		maClient: (bonSo: string) => ` · client …${bonSo}`,
		tenMien: "Email domain",
		issuer: "Issuer",
		uriChuyenHuong: "Redirect URI",
		hanhDong: "Actions",
		tim: "Search by name, domain or issuer…",
		trong: "No identity provider yet — everyone signs in with Google.",
	},
	go: {
		nhan: "Remove",
		choNha: (ten: string) => `Remove ${ten}`,
		moTa: "Nobody can sign in through it again. If this is the only provider, the sign-in page goes back to Google.",
		huy: "Cancel",
		xong: "Identity provider removed.",
	},
	them: {
		nut: "Add provider",
		khoaLyDo: "Only an owner or an admin can change how people sign in.",
		tieuDe: "Add an identity provider",
		moTa: "Configure an OpenID Connect provider.",
		ten: "Name",
		tenGoiY: "okta",
		tenMoTa: "Names the sign-in button. Cannot be changed later.",
		issuer: "Issuer URL",
		issuerMoTa: "Where discovery lives.",
		tenMien: "Email domain",
		tenMienGoiY: "acme.com",
		tenMienMoTa: "Comma-separate several.",
		maClient: "Client ID",
		maBiMat: "Client secret",
		maBiMatMoTa: "Never shown again.",
		uriChuyenHuong: "Redirect URI",
		uriMoTa: "Add this at your provider before saving.",
		huy: "Cancel",
		daLuu: (ten: string) => `${ten} saved.`,
	},
};

export type SsoMessages = typeof en;

const vi = {
	trang: {
		moTa: "Cho người của bạn đăng nhập qua nhà cung cấp danh tính của chính công ty. Khi đã khai một cái, trang đăng nhập hiện nó thay cho Google.",
	},
	bang: {
		nhaCungCap: "Nhà cung cấp",
		chuanSaml: "Chuẩn SAML",
		chuanOidc: "Chuẩn OpenID Connect",
		maClient: (bonSo: string) => ` · mã client …${bonSo}`,
		tenMien: "Tên miền email",
		issuer: "URL của Issuer",
		uriChuyenHuong: "URI chuyển hướng",
		hanhDong: "Hành động",
		tim: "Tìm theo tên, tên miền hoặc issuer…",
		trong:
			"Chưa có nhà cung cấp danh tính nào — mọi người đăng nhập bằng Google.",
	},
	go: {
		nhan: "Gỡ",
		choNha: (ten: string) => `Gỡ ${ten}`,
		moTa: "Không ai đăng nhập qua nó được nữa. Nếu đây là nhà cung cấp duy nhất, trang đăng nhập quay về Google.",
		huy: "Huỷ",
		xong: "Đã gỡ nhà cung cấp danh tính.",
	},
	them: {
		nut: "Thêm nhà cung cấp",
		khoaLyDo: "Chỉ chủ sở hữu hoặc quản trị đổi được cách đăng nhập.",
		tieuDe: "Thêm một nhà cung cấp danh tính",
		moTa: "Khai một nhà cung cấp theo chuẩn OpenID Connect.",
		ten: "Tên",
		tenGoiY: "ví dụ: okta",
		tenMoTa: "Chữ này hiện trên nút đăng nhập. Sau không đổi được.",
		issuer: "URL của Issuer",
		issuerMoTa: "Chỗ đặt tài liệu discovery.",
		tenMien: "Tên miền email",
		tenMienGoiY: "ví dụ: acme.com",
		tenMienMoTa: "Nhiều tên miền thì ngăn bằng dấu phẩy.",
		maClient: "Mã Client",
		maBiMat: "Mã bí mật Client",
		maBiMatMoTa: "Chỉ hiện một lần, sau không xem lại được.",
		uriChuyenHuong: "URI chuyển hướng",
		uriMoTa: "Dán nó vào nhà cung cấp danh tính trước khi lưu.",
		huy: "Huỷ",
		daLuu: (ten: string) => `Đã lưu ${ten}.`,
	},
} satisfies SsoMessages;

const BANG = { en, vi } satisfies Record<Locale, SsoMessages>;

export function ssoMessages(locale: Locale): SsoMessages {
	return BANG[locale];
}
