const SECOND_MS = 1_000;
const DAY_MS = 24 * 60 * 60 * SECOND_MS;

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
	lenh: { tu: ["xong", "done"], toiDaSo: 20 },
	loi: {
		huongDan:
			"Chào bạn. Để nhận nhắc việc, mở CRM › Cài đặt › Thông báo của bạn, bấm «Nối Zalo» rồi nhắn mã 6 số ở đây.",
		daNoi: (ten: string) =>
			`Đã nối với ${ten}. Mỗi sáng tôi gửi việc cần để ý ở đây.`,
		daNoiRoi: (ten: string, gio: string) =>
			`Bạn đã nối với ${ten}. Nhắc đến lúc ${gio}.`,
		guiThu: (gio: string) =>
			`Tin thử từ CRM. Nhắc việc buổi sáng của bạn sẽ đến ở đây lúc ${gio}.`,
		tokenSai: "Zalo không nhận token này.",
		zaloKhongTraLoi:
			"Zalo đang không trả lời nên chưa kiểm được token. Bot đang dùng giữ nguyên; thử lại sau ít phút.",
		dangKyHong:
			"Zalo chưa nhận đăng ký nhận tin. Bot đang dùng giữ nguyên; thử lại sau.",
		khongCoToken: "Chưa có Bot Token nào để đăng ký.",
		goiY: 'Trả lời "xong 2" để đánh dấu mục 2 xong.',
		thieuSo: 'Gõ "xong" kèm số mục trong tin nhắc sáng nay, ví dụ "xong 2".',
		khongQuyen:
			"Tài khoản CRM của bạn không còn quyền với kế hoạch 30 ngày đầu, nên chưa đánh dấu mục nào.",
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
	},
} as const;
