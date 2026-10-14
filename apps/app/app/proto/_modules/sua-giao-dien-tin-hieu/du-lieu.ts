import type { NghiaTrangThai } from "@crm/ui/lib/status-tone";

export const STATE = {
	truocBang: "ST-truoc-bang",
	truocHopQuaTran: "ST-truoc-hop-qua-tran",
	dsCo: "ST-ds-co",
	dsEn: "ST-ds-en",
	dsXacNhanXoa: "ST-ds-xac-nhan-xoa",
	dsXoaKhoa: "ST-ds-xoa-khoa",
	dsXoaHong: "ST-ds-xoa-hong",
	dsDaXoa: "ST-ds-da-xoa",
	dsRong: "ST-ds-rong",
	hopTrong: "ST-hop-trong",
	hopDangGo: "ST-hop-dang-go",
	hopQuaTran: "ST-hop-qua-tran",
	hopQuaTranEn: "ST-hop-qua-tran-en",
	hopLoi: "ST-hop-loi",
	hopDaGui: "ST-hop-da-gui",
} as const;

export type NgonNgu = "vi" | "en";

export const CHU = {
	vi: {
		cot: {
			dieuDaKe: "Điều đã kể",
			gui: "Gửi",
			trangThai: "Trạng thái",
			thaoTac: "Thao tác",
		},
		muonLam: "Muốn: {muonLam}",
		thaoTac: "Thao tác với tín hiệu {ma}",
		xoa: "Xoá",
		khongXoaDuoc: "Đội sản phẩm đã lấy về — không xoá được nữa.",
		xoaTieuDe: "Xoá tín hiệu {ma}?",
		xoaThan: "Đội sản phẩm chưa mở tín hiệu này. Xoá là mất hẳn.",
		xoaNut: "Xoá tín hiệu",
		thoi: "Giữ lại",
		daXoa: "Đã xoá tín hiệu {ma}.",
		xoaHongDaLayVe:
			"Chưa xoá được crm-41 — đội sản phẩm vừa lấy tín hiệu này về.",
		tieuDe: "Tín hiệu đã gửi",
		moTa: "Những điều bạn đã kể với đội sản phẩm, và từng tín hiệu đang ở đâu.",
		rongTieuDe: "Bạn chưa gửi tín hiệu nào",
		rongMoTa:
			"Bấm «Gửi tín hiệu» ở đầu bất kỳ màn nào để kể với đội sản phẩm điều bạn gặp.",
		nut: "Gửi tín hiệu",
		hop: {
			tieuDe: "Gửi tín hiệu",
			moTa: "Kể với đội sản phẩm bạn đang muốn làm gì và điều gì cản bạn. Đội sản phẩm xếp những tín hiệu giống nhau thành việc, và bạn theo dõi được tín hiệu của mình.",
			baoTruoc: "Quản trị CRM thấy tên bạn cùng tín hiệu này.",
			muonLam: "Bạn đang muốn làm gì?",
			goiYMuonLam: "Ví dụ: Cập nhật số tuần này cho KR của tôi…",
			daXayRa: "Điều gì xảy ra, hoặc còn thiếu gì?",
			goiYDaXayRa:
				"Ví dụ: Màn cập nhật không hiện số tuần trước, phải mở tab khác để xem…",
			man: "Gửi từ màn: {man}",
			lyDoKhoa: "Kể đủ hai câu rồi bấm Gửi.",
			gui: "Gửi",
			huy: "Huỷ",
			dong: "Đóng",
			daGuiTieuDe: "Đã nhận tín hiệu {ma}",
			daGuiMoTa:
				"Đội sản phẩm sẽ xem nó cùng những điều tương tự. Theo dõi ở «Tín hiệu đã gửi».",
			xemDaGui: "Xem tín hiệu đã gửi",
			chuaGui: "Chưa gửi được — thử lại.",
			quaTran:
				"Hôm nay bạn đã gửi 10 tín hiệu — gửi tiếp được từ 0 giờ ngày mai.",
		},
	},
	en: {
		cot: {
			dieuDaKe: "What you told us",
			gui: "Sent",
			trangThai: "Status",
			thaoTac: "Actions",
		},
		muonLam: "Wanted to: {muonLam}",
		thaoTac: "Actions for signal {ma}",
		xoa: "Delete",
		khongXoaDuoc: "The product team has it — it can't be deleted anymore.",
		xoaTieuDe: "Delete signal {ma}?",
		xoaThan:
			"The product team hasn't opened this signal yet. Deleting it removes it for good.",
		xoaNut: "Delete signal",
		thoi: "Keep",
		daXoa: "Signal {ma} deleted.",
		xoaHongDaLayVe:
			"Couldn't delete crm-41 — the product team just picked it up.",
		tieuDe: "Sent signals",
		moTa: "What you told the product team, and where each signal is now.",
		rongTieuDe: "You haven't sent any signals",
		rongMoTa:
			"Press Send a signal at the top of any screen to tell the product team what you ran into.",
		nut: "Send a signal",
		hop: {
			tieuDe: "Send a signal",
			moTa: "Tell the product team what you were trying to do and what got in the way. The product team turns similar signals into work, and you can follow yours.",
			baoTruoc: "CRM admins see your name with this signal.",
			muonLam: "What were you trying to do?",
			goiYMuonLam: "e.g. Update this week's number for my KR…",
			daXayRa: "What happened, or what's missing?",
			goiYDaXayRa:
				"e.g. The update screen doesn't show last week's number, so I have to open another tab…",
			man: "Sent from screen: {man}",
			lyDoKhoa: "Answer both questions, then press Send.",
			gui: "Send",
			huy: "Cancel",
			dong: "Close",
			daGuiTieuDe: "Signal {ma} received",
			daGuiMoTa:
				"The product team will review it with similar signals. Follow it under Sent signals.",
			xemDaGui: "View sent signals",
			chuaGui: "Not sent — try again.",
			quaTran:
				"You've sent 10 signals today — you can send more from midnight.",
		},
	},
} as const;

