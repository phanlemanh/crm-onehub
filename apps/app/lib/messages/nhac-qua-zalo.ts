import type { Locale } from "@crm/ui/lib/locale";

const en = {
	tieuDe: "Your notifications",
	moTa: "Only for you. Every morning at 08:30 the CRM gathers what needs your attention and sends it on one channel.",
	khoiZalo: {
		ten: "Your Zalo",
		tat: "Zalo is not switched on for this workspace. Ask an admin to turn it on under Connections › Zalo.",
		chuaNoi:
			"Get your reminders on Zalo. Connect, then send the 6-digit code to the bot.",
		noi: "Connect Zalo",
		taoMaMoi: "New code",
		hetHan: "The code has expired.",
		nhanMaCho: (bot: string) => `Send this code to ${bot} on Zalo.`,
		dangCho: (gio: string) => `Waiting for your message · expires at ${gio}`,
		maNoi: "Zalo link code",
		chepMa: "Copy code",
		daChep: "Code copied",
		daNoi: "Connected",
		go: "Remove",
		goTieuDe: "Remove Zalo from your account?",
		goVeSlack:
			"You chose Zalo. After removing it, your reminders go to Slack and your choice switches to Automatic.",
		goThuong:
			"The bot will stop messaging you. You can connect again at any time.",
		goGiu: "Keep it",
		goXacNhan: "Remove Zalo",
		loi: "Could not reach the server. Try again.",
	},
	kenh: {
		tieuDe: "Send my reminders by",
		auto: "Automatic",
		zalo: "Zalo",
		slack: "Slack",
		moTaAuto: "Zalo once you have connected it, otherwise Slack.",
		moTaZalo:
			"Only Zalo. If Zalo cannot be used, the reminder goes to Slack and this page tells you.",
		moTaSlack:
			"Only Slack. If Slack cannot be used, the reminder goes to Zalo and this page tells you.",
		khoaZaloTat: "Zalo is not switched on for this workspace.",
		khoaZaloChuaNoi: "Connect Zalo first.",
		khoaSlack:
			"Slack does not recognise you yet — ask an admin to match people under Connections › Slack.",
		lechQuaZalo: "Tomorrow's reminder will go to Zalo",
		lechQuaSlack: "Tomorrow's reminder will go to Slack",
		lechMoTa:
			"The channel you chose cannot be used right now, so the reminder takes the other one and you do not miss anything.",
		luuLoi: "Could not save your choice. Try again.",
	},
	ketNoi: {
		moTa: "The Zalo bot sends each person on the team their morning reminder.",
		mangVe: "Brings in",
		mangVeMoTa:
			"The link code each person sends to the bot. No other message is read or kept.",
		gui: "Sends",
		guiMoTa:
			"The morning reminder, privately, to people who connected. No customers, no groups.",
		traLoiLanCuoi: (luc: string) => `last answered at ${luc}`,
		chuaBat: "Not switched on",
		imTieuDe: (luc: string) => `The bot has not answered since ${luc}`,
		imMoTa:
			"The agent may be stopped. People waiting to connect get no confirmation, and tomorrow's reminder may not go out.",
		daNoiSo: (daNoi: string, tong: string) =>
			`${daNoi}/${tong} people connected Zalo`,
		chuaNoiVanSlack:
			"People who have not connected still get their reminder on Slack. Each person connects under Your notifications.",
		noiCuaToi: "Connect my Zalo",
		daNoi: "Connected",
		chuaNoi: "Not connected",
		cachBatTieuDe: "How to switch it on",
		cachBat1: "Create a bot at bot.zaloplatforms.com and copy its token.",
		cachBat2:
			"Put it in the .env file at the server root as ZALO_BOT_TOKEN, then restart the agent.",
		cachBat3: "Within a minute this page shows the bot as running.",
	},
};

export type NhacQuaZaloMessages = typeof en;

