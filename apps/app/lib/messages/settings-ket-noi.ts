import type { Locale } from "@crm/ui/lib/locale";

const en = {
	ten: {
		google: "Google",
		googleWorkspace: "Google Workspace",
		slack: "Slack",
		microsoft: "Microsoft",
		microsoft365: "Microsoft 365",
		stripe: "Stripe",
		docusign: "Docusign",
	},
	chung: {
		xoa: "Delete",
		huy: "Cancel",
		cam: "Connect",
		daCam: "Connected",
		chuaCam: "Not connected",
		chuaCauHinh: "Not configured",
		canXemLai: "Needs attention",
		dangKiem: "Checking…",
		kiemNgay: "Check now",
		kiemLanCuoi: "Last checked",
		chuaKiemLanNao: "Waiting for the first check",
		xoaDuLieu: "Delete synced data",
		xoaDuLieuHoi: "Delete synced data?",
		daXoa: (so: string) => `Removed ${so} synced items.`,
		vaoLai: "Sign out and back in.",
		batBuoc:
			"You will be signed out, and you cannot use the CRM again until you grant access.",
	},
	danhSach: {
		tieuDe: "Connections",
		moTa: "Where your CRM gets its information, and what it is allowed to send on your behalf.",
		them: "Add connection",
		quanLy: "Manage",
		cam: "Connect",
		mangVe: "Brings in",
		gui: "Sends",
		daCamVoi: (noiLam: string) => `Connected to ${noiLam}`,
		chuaGuiGi: "Nothing yet",
		googleMangVe: "Emails, meetings and the people on them",
		slackMangVe: "Workspace members and channels the app has joined",
		slackGui: "Messages to approved channels and people",
		microsoftMangVe: "Outlook email and the people on it",
		trongTieuDe: "Nothing is connected yet",
		trongMoTa:
			"Right now every deal, contact and note has to be typed in by hand. Connect a tool and the CRM starts filling itself in from the work your team already does.",
		googleKhoiDau: "File email and meetings against the right company",
		slackKhoiDau: "Let deployed agents notify approved channels and people",
		microsoftKhoiDau: "File Outlook email against the right company",
		timGiKhac: "Looking for something else?",
		xemTatCa: "Browse all connections",
	},
	them: {
		tieuDe: "Add a connection",
		moTa: "Nothing moves until you finish setting one up.",
		googleMoTa: "Bring in Gmail messages and Google Calendar meetings",
		slackMoTa: "Let deployed agents notify approved channels and people",
		microsoftMoTa: "Bring in Outlook email and the people on it",
		sapCo: "Coming soon",
		thuKhac: "Anything else",
		thuKhacMoTa: "The intake API is not available yet",
		daCamRoi: (danhSach: string) => `Already connected: ${danhSach}.`,
		chuaCamGi: "Nothing is connected yet.",
	},
	google: {
		chuaCauHinhMoTa:
			"Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in the root .env file and restart.",
		chuaCamMoTa:
			"Read-only Gmail and Calendar. Only conversations with companies in the CRM are stored.",
		khongVoiToi: "Could not reach Google.",
		camHong: "Google did not finish connecting",
		camHongMoTa:
			"Google returned an error before the connection was made. Try again.",
		loiCam: new Map([
			[
				"email_doesn't_match",
				"That Google account has a different email address to the one you sign in with, so it cannot be attached to your account. Connect the Google account that matches your sign-in address.",
			],
		]),
		daCamMoTa:
			"Meetings and email threads land on the matching company as they happen.",
		khongCoKhoaLamMoi: "Google did not return a refresh token",
		canCamLai: "Google needs reconnecting.",
		dongBoHong: (nguon: string) => `${nguon} sync failed`,
		xuLy: "Resolve",
		xoaDuLieuMoTa:
			"Every email and meeting brought in from Google is removed from the CRM. The next check starts from now, so nothing deleted here comes back.",
		go: "Revoke Google access",
		goHoi: "Revoke Google access?",
		goMoTa:
			"New email and meetings stop arriving. Everything already synced stays, and you can connect Google again from this page.",
		goNut: "Revoke",
		quanLyTaiKhoan: "Manage in your Google account",
		nguon: {
			calendar: {
				nhan: "Meetings",
				tuTao: "Add the company and contact when you meet someone new",
			},
			gmail: {
				nhan: "Email",
				tuTao: "Add the company and contact when you reply to someone new",
			},
		},
	},
	microsoft: {
		chuaCauHinhMoTa:
			"Set MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET in the root .env file and restart.",
		chuaCamMoTa:
			"Read-only Outlook mail. Only conversations with companies in the CRM are stored.",
		khongVoiToi: "Could not reach Microsoft.",
		camHong: "Microsoft did not finish connecting",
		camHongMoTa:
			"Microsoft returned an error before the connection was made. Try again.",
		loiCam: new Map([
			[
				"email_doesn't_match",
				"That Microsoft account has a different email address to the one you sign in with, so it cannot be attached to your account. Connect the Microsoft account that matches your sign-in address.",
			],
		]),
		daCamMoTa: "Email threads land on the matching company as they happen.",
		khongCoKhoaLamMoi: "Microsoft did not return a refresh token",
		canCamLai: "Microsoft needs reconnecting.",
		dongBoHong: "Email sync failed",
		nhanEmail: "Email",
		tuTao: "Add the company and contact when you reply to someone new",
		xoaDuLieuMoTa:
			"Every email brought in from Outlook is removed from the CRM. The next check starts from now, so nothing deleted here comes back.",
		go: "Disconnect Microsoft",
		goHoi: "Disconnect Microsoft?",
		goMoTa:
			"New email stops arriving. Everything already synced stays, and you can connect Microsoft again from this page.",
		goThem:
			"Microsoft has no way for us to withdraw the consent itself — remove this app from your Microsoft account to do that.",
		goNut: "Disconnect",
		quanLyTaiKhoan: "Manage in your Microsoft account",
	},
	slack: {
		gioiThieu:
			"Connecting Slack gives the CRM a way in and a way out. What it actually does with that is up to you afterwards, one automation at a time.",
		banGiao: "What you are handing over",
		khongBaoGio: "What it will never do",
		khongBaoGioMuc: [
			"Send anything at all until you build an automation and switch it on",
			"Post anywhere except the destination approved in that automation",
			"Read a direct message between two people",
		],
		duyetOSlack:
			"You approve the workspace in Slack. You can disconnect it here at any time.",
		goiYTieuDe: "Afterwards, most teams start with one of these",
		goiYMoTa:
			"Suggestions, not settings. None of them exist until you pick one and switch it on.",
		goiY: [
			{
				ten: "When a deal is created",
				moTa: "Post the deal to an approved sales channel.",
			},
			{
				ten: "When a deal is won",
				moTa: "Tell an approved channel that the deal closed.",
			},
			{
				ten: "When a deal reopens",
				moTa: "Notify one approved channel or teammate.",
			},
		],
		daCap: "What this workspace granted",
		moTaQuanTri:
			"Here is what Slack gave us. Agents only post where their automation says.",
		moTaThuong:
			"Here is what Slack gave us. Only an owner or an admin can disconnect it.",
		tacNhanTieuDe: "Agents that use Slack",
		tacNhanMoTa: "Built in chat, not here. Open one to change it.",
		tacNhanMoi: "New agent",
		tacNhanTrong: "No deployed agents use Slack yet.",
		dangChay: "Running",
		tamDung: "Paused",
		taChatTiep: "Describe another agent in chat",
		chuaSoatAi: "No workspace people have been reviewed yet.",
		daKhopNguoi: (khop: string, soat: string) =>
			`${khop} of ${soat} reviewed people are matched.`,
		soat: "Review",
		thieuRiengTu: "OneHub cannot reach private channels",
		thieuQuyen: (so: string) =>
			`Slack held back ${so} permission${so === "1" ? "" : "s"}`,
		camLaiMoTa: "Reconnect to ask again. You lose nothing.",
		camLai: "Reconnect",
		dangMoSlack: "Opening Slack…",
		camSlack: "Connect Slack",
		chuaCauHinh: "Slack is not configured",
		khongCamDuoc: "Could not connect Slack.",
		camHongMac: (ma: string) => `Slack could not be connected (${ma}).`,
		loiCam: new Map([
			[
				"access_denied",
				"Slack installation was cancelled before access was granted.",
			],
			[
				"account_already_linked_to_different_user",
				"That Slack installer is already linked to another CRM account.",
			],
			[
				"email_doesn't_match",
				"The Slack installer's email must match the CRM account you are signed in with.",
			],
			[
				"oauth_code_verification_failed",
				"Slack rejected the app credentials or redirect URL. Check the client ID, client secret, and OAuth redirect URL, then try again.",
			],
			[
				"user_info_is_missing",
				"Slack did not return the installer's profile. Confirm the app has users:read and users:read.email, reinstall it, then try again.",
			],
		]),
		daGo: "Slack disconnected.",
		go: "Disconnect",
		goHoi: (noiLam: string) => `Disconnect ${noiLam}?`,
		goMoTa:
			"Agents stop sending to Slack immediately, and the cached channel list is cleared so a new app re-reads it. Who is matched to which Slack account is kept, so reconnecting the same workspace does not ask you to match everyone again.",
		dangGo: "Disconnecting…",
	},
	quyen: {
		moTa: "Broad means the whole workspace, not one channel. Open a group to see the details.",
		dem: (rong: string, tong: string) => `${rong} broad of ${tong}`,
		giuLai: "Slack held this one back, so it is off.",
		chuaCap: "Not granted",
	},
	kenh: {
		chonKenh: (ten: string) => `Choose #${ten}`,
		xinLai: "Ask again",
		xinVao: "Request",
		themNgan: "Add",
		soNguoi: (so: string) => ` · ${so} people`,
		moTaDaVao: "OneHub is in",
		moTaChuaDoc: "Not read from Slack yet",
		moTaVaoDuoc: "OneHub can join this one",
		moTaVaoTheoBan: "Private. OneHub joins as you",
		moTaChoMoi: "Private. Waiting on an invite",
		moTaNhoNguoiTrong: "Private. Someone inside has to invite OneHub",
		tieuDe: "Channels OneHub can reach",
		moTa: "Agents pick from this list.",
		lamMoi: "Refresh",
		dangLamMoi: "Refreshing…",
		treo: "OneHub is not reading Slack right now. The list can be out of date.",
		tim: "Search channels",
		dangDoc: "Reading the channel list from Slack.",
		dangDocCho: "Reading the channel list from Slack…",
		khongKhop: (tuKhoa: string) => `No channel matches “${tuKhoa}”.`,
		chuaCoKenh:
			"No channels yet. OneHub reads the list from Slack after it connects.",
		taiThem: "Load more",
		dangTai: "Loading…",
		daOTrong: "OneHub is already in there.",
		dangVao: "OneHub is joining.",
		nhoMoi: "Ask someone inside to invite OneHub.",
		chepHong: "Copying failed. Copy the command above by hand.",
		daChep: "Command copied.",
		themHoi: (kenh: string) => `Add OneHub to #${kenh}?`,
		themMoTa:
			"It is a private channel, so OneHub joins as you. Same as typing the invite yourself. Everyone in the channel sees it join. It reads nothing until you turn a permission on.",
		nhoThem: "Ask someone to add OneHub",
		nhoThemMoTa: (kenh: string) =>
			`We cannot add OneHub to a private channel yet. Someone already in #${kenh} has to run this.`,
		dangThem: "Adding…",
		them: "Add OneHub",
		chepVaDanhDau: "Copy and mark as asked",
	},
	nguoi: {
		tieuDe: "Slack is connected",
		moTa: "Match your CRM people to Slack once. Agents use these exact accounts later instead of guessing from a similar name.",
		demKhop: (khop: string, tong: string) => `${khop} of ${tong} matched`,
		lamMoi: "Refresh from Slack",
		dangLamMoi: "Refreshing…",
		treo: "OneHub is not reading Slack right now. These matches can be out of date.",
		khongCoAi: "No CRM teammates are available to match.",
		khongKhopEmail: "No exact email match",
		ghiChu:
			"Refresh after a Slack email changes. The CRM matches exact email addresses only. Someone with no exact match stays unmatched, and an agent stops instead of guessing at a similar name.",
		tiepTuc: "Continue",
	},
	tiepNhan: {
		tieuDe: "Intake endpoint",
		moTa: "This connection is not available yet. No endpoint, API key, or intake activity has been created for this workspace.",
		quayLai: "Back to connections",
	},
};

