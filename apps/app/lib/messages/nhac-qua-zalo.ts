import type { Locale } from "@crm/ui/lib/locale";

const en = {
	tieuDe: "Morning reminders",
	moTa: "Only for you. Every morning at 08:30 OneHub Center gathers what needs your attention and sends it on one channel.",
	khoiZalo: {
		ten: "Your Zalo",
		canNoiLai:
			"The company's Zalo bot changed or your link was removed. Link again to get reminders on Zalo.",
		tat: "Zalo is not switched on for this workspace. Ask an admin to turn it on under Connections › Zalo.",
		chuaNoi:
			"Get your reminders on Zalo. Connect, then send the 6-digit code to the bot.",
		noi: "Connect Zalo",
		taoMaMoi: "New code",
		hetHan: "The code has expired.",
		nhanMaCho: (bot: string) => `Send this code to ${bot} on Zalo.`,
		dangChoNgan: "Waiting for your message",
		hetHanLuc: (gio: string) => `Expires at ${gio}`,
		baBuoc: "Three steps to connect Zalo",
		buocTimBot: "Open Zalo and find",
		buocTimBotMoTa:
			"Type this exact name into Zalo's search box, then tap Message.",
		buocLayMa: "Get a link code",
		buocLayMaMoTa: "The code has 6 digits and lasts 15 minutes.",
		buocNhanMa: "Send the code to the bot",
		buocNhanMaMoTa: "Once you are connected this page switches to «Connected».",
		guiThu: "Send a test reminder now",
		dangGui: "Sending…",
		daGuiThuZalo: "Test message sent on Zalo.",
		daGuiThuSlack: "Test message sent on Slack.",
		guiThuLoi: "Could not send the test message. Try again.",
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
		khoaZaloTat: "not switched on for this workspace.",
		khoaZaloChuaNoi: "you have not connected it yet.",
		khoaSlack:
			"does not recognise you yet — ask an admin to match people under Connections › Slack.",
		lechQuaZalo: "Tomorrow's reminder will go to Zalo",
		lechQuaSlack: "Tomorrow's reminder will go to Slack",
		lechMoTa:
			"The channel you chose cannot be used right now, so the reminder takes the other one and you do not miss anything.",
		luuLoi: "Could not save your choice. Try again.",
	},
	troLy: {
		tieuDe: "OKR assistant",
		dongTomTat: "The OKR assistant's weekly summary line",
		dongTomTatMoTa: "One line a week, when your department has a new summary",
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
			"People who have not connected still get their reminder on Slack. Each person connects under Morning reminders in their account menu.",
		noiCuaToi: "Connect my Zalo",
		daNoi: "Connected",
		chuaNoi: "Not connected",
		botXuong: "The workspace bot",
		baBuoc: "Three steps to switch on the Zalo bot",
		buoc1TieuDe: "Create a bot in Zalo",
		buoc1MoTa:
			"Open the Zalo app, find the official account «Zalo Bot Manager», choose Create bot and give it a name — people search for this name to connect.",
		buoc2TieuDe: "Copy the Bot Token",
		buoc2MoTa:
			"In Zalo Bot Manager, open the new bot and copy its Bot Token. It looks like 1234567890:AbC… — not the Secret Token.",
		buoc3TieuDe: "Paste it here",
		buoc3MoTa:
			"OneHub Center checks the token with Zalo and signs up for messages on its own.",
		nhanToken: "Bot Token",
		goiYToken: "1234567890:AbC…",
		luu: "Save",
		thayToken: "Replace token",
		dangKiem: "Checking…",
		saiDang:
			"This is not a Bot Token. A Bot Token looks like 1234567890:AbC…, not like the Secret Token.",
		daLuu: (ten: string) => `${ten} is switched on.`,
		daLuuChuaNhanTin: (ten: string) =>
			`${ten} is saved, but Zalo could not reach OneHub Center yet. Press “Sign up again” in a few minutes.`,
		daDangKyLai: "Signed up for messages again.",
		dangKyLaiChuaXong:
			"Zalo took the sign-up but could not reach OneHub Center yet. Try “Sign up again” in a few minutes.",
		tokenEnv:
			"The token is set in the server's .env file. Paste a token here to replace it.",
		chiQuanTri: "Only an admin can change the bot.",
		nhanQuaWebhook: "Receives messages through the webhook",
		canHttpsTieuDe: "Messages to the bot do not reach OneHub Center yet",
		canHttpsMoTa:
			"The agent has no https address, so Zalo cannot deliver messages. When testing on your machine, run",
		doiBotTieuDe: "Switch to another Zalo bot?",
		doiBotThan: (ten: string, n: number) =>
			`Switching to the bot «${ten}» removes ${n} Zalo links. Everyone who linked must link again.`,
		doiBotNut: "Remove links and switch bot",
		doiBotThoi: "Cancel",
		khoaLechTieuDe: "Zalo is sending with an old key",
		khoaLechMoTa:
			"Messages to the bot are being refused. A bot you replaced may still point here. Register again so this bot's messages come in.",
		chuaWebhookTieuDe: "Zalo is not delivering messages to OneHub Center",
		chuaWebhookMoTa:
			"People who send their code will not be connected until you sign up again.",
		dangKyLai: "Sign up again",
	},
};

