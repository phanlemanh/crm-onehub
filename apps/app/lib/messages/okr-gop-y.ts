import type { Locale } from "@crm/ui/lib/locale";

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
		nhoLoi: {
			"khong-quyen":
				"Bạn không sửa được Mục tiêu hay KR nào ở đây nên chưa nhờ Kara được.",
			"mat-mang": "Mất kết nối nên lời nhờ chưa tới Kara. Chưa trừ lượt nào.",
			khac: "Lời nhờ chưa tới Kara. Chưa có gì bị ghi vào Mục tiêu.",
		},
		rong: "Kara không thấy chỗ nào cần sửa",
		rongMoTa: (gio: string) =>
			`Tên, «vì sao lúc này» và các KR đã đọc ổn lúc ${gio}. Sửa xong thì nhờ Kara đọc lại.`,
		loi: "Kara chưa đọc được Mục tiêu này",
		loiMoTa: "Lượt đọc bị ngắt giữa chừng. Chưa có gì bị ghi vào Mục tiêu.",
		thuLai: "Thử lại",
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
		moTaMucTieu: "Quyết ngay dưới từng KR.",
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
	vet: {
		theoKara: "theo đề xuất của Kara",
		suaTruong: (truong: string) => `Sửa ${truong}`,
	},
};

export type OkrGopYMessages = typeof vi;

const en: OkrGopYMessages = {
	vung: {
		soCho: (n: string) => `${n} suggestions waiting`,
		daXemHet: "all suggestions reviewed",
		lyDo: (soKr: string) =>
			`Kara read the title, “why now” and ${soKr} KRs of this objective. Kara reads OKR data only.`,
		moTaChuaGoi:
			"Kara reads the title, “why now” and the KRs, then places each suggestion right under what it changes.",
		nho: "Ask Kara for feedback",
		docLai: "Ask Kara to read again",
		dangDoc: "Kara is reading this objective…",
		viecTai: "load suggestions",
		taiLoiMoTa: "Nothing was lost. Reload to see the suggestions.",
		viecDoc: "read this objective",
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
		loi: "Kara couldn't read this objective",
		loiMoTa: "The read was interrupted. Nothing was written to the objective.",
		thuLai: "Try again",
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
	chip: (n: string) => `${n} suggestions`,
	chipAria: (n: string, ten: string) =>
		`Kara has ${n} suggestions waiting for “${ten}”, open details`,
	danSang: {
		moTaMucTieu: "Decide right under each KR.",
		moTaKr: "Decide right under this KR.",
		xem: "See suggestions",
	},
	loc: {
		mat: "Kara suggestions",
		coCho: (n: string) => `Has suggestions waiting · ${n}`,
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
	vet: {
		theoKara: "suggested by Kara",
		suaTruong: (truong: string) => `Edited ${truong}`,
	},
};

const BANG = { en, vi } satisfies Record<Locale, OkrGopYMessages>;

export function okrGopYMessages(locale: Locale): OkrGopYMessages {
	return BANG[locale];
}
