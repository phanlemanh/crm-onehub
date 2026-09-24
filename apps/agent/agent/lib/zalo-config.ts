const SECOND_MS = 1_000;
const DAY_MS = 24 * 60 * 60 * SECOND_MS;

export const ZALO = {
	api: "https://bot-api.zaloplatforms.com",
	http: { hetTin: 408 },
	poll: { toiDaMoiNhip: 20, timeoutGiay: 1, giuDauMs: 7 * DAY_MS },
	pollTay: { timeoutGiay: 30 },
	webhook: {
		duong: "/zalo/webhook",
		header: "x-bot-api-secret-token",
		khoa: { min: 8, max: 256 },
	},
	chatRieng: "PRIVATE",
	tranKyTu: 2_000,
	loi: {
		huongDan:
			"Chào bạn. Để nhận nhắc việc, mở CRM › Cài đặt › Thông báo của bạn, bấm «Nối Zalo» rồi nhắn mã 6 số ở đây.",
		daNoi: (ten: string) =>
			`Đã nối với ${ten}. Mỗi sáng tôi gửi việc cần để ý ở đây.`,
	},
} as const;
