import type { Locale } from "@crm/ui/lib/locale";
import type { MaLoaiDeXuat, TruongVietLai } from "@crm/validation/okr-tro-ly";

const vi = {
	troLy: {
		tieuDe: "Kara · OKR",
		luu: "Lưu",
		daLuu: "Đã lưu Kara · OKR.",
		loiLuu: "Chưa lưu được. Thử lại — phần đã nhập vẫn còn.",
		bat: "Bật Kara",
		batMoTa:
			"Nội dung OKR chỉ gửi tới nhà cung cấp mô hình cam kết không lưu dữ liệu. Người dùng chưa thấy nút nào cho tới khi góp ý mở.",
		phamVi: {
			tat: "Không đơn vị nào",
			"toan-cong-ty": "Toàn công ty",
			"danh-sach": "Chọn đơn vị",
		},
		nac: {
			bat: "Bật cho",
			an: "Chế độ ẩn cho",
		},
		viec: {
			"de-xuat": {
				nhan: "Góp ý khi bấm",
				moTa: "Người sửa được một Mục tiêu nhờ Kara góp ý tên, «vì sao lúc này» và KR.",
				moTaAn:
					"Kara góp ý khi Mục tiêu được lưu; chỉ quản trị thấy kết quả, ở thẻ bên dưới.",
			},
			"tom-tat-tuan": {
				nhan: "Tóm tắt tuần",
				moTa: "Mỗi phòng ban nhận một Tóm tắt tuần ở đầu Họp tuần.",
				moTaAn: "Kara tóm tắt sau ngày cập nhật; chỉ quản trị thấy kết quả.",
			},
			soan: {
				nhan: "Soạn OKR",
				moTa: "Trưởng đơn vị mở «Soạn OKR cùng Kara» cho đơn vị và chu kỳ đang lập kế hoạch; bản nháp do người nhận, sửa, bác.",
				moTaAn:
					"Chỉ quản trị mở được cuộc soạn trên đơn vị; số đo tách cột Ẩn.",
			},
		},
		khoaAn: "Mọi đơn vị đã bật — không còn đơn vị nào để chế độ ẩn.",
		donViCua: (nac: string, viec: string) =>
			`Đơn vị ${nac.toLowerCase()} ${viec.toLowerCase()}`,
		chonDonVi: "Chọn đơn vị…",
		chuaChonDonVi: "Chưa chọn đơn vị nào — việc này chưa chạy ở đâu.",
		chuaChonDonViAn: "Chưa chọn đơn vị nào — chế độ ẩn chưa chạy ở đâu.",
		hop: {
			tieuDe: (nac: string, viec: string) =>
				`Đơn vị ${nac.toLowerCase()} «${viec}»`,
			moTa: "Kara chỉ chạy cho Mục tiêu thuộc các đơn vị đã chọn.",
			moTaAn:
				"Kara chạy ở chế độ ẩn cho Mục tiêu thuộc các đơn vị đã chọn. Đơn vị đã bật không có trong danh sách.",
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
			"Chạm trần thì Kara tạm nghỉ tới đầu tháng sau. Quản trị được báo ở 80% và 100%.",
		tranHong: "Trần là một số từ 0, tối đa hai chữ số sau dấu phẩy.",
		tranDatOkr: "Trần tháng đặt OKR (USD)",
		tranDatOkrMoTa:
			"Trống = bằng trần thường; áp cho tháng có chu kỳ ở pha lập kế hoạch.",
		tranDatOkrHong:
			"Trần tháng đặt OKR là một số từ 0, tối đa hai chữ số sau dấu phẩy, hoặc để trống.",
		sanSang: {
			dangTat: "Đang tắt",
			sanSang: "Sẵn sàng",
			sanSangNguon: {
				"khoa-rieng": "Sẵn sàng · khoá riêng của Kara · OKR",
				"khoa-chung": "Sẵn sàng · khoá chung của tác tử",
				oidc: "Sẵn sàng · qua Vercel",
			},
			thieuKhoaMoTa: (rieng: string, chung: string, phut: string) =>
				`Cắm ${rieng} (hoặc ${chung}) vào dự án tác tử, hoặc bật OIDC của dự án đó trên Vercel. Tác tử tự kiểm lại trong khoảng ${phut} phút.`,
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
		moTa: "Tiền mọi việc AI trong OneHub Center, theo giờ Việt Nam từ ngày 1.",
		cotViec: "Việc",
		cotTien: "Tiền",
		tong: "Tổng",
		troLyOkr: "Kara · OKR",
		thanh: "Kara · OKR đã dùng trên trần tháng",
		muc80: "Đã dùng 80% trần",
		muc100: "Đã chạm trần",
		nhom: {
			"nghien-cuu-danh-ba": "Nghiên cứu danh bạ",
			"tro-ly-ai": "Kara · hồ sơ",
			"hoi-crm-zalo": "Hỏi qua Zalo",
			"tac-nhan": "Tác nhân",
			"tro-ly-okr": "Kara · OKR",
			"chua-gan": "Chưa gán việc",
		},
		rong: "Tháng này chưa có lượt AI nào",
		rongMoTa: (tran: string) => `Trần của Kara · OKR: ${tran}.`,
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
	soDo: {
		tieuDe: "Góp ý của Kara — tháng này",
		moTa: "Số đo của nấc bật và chế độ ẩn; bấm một lượt để xem từng dòng.",
		cotSo: "Số đo",
		nacTen: {
			bat: "Bật",
			an: "Chế độ ẩn",
		},
		hang: {
			luot: "Lượt",
			daHien: "Đề xuất đã hiện / sinh ra",
			nhan: "Nhận",
			sua: "Sửa rồi nhận",
			bac: "Bác",
			boQua: "Bỏ qua câu hỏi",
			hoanTac: (ngay: string) => `Hoàn tác trong ${ngay} ngày`,
			p50: "Độ trễ p50",
			p90: "Độ trễ p90",
			biLoai: "Câu bị bộ kiểm loại",
			chiPhiMoiNhan: "Chi phí mỗi đề xuất được nhận",
			chiPhiMoiLuot: "Chi phí mỗi lượt",
		},
		cotMucTieu: "Mục tiêu",
		cotNac: "Nấc",
		cotDong: "Dòng",
		cotTre: "Độ trễ",
		dongBiLoai: (so: string) => `(+${so} bị loại)`,
		mucTieuMat: "Mục tiêu đã xoá",
		rong: "Tháng này chưa có lượt góp ý nào",
		rongMoTa: "Lượt góp ý ở nấc bật và chế độ ẩn sẽ hiện ở đây.",
		loi: "Không tải được số đo",
		thuLai: "Thử lại",
		khongDong: "Lượt này không có dòng nào.",
		loai: {
			"viet-lai": "Viết lại",
			hoi: "Câu hỏi",
			"can-chinh": "Căn chỉnh",
		},
		truong: {
			title: "Viết lại tên Mục tiêu",
			whyNow: "Viết lại «vì sao lúc này»",
			"kr.title": "Viết lại tên KR",
		} satisfies Record<TruongVietLai, string>,
		trangThai: {
			cho: "Qua bộ kiểm",
			nhan: "Đã nhận",
			sua: "Sửa rồi nhận",
			bac: "Đã bác",
			"het-han": "Hết hạn",
			"da-sua-theo": "Người dùng đã sửa theo",
			"bo-qua": "Đã bỏ qua",
			"bi-loai": "Bị loại",
		},
		biLoaiMa: (nhan: string) => `Bị loại · ${nhan}`,
		maLoai: {
			"id-ngoai-goi": "Trỏ tới mục không có trong OKR đã gửi",
			"so-moi": "Có số mới không có trong câu gốc",
			"tu-cam": "Dùng từ cần tránh",
			"noi-ve-nguoi": "Nêu tên một người",
			"chep-cap-tren": "Chép KR của Mục tiêu cấp trên",
			"trung-luat": "Trùng câu hỏi luật đã hỏi",
			"dich-ngoai-tap": "Căn chỉnh tới đích ngoài danh sách",
			"da-bac": "Trùng đề xuất đã bị bác",
			"dang-cho": "Trùng đề xuất đang chờ",
			"khong-doi": "Câu mới giống câu cũ",
		} satisfies Record<MaLoaiDeXuat, string>,
	},
};

export type TroLyOkrMessages = typeof vi;

const en: TroLyOkrMessages = {
	troLy: {
		tieuDe: "Kara · OKR",
		luu: "Save",
		daLuu: "Kara · OKR saved.",
		loiLuu: "Couldn't save. Try again — what you entered is kept.",
		bat: "Turn on Kara",
		batMoTa:
			"OKR content goes only to model providers that commit to keeping no data. Nobody sees a button until feedback opens.",
		phamVi: {
			tat: "No units",
			"toan-cong-ty": "Whole company",
			"danh-sach": "Chosen units",
		},
		nac: {
			bat: "On for",
			an: "Hidden mode for",
		},
		viec: {
			"de-xuat": {
				nhan: "Feedback on request",
				moTa: "Anyone who can edit an objective can ask Kara for feedback on its title, “why now” and KRs.",
				moTaAn:
					"Feedback runs when an objective is saved; only admins see the results, in the card below.",
			},
			"tom-tat-tuan": {
				nhan: "Weekly summary",
				moTa: "Each department gets a weekly summary at the top of its weekly meeting.",
				moTaAn: "Summaries run after update day; only admins see the results.",
			},
			soan: {
				nhan: "Draft OKRs",
				moTa: "A unit head opens “Draft OKRs with Kara” for a unit and a cycle in planning; people accept, edit or reject every line.",
				moTaAn:
					"Only admins can open a drafting session on the unit; metrics go to the Hidden column.",
			},
		},
		khoaAn: "Every unit is already on — none is left for hidden mode.",
		donViCua: (nac: string, viec: string) =>
			`Units ${nac.toLowerCase()} ${viec.toLowerCase()}`,
		chonDonVi: "Choose units…",
		chuaChonDonVi: "No unit chosen — this runs nowhere yet.",
		chuaChonDonViAn: "No unit chosen — hidden mode runs nowhere yet.",
		hop: {
			tieuDe: (nac: string, viec: string) =>
				`Units ${nac.toLowerCase()} “${viec}”`,
			moTa: "Kara runs only for objectives in the chosen units.",
			moTaAn:
				"Hidden mode runs for objectives in the chosen units. Units that are on are not listed.",
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
			"At the cap Kara pauses until next month. Admins are told at 80% and 100%.",
		tranHong: "The cap is a number from 0, with at most two decimals.",
		tranDatOkr: "Monthly cap in OKR-setting months (USD)",
		tranDatOkrMoTa:
			"Empty = same as the regular cap; applies to months with a cycle in planning.",
		tranDatOkrHong:
			"The cap is a number from 0 with at most two decimals, or empty.",
		sanSang: {
			dangTat: "Off",
			sanSang: "Ready",
			sanSangNguon: {
				"khoa-rieng": "Ready · own key for Kara · OKR",
				"khoa-chung": "Ready · the agent's shared key",
				oidc: "Ready · through Vercel",
			},
			thieuKhoaMoTa: (rieng: string, chung: string, phut: string) =>
				`Set ${rieng} (or ${chung}) on the agent project, or turn on that project's OIDC on Vercel. The agent checks again within about ${phut} minutes.`,
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
		moTa: "What every AI task in OneHub Center cost, Vietnam time from the 1st.",
		cotViec: "Task",
		cotTien: "Cost",
		tong: "Total",
		troLyOkr: "Kara · OKR",
		thanh: "Kara · OKR spend against the monthly cap",
		muc80: "80% of the cap used",
		muc100: "Cap reached",
		nhom: {
			"nghien-cuu-danh-ba": "Contact research",
			"tro-ly-ai": "Kara · records",
			"hoi-crm-zalo": "Questions on Zalo",
			"tac-nhan": "Agents",
			"tro-ly-okr": "Kara · OKR",
			"chua-gan": "Not assigned",
		},
		rong: "No AI use this month yet",
		rongMoTa: (tran: string) => `Kara · OKR cap: ${tran}.`,
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
	soDo: {
		tieuDe: "Kara feedback — this month",
		moTa: "Numbers for on and hidden mode; open a run to see each line.",
		cotSo: "Measure",
		nacTen: {
			bat: "On",
			an: "Hidden mode",
		},
		hang: {
			luot: "Runs",
			daHien: "Suggestions shown / produced",
			nhan: "Accepted",
			sua: "Edited then accepted",
			bac: "Rejected",
			boQua: "Questions skipped",
			hoanTac: (ngay: string) => `Undone within ${ngay} days`,
			p50: "Latency p50",
			p90: "Latency p90",
			biLoai: "Lines dropped by the checker",
			chiPhiMoiNhan: "Cost per accepted suggestion",
			chiPhiMoiLuot: "Cost per run",
		},
		cotMucTieu: "Objective",
		cotNac: "Mode",
		cotDong: "Lines",
		cotTre: "Latency",
		dongBiLoai: (so: string) => `(+${so} dropped)`,
		mucTieuMat: "Deleted objective",
		rong: "No feedback runs this month yet",
		rongMoTa: "Runs in on and hidden mode will show up here.",
		loi: "Couldn't load the numbers",
		thuLai: "Try again",
		khongDong: "This run has no lines.",
		loai: {
			"viet-lai": "Rewrite",
			hoi: "Question",
			"can-chinh": "Alignment",
		},
		truong: {
			title: "Rewrite objective title",
			whyNow: "Rewrite “why now”",
			"kr.title": "Rewrite KR title",
		},
		trangThai: {
			cho: "Passed the checker",
			nhan: "Accepted",
			sua: "Edited then accepted",
			bac: "Rejected",
			"het-han": "Expired",
			"da-sua-theo": "User edited along",
			"bo-qua": "Skipped",
			"bi-loai": "Dropped",
		},
		biLoaiMa: (nhan: string) => `Dropped · ${nhan}`,
		maLoai: {
			"id-ngoai-goi": "Points at something not in the OKR sent",
			"so-moi": "Adds a number not in the original",
			"tu-cam": "Uses a word to avoid",
			"noi-ve-nguoi": "Names a person",
			"chep-cap-tren": "Copies a KR of the parent objective",
			"trung-luat": "Repeats a rule question already asked",
			"dich-ngoai-tap": "Aligns to a target outside the list",
			"da-bac": "Repeats a rejected suggestion",
			"dang-cho": "Repeats a pending suggestion",
			"khong-doi": "New text same as the old",
		},
	},
};

const BANG = { en, vi } satisfies Record<Locale, TroLyOkrMessages>;

export function troLyOkrMessages(locale: Locale): TroLyOkrMessages {
	return BANG[locale];
}
