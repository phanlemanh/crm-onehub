const SECOND_MS = 1_000;
const MINUTE_MS = 60 * SECOND_MS;
const DAY_MS = 24 * 60 * MINUTE_MS;

export const ZALO = {
	api: "https://bot-api.zaloplatforms.com",
	http: {
		hetTin: 408,
		ok: 200,
		khongCo: 404,
		chuaQuyen: 401,
		saiThan: 400,
		cam: 403,
		loiMayChu: 500,
		tuChoi: { tu: 400, den: 500 },
		tamLoi: [408, 429],
	},
	poll: { toiDaMoiNhip: 20, timeoutGiay: 1, giuDauMs: 7 * DAY_MS },
	pollTay: { timeoutGiay: 30 },
	webhook: {
		duong: "/zalo/webhook",
		header: "x-bot-api-secret-token",
		khoa: { min: 8, max: 256, sinhByte: 32 },
		giaoThucAnToan: "https:",
		xacMinhOk: "webhook.ok",
	},
	chatRieng: "PRIVATE",
	tranKyTu: 2_000,
	hoi: {
		toiDaTin: 3,
		an: "[đã ẩn]",
		luoc: "…",
		soChuSo: { min: 10, max: 15 },
		tran: { phut: 3, ngay: 20, thang: 300 },
		cuaSoPhutMs: MINUTE_MS,
		hanTraLoiMs: 5 * MINUTE_MS,
		ngayMs: DAY_MS,
		tienToToken: "chat:",
		khoaChat: "zalo-hoi:",
		giuaLuot: "tool-calls",
		tienToBo: "bo:",
		authenticator: "zalo",
		purpose: "zalo",
		tuChoiGhi:
			"Not available on Zalo: this conversation is read-only. Answer from what OneHub Center already holds.",
		congCu: {
			doc: [
				"list_deals",
				"list_fields",
				"list_outstanding_work",
				"read_company_history",
				"read_crm_history",
				"read_deal_history",
				"search_crm",
				"zalo-chi-doc",
				"okr-chi-tro-ly",
			],
			ghi: [
				"archive_field",
				"enrich_company",
				"fetch_contact_photo",
				"find_contact_socials",
				"get_contact_work_history",
				"get_linkedin_profile",
				"identify_contact",
				"manage_fields",
				"record_fact",
				"record_job_change",
				"research_company",
				"research_person",
				"resolve_linkedin_profile",
				"schedule_recheck",
				"set_chat_title",
				"set_contact_socials",
				"set_field_value",
				"web_fetch",
				"write_brief",
				"write_workspace_profile",
			],
			tat: ["agent"],
			subagent: ["tro_ly_kho"],
			coSanChan: ["web_search", "ask_question"],
		},
	},
	lenh: { tu: ["xong", "done"], toiDaSo: 20, moi: ["mới", "moi", "/new"] },
	loi: {
		huongDan:
			"Chào bạn. Để nhận nhắc việc, mở OneHub Center, bấm ảnh đại diện ở góc trên › Nhắc buổi sáng, bấm «Nối Zalo» rồi nhắn mã 6 số ở đây.",
		daNoi: (ten: string) =>
			`Đã nối với ${ten}. Mỗi sáng tôi gửi việc cần để ý ở đây.`,
		daNoiRoi: (ten: string, gio: string) =>
			`Bạn đã nối với ${ten}. Nhắc đến lúc ${gio}.`,
		guiThu: (gio: string) =>
			`Tin thử từ OneHub Center. Nhắc việc buổi sáng của bạn sẽ đến ở đây lúc ${gio}.`,
		tokenSai: "Zalo không nhận token này.",
		zaloKhongTraLoi:
			"Zalo đang không trả lời nên chưa kiểm được token. Bot đang dùng giữ nguyên; thử lại sau ít phút.",
		dangKyHong:
			"Zalo chưa nhận đăng ký nhận tin. Bot đang dùng giữ nguyên; thử lại sau.",
		khongCoToken: "Chưa có Bot Token nào để đăng ký.",
		goiY: 'Trả lời "xong 2" để đánh dấu mục 2 xong.',
		thieuSo: 'Gõ "xong" kèm số mục trong tin nhắc sáng nay, ví dụ "xong 2".',
		khongQuyen:
			"Tài khoản OneHub Center của bạn không còn quyền với kế hoạch 30 ngày đầu, nên chưa đánh dấu mục nào.",
		chuaCoTin: (gio: string) =>
			`Hôm nay chưa có tin nhắc qua Zalo. Nhắc đến lúc ${gio}.`,
		chuaDanhDau: "Chưa đánh dấu mục nào.",
		ngoaiDai: (sai: string, tran: number) =>
			`Tin nhắc sáng nay chỉ có mục 1–${tran}, không có mục ${sai}.`,
		khongPhaiBuoc: (so: number, loai: string, url: string | null) =>
			`Mục ${so} là «${loai}», không đánh dấu xong được${url ? ` — mở kế hoạch: ${url}` : ""}.`,
		buocDoi: (so: number, lyDo: "khong-co-buoc" | "ke-hoach-dong") =>
			lyDo === "khong-co-buoc"
				? `Mục ${so} không còn bước đó trong kế hoạch.`
				: `Mục ${so} thuộc kế hoạch đã đóng.`,
		daXong: "Đã đánh dấu xong: ",
		khongGiMoi: "Không có mục nào mới",
		mocDaXongTruoc: " — đã xong từ trước: ",
		hoiKhongQuyen:
			"Tài khoản của bạn trong OneHub Center không có quyền hỏi dữ liệu đối tác, nên tôi chưa trả lời được câu này.",
		hetTranPhut: "Chờ một chút rồi hỏi tiếp.",
		hetTranNgay: (n: number) =>
			`Hôm nay bạn đã hỏi ${n} câu qua Zalo. Mở OneHub Center để hỏi tiếp; mai hỏi lại ở đây.`,
		hetTranThang:
			"Kênh hỏi qua Zalo tháng này đã hết lượt. Mở OneHub Center để hỏi.",
		dangTraLoi:
			"Tôi đang trả lời câu trước của bạn, gửi câu mới sau khi nhận được nhé.",
		tacTuLoi:
			"Tôi chưa trả lời được câu này. Thử lại sau ít phút, hoặc hỏi trong OneHub Center.",
		daMoi: "Đã bắt đầu cuộc trò chuyện mới.",
		canHoiLai:
			"Câu này tôi cần hỏi lại mới trả lời được, mà qua Zalo thì chưa hỏi lại được. Hỏi lại rõ hơn ở đây, hoặc hỏi trong OneHub Center.",
		chiDocChu: "Tôi chỉ đọc được tin chữ. Gõ câu hỏi của bạn ở đây nhé.",
	},
} as const;