export type KetNoiMessages = typeof en;

const vi = {
	ten: {
		google: "Google",
		googleWorkspace: "Google Workspace",
		slack: "Slack",
		microsoft: "Microsoft",
		microsoft365: "Microsoft 365",
		stripe: "Stripe",
		docusign: "Docusign",
	},
	chung: {
		xoa: "Xoá",
		huy: "Huỷ",
		cam: "Cắm",
		daCam: "Đã cắm",
		chuaCam: "Chưa cắm",
		chuaCauHinh: "Chưa cấu hình",
		canXemLai: "Cần xem lại",
		dangKiem: "Đang kiểm…",
		kiemNgay: "Kiểm ngay",
		kiemLanCuoi: "Kiểm lần cuối",
		chuaKiemLanNao: "Đang chờ lần kiểm đầu",
		xoaDuLieu: "Xoá dữ liệu đã kéo về",
		xoaDuLieuHoi: "Xoá dữ liệu đã kéo về?",
		daXoa: (so: string) => `Đã xoá ${so} mục đã kéo về.`,
		vaoLai: "Đăng xuất rồi đăng nhập lại.",
		batBuoc:
			"Bạn sẽ bị đăng xuất, và không dùng lại được CRM cho tới khi cấp quyền.",
	},
	danhSach: {
		tieuDe: "Kết nối",
		moTa: "CRM lấy thông tin từ đâu, và nó được phép gửi gì thay mặt bạn.",
		them: "Thêm kết nối",
		quanLy: "Quản lý",
		cam: "Cắm",
		mangVe: "Mang về",
		gui: "Gửi đi",
		daCamVoi: (noiLam: string) => `Đã cắm vào ${noiLam}`,
		chuaGuiGi: "Chưa gửi gì",
		googleMangVe: "Email, cuộc họp và những người có mặt",
		slackMangVe: "Thành viên workspace và các kênh ứng dụng đã vào",
		slackGui: "Tin nhắn tới kênh và người đã duyệt",
		microsoftMangVe: "Email Outlook và những người có mặt",
		trongTieuDe: "Chưa cắm gì cả",
		trongMoTa:
			"Hiện giờ mọi thoả thuận, cá nhân và ghi chú đều phải gõ tay. Cắm một công cụ vào thì CRM tự điền lấy từ việc đội bạn vốn đã làm.",
		googleKhoiDau: "Xếp email và cuộc họp về đúng công ty",
		slackKhoiDau: "Cho tác nhân đã bật báo tin tới kênh và người đã duyệt",
		microsoftKhoiDau: "Xếp email Outlook về đúng công ty",
		timGiKhac: "Tìm thứ khác?",
		xemTatCa: "Xem hết kết nối",
	},
	them: {
		tieuDe: "Thêm một kết nối",
		moTa: "Chưa cắm xong thì chưa có gì chạy.",
		googleMoTa: "Kéo về thư Gmail và cuộc họp Google Calendar",
		slackMoTa: "Cho tác nhân đã bật báo tin tới kênh và người đã duyệt",
		microsoftMoTa: "Kéo về thư Outlook và những người có mặt",
		sapCo: "Sắp có",
		thuKhac: "Thứ khác",
		thuKhacMoTa: "API nhận dữ liệu chưa dùng được",
		daCamRoi: (danhSach: string) => `${danhSach} đã cắm rồi.`,
		chuaCamGi: "Chưa cắm gì cả.",
	},
	google: {
		chuaCauHinhMoTa:
			"Đặt GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET trong tệp .env ở gốc kho rồi khởi động lại.",
		chuaCamMoTa:
			"Chỉ đọc Gmail và Lịch. Chỉ hội thoại với công ty có trong CRM mới được lưu.",
		khongVoiToi: "Không với tới Google.",
		camHong: "Google chưa cắm xong",
		camHongMoTa: "Google trả về lỗi trước khi cắm xong. Thử lại.",
		loiCam: new Map([
			[
				"email_doesn't_match",
				"Tài khoản Google đó dùng địa chỉ email khác với địa chỉ bạn đăng nhập, nên không gắn vào tài khoản của bạn được. Hãy cắm tài khoản Google trùng với địa chỉ đăng nhập.",
			],
		]),
		daCamMoTa:
			"Cuộc họp và luồng thư rơi về đúng công ty ngay khi chúng diễn ra.",
		khongCoKhoaLamMoi: "Google không trả về refresh token",
		canCamLai: "Google cần cắm lại.",
		dongBoHong: (nguon: string) => `Đồng bộ hỏng: ${nguon}`,
		xuLy: "Xử lý",
		xoaDuLieuMoTa:
			"Mọi thư và cuộc họp kéo về từ Google sẽ bị xoá khỏi CRM. Lần kiểm sau bắt đầu từ bây giờ, nên thứ đã xoá ở đây không quay lại.",
		go: "Thu hồi quyền Google",
		goHoi: "Thu hồi quyền Google?",
		goMoTa:
			"Thư và cuộc họp mới ngừng về. Thứ đã kéo về vẫn còn, và bạn cắm lại Google được từ màn này.",
		goNut: "Thu hồi",
		quanLyTaiKhoan: "Quản lý trong tài khoản Google của bạn",
		nguon: {
			calendar: {
				nhan: "Cuộc họp",
				tuTao: "Thêm công ty và cá nhân khi bạn gặp người mới",
			},
			gmail: {
				nhan: "Thư",
				tuTao: "Thêm công ty và cá nhân khi bạn trả lời người mới",
			},
		},
	},
	microsoft: {
		chuaCauHinhMoTa:
			"Đặt MICROSOFT_CLIENT_ID và MICROSOFT_CLIENT_SECRET trong tệp .env ở gốc kho rồi khởi động lại.",
		chuaCamMoTa:
			"Chỉ đọc thư Outlook. Chỉ hội thoại với công ty có trong CRM mới được lưu.",
		khongVoiToi: "Không với tới Microsoft.",
		camHong: "Microsoft chưa cắm xong",
		camHongMoTa: "Microsoft trả về lỗi trước khi cắm xong. Thử lại.",
		loiCam: new Map([
			[
				"email_doesn't_match",
				"Tài khoản Microsoft đó dùng địa chỉ email khác với địa chỉ bạn đăng nhập, nên không gắn vào tài khoản của bạn được. Hãy cắm tài khoản Microsoft trùng với địa chỉ đăng nhập.",
			],
		]),
		daCamMoTa: "Luồng thư rơi về đúng công ty ngay khi chúng diễn ra.",
		khongCoKhoaLamMoi: "Microsoft không trả về refresh token",
		canCamLai: "Microsoft cần cắm lại.",
		dongBoHong: "Đồng bộ thư hỏng",
		nhanEmail: "Thư",
		tuTao: "Thêm công ty và cá nhân khi bạn trả lời người mới",
		xoaDuLieuMoTa:
			"Mọi thư kéo về từ Outlook sẽ bị xoá khỏi CRM. Lần kiểm sau bắt đầu từ bây giờ, nên thứ đã xoá ở đây không quay lại.",
		go: "Gỡ Microsoft",
		goHoi: "Gỡ Microsoft?",
		goMoTa:
			"Thư mới ngừng về. Thứ đã kéo về vẫn còn, và bạn cắm lại Microsoft được từ màn này.",
		goThem:
			"Microsoft không cho chúng tôi cách nào tự thu hồi sự đồng ý — muốn thu hồi thì gỡ ứng dụng này khỏi tài khoản Microsoft của bạn.",
		goNut: "Gỡ",
		quanLyTaiKhoan: "Quản lý trong tài khoản Microsoft của bạn",
	},
	slack: {
		gioiThieu:
			"Cắm Slack là cho CRM một lối vào và một lối ra. Nó thật sự làm gì với hai lối đó thì tuỳ bạn quyết sau, mỗi lần một tự động hoá.",
		banGiao: "Bạn đang trao đi những gì",
		khongBaoGio: "Nó sẽ không bao giờ làm gì",
		khongBaoGioMuc: [
			"Gửi bất cứ thứ gì khi bạn chưa dựng một tự động hoá và bật nó lên",
			"Đăng ra ngoài đích đã duyệt trong chính tự động hoá đó",
			"Đọc tin nhắn riêng giữa hai người",
		],
		duyetOSlack:
			"Bạn duyệt workspace ngay trong Slack. Bạn gỡ ở đây bất cứ lúc nào.",
		goiYTieuDe: "Sau đó, phần lớn đội bắt đầu bằng một trong số này",
		goiYMoTa:
			"Đây là gợi ý, không phải cài đặt. Không cái nào tồn tại cho tới khi bạn chọn một cái và bật lên.",
		goiY: [
			{
				ten: "Khi có thoả thuận mới",
				moTa: "Đăng thoả thuận vào một kênh bán hàng đã duyệt.",
			},
			{
				ten: "Khi chốt được thoả thuận",
				moTa: "Báo vào kênh đã duyệt rằng thoả thuận đã chốt.",
			},
			{
				ten: "Khi thoả thuận mở lại",
				moTa: "Báo cho một kênh hoặc một đồng nghiệp đã duyệt.",
			},
		],
		daCap: "Workspace này đã cấp gì",
		moTaQuanTri:
			"Đây là những gì Slack đã cấp. Tác nhân chỉ đăng vào nơi tự động hoá của nó chỉ định.",
		moTaThuong:
			"Đây là những gì Slack đã cấp. Chỉ chủ sở hữu hoặc quản trị mới gỡ được.",
		tacNhanTieuDe: "Tác nhân dùng Slack",
		tacNhanMoTa:
			"Dựng trong khung chat, không phải ở đây. Mở một cái ra để sửa.",
		tacNhanMoi: "Tác nhân mới",
		tacNhanTrong: "Chưa tác nhân đã bật nào dùng Slack.",
		dangChay: "Đang chạy",
		tamDung: "Tạm dừng",
		taChatTiep: "Tả một tác nhân nữa trong khung chat",
		chuaSoatAi: "Chưa soát người nào trong workspace.",
		daKhopNguoi: (khop: string, soat: string) =>
			`Đã khớp ${khop} trên ${soat} người đã soát.`,
		soat: "Soát",
		thieuRiengTu: "OneHub không với tới được kênh riêng tư",
		thieuQuyen: (so: string) => `Slack giữ lại ${so} quyền`,
		camLaiMoTa: "Cắm lại để xin lần nữa. Bạn không mất gì.",
		camLai: "Cắm lại",
		dangMoSlack: "Đang mở Slack…",
		camSlack: "Cắm Slack",
		chuaCauHinh: "Slack chưa cấu hình",
		khongCamDuoc: "Không cắm được Slack.",
		camHongMac: (ma: string) => `Không cắm được Slack (${ma}).`,
		loiCam: new Map([
			["access_denied", "Việc cài lên Slack bị huỷ trước khi quyền được cấp."],
			[
				"account_already_linked_to_different_user",
				"Người cài Slack đó đã gắn với một tài khoản CRM khác.",
			],
			[
				"email_doesn't_match",
				"Email của người cài Slack phải trùng với tài khoản CRM bạn đang đăng nhập.",
			],
			[
				"oauth_code_verification_failed",
				"Slack từ chối thông tin xác thực của ứng dụng hoặc URL chuyển hướng. Kiểm lại client ID, client secret và URL chuyển hướng OAuth rồi thử lại.",
			],
			[
				"user_info_is_missing",
				"Slack không trả về hồ sơ của người cài. Xác nhận ứng dụng có users:read và users:read.email, cài lại rồi thử lại.",
			],
		]),
		daGo: "Đã gỡ Slack.",
		go: "Gỡ",
		goHoi: (noiLam: string) => `Gỡ ${noiLam}?`,
		goMoTa:
			"Tác nhân ngừng gửi sang Slack ngay lập tức, và danh sách kênh đã lưu bị xoá để một ứng dụng mới đọc lại từ đầu. Ai khớp với tài khoản Slack nào thì vẫn giữ, nên cắm lại đúng workspace đó không bắt bạn khớp lại từng người.",
		dangGo: "Đang gỡ…",
	},
	quyen: {
		moTa: "Rộng nghĩa là cả workspace, không phải một kênh. Mở một nhóm ra để xem chi tiết.",
		dem: (rong: string, tong: string) => `${rong} rộng trên ${tong}`,
		giuLai: "Slack giữ lại quyền này, nên nó đang tắt.",
		chuaCap: "Chưa cấp",
	},
	kenh: {
		chonKenh: (ten: string) => `Chọn kênh #${ten}`,
		xinLai: "Xin lại",
		xinVao: "Xin vào",
		themNgan: "Thêm",
		soNguoi: (so: string) => ` · ${so} người`,
		moTaDaVao: "OneHub đã ở trong",
		moTaChuaDoc: "Chưa đọc từ Slack",
		moTaVaoDuoc: "OneHub vào được kênh này",
		moTaVaoTheoBan: "Kênh riêng tư. OneHub vào dưới danh nghĩa bạn",
		moTaChoMoi: "Kênh riêng tư. Đang chờ lời mời",
		moTaNhoNguoiTrong: "Kênh riêng tư. Một người trong kênh phải mời OneHub",
		tieuDe: "Kênh OneHub với tới được",
		moTa: "Tác nhân chọn trong danh sách này.",
		lamMoi: "Lấy lại",
		dangLamMoi: "Đang lấy lại…",
		treo: "OneHub đang không đọc Slack. Danh sách có thể đã cũ.",
		tim: "Tìm kênh",
		dangDoc: "Đang đọc danh sách kênh từ Slack.",
		dangDocCho: "Đang đọc danh sách kênh từ Slack…",
		khongKhop: (tuKhoa: string) => `Không kênh nào khớp “${tuKhoa}”.`,
		chuaCoKenh:
			"Chưa có kênh nào. OneHub đọc danh sách từ Slack sau khi cắm xong.",
		taiThem: "Tải thêm",
		dangTai: "Đang tải…",
		daOTrong: "OneHub đã ở trong đó rồi.",
		dangVao: "OneHub đang vào.",
		nhoMoi: "Nhờ một người trong kênh mời OneHub vào.",
		chepHong: "Chép hỏng. Chép tay lệnh ở trên.",
		daChep: "Đã chép lệnh.",
		themHoi: (kenh: string) => `Thêm OneHub vào #${kenh}?`,
		themMoTa:
			"Đây là kênh riêng tư, nên OneHub vào dưới danh nghĩa bạn. Y như bạn tự gõ lệnh mời. Mọi người trong kênh đều thấy nó vào. Nó không đọc gì cho tới khi bạn bật một quyền lên.",
		nhoThem: "Nhờ người khác thêm OneHub",
		nhoThemMoTa: (kenh: string) =>
			`Chưa thêm OneHub vào kênh riêng tư được. Một người đã ở trong #${kenh} phải chạy lệnh này.`,
		dangThem: "Đang thêm…",
		them: "Thêm OneHub",
		chepVaDanhDau: "Chép rồi đánh dấu đã nhờ",
	},
	nguoi: {
		tieuDe: "Slack đã cắm xong",
		moTa: "Khớp người trong CRM với Slack một lần. Về sau tác nhân dùng đúng những tài khoản này thay vì đoán theo tên na ná.",
		demKhop: (khop: string, tong: string) => `Đã khớp ${khop} trên ${tong}`,
		lamMoi: "Lấy lại từ Slack",
		dangLamMoi: "Đang lấy lại…",
		treo: "OneHub đang không đọc Slack. Các cặp khớp này có thể đã cũ.",
		khongCoAi: "Không có đồng nghiệp nào trong CRM để khớp.",
		khongKhopEmail: "Không email nào trùng khít",
		ghiChu:
			"Lấy lại sau khi một email Slack đổi. CRM chỉ khớp địa chỉ email trùng khít. Người không có email trùng khít thì để trống, và tác nhân dừng lại thay vì đoán theo tên na ná.",
		tiepTuc: "Tiếp tục",
	},
	tiepNhan: {
		tieuDe: "Điểm nhận dữ liệu",
		moTa: "Kết nối này chưa dùng được. Chưa có điểm nhận, khoá API hay hoạt động nhận nào được tạo cho workspace này.",
		quayLai: "Về màn kết nối",
	},
} satisfies KetNoiMessages;

const BANG = { en, vi } satisfies Record<Locale, KetNoiMessages>;

export function ketNoiMessages(locale: Locale): KetNoiMessages {
	return BANG[locale];
}
