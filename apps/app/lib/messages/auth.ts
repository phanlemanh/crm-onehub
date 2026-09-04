import type { Locale } from "@crm/ui/lib/locale";

const en = {
	shell: {
		homepage: "Homepage",
		eyebrow: "CRM",
		headline: "Every customer, one place.",
	},
	docTitle: {
		signIn: "Sign in",
		onboarding: "Set up",
		research: "Research key",
		grantAccess: "Grant access",
	},
	signIn: {
		title: "Welcome back",
		description: "Sign in with your account to continue.",
		continueWith: (ten: string) => `Continue with ${ten}`,
		signingIn: "Signing in…",
		noWay: {
			title: "No way in yet",
			description:
				"This CRM has no sign-in method configured, so nobody can get in — including you.",
			howTo:
				"Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET — or MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET — in the root .env file and restart. Your own identity provider can be added from Settings once somebody is signed in.",
		},
		error: {
			unreachable:
				"Could not reach the sign-in service. Check your connection and try again.",
		},
	},
	onboarding: {
		title: "Tell us about your company",
		description:
			"Two things, once. The name is what the CRM calls you; the website is how the agent learns what you sell.",
		name: "Company name",
		slug: "Workspace URL",
		slugHint: "Your team will use this address to open the CRM.",
		website: "Website",
		websiteHint: "Read once, so every answer afterwards knows what you sell.",
		submit: "Continue",
		submitting: "Saving…",
	},
	grantAccess: {
		title: "One more step",
		google:
			"This CRM reads your Gmail and Calendar so meetings and email threads show up on the right company. It is read-only — nothing is ever sent on your behalf.",
		microsoft:
			"This CRM reads your Outlook mail so email threads show up on the right company. It is read-only — nothing is ever sent on your behalf.",
		both: "This CRM reads your mail and calendar so meetings and email threads show up on the right company. It is read-only — nothing is ever sent on your behalf.",
		privacy:
			"Only conversations with companies in the CRM are stored. Personal mail is discarded without being saved.",
	},
	research: {
		title: "Level up your CRM data",
		description:
			"Power your research agent with Context to research every company added to your CRM.",
		label: "Context API key",
		placeholder: "Paste the key",
		noKey: "Don't have a Context API key?",
		signUp: "Sign up here",
		submit: "Continue",
		submitting: "Saving…",
	},
};

export type AuthMessages = typeof en;

const vi = {
	shell: {
		homepage: "Trang chủ",
		eyebrow: "CRM",
		headline: "Mọi khách hàng, một chỗ.",
	},
	docTitle: {
		signIn: "Đăng nhập",
		onboarding: "Khai báo",
		research: "Khoá nghiên cứu",
		grantAccess: "Cấp quyền",
	},
	signIn: {
		title: "Mừng bạn quay lại",
		description: "Đăng nhập bằng tài khoản của bạn để tiếp tục.",
		continueWith: (ten: string) => `Tiếp tục với ${ten}`,
		signingIn: "Đang đăng nhập…",
		noWay: {
			title: "Chưa có cách nào để vào",
			description:
				"CRM này chưa cấu hình cách đăng nhập nào, nên chưa ai vào được — kể cả bạn.",
			howTo:
				"Đặt GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET — hoặc MICROSOFT_CLIENT_ID và MICROSOFT_CLIENT_SECRET — trong file .env ở gốc kho rồi khởi động lại. Nhà cung cấp định danh của riêng bạn thêm được từ Cài đặt, sau khi đã có người đăng nhập.",
		},
		error: {
			unreachable:
				"Không kết nối được tới dịch vụ đăng nhập. Kiểm tra mạng rồi thử lại.",
		},
	},
	onboarding: {
		title: "Giới thiệu về công ty bạn",
		description:
			"Hai việc, làm một lần. Tên là cách CRM gọi bạn; website là cách tác nhân biết bạn bán gì.",
		name: "Tên công ty",
		slug: "Địa chỉ workspace",
		slugHint: "Đội của bạn sẽ dùng địa chỉ này để mở CRM.",
		website: "Website",
		websiteHint: "Đọc một lần, để mọi câu trả lời sau đó biết bạn bán gì.",
		submit: "Tiếp tục",
		submitting: "Đang lưu…",
	},
	grantAccess: {
		title: "Còn một bước nữa",
		google:
			"CRM đọc Gmail và Lịch của bạn để cuộc họp và luồng thư hiện đúng ở công ty tương ứng. Chỉ đọc — không bao giờ gửi gì thay bạn.",
		microsoft:
			"CRM đọc thư Outlook của bạn để luồng thư hiện đúng ở công ty tương ứng. Chỉ đọc — không bao giờ gửi gì thay bạn.",
		both: "CRM đọc thư và lịch của bạn để cuộc họp và luồng thư hiện đúng ở công ty tương ứng. Chỉ đọc — không bao giờ gửi gì thay bạn.",
		privacy:
			"Chỉ lưu trao đổi với các công ty có trong CRM. Thư cá nhân bị bỏ đi, không lưu lại.",
	},
	research: {
		title: "Làm dày dữ liệu CRM của bạn",
		description:
			"Cắm Context cho tác nhân nghiên cứu, để nó tra mọi công ty được thêm vào CRM.",
		label: "Khoá API Context",
		placeholder: "Dán khoá vào đây",
		noKey: "Chưa có khoá API Context?",
		signUp: "Đăng ký ở đây",
		submit: "Tiếp tục",
		submitting: "Đang lưu…",
	},
} satisfies AuthMessages;

const BANG = { en, vi } satisfies Record<Locale, AuthMessages>;

export function authMessages(locale: Locale): AuthMessages {
	return BANG[locale];
}
