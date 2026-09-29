import type { Locale } from "@crm/ui/lib/locale";
import type { LyDoMoCoi } from "@crm/validation/okr-hien-thi";

const vi = {
	chuongTrinh: {
		duyetCongBo: "Công bố cần duyệt",
		duyetCongBoMoTa:
			"Mục tiêu phải được duyệt trước khi công bố: trưởng bộ phận duyệt mục tiêu phòng ban, quản trị duyệt mục tiêu bộ phận, trưởng phòng ban duyệt mục tiêu cá nhân. Mục tiêu cấp công ty không qua duyệt.",
	},
	toChuc: {
		okrMo: (n: number) => `OKR: ${n} mục tiêu ở kỳ đang mở`,
		okrMoMoTa: {
			"phong-ban":
				"Chuyển sang phòng ban khác trước khi lưu trữ, gộp hay tách phòng ban.",
			"bo-phan":
				"Chuyển sang bộ phận khác trước khi lưu trữ, gộp hay tách bộ phận.",
		},
		chuyenOkr: "Chuyển OKR…",
		chan: {
			tieuDe: "Lưu trữ «{ten}»?",
			moTa: {
				"phong-ban":
					"Phòng ban lưu trữ rời khỏi cây; người trong đó giữ tài khoản.",
				"bo-phan":
					"Bộ phận lưu trữ rời khỏi cây; phòng ban trong đó thành chưa xếp.",
			},
			canhBao: "Chưa lưu trữ được",
			lyDo: {
				"phong-ban": (n: number) =>
					`Phòng ban còn ${n} mục tiêu ở kỳ đang mở — chuyển OKR hoặc bỏ mục tiêu trước khi lưu trữ.`,
				"bo-phan": (n: number) =>
					`Bộ phận còn ${n} mục tiêu ở kỳ đang mở — chuyển OKR hoặc bỏ mục tiêu trước khi lưu trữ.`,
			},
			huy: "Huỷ",
			luuTru: "Lưu trữ",
		},
	},
	chuyen: {
		tieuDe: "Chuyển OKR",
		moTa: "Từ «{ten}». Mục tiêu giữ KR, cập nhật tuần, căn chỉnh, người xem và vết.",
		denDonVi: "Chuyển sang",
		chon: {
			"phong-ban": "Chọn phòng ban…",
			"bo-phan": "Chọn bộ phận…",
		},
		tim: {
			"phong-ban": "Tìm phòng ban…",
			"bo-phan": "Tìm bộ phận…",
		},
		khongKhop: "Không có đơn vị nào khớp",
		denMoTa: {
			"phong-ban":
				"Chỉ phòng ban còn hoạt động. Quyền sửa theo trưởng của phòng ban nhận.",
			"bo-phan":
				"Chỉ bộ phận còn hoạt động. Quyền sửa theo trưởng của bộ phận nhận.",
		},
		chuaXep: "Chưa xếp vào bộ phận",
		danhSach: (n: number) => `Mục tiêu ở kỳ đang mở (${n})`,
		dongMoTa: (soKr: number, trangThai: string, nguoi: string) =>
			`${soKr} KR · ${trangThai} · ${nguoi}`,
		quaTran: (toiDa: number) =>
			`Mỗi lần chuyển tối đa ${toiDa} mục tiêu — bỏ chọn bớt rồi chuyển.`,
		dangTai: "Đang tải mục tiêu…",
		rong: {
			tieuDe: "Không còn mục tiêu ở kỳ đang mở",
			moTa: "Đơn vị này không còn OKR nào cần chuyển.",
		},
		loiTai: {
			tieuDe: "Không tải được danh sách mục tiêu",
			moTa: "Chưa có gì bị chuyển — thử lại sau ít phút.",
			thuLai: "Thử lại",
		},
		loiChuyen: "Không mục tiêu nào được chuyển",
		huy: "Huỷ",
		nut: (n: number) => `Chuyển ${n} mục tiêu`,
		xong: (n: number, ten: string) => `Đã chuyển ${n} mục tiêu sang ${ten}.`,
	},
	moCoi: {
		tieuDe: "OKR mồ côi",
		moTa: "Mục tiêu ở kỳ đang mở mà không ai trả lời được: đơn vị đã lưu trữ, không ai sửa được, hoặc người phụ trách đã rời. Chỉ quản trị thấy khối này.",
		lyDo: {
			"don-vi-luu-tru": "Đơn vị đã lưu trữ",
			"khong-ai-sua": "Không ai sửa được",
			"phu-trach-roi": "Người phụ trách đã rời",
			"kr-phu-trach-roi": "Người phụ trách KR đã rời",
		} satisfies Record<LyDoMoCoi, string>,
		cap: {
			onehub: "Công ty",
			"bo-phan": "Bộ phận",
			"phong-ban": "Phòng ban",
			"ca-nhan": "Cá nhân",
		},
		hanhDong: {
			chuyen: "Chuyển OKR…",
			datTruong: "Đặt trưởng",
			nguoiRoi: "Chuyển OKR của người rời",
		},
		dangTai: "Đang tải OKR mồ côi…",
		rong: {
			tieuDe: "Không có OKR mồ côi",
			moTa: "Mọi mục tiêu ở kỳ đang mở đều có đơn vị còn hoạt động và người trả lời.",
		},
		loi: {
			tieuDe: "Không tải được danh sách",
			moTa: "Mạng hoặc máy chủ đang lỗi. Số khác của sức khoẻ vẫn xem được.",
			thuLai: "Thử lại",
		},
	},
};