const vi = {
	tieuDe: "Thông báo của bạn",
	moTa: "Chỉ áp cho bạn. Mỗi sáng 08:30 máy gom việc cần để ý và nhắn bạn ở một kênh.",
	khoiZalo: {
		ten: "Zalo của bạn",
		tat: "Zalo chưa bật cho xưởng này. Nhờ quản trị viên bật trong Kết nối › Zalo.",
		chuaNoi: "Nhận nhắc việc trên Zalo. Bấm nối, rồi nhắn mã 6 số cho bot.",
		noi: "Nối Zalo",
		taoMaMoi: "Tạo mã mới",
		hetHan: "Mã đã hết hạn.",
		nhanMaCho: (bot: string) => `Nhắn mã này cho ${bot} trên Zalo.`,
		dangCho: (gio: string) => `Đang chờ bạn nhắn · hết hạn lúc ${gio}`,
		maNoi: "Mã nối Zalo",
		chepMa: "Chép mã",
		daChep: "Đã chép mã",
		daNoi: "Đã nối",
		go: "Gỡ",
		goTieuDe: "Gỡ Zalo khỏi tài khoản của bạn?",
		goVeSlack:
			"Bạn đang chọn nhận qua Zalo. Sau khi gỡ, nhắc việc sẽ về Slack và lựa chọn của bạn đổi thành Tự động.",
		goThuong:
			"Bot sẽ không nhắn cho bạn nữa. Bạn có thể nối lại bất cứ lúc nào.",
		goGiu: "Giữ nguyên",
		goXacNhan: "Gỡ Zalo",
		loi: "Không gọi được máy chủ. Thử lại.",
	},
	kenh: {
		tieuDe: "Nhận nhắc việc qua",
		auto: "Tự động",
		zalo: "Zalo",
		slack: "Slack",
		moTaAuto: "Zalo khi bạn đã nối Zalo, không thì Slack.",
		moTaZalo:
			"Chỉ Zalo. Zalo không dùng được thì tin đi qua Slack và trang này báo cho bạn.",
		moTaSlack:
			"Chỉ Slack. Slack không dùng được thì tin đi qua Zalo và trang này báo cho bạn.",
		khoaZaloTat: "Zalo chưa bật cho xưởng.",
		khoaZaloChuaNoi: "Nối Zalo trước.",
		khoaSlack:
			"Slack chưa nhận ra bạn — nhờ quản trị viên ghép người ở Kết nối › Slack.",
		lechQuaZalo: "Nhắc sáng mai sẽ qua Zalo",
		lechQuaSlack: "Nhắc sáng mai sẽ qua Slack",
		lechMoTa:
			"Kênh bạn chọn đang chưa dùng được, nên tin đi đường còn lại để bạn không lỡ việc.",
		luuLoi: "Không lưu được lựa chọn. Thử lại.",
	},
	ketNoi: {
		moTa: "Bot Zalo gửi nhắc việc buổi sáng cho từng người trong đội.",
		mangVe: "Mang về",
		mangVeMoTa:
			"Mã nối mà mỗi người nhắn cho bot. Không đọc hay lưu tin nào khác.",
		gui: "Gửi đi",
		guiMoTa:
			"Tin nhắc việc buổi sáng, riêng cho người đã nối. Không nhắn khách, không nhắn nhóm.",
		traLoiLanCuoi: (luc: string) => `trả lời lần cuối lúc ${luc}`,
		chuaBat: "Chưa bật",
		imTieuDe: (luc: string) => `Bot không trả lời từ ${luc}`,
		imMoTa:
			"Tác tử có thể đang tắt. Người đang chờ nối sẽ không nhận được xác nhận, và nhắc sáng mai có thể không đi.",
		daNoiSo: (daNoi: string, tong: string) =>
			`${daNoi}/${tong} người đã nối Zalo`,
		chuaNoiVanSlack:
			"Người chưa nối vẫn nhận nhắc qua Slack. Mỗi người tự nối ở Thông báo của bạn.",
		noiCuaToi: "Nối Zalo của tôi",
		daNoi: "Đã nối",
		chuaNoi: "Chưa nối",
		cachBatTieuDe: "Cách bật",
		cachBat1: "Tạo một bot ở bot.zaloplatforms.com và chép token của nó.",
		cachBat2:
			"Đặt token vào tệp .env ở gốc máy chủ với tên ZALO_BOT_TOKEN, rồi khởi động lại tác tử.",
		cachBat3: "Trong một phút trang này chuyển sang đang chạy.",
	},
} satisfies NhacQuaZaloMessages;

const BANG = { en, vi } satisfies Record<Locale, NhacQuaZaloMessages>;

export function nhacQuaZaloMessages(locale: Locale): NhacQuaZaloMessages {
	return BANG[locale];
}
