import type { Locale } from "@crm/ui/lib/locale";
import type { LY_DO_LUOT_HOI } from "@crm/validation/okr-tra-loi";

type LyDoLuot = (typeof LY_DO_LUOT_HOI)[number];

const vi = {
	nut: {
		hoi: "Hỏi Kara",
		dangMo: "Đang mở…",
		loiMo: "Kara chưa mở được cuộc hỏi. Thử lại sau ít phút.",
	},
	khung: {
		tieuDe: "Kara · Hỏi OKR",
	},
	trong: {
		tieuDe: "Hỏi Kara về OKR bạn xem được",
		moTa: "Kara chỉ đọc những Mục tiêu và KR bạn được xem. Mỗi câu trả lời có trích để bấm mở.",
		goiYNhan: "Câu hỏi gợi ý",
		goiY: [
			"KR nào của tôi đang trượt?",
			"Mục tiêu của phòng tôi quý này đang thế nào?",
			"Tuần trước KR nào đổi nhiều nhất?",
		],
	},
	dangDoc: "Kara đang đọc OKR…",
	khongThay: {
		tieuDe: "Kara không thấy câu trả lời",
		moTa: "Không Mục tiêu hay KR nào bạn được xem trả lời được câu này.",
	},
	loi: { viec: "trả lời" },
	oGo: {
		nhan: "Câu hỏi cho Kara",
		goi: "Hỏi về Mục tiêu, KR hay tiến độ…",
	},
	khoa: {
		"het-luot-ngay": "Hôm nay bạn đã hỏi đủ số câu. Mở lại từ 0 giờ ngày mai.",
		"het-tran-thang": "Kara tạm nghỉ hỏi đáp OKR tới đầu tháng sau.",
	} satisfies Record<LyDoLuot, string>,
	trich: {
		objective: "Mục tiêu",
		kr: "KR",
		mo: "Mở",
	},
	phanHoi: {
		nhan: "Câu trả lời này có hữu ích không?",
		camOn: "Cảm ơn bạn. Kara ghi lại để đội xem những câu trả lời chưa ổn.",
	},
};

type OkrHoiMessages = typeof vi;

const en: OkrHoiMessages = {
	nut: {
		hoi: "Ask Kara",
		dangMo: "Opening…",
		loiMo: "Kara could not open a conversation. Try again in a few minutes.",
	},
	khung: {
		tieuDe: "Kara · Ask about OKR",
	},
	trong: {
		tieuDe: "Ask Kara about the OKR you can see",
		moTa: "Kara only reads the Objectives and KRs you may see. Every answer cites what it read, so you can open it.",
		goiYNhan: "Suggested questions",
		goiY: [
			"Which of my KRs are off track?",
			"How is my team doing on its Objectives this quarter?",
			"Which KR moved the most last week?",
		],
	},
	dangDoc: "Kara is reading the OKR…",
	khongThay: {
		tieuDe: "Kara found no answer",
		moTa: "None of the Objectives or KRs you may see answers this question.",
	},
	loi: { viec: "answer" },
	oGo: {
		nhan: "Question for Kara",
		goi: "Ask about an Objective, a KR or progress…",
	},
	khoa: {
		"het-luot-ngay":
			"You have asked all your questions for today. Kara opens again at midnight.",
		"het-tran-thang": "Kara is paused on OKR questions until next month.",
	},
	trich: {
		objective: "Objective",
		kr: "KR",
		mo: "Open",
	},
	phanHoi: {
		nhan: "Was this answer useful?",
		camOn:
			"Thanks. Kara keeps a note so the team can review answers that fell short.",
	},
};

const BANG = { en, vi } satisfies Record<Locale, OkrHoiMessages>;

export type { OkrHoiMessages };

export function okrHoiMessages(locale: Locale): OkrHoiMessages {
	return BANG[locale];
}
