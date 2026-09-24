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
		dangKyHong:
			"Zalo chưa nhận đăng ký nhận tin. Bot đang dùng giữ nguyên; thử lại sau.",
		khongCoToken: "Chưa có Bot Token nào để đăng ký.",
	},
} as const;