export type ChuMau = (typeof CHU)[NgonNgu];

export type DongMau = {
	id: string;
	ma: string;
	tieuDe: string;
	muonLam: string;
	tenMan: Record<NgonNgu, string>;
	guiLuc: string;
	coTheXoa: boolean;
	trangThai: Record<
		NgonNgu,
		{ nhan: string; cau: string; nghia: NghiaTrangThai }
	>;
};

const DA_NHAN = {
	vi: {
		nhan: "Đã nhận",
		cau: "Đội sản phẩm chưa mở. Bạn còn xoá được.",
		nghia: "nhap",
	},
	en: {
		nhan: "Received",
		cau: "Not opened by the product team yet. You can still delete it.",
		nghia: "nhap",
	},
} as const;

const DANG_XEM = {
	vi: {
		nhan: "Đang xem xét",
		cau: "Đội sản phẩm đang xếp nó cùng những điều tương tự.",
		nghia: "nhap",
	},
	en: {
		nhan: "Under review",
		cau: "The product team is sorting it with similar signals.",
		nghia: "nhap",
	},
} as const;

export const DONG_MAU: DongMau[] = [
	{
		id: "t41",
		ma: "crm-41",
		tieuDe: "Mở cập nhật KR không thấy số tuần trước",
		muonLam: "Cập nhật số tuần này cho KR của tôi",
		tenMan: { vi: "Mục tiêu", en: "Objectives" },
		guiLuc: "2026-10-16T02:14:00Z",
		coTheXoa: true,
		trangThai: DA_NHAN,
	},
	{
		id: "t38",
		ma: "crm-38",
		tieuDe: "Tài liệu quy trình tuyển dụng tìm không ra khi gõ «tuyển»",
		muonLam: "Tìm quy trình tuyển dụng để gửi cho ứng viên",
		tenMan: { vi: "Tài liệu", en: "Documents" },
		guiLuc: "2026-10-15T08:40:00Z",
		coTheXoa: false,
		trangThai: DANG_XEM,
	},
	{
		id: "t35",
		ma: "crm-35",
		tieuDe: "Muốn thấy OKR của phòng khác để căn chỉnh",
		muonLam: "Căn chỉnh OKR phòng tôi với phòng Kinh doanh",
		tenMan: { vi: "Mục tiêu", en: "Objectives" },
		guiLuc: "2026-10-14T03:05:00Z",
		coTheXoa: false,
		trangThai: {
			vi: {
				nhan: "Đang làm",
				cau: "Đã thành việc «Xem OKR phòng ban khác» — đang làm.",
				nghia: "dangChay",
			},
			en: {
				nhan: "In progress",
				cau: "Đã thành việc «Xem OKR phòng ban khác» — đang làm.",
				nghia: "dangChay",
			},
		},
	},
	{
		id: "t31",
		ma: "crm-31",
		tieuDe:
			"Thêm thành viên mới mà không thấy họ trong danh sách phòng ban ngay, phải tải lại trang mới hiện",
		muonLam: "Thêm người mới vào phòng Kinh doanh",
		tenMan: { vi: "Cài đặt › Thành viên", en: "Settings › Members" },
		guiLuc: "2026-10-13T09:30:00Z",
		coTheXoa: false,
		trangThai: {
			vi: {
				nhan: "Đã giao",
				cau: "Việc «Thành viên hiện ngay sau khi thêm» đã giao ngày 13/10.",
				nghia: "xong",
			},
			en: {
				nhan: "Delivered",
				cau: "Việc «Thành viên hiện ngay sau khi thêm» đã giao ngày 13/10.",
				nghia: "xong",
			},
		},
	},
];

export const MUON_LAM_MAU = "Cập nhật số tuần này cho KR của tôi";
export const DA_XAY_RA_MAU =
	"Mở cập nhật KR không thấy số tuần trước\nPhải mở tab khác để xem tuần trước mình nhập bao nhiêu.";
export const TEN_MAN_MAU = { vi: "Mục tiêu", en: "Objectives" } as const;
