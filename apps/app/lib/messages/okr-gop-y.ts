import type { Locale } from "@crm/ui/lib/locale";
import type { LyDoKhongQuyet } from "@crm/validation/okr-tro-ly";

const vi = {
	vung: {
		soCho: (n: string) => `${n} góp ý chờ`,
		daXemHet: "đã xem hết góp ý",
		lyDo: (soKr: string) =>
			`Kara đọc tên, «vì sao lúc này» và ${soKr} KR của Mục tiêu này. Kara chỉ đọc dữ liệu OKR.`,
		moTaChuaGoi:
			"Kara đọc tên, «vì sao lúc này» và các KR, rồi đặt góp ý ngay dưới chỗ cần sửa.",
		nho: "Nhờ Kara góp ý",
		docLai: "Nhờ Kara đọc lại",
		dangDoc: "Kara đang đọc Mục tiêu này…",
		viecTai: "tải góp ý",
		taiLoiMoTa: "Góp ý không mất. Tải lại để xem tiếp.",
		viecDoc: "đọc Mục tiêu này",
		chuaBat:
			"Đơn vị này chưa bật Kara góp ý. Mở lại khi quản trị bật trong Cài đặt OKR.",
		tamTat:
			"Kara đang tạm tắt ở đây. Mở lại khi quản trị bật lại trong Cài đặt OKR.",
		nhoLoi: {
			"khong-quyen":
				"Bạn không sửa được Mục tiêu hay KR nào ở đây nên chưa nhờ Kara được.",
			"mat-mang": "Mất kết nối nên lời nhờ chưa tới Kara. Chưa trừ lượt nào.",
			khac: "Lời nhờ chưa tới Kara. Chưa có gì bị ghi vào Mục tiêu.",
		},
		rong: "Kara không thấy chỗ nào cần sửa",
		rongMoTa: (gio: string) =>
			`Tên, «vì sao lúc này» và các KR đã đọc ổn lúc ${gio}. Sửa xong thì nhờ Kara đọc lại.`,
		loiMoTa: "Lượt đọc bị ngắt giữa chừng. Chưa có gì bị ghi vào Mục tiêu.",
		hetLuot: "Bạn đã dùng hết lượt góp ý hôm nay. Mở lại lúc 00:00 ngày mai.",
		tamNghi: (ngay: string) => `Kara tạm nghỉ tới ${ngay}.`,
	},
	de: {
		doiTenKr: "Đổi tên KR",
		doiTenMucTieu: "Đổi tên Mục tiêu",
		thayViSao: "Thay câu",
		sua: "Sửa",
		boQua: "Bỏ qua",
		huy: "Huỷ",
		themDoiTrong: "Thêm KR đối trọng",
		suaKrNay: "Sửa KR này",
		suaMucTieu: "Sửa mục tiêu",
		khoaSua: "Mục tiêu đang khoá sửa nên chưa quyết được góp ý này.",
	},
	bienNhan: {
		daDoiTenKr: "Đã đổi tên KR theo Kara",
		daDoiTenMucTieu: "Đã đổi tên Mục tiêu theo Kara",
		daThayViSao: "Đã thay «vì sao lúc này» theo Kara",
		daCanChinh: "Đã góp vào mục tiêu theo Kara",
		hoanTacKr: (cu: string) => `Đã hoàn tác — tên KR trở lại «${cu}»`,
		hoanTacMucTieu: (cu: string) =>
			`Đã hoàn tác — tên Mục tiêu trở lại «${cu}»`,
		hoanTacViSao: "Đã hoàn tác — câu cũ trở lại",
		hoanTacCanChinh: (ten: string) => `Đã hoàn tác — bỏ góp vào «${ten}»`,
		boQuaTen: (sau: string) => `Đã bỏ qua tên Kara đề xuất: «${sau}»`,
		boQuaCau: (sau: string) => `Đã bỏ qua câu Kara đề xuất: «${sau}»`,
		boQuaCanChinh: (ten: string) => `Đã bỏ qua góp ý góp vào «${ten}»`,
		boQuaHoi: (tomTat: string) => `Đã bỏ qua câu hỏi của Kara: ${tomTat}`,
	},
	tomTat: {
		"kr-la-viec": "KR này là việc, chưa phải kết quả",
		"thieu-doi-trong": "bộ KR thiếu KR đối trọng",
		"khong-do-duoc": "chưa đo được",
		"trung-y": "hai KR trùng ý",
		"muc-tieu-la-so": "Mục tiêu đang là một con số",
	},
	chip: (n: string) => `${n} góp ý`,
	chipAria: (n: string, ten: string) =>
		`Kara có ${n} góp ý chờ cho «${ten}», mở khung chi tiết`,
	danSang: {
		moTaMucTieu: "Góp ý nằm trong vùng Kara của Mục tiêu này.",
		moTaKr: "Quyết ngay dưới KR này.",
		xem: "Xem góp ý",
	},
	loc: {
		mat: "Góp ý của Kara",
		coCho: (n: string) => `Có góp ý chờ · ${n}`,
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
		gopVao: (ten: string) => `Góp vào «${ten}»`,
		ket: {
			accepted: "Đã nhận",
			dismissed: "Đã bác",
			skipped: "Đã bỏ qua",
		},
	},
	xuHuong: (moiTuan: string, uoc: string, donVi: string) =>
		`Theo các lần cập nhật gần nhất (${moiTuan}/tuần), cuối kỳ ước khoảng ${[uoc, donVi.trim()].filter(Boolean).join(" ")}`,
	loiDong: {
		"khong-con": "Góp ý này không còn — có thể đã được quyết ở nơi khác.",
		"da-cu": "Góp ý này đã cũ vì Mục tiêu vừa đổi. Danh sách đã tải lại.",
		"chua-san-sang": "Chưa quyết được góp ý này lúc này. Thử lại sau ít phút.",
		"mat-mang": "Mất kết nối nên chưa ghi được. Thử lại khi có mạng.",
	},
	loiQuyet: {
		"muc-tieu-da-bo": "Mục tiêu này đã bỏ nên không quyết được góp ý.",
		"dang-cho-duyet":
			"Mục tiêu đang chờ duyệt nên nội dung, KR và căn chỉnh đang khoá. Rút lại để sửa.",
		"so-sai-kieu":
			"Khởi điểm và đích của KR này không khớp kiểu đo — sửa số hoặc kiểu đo của KR trước.",
		"can-chinh-gioi-han":
			"Một bên đang ở mức giới hạn nên không căn chỉnh được.",
		"can-chinh-chinh-no":
			"Đích là chính Mục tiêu này nên không căn chỉnh được.",
		"can-chinh-cung-cap": "Đích không ở cấp cao hơn nên không căn chỉnh được.",
		"can-chinh-chua-cong-bo":
			"Đích chưa công bố hoặc đã bỏ nên không căn chỉnh được.",
		"can-chinh-khac-chu-ky": "Đích thuộc chu kỳ khác nên không căn chỉnh được.",
		"can-chinh-da-gan": "Mục tiêu này đã căn chỉnh vào đích đó rồi.",
	} satisfies Record<LyDoKhongQuyet, string>,
	vet: {
		theoKara: "theo đề xuất của Kara",
		suaTruong: (truong: string) => `Sửa ${truong}`,
	},
};

