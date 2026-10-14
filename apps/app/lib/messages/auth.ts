import type { Locale } from "@crm/ui/lib/locale";

const en = {
	shell: {
		homepage: "Homepage",
		headline: "OneHub Center: partners, 30-day plans and OKRs.",
	},
	docTitle: {
		signIn: "Sign in",
		onboarding: "Set up",
		research: "Research key",
		grantAccess: "Grant access",
		quenMatKhau: "Forgot password",
	},
	signIn: {
		title: "Sign in to OneHub Center",
		description: "Use the exact email address you were allowed in with.",
		continueWith: (ten: string) => `Continue with ${ten}`,
		signingIn: "Signing in…",
		hoac: "or",
		diaChi: "Email address",
		matKhau: "Password",
		dangNhap: "Sign in",
		quenMatKhau: "Forgot password?",
		saiChung: "That email or password isn't right.",
		error: {
			unreachable:
				"Could not reach the sign-in service. Check your connection and try again.",
		},
	},
	onboarding: {
		title: "Tell us about your company",
		description:
			"Two things, once. The name is what OneHub Center calls you; the website is how Kara learns what you sell.",
		name: "Company name",
		slug: "Workspace URL",
		slugHint: "Your team will use this address to open OneHub Center.",
		website: "Website",
		websiteHint: "Read once, so every answer afterwards knows what you sell.",
		submit: "Continue",
		submitting: "Saving…",
	},
	grantAccess: {
		title: "One more step",
		google:
			"OneHub Center reads your Gmail and Calendar so meetings and email threads show up on the right company. It is read-only — nothing is ever sent on your behalf.",
		microsoft:
			"OneHub Center reads your Outlook mail so email threads show up on the right company. It is read-only — nothing is ever sent on your behalf.",
		both: "OneHub Center reads your mail and calendar so meetings and email threads show up on the right company. It is read-only — nothing is ever sent on your behalf.",
		privacy:
			"Only conversations with companies in OneHub Center are stored. Personal mail is discarded without being saved.",
		grant: (ten: string) => `Grant ${ten} access`,
		grantOne: "Grant access",
		granting: "Opening…",
		signOut: "Sign out",
		error: {
			provider:
				"Could not reach the provider. Check your connection and try again.",
			signOut: "Could not sign out. Reload the page and try again.",
		},
	},
	research: {
		title: "Level up your data in OneHub Center",
		description:
			"Power Kara with Context to research every company added to OneHub Center.",
		label: "Context API key",
		placeholder: "Paste the key",
		noKey: "Don't have a Context API key?",
		signUp: "Sign up here",
		submit: "Continue",
		submitting: "Saving…",
	},
	quenMatKhau: {
		title: "Forgot your password",
		description:
			"Enter your email address to get a link for setting a new password.",
		diaChi: "Email address",
		gui: "Send the link",
		dangGui: "Sending…",
		quayLai: "Back to sign in",
		loi: "The link could not be sent. Check your connection and send again.",
		quaLuot: (phut: number) =>
			`You have asked too many times. Wait ${phut === 1 ? "a minute" : `${phut} minutes`} and try again.`,
		xong: {
			title: "Check your email",
			description: (phut: number) =>
				`If that address can sign in to OneHub Center, a link is on its way. It can be used once and expires in ${phut} minutes. Nothing changes until you open it.`,
			quayLai: "Back to sign in",
		},
	},
	datMatKhau: {
		title: "Set a password",
		description: (phut: number) =>
			`This link can be used once and expires in ${phut} minutes.`,
		matKhauMoi: "New password",
		goLai: "Confirm password",
		toiThieu: (n: number) =>
			`At least ${n} characters. No uppercase or special characters required.`,
		gui: "Set password",
		xong: {
			title: "Done",
			description:
				"Your password is set. From now on you can sign in to OneHub Center with this email and password, even when your network can't reach Google.",
			dangNhap: "Sign in",
		},
		loi: {
			hetHan:
				"This link has expired. Ask your administrator to send you a new one.",
			khongDungDuoc:
				"This link can no longer be used — it may already have been used, or replaced by a newer link. Ask your administrator to send you a new one.",
			lechNhau: "The two passwords don't match.",
			quaNgan: (soKyTu: number) => `Use at least ${soKyTu} characters.`,
		},
	},
};

export type AuthMessages = typeof en;

