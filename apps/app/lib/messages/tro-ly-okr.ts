import type { Locale } from "@crm/ui/lib/locale";

const vi = {
	troLy: {
		tieuDe: "Trợ lý OKR",
		luu: "Lưu",
		daLuu: "Đã lưu Trợ lý OKR.",
		loiLuu: "Chưa lưu được. Thử lại — phần đã nhập vẫn còn.",
		bat: "Bật Trợ lý OKR",
		batMoTa:
			"Nội dung OKR chỉ gửi tới nhà cung cấp mô hình cam kết không lưu dữ liệu. Người dùng chưa thấy nút nào cho tới khi góp ý mở.",
		phamVi: {
			tat: "Tắt",
			"toan-cong-ty": "Toàn công ty",
			"danh-sach": "Chọn đơn vị",
		},
		viec: {
			"de-xuat": {
				nhan: "Góp ý khi bấm",
				moTa: "Người sửa được một Mục tiêu nhờ Trợ lý OKR góp ý tên, «vì sao lúc này» và KR.",
			},
			"tom-tat-tuan": {
				nhan: "Tóm tắt tuần",
				moTa: "Mỗi phòng ban nhận một Tóm tắt tuần ở đầu Họp tuần.",
			},
		},
		donViBat: (viec: string) => `Đơn vị bật ${viec.toLowerCase()}`,
		chonDonVi: "Chọn đơn vị…",
		chuaChonDonVi: "Chưa chọn đơn vị nào — việc này chưa chạy ở đâu.",
		hop: {
			tieuDe: (viec: string) => `Đơn vị cho «${viec}»`,
			moTa: "Trợ lý OKR chỉ chạy cho Mục tiêu thuộc các đơn vị đã chọn.",
			tim: "Tìm đơn vị",
			xacNhan: (n: number) => `Chọn ${n} đơn vị`,
			huy: "Huỷ",
			rong: "Không có đơn vị nào khớp",
			onehub: "OneHub",
			goiYOnehub: "Mục tiêu cấp công ty",
			goiYBoPhan: "Bộ phận",
			goiYPhongBan: (boPhan: string | null) =>
				boPhan ? `Phòng ban · ${boPhan}` : "Phòng ban",
		},
		tran: "Trần tháng (USD)",
		tranMoTa:
			"Chạm trần thì Trợ lý OKR tạm nghỉ tới đầu tháng sau. Quản trị được báo ở 80% và 100%.",
		tranHong: "Trần là một số từ 0, tối đa hai chữ số sau dấu phẩy.",
		sanSang: {
			dangTat: "Đang tắt",
			sanSang: "Sẵn sàng",
			chuaSanSang: (lyDo: string) => `Chưa sẵn sàng — ${lyDo}`,
			hetTran: (ngay: string) => `Đã chạm trần tháng — tạm nghỉ tới ${ngay}`,
			dangKiem: "Đang kiểm tra…",
			lyDo: {
				tat: "Đang tắt",
				"viec-tat": "Góp ý đang tắt",
				"don-vi-chua-bat": "Chưa chọn đơn vị",
				"het-tran-thang": "Đã chạm trần tháng",
				"het-tran-ngay": "Đã chạm trần ngày",
				"chua-noi-tac-tu": "Chưa nối tác tử",
				"chua-co-khoa-mo-hinh": "Chưa có khoá mô hình",
				"het-tran-gateway": "Hết ngân sách AI Gateway",
			},
		},
	},
	so: {
		tieuDe: "Sổ chi phí AI — tháng này",
		moTa: "Tiền mọi việc AI trong CRM, theo giờ Việt Nam từ ngày 1.",
		cotViec: "Việc",
		cotTien: "Tiền",
		tong: "Tổng",
		troLyOkr: "Trợ lý OKR",
		thanh: "Trợ lý OKR đã dùng trên trần tháng",
		muc80: "Đã dùng 80% trần",
		muc100: "Đã chạm trần",
		nhom: {
			"nghien-cuu-danh-ba": "Nghiên cứu danh bạ",
			"tro-ly-ai": "Trợ lý AI",
			"hoi-crm-zalo": "Hỏi CRM qua Zalo",
			"tac-nhan": "Tác nhân",
			"tro-ly-okr": "Trợ lý OKR",
			"chua-gan": "Chưa gán việc",
		},
		rong: "Tháng này chưa có lượt AI nào",
		rongMoTa: (tran: string) => `Trần của Trợ lý OKR: ${tran}.`,
		loi: "Không tải được sổ chi phí",
		thuLai: "Thử lại",
		doiSoat: {
			chuaCo: "Chưa có lần đối soát nào với AI Gateway.",
			khop: (thang: string, lech: string) =>
				`Đối soát tháng ${thang} với AI Gateway: khớp (lệch ${lech}%).`,
			lech: (thang: string, lech: string) =>
				`Đối soát tháng ${thang} với AI Gateway: lệch ${lech}%.`,
			khongDuoc: (thang: string, lyDo: string) =>
				`Đối soát tháng ${thang}: chưa đối soát được — ${lyDo}.`,
			khongCoKhoaRieng: "tác tử chưa có khoá AI Gateway riêng để lọc",
			loiGateway: (ma: string) => `AI Gateway trả lỗi ${ma}`,
			khongRo: "không rõ lý do",
		},
	},
};

