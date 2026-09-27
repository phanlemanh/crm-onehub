import type { Locale } from "@crm/ui/lib/locale";

const en = {
	lanDau: {
		tieuDe: "First time here?",
		moTa: "OneHub Center only opens for addresses an administrator has allowed.",
	},
	buoc: {
		choPhep: {
			tieuDe: "Ask an administrator to allow the email address you will use",
			moTa: (duong: string) => `In ${duong}.`,
		},
		nutNgoai: {
			tieuDe: (ten: string) => `Sign in with ${ten}, using that same address`,
			moTa: "Any other address will be turned away.",
		},
		matKhauPhu: {
			tieuDe: "Prefer a password? Ask for a set-password link",
			moTa: (duong: string, phut: string | number) =>
				`An administrator issues it in ${duong}. The link works once and expires after ${phut} minutes.`,
		},
		matKhauChinh: {
			tieuDe: "Ask for a set-password link",
		},
	},
	loi: {
		chuaChoPhep: {
			tieuDe: "This address hasn't been allowed in",
			moTa: "Ask an administrator to allow the exact email address you just used.",
		},
		daHuy: {
			tieuDe: "You stopped signing in partway",
			moTa: "Press the sign-in button again to try once more.",
		},
		chung: {
			tieuDe: "Couldn't sign you in",
			moTa: "Try again; if it still fails, ask an administrator to take a look.",
		},
	},
};

export type CuaVaoMessages = typeof en;

const vi: CuaVaoMessages = {
	lanDau: {
		tieuDe: "Lần đầu vào?",
		moTa: "OneHub Center chỉ mở cho địa chỉ quản trị viên đã cho phép.",
	},
	buoc: {
		choPhep: {
			tieuDe: "Nhờ quản trị viên cho phép địa chỉ email bạn sẽ dùng",
			moTa: (duong) => `Ở ${duong}.`,
		},
		nutNgoai: {
			tieuDe: (ten) => `Đăng nhập bằng ${ten}, đúng địa chỉ đó`,
			moTa: "Địa chỉ khác sẽ bị từ chối.",
		},
		matKhauPhu: {
			tieuDe: "Muốn dùng mật khẩu? Xin liên kết đặt mật khẩu",
			moTa: (duong, phut) =>
				`Quản trị viên phát liên kết ở ${duong}. Liên kết dùng một lần, hết hạn sau ${phut} phút.`,
		},
		matKhauChinh: {
			tieuDe: "Xin liên kết đặt mật khẩu",
		},
	},
	loi: {
		chuaChoPhep: {
			tieuDe: "Địa chỉ này chưa được cho phép vào",
			moTa: "Nhờ quản trị viên cho phép đúng địa chỉ email bạn vừa dùng.",
		},
		daHuy: {
			tieuDe: "Bạn đã dừng đăng nhập giữa chừng",
			moTa: "Bấm lại nút đăng nhập để thử lần nữa.",
		},
		chung: {
			tieuDe: "Chưa đăng nhập được",
			moTa: "Thử lại; nếu vẫn không được, nhờ quản trị viên xem giúp.",
		},
	},
};

export function cuaVaoMessages(locale: Locale): CuaVaoMessages {
	return locale === "vi" ? vi : en;
}