const vi = {
	shell: {
		homepage: "Trang chủ",
		headline: "OneHub Center: đối tác, kế hoạch 30 ngày và OKR.",
	},
	docTitle: {
		signIn: "Đăng nhập",
		onboarding: "Khai báo",
		research: "Khoá nghiên cứu",
		grantAccess: "Cấp quyền",
		quenMatKhau: "Quên mật khẩu",
	},
	signIn: {
		title: "Đăng nhập vào OneHub Center",
		description: "Dùng đúng địa chỉ email đã được cho phép.",
		continueWith: (ten: string) => `Tiếp tục với ${ten}`,
		signingIn: "Đang đăng nhập…",
		hoac: "hoặc",
		diaChi: "Địa chỉ email",
		matKhau: "Mật khẩu",
		dangNhap: "Đăng nhập",
		quenMatKhau: "Quên mật khẩu?",
		saiChung: "Địa chỉ hoặc mật khẩu không đúng.",
		error: {
			unreachable:
				"Không kết nối được tới dịch vụ đăng nhập. Kiểm tra mạng rồi thử lại.",
		},
	},
	onboarding: {
		title: "Giới thiệu về công ty bạn",
		description:
			"Hai việc, làm một lần. Tên là cách OneHub Center gọi bạn; website là cách Kara biết bạn bán gì.",
		name: "Tên công ty",
		slug: "Địa chỉ workspace",
		slugHint: "Đội của bạn sẽ dùng địa chỉ này để mở OneHub Center.",
		website: "Website",
		websiteHint: "Đọc một lần, để mọi câu trả lời sau đó biết bạn bán gì.",
		submit: "Tiếp tục",
		submitting: "Đang lưu…",
	},
	grantAccess: {
		title: "Còn một bước nữa",
		google:
			"OneHub Center đọc Gmail và Lịch của bạn để cuộc họp và luồng thư hiện đúng ở công ty tương ứng. Chỉ đọc — không bao giờ gửi gì thay bạn.",
		microsoft:
			"OneHub Center đọc thư Outlook của bạn để luồng thư hiện đúng ở công ty tương ứng. Chỉ đọc — không bao giờ gửi gì thay bạn.",
		both: "OneHub Center đọc thư và lịch của bạn để cuộc họp và luồng thư hiện đúng ở công ty tương ứng. Chỉ đọc — không bao giờ gửi gì thay bạn.",
		privacy:
			"Chỉ lưu trao đổi với các công ty có trong OneHub Center. Thư cá nhân bị bỏ đi, không lưu lại.",
		grant: (ten: string) => `Cấp quyền ${ten}`,
		grantOne: "Cấp quyền",
		granting: "Đang mở…",
		signOut: "Đăng xuất",
		error: {
			provider:
				"Không kết nối được tới nhà cung cấp. Kiểm tra mạng rồi thử lại.",
			signOut: "Không đăng xuất được. Tải lại trang rồi thử lại.",
		},
	},
	research: {
		title: "Làm dày dữ liệu trong OneHub Center",
		description:
			"Cắm Context cho Kara, để Kara tra mọi công ty được thêm vào OneHub Center.",
		label: "Khoá API Context",
		placeholder: "Dán khoá vào đây",
		noKey: "Chưa có khoá API Context?",
		signUp: "Đăng ký ở đây",
		submit: "Tiếp tục",
		submitting: "Đang lưu…",
	},
	quenMatKhau: {
		title: "Quên mật khẩu",
		description:
			"Nhập địa chỉ email của bạn, hệ thống gửi cho bạn một liên kết để đặt mật khẩu mới.",
		diaChi: "Địa chỉ email",
		gui: "Gửi liên kết",
		dangGui: "Đang gửi…",
		quayLai: "Quay lại đăng nhập",
		loi: "Chưa gửi được liên kết. Kiểm tra kết nối rồi bấm gửi lại.",
		quaLuot: (phut: number) =>
			`Bạn đã xin quá nhiều lần. Chờ ${phut} phút rồi thử lại.`,
		xong: {
			title: "Kiểm tra hộp thư",
			description: (phut: number) =>
				`Nếu địa chỉ này vào được OneHub Center, liên kết đang trên đường tới. Liên kết dùng được một lần và còn hạn ${phut} phút. Chưa mở thì mật khẩu hiện tại vẫn nguyên.`,
			quayLai: "Quay lại đăng nhập",
		},
	},
	datMatKhau: {
		title: "Đặt mật khẩu",
		description: (phut: number) =>
			`Liên kết này dùng được một lần, còn hạn ${phut} phút.`,
		matKhauMoi: "Mật khẩu mới",
		goLai: "Gõ lại mật khẩu",
		toiThieu: (n: number) =>
			`Ít nhất ${n} ký tự. Không cần chữ hoa hay ký tự đặc biệt.`,
		gui: "Đặt mật khẩu",
		xong: {
			title: "Xong",
			description:
				"Mật khẩu đã đặt. Từ giờ bạn vào OneHub Center được bằng địa chỉ email và mật khẩu này, kể cả khi mạng không vào được Google.",
			dangNhap: "Đăng nhập",
		},
		loi: {
			hetHan:
				"Liên kết này hết hạn rồi. Nhắn người quản trị phát cho bạn một liên kết mới.",
			khongDungDuoc:
				"Liên kết này không dùng được nữa — có thể đã dùng rồi hoặc đã bị thay bằng liên kết mới. Nhắn người quản trị phát cho bạn một liên kết mới.",
			lechNhau: "Hai ô mật khẩu chưa giống nhau.",
			quaNgan: (soKyTu: number) => `Mật khẩu phải có ít nhất ${soKyTu} ký tự.`,
		},
	},
} satisfies AuthMessages;

const BANG = { en, vi } satisfies Record<Locale, AuthMessages>;

export function authMessages(locale: Locale): AuthMessages {
	return BANG[locale];
}
