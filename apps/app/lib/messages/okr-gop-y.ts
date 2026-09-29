import type { Locale } from "@crm/ui/lib/locale";

const vi = {
	nut: {
		nho: "Nhờ Trợ lý OKR góp ý",
		dangCho: (n: string) => `${n} đề xuất đang chờ`,
		khoaSua: "Lưu thay đổi trước khi nhờ góp ý",
		tamNghi: (ngay: string) => `Trợ lý OKR tạm nghỉ tới ${ngay}`,
		hetLuot: "Bạn đã dùng hết lượt góp ý hôm nay",
	},
	cot: {
		tieuDe: "Trợ lý OKR",
		tieuDeKr: "Trợ lý OKR · chỉ KR này",
		dong: "Đóng cột Trợ lý OKR",
		dangDocMucTieu: "Trợ lý OKR đang đọc Mục tiêu này…",
		dangDocKr: "Trợ lý OKR đang đọc KR này…",
		soDong: (n: string) =>
			`${n} đề xuất. Nhận là ghi ngay, kèm vết «theo đề xuất của Trợ lý OKR».`,
		rong: "Trợ lý OKR không thấy chỗ nào cần sửa",
		rongMoTa: "Tên, «vì sao lúc này» và các KR đã đọc ổn.",
		rongMoTaKr: "Tên KR đã đọc ổn.",
		loi: "Trợ lý OKR chưa trả lời được, thử lại sau",
		thuLai: "Thử lại",
	},
	dong: {
		loai: {
			"viet-lai": "Viết lại",
			hoi: "Câu hỏi",
			"can-chinh": "Căn chỉnh",
		},
		truong: {
			title: "Tên Mục tiêu",
			whyNow: "Vì sao lúc này",
			"kr.title": "Tên KR",
		},
		boQua: "Bỏ qua",
		nhan: "Nhận",
		sua: "Sửa",
		bac: "Bác",
		nhanBanSua: "Nhận bản đã sửa",
		huySua: "Huỷ",
		canChinh: "Căn chỉnh",
		moKr: "Mở KR này",
		khoaMoKr: "Lưu thay đổi của Mục tiêu trước khi mở KR",
		gopVao: (ten: string) => `Góp vào «${ten}»`,
		ket: {
			accepted: "Đã nhận",
			dismissed: "Đã bác",
			skipped: "Đã bỏ qua",
		},
		khoaODangSua: "Lưu hoặc hoàn lại ô này trước",
		dangGhiKhac: "Đang ghi một đề xuất khác",
	},
	toast: {
		daNhan: "Đã nhận",
		hoanTac: "Hoàn tác",
		daHoanTac: "Đã hoàn tác",
	},
	xuHuong: (moiTuan: string, uoc: string) =>
		`Theo các lần cập nhật gần nhất (${moiTuan}/tuần), cuối kỳ ước khoảng ${uoc}`,
	vet: {
		theoTroLy: "theo đề xuất của Trợ lý OKR",
		suaTruong: (truong: string) => `Sửa ${truong}`,
	},
};

export type OkrGopYMessages = typeof vi;

const en: OkrGopYMessages = {
	nut: {
		nho: "Ask the OKR assistant for feedback",
		dangCho: (n: string) => `${n} suggestions waiting`,
		khoaSua: "Save your changes before asking for feedback",
		tamNghi: (ngay: string) => `The OKR assistant is paused until ${ngay}`,
		hetLuot: "You have used today's feedback requests",
	},
	cot: {
		tieuDe: "OKR assistant",
		tieuDeKr: "OKR assistant · this KR only",
		dong: "Close the OKR assistant column",
		dangDocMucTieu: "The OKR assistant is reading this objective…",
		dangDocKr: "The OKR assistant is reading this KR…",
		soDong: (n: string) =>
			`${n} suggestions. Accepting saves right away, with a trail entry “suggested by the OKR assistant”.`,
		rong: "The OKR assistant found nothing to change",
		rongMoTa: "The title, “why now” and the KRs read well.",
		rongMoTaKr: "The KR title reads well.",
		loi: "The OKR assistant couldn't answer, try again later",
		thuLai: "Try again",
	},
	dong: {
		loai: {
			"viet-lai": "Rewrite",
			hoi: "Question",
			"can-chinh": "Alignment",
		},
		truong: {
			title: "Objective title",
			whyNow: "Why now",
			"kr.title": "KR title",
		},
		boQua: "Skip",
		nhan: "Accept",
		sua: "Edit",
		bac: "Reject",
		nhanBanSua: "Accept edited",
		huySua: "Cancel",
		canChinh: "Align",
		moKr: "Open this KR",
		khoaMoKr: "Save the objective changes before opening the KR",
		gopVao: (ten: string) => `Contributes to “${ten}”`,
		ket: {
			accepted: "Accepted",
			dismissed: "Rejected",
			skipped: "Skipped",
		},
		khoaODangSua: "Save or revert this field first",
		dangGhiKhac: "Saving another suggestion",
	},
	toast: {
		daNhan: "Accepted",
		hoanTac: "Undo",
		daHoanTac: "Undone",
	},
	xuHuong: (moiTuan: string, uoc: string) =>
		`Based on the latest updates (${moiTuan}/week), the period should end around ${uoc}`,
	vet: {
		theoTroLy: "suggested by the OKR assistant",
		suaTruong: (truong: string) => `Edited ${truong}`,
	},
};

const BANG = { en, vi } satisfies Record<Locale, OkrGopYMessages>;

export function okrGopYMessages(locale: Locale): OkrGopYMessages {
	return BANG[locale];
}