export type TroLyOkrMessages = typeof vi;

const en: TroLyOkrMessages = {
	troLy: {
		tieuDe: "OKR assistant",
		luu: "Save",
		daLuu: "OKR assistant saved.",
		loiLuu: "Couldn't save. Try again — what you entered is kept.",
		bat: "Turn on the OKR assistant",
		batMoTa:
			"OKR content goes only to model providers that commit to keeping no data. Nobody sees a button until feedback opens.",
		phamVi: {
			tat: "Off",
			"toan-cong-ty": "Whole company",
			"danh-sach": "Chosen units",
		},
		viec: {
			"de-xuat": {
				nhan: "Feedback on request",
				moTa: "Anyone who can edit an objective can ask the OKR assistant for feedback on its title, “why now” and KRs.",
			},
			"tom-tat-tuan": {
				nhan: "Weekly summary",
				moTa: "Each department gets a weekly summary at the top of its weekly meeting.",
			},
		},
		donViBat: (viec: string) => `Units with ${viec.toLowerCase()}`,
		chonDonVi: "Choose units…",
		chuaChonDonVi: "No unit chosen — this runs nowhere yet.",
		hop: {
			tieuDe: (viec: string) => `Units for “${viec}”`,
			moTa: "The OKR assistant runs only for objectives in the chosen units.",
			tim: "Search units",
			xacNhan: (n: number) => `Choose ${n} units`,
			huy: "Cancel",
			rong: "No unit matches",
			onehub: "OneHub",
			goiYOnehub: "Company-level objectives",
			goiYBoPhan: "Division",
			goiYPhongBan: (boPhan: string | null) =>
				boPhan ? `Department · ${boPhan}` : "Department",
		},
		tran: "Monthly cap (USD)",
		tranMoTa:
			"At the cap the OKR assistant pauses until next month. Admins are told at 80% and 100%.",
		tranHong: "The cap is a number from 0, with at most two decimals.",
		sanSang: {
			dangTat: "Off",
			sanSang: "Ready",
			chuaSanSang: (lyDo: string) => `Not ready — ${lyDo}`,
			hetTran: (ngay: string) => `Monthly cap reached — paused until ${ngay}`,
			dangKiem: "Checking…",
			lyDo: {
				tat: "Off",
				"viec-tat": "Feedback is off",
				"don-vi-chua-bat": "No unit chosen",
				"het-tran-thang": "Monthly cap reached",
				"het-tran-ngay": "Daily cap reached",
				"chua-noi-tac-tu": "Agent not connected",
				"chua-co-khoa-mo-hinh": "No model key",
				"het-tran-gateway": "AI Gateway budget used up",
			},
		},
	},
	so: {
		tieuDe: "AI spend — this month",
		moTa: "What every AI task in the CRM cost, Vietnam time from the 1st.",
		cotViec: "Task",
		cotTien: "Cost",
		tong: "Total",
		troLyOkr: "OKR assistant",
		thanh: "OKR assistant spend against the monthly cap",
		muc80: "80% of the cap used",
		muc100: "Cap reached",
		nhom: {
			"nghien-cuu-danh-ba": "Contact research",
			"tro-ly-ai": "AI assistant",
			"hoi-crm-zalo": "CRM questions on Zalo",
			"tac-nhan": "Agents",
			"tro-ly-okr": "OKR assistant",
			"chua-gan": "Not assigned",
		},
		rong: "No AI use this month yet",
		rongMoTa: (tran: string) => `OKR assistant cap: ${tran}.`,
		loi: "Couldn't load AI spend",
		thuLai: "Try again",
		doiSoat: {
			chuaCo: "Not reconciled with AI Gateway yet.",
			khop: (thang: string, lech: string) =>
				`Reconciled ${thang} with AI Gateway: matches (off by ${lech}%).`,
			lech: (thang: string, lech: string) =>
				`Reconciled ${thang} with AI Gateway: off by ${lech}%.`,
			khongDuoc: (thang: string, lyDo: string) =>
				`Couldn't reconcile ${thang} — ${lyDo}.`,
			khongCoKhoaRieng:
				"the agent has no AI Gateway key of its own to filter by",
			loiGateway: (ma: string) => `AI Gateway returned ${ma}`,
			khongRo: "reason unknown",
		},
	},
};

const BANG = { en, vi } satisfies Record<Locale, TroLyOkrMessages>;

export function troLyOkrMessages(locale: Locale): TroLyOkrMessages {
	return BANG[locale];
}
