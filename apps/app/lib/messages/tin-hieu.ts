import type { Locale } from "@crm/ui/lib/locale";

const en = {
	nut: "Send a signal",
	hop: {
		tieuDe: "Send a signal",
		moTa: "Tell us what you ran into in OneHub — something broken, something missing, an idea. The product team groups signals into work and you can follow yours.",
		nhan: "What did you run into?",
		goiY: "e.g. The KR update screen doesn't show last week's number…",
		man: "Sent from screen: {man}",
		conLai: "{so} characters left",
		gui: "Send",
		dangGui: "Sending…",
		huy: "Cancel",
		dong: "Close",
		daGuiTieuDe: "Signal {ma} received",
		daGuiMoTa:
			"It waits for the next pick-up into the product backlog. Follow it under Sent signals.",
		xemDaGui: "View sent signals",
		chuaGui: "Not sent — try again.",
		quaTran:
			"You've sent {tran} signals today — you can send more from midnight.",
	},
	trang: {
		tieuDe: "Sent signals",
		moTa: "What you told the product team, and where each signal is now.",
		cot: {
			dieuDaKe: "What you told us",
			man: "Screen",
			guiLuc: "Sent",
			trangThai: "Status",
		},
		rongTieuDe: "You haven't sent any signals",
		rongMoTa:
			"Press Send a signal at the top of any screen to tell the product team what you ran into.",
		banVeChuaDoc:
			"Status after grouping can't be read right now — showing the status at sending time.",
		taiLoiTieuDe: "Couldn't load your signals",
		taiLoiMoTa: "The list didn't load. Try again in a moment.",
		xoa: "Delete",
		xoaTieuDe: "Delete signal {ma}?",
		xoaThan:
			"This signal hasn't been picked up yet. Deleting it removes it for good.",
		xoaNut: "Delete signal",
		thoi: "Keep",
	},
	nhan: {
		choLayVe: "Waiting to be picked up",
		choGom: "Waiting to be grouped",
		le: "Not turned into work",
		daCoViec: "Already done",
		daVaoNhom: "In a group",
		deSau: "Later",
		chuaBatDau: "Not started",
		dangLam: "In progress",
		daGiao: "Delivered",
		khac: "Other",
	},
	trangThai: {
		choKeoVe: "Received — waiting for the product team to pick it up",
		choGom: "Picked up by the product team — waiting to be grouped",
	},
	menu: "Sent signals",
};

export type TinHieuMessages = typeof en;

const vi: TinHieuMessages = {
	nut: "Gửi tín hiệu",
	hop: {
		tieuDe: "Gửi tín hiệu",
		moTa: "Kể điều bạn gặp trong OneHub — chỗ hỏng, chỗ thiếu, một ý muốn có. Đội sản phẩm gom tín hiệu thành việc, và bạn theo dõi được tín hiệu của mình.",
		nhan: "Bạn gặp điều gì?",
		goiY: "Ví dụ: Mở cập nhật KR không thấy số tuần trước…",
		man: "Gửi từ màn: {man}",
		conLai: "Còn {so} ký tự",
		gui: "Gửi",
		dangGui: "Đang gửi…",
		huy: "Huỷ",
		dong: "Đóng",
		daGuiTieuDe: "Đã nhận tín hiệu {ma}",
		daGuiMoTa:
			"Tín hiệu chờ đội sản phẩm lấy về để gom thành việc. Theo dõi ở «Tín hiệu đã gửi».",
		xemDaGui: "Xem tín hiệu đã gửi",
		chuaGui: "Chưa gửi được — thử lại.",
		quaTran:
			"Hôm nay bạn đã gửi {tran} tín hiệu — gửi tiếp được từ 0 giờ ngày mai.",
	},
	trang: {
		tieuDe: "Tín hiệu đã gửi",
		moTa: "Những điều bạn đã kể với đội sản phẩm, và từng tín hiệu đang ở đâu.",
		cot: {
			dieuDaKe: "Điều đã kể",
			man: "Màn",
			guiLuc: "Gửi lúc",
			trangThai: "Trạng thái",
		},
		rongTieuDe: "Bạn chưa gửi tín hiệu nào",
		rongMoTa:
			"Bấm «Gửi tín hiệu» ở đầu bất kỳ màn nào để kể với đội sản phẩm điều bạn gặp.",
		banVeChuaDoc:
			"Trạng thái sau gom chưa đọc được — đang hiện trạng thái lúc gửi.",
		taiLoiTieuDe: "Chưa tải được tín hiệu của bạn",
		taiLoiMoTa: "Danh sách chưa tải xong. Thử lại sau một lát.",
		xoa: "Xoá",
		xoaTieuDe: "Xoá tín hiệu {ma}?",
		xoaThan: "Đội sản phẩm chưa lấy tín hiệu này về. Xoá là mất hẳn.",
		xoaNut: "Xoá tín hiệu",
		thoi: "Giữ lại",
	},
	nhan: {
		choLayVe: "Chờ lấy về",
		choGom: "Chờ gom",
		le: "Không thành việc",
		daCoViec: "Đã có việc",
		daVaoNhom: "Đã vào nhóm",
		deSau: "Để sau",
		chuaBatDau: "Chưa bắt đầu",
		dangLam: "Đang làm",
		daGiao: "Đã giao",
		khac: "Khác",
	},
	trangThai: {
		choKeoVe: "Đã nhận — chờ đội sản phẩm lấy về",
		choGom: "Đội sản phẩm đã lấy về — chờ gom nhóm",
	},
	menu: "Tín hiệu đã gửi",
};

export function tinHieuMessages(locale: Locale): TinHieuMessages {
	return locale === "vi" ? vi : en;
}
