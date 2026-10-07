import type { Locale } from "@crm/ui/lib/locale";
import { type CachDoc, OKR_KHEP } from "@crm/validation/okr-khep";
import type { MaLuatOkr } from "@crm/validation/okr-kiem";
import type { LoiSoTheoKieu } from "@crm/validation/okr-kr";

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
		"da-tra-loi": "Đã trả lời",
		"chua-tra-loi": "Chưa trả lời",
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
	cham: {
		cachXem: "Chấm điểm",
		daCham: (n: string, tong: string) => `Đã chấm ${n}/${tong} KR`,
		daChamHet: (tong: string) =>
			`Đã chấm cả ${tong} KR của đơn vị. Quản trị đóng kỳ khi mọi đơn vị xong.`,
		chiDoc:
			"Bạn đọc được điểm; người phụ trách KR, trưởng đơn vị hoặc quản trị chấm.",
		cot: {
			kr: "KR",
			so: "Khởi điểm → đích · số chốt",
			goiY: "Gợi ý",
			diem: "Điểm",
		},
		soChot: "Số chốt",
		phuTrach: "Phụ trách",
		chuaCham: "Chưa chấm",
		nguoiSuaCham: "Người sửa được KR này chấm",
		dichNgoaiRa: "Đích sửa ngoài rà",
		lyDo: "Lý do chỉnh",
		canLyDo: `Cần lý do khi điểm khác gợi ý (ít nhất ${LY_DO.toiThieu} ký tự).`,
		luu: "Lưu điểm",
		luuLai: "Lưu lại",
		daLuu: "Đã lưu điểm",
		hoc: {
			nhan: "Điều học được",
			goiY: "Điều gì đơn vị sẽ làm khác ở kỳ sau?",
			moTa: "Không bắt buộc để đóng kỳ. Ai mở được mục tiêu đều đọc được.",
			batBuoc: "Bắt buộc trước khi khép kỳ.",
			chuaGhi: "Chưa ghi.",
			luu: "Lưu điều học được",
			daLuu: "Đã lưu điều học được",
		},
		mangSang: "Mang sang",
		daMangSang: "Đã mang sang",
		rong: {
			tieuDe: "Không có mục tiêu đã công bố trong kỳ",
			moTa: "Đơn vị này không có gì để chấm ở kỳ này. Mục tiêu nháp và mục tiêu đã bỏ không chấm.",
		},
		loi: "Không tải được bảng chấm. Điểm đã lưu vẫn còn; bấm Thử lại.",
	},
	mangSang: {
		moTa: (ky: string, kyNay: string) =>
			`Tạo một mục tiêu nháp ở ${ky}, cùng đơn vị, loại và người phụ trách. Mục tiêu và điểm ở ${kyNay} giữ nguyên.`,
		khongKy: "Chưa có chu kỳ kế để mang sang — quản trị mở chu kỳ trước.",
		chep: (n: string) => `Chép ${n} KR chưa trọn`,
		khongChepNao:
			"Không có KR nào để chép — mục tiêu mới chỉ mang tên và loại.",
		khoiDiemMoi: (so: string, dich: string) =>
			`Khởi điểm mới ${so} (số chốt) · đích ${dich}`,
		khongChep: "Không chép",
		lyDo: {
			tron: "điểm đã trọn",
			"dich-phai-lon-hon-khoi-diem": "số chốt đã chạm đích",
			"dich-phai-nho-hon-khoi-diem": "số chốt đã xuống tới đích",
			"phan-tram-ngoai-0-100": "đích phần trăm ngoài khoảng 0–100",
		} satisfies Record<LoiSoTheoKieu | "tron", string>,
		canChinh: "Căn chỉnh không chép; đặt lại ở kỳ mới.",
		xacNhan: "Mang sang",
		huy: "Huỷ",
		dong: "Đóng",
		daXong: "Đã tạo mục tiêu nháp ở kỳ kế",
	},
	caiDat: {
		menu: {
			moRa: "Mở rà giữa kỳ",
			dongRa: "Đóng rà sớm",
			sangCham: "Sang chấm điểm",
			dongKy: "Đóng kỳ",
			moLai: "Mở lại kỳ",
		},
		dongPhu: (tu: string, den: string) => `Rà giữa kỳ: ${tu} – ${den}`,
		daDongRa: (ten: string) => `Đã đóng rà giữa kỳ của ${ten}.`,
		sangCham: {
			tieuDe: (ten: string) => `Sang chấm điểm ${ten}?`,
			than: "Số của mọi KR đã công bố chốt ở giá trị lúc này, và mỗi KR nhận một điểm gợi ý. Pha chỉ đi tới.",
			nut: "Sang chấm điểm",
			huy: "Huỷ",
			daSang: (ten: string) => `${ten} đã sang chấm điểm.`,
		},
		ra: {
			tieuDe: (ten: string) => `Mở rà giữa kỳ · ${ten}`,
			moTa: "Trong khoảng này, sửa đích của KR đã công bố không cần lý do. Ngoài khoảng này, sửa đích phải ghi lý do và KR mang nhãn «đích sửa ngoài rà» tới lúc chấm.",
			tu: "Từ ngày",
			den: "Đến hết ngày",
			moTaNgay: (dau: string, cuoi: string) =>
				`Hai ngày nằm trong chu kỳ, từ ${dau} đến ${cuoi}. Đóng sớm được từ menu của dòng.`,
			loiThuTu: "Ngày bắt đầu rà phải trước hoặc trùng ngày kết thúc.",
			loiNgoaiKy: (dau: string, cuoi: string) =>
				`Khoảng rà phải nằm trong chu kỳ, từ ${dau} đến ${cuoi}.`,
			huy: "Huỷ",
			gui: "Mở rà giữa kỳ",
			daMo: (ten: string) => `Đã mở rà giữa kỳ của ${ten}.`,
		},
		dong: {
			chanTieuDe: (ten: string) => `Chưa đóng được ${ten}`,
			chanMoTa: (n: string) =>
				`Kỳ chỉ đóng khi mọi KR của mục tiêu đã công bố có điểm. Còn ${n} KR chưa chấm:`,
			soKr: (n: string) => `${n} KR`,
			dangDem: "Đang đếm KR chưa chấm…",
			hocTapMoTa: "Mục tiêu học tập cần ghi điều học được trước khi khép kỳ:",
			loi: "Không đếm được KR chưa chấm. Đóng hộp thoại rồi thử lại.",
			dongHop: "Đóng hộp thoại",
			nut: "Đóng kỳ",
			hoiTieuDe: (ten: string) => `Đóng ${ten}?`,
			hoiThan: (ten: string) =>
				`Mọi KR đã chấm. Sau khi đóng, số, điểm và điều học được của ${ten} chỉ còn để đọc; mở lại cần lý do và để vết.`,
			huy: "Huỷ",
			daDong: (ten: string) => `Đã đóng ${ten}.`,
		},
		moLai: {
			tieuDe: (ten: string) => `Mở lại ${ten}`,
			moTa: "Kỳ về pha «Chấm điểm»: điểm và điều học được sửa được lại. Số chốt giữ nguyên. Lý do nằm trong vết của chu kỳ.",
			nhan: "Lý do mở lại",
			moTaO: `Từ ${LY_DO.toiThieu} đến ${LY_DO.toiDa} ký tự.`,
			huy: "Huỷ",
			nut: "Mở lại kỳ",
			daMo: (ten: string) => `${ten} đã về pha chấm điểm.`,
		},
	},
	xuat: {
		tieuDe: "Tải cả kỳ",
		moTa: "Tệp CSV một dòng mỗi KR: đơn vị, mục tiêu, KR, khởi điểm, đích, số chốt, điểm gợi ý, điểm, lý do chỉnh, số lần đổi đích ngoài rà, điều học được, mang sang tới.",
		nut: "Xuất",
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
		"da-tra-loi": "Answered",
		"chua-tra-loi": "Not yet answered",
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
	cham: {
		cachXem: "Scoring",
		daCham: (n: string, tong: string) => `${n}/${tong} key results scored`,
		daChamHet: (tong: string) =>
			`All ${tong} key results of this unit are scored. An admin closes the cycle once every unit is done.`,
		chiDoc:
			"You can read the scores; the key result owner, the unit head or an admin scores.",
		cot: {
			kr: "Key result",
			so: "Start → target · closing number",
			goiY: "Suggested",
			diem: "Score",
		},
		soChot: "Closing number",
		phuTrach: "Owner",
		chuaCham: "Not scored",
		nguoiSuaCham: "Whoever can edit this key result scores it",
		dichNgoaiRa: "Target changed outside review",
		lyDo: "Reason for the change",
		canLyDo: `A score other than the suggestion needs a reason (at least ${LY_DO.toiThieu} characters).`,
		luu: "Save score",
		luuLai: "Save again",
		daLuu: "Score saved",
		hoc: {
			nhan: "Lessons learned",
			goiY: "What will the unit do differently next cycle?",
			moTa: "Not required to close the cycle. Anyone who can open the objective can read it.",
			batBuoc: "Required before the cycle closes.",
			chuaGhi: "Nothing written.",
			luu: "Save lessons",
			daLuu: "Lessons saved",
		},
		mangSang: "Carry over to",
		daMangSang: "Carried over to",
		rong: {
			tieuDe: "No published objectives in this cycle",
			moTa: "This unit has nothing to score in this cycle. Draft and dropped objectives are not scored.",
		},
		loi: "Could not load the scoring table. Saved scores are safe; press Try again.",
	},
	mangSang: {
		moTa: (ky: string, kyNay: string) =>
			`Creates a draft objective in ${ky} with the same unit, type and owner. The objective and its scores in ${kyNay} stay as they are.`,
		khongKy:
			"There is no next cycle to carry over to yet — an admin has to open one first.",
		chep: (n: string) => `Copies ${n} unfinished key results`,
		khongChepNao:
			"No key result will be copied — the new objective only keeps its title and type.",
		khoiDiemMoi: (so: string, dich: string) =>
			`New start ${so} (closing number) · target ${dich}`,
		khongChep: "Not copied",
		lyDo: {
			tron: "fully scored",
			"dich-phai-lon-hon-khoi-diem":
				"the closing number already reached the target",
			"dich-phai-nho-hon-khoi-diem":
				"the closing number already fell to the target",
			"phan-tram-ngoai-0-100": "the percentage target is outside 0–100",
		},
		canChinh: "Alignments are not copied; set them again in the new cycle.",
		xacNhan: "Carry over",
		huy: "Cancel",
		dong: "Close",
		daXong: "Draft objective created in the next cycle",
	},
	caiDat: {
		menu: {
			moRa: "Open mid-cycle review",
			dongRa: "End review early",
			sangCham: "Start scoring",
			dongKy: "Close cycle",
			moLai: "Reopen cycle",
		},
		dongPhu: (tu: string, den: string) => `Mid-cycle review: ${tu} – ${den}`,
		daDongRa: (ten: string) => `Mid-cycle review of ${ten} ended.`,
		sangCham: {
			tieuDe: (ten: string) => `Start scoring ${ten}?`,
			than: "Every published key result keeps its current number as the closing number and gets a suggested score. Phases only move forward.",
			nut: "Start scoring",
			huy: "Cancel",
			daSang: (ten: string) => `${ten} is now being scored.`,
		},
		ra: {
			tieuDe: (ten: string) => `Open mid-cycle review · ${ten}`,
			moTa: "Inside this range, targets of published key results change without a reason. Outside it, a new target needs a reason and the key result carries a «target changed outside review» label until scoring.",
			tu: "From",
			den: "Through",
			moTaNgay: (dau: string, cuoi: string) =>
				`Both days fall inside the cycle, ${dau} to ${cuoi}. End it early from the row menu.`,
			loiThuTu: "The review has to start on or before the day it ends.",
			loiNgoaiKy: (dau: string, cuoi: string) =>
				`The review has to fall inside the cycle, ${dau} to ${cuoi}.`,
			huy: "Cancel",
			gui: "Open review",
			daMo: (ten: string) => `Mid-cycle review of ${ten} is open.`,
		},
		dong: {
			chanTieuDe: (ten: string) => `${ten} cannot close yet`,
			chanMoTa: (n: string) =>
				`A cycle closes only when every key result of a published objective has a score. ${n} key results are not scored:`,
			soKr: (n: string) => `${n} key results`,
			dangDem: "Counting unscored key results…",
			hocTapMoTa:
				"Learning objectives need their lessons written before the cycle closes:",
			loi: "Could not count unscored key results. Close this dialog and try again.",
			dongHop: "Close dialog",
			nut: "Close cycle",
			hoiTieuDe: (ten: string) => `Close ${ten}?`,
			hoiThan: (ten: string) =>
				`Every key result is scored. Once closed, the numbers, scores and lessons of ${ten} are read-only; reopening needs a reason and leaves a trail.`,
			huy: "Cancel",
			daDong: (ten: string) => `${ten} is closed.`,
		},
		moLai: {
			tieuDe: (ten: string) => `Reopen ${ten}`,
			moTa: "The cycle goes back to scoring: scores and lessons can be edited again. Closing numbers stay. The reason goes into the cycle's trail.",
			nhan: "Reason for reopening",
			moTaO: `${LY_DO.toiThieu} to ${LY_DO.toiDa} characters.`,
			huy: "Cancel",
			nut: "Reopen cycle",
			daMo: (ten: string) => `${ten} is back in scoring.`,
		},
	},
	xuat: {
		tieuDe: "Download the whole cycle",
		moTa: "A CSV file with one row per key result: unit, objective, key result, start, target, closing number, suggested score, score, reason for the change, target changes outside review, lessons, carried over to.",
		nut: "Export",
	},
};

export function okrKhepMessages(locale: Locale): OkrKhepMessages {
	return locale === "vi" ? vi : en;
}