export type NhacQuaZaloMessages = typeof en;

const vi = {
	tieuDe: "Nhắc buổi sáng",
	moTa: "Chỉ áp cho bạn. Mỗi sáng 08:30 máy gom việc cần để ý và nhắn bạn ở một kênh.",
	khoiZalo: {
		ten: "Zalo của bạn",
		canNoiLai:
			"Bot Zalo của công ty đã đổi hoặc liên kết của bạn đã gỡ. Nối lại để nhận nhắc qua Zalo.",
		tat: "Zalo chưa bật cho xưởng này. Nhờ quản trị viên bật trong Kết nối › Zalo.",
		chuaNoi: "Nhận nhắc việc trên Zalo. Bấm nối, rồi nhắn mã 6 số cho bot.",
		noi: "Nối Zalo",
		taoMaMoi: "Tạo mã mới",
		hetHan: "Mã đã hết hạn.",
		nhanMaCho: (bot: string) => `Nhắn mã này cho ${bot} trên Zalo.`,
		dangChoNgan: "Đang chờ bạn nhắn",
		hetHanLuc: (gio: string) => `Hết hạn lúc ${gio}`,
		baBuoc: "Ba bước nối Zalo",
		buocTimBot: "Mở Zalo, tìm",
		buocTimBotMoTa:
			"Gõ đúng tên này vào ô tìm kiếm của Zalo, rồi bấm Nhắn tin.",
		buocLayMa: "Lấy mã nối",
		buocLayMaMoTa: "Mã có 6 số, dùng được 15 phút.",
		buocNhanMa: "Nhắn mã cho bot",
		buocNhanMaMoTa: "Nối xong trang này tự chuyển sang «Đã nối».",
		guiThu: "Gửi thử nhắc ngay",
		dangGui: "Đang gửi…",
		daGuiThuZalo: "Đã gửi tin thử qua Zalo.",
		daGuiThuSlack: "Đã gửi tin thử qua Slack.",
		guiThuLoi: "Chưa gửi được tin thử. Thử lại.",
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
		khoaZaloTat: "chưa bật cho xưởng này.",
		khoaZaloChuaNoi: "bạn chưa nối.",
		khoaSlack:
			"chưa nhận ra bạn — nhờ quản trị viên ghép người ở Kết nối › Slack.",
		lechQuaZalo: "Nhắc sáng mai sẽ qua Zalo",
		lechQuaSlack: "Nhắc sáng mai sẽ qua Slack",
		lechMoTa:
			"Kênh bạn chọn đang chưa dùng được, nên tin đi đường còn lại để bạn không lỡ việc.",
		luuLoi: "Không lưu được lựa chọn. Thử lại.",
	},
	troLy: {
		tieuDe: "Trợ lý OKR",
		dongTomTat: "Dòng Tóm tắt tuần của Trợ lý OKR",
		dongTomTatMoTa: "Mỗi tuần một dòng, khi phòng bạn có tóm tắt mới",
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
			"Người chưa nối vẫn nhận nhắc qua Slack. Mỗi người tự nối ở Nhắc buổi sáng trong menu người dùng.",
		noiCuaToi: "Nối Zalo của tôi",
		daNoi: "Đã nối",
		chuaNoi: "Chưa nối",
		botXuong: "Bot của xưởng",
		baBuoc: "Ba bước bật bot Zalo",
		buoc1TieuDe: "Tạo bot trong Zalo",
		buoc1MoTa:
			"Mở app Zalo, tìm OA «Zalo Bot Manager», chọn Tạo bot và đặt tên — tên này là tên mọi người tìm để nối.",
		buoc2TieuDe: "Chép Bot Token",
		buoc2MoTa:
			"Trong Zalo Bot Manager, mở bot vừa tạo và chép Bot Token. Token có dạng 1234567890:AbC… — không phải Secret Token.",
		buoc3TieuDe: "Dán vào đây",
		buoc3MoTa: "OneHub Center kiểm token với Zalo rồi tự đăng ký nhận tin.",
		nhanToken: "Bot Token",
		goiYToken: "1234567890:AbC…",
		luu: "Lưu",
		thayToken: "Đổi token",
		dangKiem: "Đang kiểm…",
		saiDang:
			"Đây không phải Bot Token. Bot Token có dạng 1234567890:AbC…, khác Secret Token.",
		daLuu: (ten: string) => `Đã bật ${ten}.`,
		daLuuChuaNhanTin: (ten: string) =>
			`Đã lưu ${ten}, nhưng Zalo chưa gọi thử được địa chỉ nhận tin. Bấm “Đăng ký lại” sau ít phút.`,
		daDangKyLai: "Đã đăng ký nhận tin lại.",
		dangKyLaiChuaXong:
			"Zalo nhận đăng ký nhưng chưa gọi thử được địa chỉ nhận tin. Thử “Đăng ký lại” sau ít phút.",
		tokenEnv:
			"Token đang đặt trong tệp .env của máy chủ. Dán token ở đây để thay.",
		chiQuanTri: "Chỉ quản trị viên thay được bot.",
		nhanQuaWebhook: "Nhận tin qua webhook",
		canHttpsTieuDe: "Tin nhắn tới bot chưa về OneHub Center",
		canHttpsMoTa:
			"Tác tử chưa có địa chỉ https nên Zalo không giao tin về được. Khi thử tại máy, chạy",
		doiBotTieuDe: "Đổi sang bot Zalo khác?",
		doiBotThan: (ten: string, n: number) =>
			`Đổi sang bot «${ten}» sẽ gỡ ${n} liên kết Zalo. Mọi người đã nối phải nối lại.`,
		doiBotNut: "Gỡ liên kết và đổi bot",
		doiBotThoi: "Huỷ",
		khoaLechTieuDe: "Zalo đang gửi tin bằng khoá cũ",
		khoaLechMoTa:
			"Tin nhắn tới bot đang bị từ chối — có thể một bot đã thay vẫn trỏ về đây. Đăng ký lại để nhận tin từ bot này.",
		chuaWebhookTieuDe: "Zalo chưa giao tin nhắn về OneHub Center",
		chuaWebhookMoTa: "Người nhắn mã sẽ không được nối cho tới khi đăng ký lại.",
		dangKyLai: "Đăng ký lại",
	},
} satisfies NhacQuaZaloMessages;

const BANG = { en, vi } satisfies Record<Locale, NhacQuaZaloMessages>;

export function nhacQuaZaloMessages(locale: Locale): NhacQuaZaloMessages {
	return BANG[locale];
}