export type OkrGopYMessages = typeof vi;

const en: OkrGopYMessages = {
	vung: {
		soCho: (n: string) =>
			n === "1" ? "1 suggestion waiting" : `${n} suggestions waiting`,
		daXemHet: "all suggestions reviewed",
		lyDo: (soKr: string) =>
			soKr === "1"
				? "Kara read the title, “why now” and 1 KR of this objective. Kara reads OKR data only."
				: `Kara read the title, “why now” and ${soKr} KRs of this objective. Kara reads OKR data only.`,
		moTaChuaGoi:
			"Kara reads the title, “why now” and the KRs, then places each suggestion right under what it changes.",
		nho: "Ask Kara for feedback",
		docLai: "Ask Kara to read again",
		dangDoc: "Kara is reading this objective…",
		viecTai: "load suggestions",
		taiLoiMoTa: "Nothing was lost. Reload to see the suggestions.",
		viecDoc: "read this objective",
		chuaBat:
			"Kara feedback is off for this unit. It reopens when an admin turns it on in OKR settings.",
		tamTat:
			"Kara is turned off here for now. It reopens when an admin turns it back on in OKR settings.",
		nhoLoi: {
			"khong-quyen":
				"You can't edit this objective or any of its KRs, so Kara can't be asked here.",
			"mat-mang":
				"The connection dropped before the request reached Kara. No request was used.",
			khac: "The request didn't reach Kara. Nothing was written to the objective.",
		},
		rong: "Kara found nothing to change",
		rongMoTa: (gio: string) =>
			`The title, “why now” and the KRs read well at ${gio}. Ask Kara again after you edit.`,
		loiMoTa: "The read was interrupted. Nothing was written to the objective.",
		hetLuot:
			"You have used today's feedback requests. They reopen at 00:00 tomorrow.",
		tamNghi: (ngay: string) => `Kara is paused until ${ngay}.`,
	},
	de: {
		doiTenKr: "Rename KR",
		doiTenMucTieu: "Rename objective",
		thayViSao: "Replace sentence",
		sua: "Edit",
		boQua: "Skip",
		huy: "Cancel",
		themDoiTrong: "Add a counterbalance KR",
		suaKrNay: "Edit this KR",
		suaMucTieu: "Edit objective",
		khoaSua:
			"This objective is locked for editing, so the suggestion can't be decided yet.",
	},
	bienNhan: {
		daDoiTenKr: "KR renamed from Kara's suggestion",
		daDoiTenMucTieu: "Objective renamed from Kara's suggestion",
		daThayViSao: "“Why now” replaced from Kara's suggestion",
		daCanChinh: "Aligned from Kara's suggestion",
		hoanTacKr: (cu: string) => `Undone — the KR name is back to “${cu}”`,
		hoanTacMucTieu: (cu: string) =>
			`Undone — the Objective name is back to “${cu}”`,
		hoanTacViSao: "Undone — the previous wording is back",
		hoanTacCanChinh: (ten: string) =>
			`Undone — no longer contributes to “${ten}”`,
		boQuaTen: (sau: string) => `Skipped the name Kara suggested: “${sau}”`,
		boQuaCau: (sau: string) => `Skipped Kara's wording: “${sau}”`,
		boQuaCanChinh: (ten: string) => `Skipped aligning to “${ten}”`,
		boQuaHoi: (tomTat: string) => `Skipped Kara's question: ${tomTat}`,
	},
	tomTat: {
		"kr-la-viec": "this KR is a task, not a result",
		"thieu-doi-trong": "the KRs lack a counterbalance",
		"khong-do-duoc": "not measurable yet",
		"trung-y": "two KRs say the same thing",
		"muc-tieu-la-so": "the objective is a number",
	},
	chip: (n: string) => (n === "1" ? "1 suggestion" : `${n} suggestions`),
	chipAria: (n: string, ten: string) =>
		n === "1"
			? `Kara has 1 suggestion waiting for “${ten}”, open details`
			: `Kara has ${n} suggestions waiting for “${ten}”, open details`,
	danSang: {
		moTaMucTieu: "Suggestions are in the Kara section of this objective.",
		moTaKr: "Decide right under this KR.",
		xem: "See suggestions",
	},
	loc: {
		mat: "Kara suggestions",
		coCho: (n: string) =>
			n === "1"
				? "Has a suggestion waiting · 1"
				: `Has suggestions waiting · ${n}`,
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
		gopVao: (ten: string) => `Contributes to “${ten}”`,
		ket: {
			accepted: "Accepted",
			dismissed: "Rejected",
			skipped: "Skipped",
		},
	},
	xuHuong: (moiTuan: string, uoc: string, donVi: string) =>
		`Based on the latest updates (${moiTuan}/week), the period should end around ${[uoc, donVi.trim()].filter(Boolean).join(" ")}`,
	loiDong: {
		"khong-con":
			"This suggestion is gone — it may have been decided elsewhere.",
		"da-cu":
			"This suggestion is out of date because the objective just changed. The list has been reloaded.",
		"chua-san-sang":
			"This suggestion can't be decided right now. Try again in a few minutes.",
		"mat-mang":
			"The connection dropped, so nothing was saved. Try again when you're back online.",
	},
	loiQuyet: {
		"muc-tieu-da-bo":
			"This objective was dropped, so the suggestion can't be decided.",
		"dang-cho-duyet":
			"The objective is awaiting approval, so its content, KRs and alignment are locked. Withdraw it to edit.",
		"so-sai-kieu":
			"This KR's start and target don't fit its measure type — fix its numbers or type first.",
		"can-chinh-gioi-han": "One side is restricted, so they can't be aligned.",
		"can-chinh-chinh-no":
			"The target is this objective itself, so it can't be aligned.",
		"can-chinh-cung-cap":
			"The target isn't at a higher level, so it can't be aligned to.",
		"can-chinh-chua-cong-bo":
			"The target is not published or was dropped, so it can't be aligned to.",
		"can-chinh-khac-chu-ky":
			"The target is in another cycle, so it can't be aligned to.",
		"can-chinh-da-gan": "This objective is already aligned to that target.",
	},
	vet: {
		theoKara: "suggested by Kara",
		suaTruong: (truong: string) => `Edited ${truong}`,
	},
};

const BANG = { en, vi } satisfies Record<Locale, OkrGopYMessages>;

export function okrGopYMessages(locale: Locale): OkrGopYMessages {
	return BANG[locale];
}
