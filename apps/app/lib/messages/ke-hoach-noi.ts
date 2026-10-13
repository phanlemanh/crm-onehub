import type { Locale } from "@crm/ui/lib/locale";

const en = {
	congTy: {
		tab: "First 30 days",
		cot: {
			keHoach: "Plan",
			ngay: "Day",
			buoc: "Steps",
			tacO: "Stuck at",
			camTrich: "Lead",
		},
		rongTieuDe: "No 30-day plan for this company yet",
		rongMoTa: "Create one from a template; the company is filled in.",
		tao: "Create plan",
		daDong: "Closed",
		khongKhuon: "Not from a template",
		batDau: "started {ngay}",
		loi: "Couldn't load plans",
	},
	caNhan: {
		tieuDe: "First 30 days",
		daDat: "reached {bac}",
		chuaDat: "no stage reached yet",
	},
	tasks: {
		keHoach: "30-day plan",
		sapHan: "Nothing overdue · {n} steps due soon",
		xongBuoc: "Mark {nhan} done",
	},
	chuyen: {
		menu: "Hand over 30-day work…",
		tieuDe: "Hand over {ten}'s 30-day work",
		coViec:
			"{ten} leads {keHoach} running plans and has {buoc} unfinished steps. Pick who takes all of it.",
		khongViec: "{ten} leads no running plan and has no unfinished step.",
		nguoiNhan: "Recipient",
		chon: "Pick a recipient",
		timNguoi: "Search people",
		khongAi: "No one matches",
		loiXemTruoc: "Couldn't count this person's work",
		thuLai: "Try again",
		dangTai: "Loading people…",
		xacNhan: "Hand over",
		huy: "Cancel",
		xong: "Handed {keHoach} plans and {buoc} steps to {ten}.",
		soViec: "{n} open work items also go to the recipient.",
		xongViec: "Plus {n} open work items.",
	},
	danhMuc: {
		nguoiGiao: "Assignee",
		chuaGiao: "Unassigned",
	},
};

type KeHoachNoiMessages = typeof en;

const vi: KeHoachNoiMessages = {
	congTy: {
		tab: "30 ngày đầu",
		cot: {
			keHoach: "Kế hoạch",
			ngay: "Ngày",
			buoc: "Bước",
			tacO: "Đang tắc ở",
			camTrich: "Cầm trịch",
		},
		rongTieuDe: "Chưa có kế hoạch 30 ngày cho công ty này",
		rongMoTa: "Tạo từ một khuôn; công ty đã điền sẵn.",
		tao: "Tạo kế hoạch",
		daDong: "Đã đóng",
		khongKhuon: "Không từ khuôn",
		batDau: "bắt đầu {ngay}",
		loi: "Không tải được kế hoạch",
	},
	caNhan: {
		tieuDe: "30 ngày đầu",
		daDat: "đã đạt {bac}",
		chuaDat: "chưa đạt bậc nào",
	},
	tasks: {
		keHoach: "Kế hoạch 30 ngày",
		sapHan: "Không có gì quá hạn · {n} bước sắp hạn",
		xongBuoc: "Đánh dấu xong {nhan}",
	},
	chuyen: {
		menu: "Chuyển việc 30 ngày…",
		tieuDe: "Chuyển việc 30 ngày của {ten}",
		coViec:
			"{ten} đang cầm trịch {keHoach} kế hoạch đang chạy và có {buoc} bước chưa xong. Chọn người nhận tất cả.",
		khongViec:
			"{ten} không cầm trịch kế hoạch nào đang chạy và không có bước nào chưa xong.",
		nguoiNhan: "Người nhận",
		chon: "Chọn người nhận",
		timNguoi: "Tìm người",
		khongAi: "Không có ai khớp",
		loiXemTruoc: "Không đếm được việc của người này",
		thuLai: "Thử lại",
		dangTai: "Đang tải danh sách người…",
		xacNhan: "Chuyển",
		huy: "Huỷ",
		xong: "Đã chuyển {keHoach} kế hoạch và {buoc} bước cho {ten}.",
		soViec: "Còn {n} việc đang mở, chuyển luôn cho người nhận.",
		xongViec: "Kèm {n} việc đang mở.",
	},
	danhMuc: {
		nguoiGiao: "Người được giao",
		chuaGiao: "Chưa giao",
	},
};

const BANG = { en, vi } satisfies Record<Locale, KeHoachNoiMessages>;

export function keHoachNoiMessages(locale: Locale): KeHoachNoiMessages {
	return BANG[locale];
}
