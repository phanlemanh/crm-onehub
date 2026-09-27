import type { Locale } from "@crm/ui/lib/locale";
import { type CachDoc, OKR_KHEP } from "@crm/validation/okr-khep";
import type { MaLuatOkr } from "@crm/validation/okr-kiem";

const NGUONG = {
	vi: String(OKR_KHEP.nguongThamVong).replace(".", ","),
	en: String(OKR_KHEP.nguongThamVong),
};
const LY_DO = OKR_KHEP.lyDo;

const vi = {
	luat: {
		"kr-la-viec": "Câu này đọc như một việc làm. Làm xong thì con số nào đổi?",
		"thieu-khoi-diem": "Khởi điểm 0 là số thật, hay chưa đo?",
		"dich-bang-khoi-diem":
			"Đích đang bằng khởi điểm. Đó là mức cần giữ, hay đích chưa đặt?",
		"thieu-doi-trong":
			"Có KR nào giữ chất lượng không — ví dụ tỷ lệ thoả thuận huỷ giữ dưới một mức?",
	} satisfies Record<MaLuatOkr, string>,
	doiTrong: {
		tieuDe: "Mọi KR đều đẩy một con số lên",
		khongChan: "Câu hỏi này không chặn công bố.",
	},
	cachDoc: {
		tot: `Tốt — với mục tiêu tham vọng, ${NGUONG.vi} là tốt`,
		"duoi-muc-tot": `Dưới mức tốt ${NGUONG.vi} của mục tiêu tham vọng`,
		dat: "Đạt cam kết",
		"chua-tron": "Cam kết chưa trọn",
	} satisfies Record<CachDoc, string>,
	khongPhaiDanhGia: {
		tieuDe: "Điểm cuối kỳ không phải đánh giá nhân sự",
		moTa: `Điểm không nối vào lương, thưởng hay xếp hạng người. Máy gợi ý từ số chốt; người chỉnh được, kèm lý do. Mục tiêu tham vọng đạt ${NGUONG.vi} là tốt.`,
	},
	lyDoDich: {
		nhan: "Lý do đổi đích",
		moTa: `Ngoài rà giữa kỳ, đổi đích cần lý do. KR sẽ mang nhãn «đích sửa ngoài rà» tới lúc chấm. Từ ${LY_DO.toiThieu} đến ${LY_DO.toiDa} ký tự.`,
		dichTruoc: "Trước đây:",
	},
	dai: {
		ra: (den: string) => `Đang rà giữa kỳ tới hết ${den}`,
		raMoTa:
			"Sửa đích lúc này không cần lý do. Hết rà, sửa đích phải ghi lý do và KR mang nhãn «đích sửa ngoài rà» tới lúc chấm.",
		cham: "đang chấm điểm",
		chamMoTa:
			"Quản trị đóng kỳ khi mọi KR đã chấm. Số của KR đã chốt lúc sang chấm điểm.",
		dong: "đã đóng",
		dongMoTa:
			"Số, điểm và điều học được chỉ còn để đọc. Tải cả kỳ ở Toàn cảnh.",
	},
};

type OkrKhepMessages = typeof vi;

const en: OkrKhepMessages = {
	luat: {
		"kr-la-viec":
			"This reads like a task. Once it is done, which number moves?",
		"thieu-khoi-diem": "Is a starting value of 0 real, or not measured yet?",
		"dich-bang-khoi-diem":
			"The target equals the starting value. Is that the level to hold, or is the target not set yet?",
		"thieu-doi-trong":
			"Does any key result guard quality — say, a deal cancellation rate held below a level?",
	},
	doiTrong: {
		tieuDe: "Every key result pushes a number up",
		khongChan: "This question does not block publishing.",
	},
	cachDoc: {
		tot: `Good — for an aspirational objective, ${NGUONG.en} is good`,
		"duoi-muc-tot": `Below the ${NGUONG.en} mark for an aspirational objective`,
		dat: "Commitment met",
		"chua-tron": "Commitment not fully met",
	},
	khongPhaiDanhGia: {
		tieuDe: "End-of-cycle scores are not performance reviews",
		moTa: `Scores are never tied to pay, bonus or ranking people. The machine suggests a score from the closing number; people can change it with a reason. An aspirational objective at ${NGUONG.en} is good.`,
	},
	lyDoDich: {
		nhan: "Reason for changing the target",
		moTa: `Outside the mid-cycle review, a new target needs a reason. The key result will carry a «target changed outside review» label until scoring. ${LY_DO.toiThieu} to ${LY_DO.toiDa} characters.`,
		dichTruoc: "Previously:",
	},
	dai: {
		ra: (den: string) => `Mid-cycle review open through ${den}`,
		raMoTa:
			"Targets can change now without a reason. Once the review ends, a new target needs a reason and the key result carries a «target changed outside review» label until scoring.",
		cham: "is being scored",
		chamMoTa:
			"An admin closes the cycle once every key result is scored. Key result numbers were fixed when scoring began.",
		dong: "is closed",
		dongMoTa:
			"Numbers, scores and lessons are read-only now. Download the whole cycle from Overview.",
	},
};

export function okrKhepMessages(locale: Locale): OkrKhepMessages {
	return locale === "vi" ? vi : en;
}