type OkrTaiCoCauMessages = typeof vi;

const en: OkrTaiCoCauMessages = {
	chuongTrinh: {
		duyetCongBo: "Publishing needs approval",
		duyetCongBoMoTa:
			"Objectives must be approved before they are published: division heads approve department objectives, admins approve division objectives, department heads approve personal objectives. Company objectives skip approval.",
	},
	toChuc: {
		okrMo: (n: number) =>
			`OKR: ${n} ${n === 1 ? "objective" : "objectives"} in an open cycle`,
		okrMoMoTa: {
			"phong-ban":
				"Move them to another department before archiving, merging or splitting this one.",
			"bo-phan":
				"Move them to another division before archiving, merging or splitting this one.",
		},
		chuyenOkr: "Move OKRs…",
		chan: {
			tieuDe: "Archive “{ten}”?",
			moTa: {
				"phong-ban":
					"An archived department leaves the tree; its people keep their accounts.",
				"bo-phan":
					"An archived division leaves the tree; its departments become unassigned.",
			},
			canhBao: "Can't archive yet",
			lyDo: {
				"phong-ban": (n: number) =>
					`This department still has ${n} ${n === 1 ? "objective" : "objectives"} in an open cycle — move the OKRs or drop the objectives before archiving.`,
				"bo-phan": (n: number) =>
					`This division still has ${n} ${n === 1 ? "objective" : "objectives"} in an open cycle — move the OKRs or drop the objectives before archiving.`,
			},
			huy: "Cancel",
			luuTru: "Archive",
		},
	},
	chuyen: {
		tieuDe: "Move OKRs",
		moTa: "From “{ten}”. Objectives keep their key results, weekly updates, alignments, viewers and history.",
		denDonVi: "Move to",
		chon: {
			"phong-ban": "Choose a department…",
			"bo-phan": "Choose a division…",
		},
		tim: {
			"phong-ban": "Search departments…",
			"bo-phan": "Search divisions…",
		},
		khongKhop: "No unit matches",
		denMoTa: {
			"phong-ban":
				"Active departments only. Editing follows the receiving department's head.",
			"bo-phan":
				"Active divisions only. Editing follows the receiving division's head.",
		},
		chuaXep: "Not in a division",
		danhSach: (n: number) => `Objectives in an open cycle (${n})`,
		dongMoTa: (soKr: number, trangThai: string, nguoi: string) =>
			`${soKr} ${soKr === 1 ? "key result" : "key results"} · ${trangThai} · ${nguoi}`,
		quaTran: (toiDa: number) =>
			`You can move up to ${toiDa} objectives at a time — untick some and try again.`,
		dangTai: "Loading objectives…",
		rong: {
			tieuDe: "No objectives in an open cycle",
			moTa: "This unit has no OKRs left to move.",
		},
		loiTai: {
			tieuDe: "Couldn't load the objectives",
			moTa: "Nothing has been moved — try again in a few minutes.",
			thuLai: "Try again",
		},
		loiChuyen: "No objectives were moved",
		huy: "Cancel",
		nut: (n: number) => `Move ${n} ${n === 1 ? "objective" : "objectives"}`,
		xong: (n: number, ten: string) =>
			`Moved ${n} ${n === 1 ? "objective" : "objectives"} to ${ten}.`,
	},
	moCoi: {
		tieuDe: "Orphaned OKRs",
		moTa: "Objectives in an open cycle that nobody can answer for: the unit is archived, nobody can edit them, or the owner has left. Only admins see this block.",
		lyDo: {
			"don-vi-luu-tru": "Unit archived",
			"khong-ai-sua": "Nobody can edit",
			"phu-trach-roi": "Owner has left",
			"kr-phu-trach-roi": "Key result owner has left",
		},
		cap: {
			onehub: "Company",
			"bo-phan": "Division",
			"phong-ban": "Department",
			"ca-nhan": "Personal",
		},
		hanhDong: {
			chuyen: "Move OKRs…",
			datTruong: "Set a head",
			nguoiRoi: "Hand over a leaver's OKRs",
		},
		dangTai: "Loading orphaned OKRs…",
		rong: {
			tieuDe: "No orphaned OKRs",
			moTa: "Every objective in an open cycle has an active unit and someone to answer for it.",
		},
		loi: {
			tieuDe: "Couldn't load the list",
			moTa: "The network or server is failing. The other health figures still work.",
			thuLai: "Try again",
		},
	},
};

export function okrTaiCoCauMessages(locale: Locale): OkrTaiCoCauMessages {
	return locale === "vi" ? vi : en;
}
