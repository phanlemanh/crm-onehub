import type { Locale } from "@crm/ui/lib/locale";
import type { LoaiDeXuat } from "@crm/validation/tai-lieu";

const vi = {
	lichSu: {
		nut: "Lịch sử",
		moTa: "Lịch sử phiên bản — mỗi lần chủ trang duyệt là một phiên bản",
		veTrang: "Về trang",
		motBan: "Trang mới có một phiên bản.",
		chuaCo: "Trang chưa có phiên bản nào được duyệt.",
		cot: {
			so: "Phiên bản",
			duyet: "Duyệt",
			deXuat: "Người đề xuất",
			trangThai: "Trạng thái",
		},
		phienBan: "Phiên bản {so}",
		dangDung: "Đang dùng",
		dongDuyet: "{ngay} · {ten}",
		dongNgan: "Duyệt {ngay} · {ten} đề xuất",
		loi: {
			tieuDe: "Không tải được lịch sử",
			moTa: "Máy chủ chưa trả về danh sách phiên bản của trang này.",
		},
	},
	banCu: {
		moTa: "Phiên bản {so} · duyệt {ngay} · {ten} duyệt",
		veLichSu: "Về lịch sử",
		kieuXem: "Cách xem phiên bản",
		soSanh: "So với bản đang dùng",
		toanVan: "Toàn văn",
		quayLai: "Quay lại phiên bản {so}",
		dangTao: "Đang tạo đề xuất…",
		loiTao: "Chưa tạo được đề xuất: {loi}",
		mayChu: "máy chủ không trả lời",
		laBanDangDung: "Đây là bản đang dùng.",
		daLuuTru:
			"Trang đã lưu trữ. Đề xuất khôi phục trang trước rồi mới quay lại phiên bản cũ được.",
		nhanThem: "Quay lại sẽ thêm",
		nhanBo: "Quay lại sẽ bỏ",
		nhanDaiSo: "Số và ngày sẽ đổi",
	},
	luuTru: {
		them: "Thêm việc với trang",
		deXuatLuuTru: "Đề xuất lưu trữ",
		daCoCho: "Đã có một đề xuất lưu trữ chờ chủ trang duyệt.",
		coLuuTruCho: "Có đề xuất lưu trữ chờ duyệt",
		dai: {
			tieuDe: "Trang đã lưu trữ ngày {ngay}",
			than: "Trang không còn hiện trong danh sách, tìm kiếm và Kara. Đề xuất khôi phục nếu trang cần dùng lại.",
			deXuatKhoiPhuc: "Đề xuất khôi phục",
			coKhoiPhucCho: "Có đề xuất khôi phục chờ duyệt",
		},
		hop: {
			LUU_TRU: {
				tieuDe: "Đề xuất lưu trữ trang",
				moTa: "Chủ trang duyệt thì trang rời danh sách, tìm kiếm và Kara. Lịch sử và nội dung vẫn giữ nguyên.",
				daGui: "Đã gửi đề xuất lưu trữ.",
			},
			KHOI_PHUC: {
				tieuDe: "Đề xuất khôi phục trang",
				moTa: "Chủ trang duyệt thì trang trở lại danh sách, tìm kiếm và Kara.",
				daGui: "Đã gửi đề xuất khôi phục.",
			},
			lyDo: "Lý do",
			lyDoMoTa: "Chủ trang đọc lý do này khi duyệt. Tối đa {max} ký tự.",
			lyDoDai: "Lý do dài quá {max} ký tự.",
			huy: "Huỷ",
			gui: "Gửi đề xuất",
			dangGui: "Đang gửi…",
			loi: "Chưa gửi được: {loi}",
			thuLai: "Thử lại",
			mayChu: "máy chủ không trả lời",
		},
		duyet: {
			LUU_TRU: {
				tieuDe: "Đề xuất lưu trữ trang",
				nut: "Duyệt lưu trữ",
				dangDuyet: "Đang lưu trữ…",
			},
			KHOI_PHUC: {
				tieuDe: "Đề xuất khôi phục trang",
				nut: "Duyệt khôi phục",
				dangDuyet: "Đang khôi phục…",
			},
			lyDo: "Lý do: {lyDo}",
			quayLai: "Quay lại phiên bản {so}",
		},
		danhSach: {
			nut: "Đã lưu trữ",
			cot: "Lưu trữ ngày",
			rong: {
				tieuDe: "Chưa có trang nào đã lưu trữ",
				than: "Trang được lưu trữ sau khi chủ trang duyệt đề xuất lưu trữ sẽ hiện ở đây.",
			},
		},
		loaiDeXuat: {
			NOI_DUNG: "Sửa nội dung",
			LUU_TRU: "Lưu trữ",
			KHOI_PHUC: "Khôi phục",
		} satisfies Record<LoaiDeXuat, string>,
	},
};

type TaiLieuLichSuMessages = typeof vi;

const en: TaiLieuLichSuMessages = {
	lichSu: {
		nut: "History",
		moTa: "Version history — every approval by the page owner is a version",
		veTrang: "Back to page",
		motBan: "This page has one version so far.",
		chuaCo: "No version of this page has been approved yet.",
		cot: {
			so: "Version",
			duyet: "Approved",
			deXuat: "Proposed by",
			trangThai: "Status",
		},
		phienBan: "Version {so}",
		dangDung: "In use",
		dongDuyet: "{ngay} · {ten}",
		dongNgan: "Approved {ngay} · proposed by {ten}",
		loi: {
			tieuDe: "Could not load history",
			moTa: "The server did not return this page's versions.",
		},
	},
	banCu: {
		moTa: "Version {so} · approved {ngay} by {ten}",
		veLichSu: "Back to history",
		kieuXem: "How to view this version",
		soSanh: "Compare with version in use",
		toanVan: "Full text",
		quayLai: "Go back to version {so}",
		dangTao: "Creating proposal…",
		loiTao: "Could not create the proposal: {loi}",
		mayChu: "the server did not respond",
		laBanDangDung: "This is the version in use.",
		daLuuTru:
			"This page is archived. Propose restoring it before going back to an old version.",
		nhanThem: "Going back adds",
		nhanBo: "Going back removes",
		nhanDaiSo: "Numbers and dates that change",
	},
	luuTru: {
		them: "More actions for this page",
		deXuatLuuTru: "Propose archiving",
		daCoCho: "An archive proposal is already waiting for the page owner.",
		coLuuTruCho: "Archive proposal waiting",
		dai: {
			tieuDe: "Page archived on {ngay}",
			than: "This page no longer shows in the list, search or Kara. Propose restoring it if it is needed again.",
			deXuatKhoiPhuc: "Propose restoring",
			coKhoiPhucCho: "Restore proposal waiting",
		},
		hop: {
			LUU_TRU: {
				tieuDe: "Propose archiving this page",
				moTa: "Once the page owner approves, the page leaves the list, search and Kara. History and content stay as they are.",
				daGui: "Archive proposal sent.",
			},
			KHOI_PHUC: {
				tieuDe: "Propose restoring this page",
				moTa: "Once the page owner approves, the page returns to the list, search and Kara.",
				daGui: "Restore proposal sent.",
			},
			lyDo: "Reason",
			lyDoMoTa:
				"The page owner reads this when deciding. Up to {max} characters.",
			lyDoDai: "The reason is longer than {max} characters.",
			huy: "Cancel",
			gui: "Send proposal",
			dangGui: "Sending…",
			loi: "Could not send: {loi}",
			thuLai: "Try again",
			mayChu: "the server did not respond",
		},
		duyet: {
			LUU_TRU: {
				tieuDe: "Proposal to archive this page",
				nut: "Approve archiving",
				dangDuyet: "Archiving…",
			},
			KHOI_PHUC: {
				tieuDe: "Proposal to restore this page",
				nut: "Approve restoring",
				dangDuyet: "Restoring…",
			},
			lyDo: "Reason: {lyDo}",
			quayLai: "Back to version {so}",
		},
		danhSach: {
			nut: "Archived",
			cot: "Archived on",
			rong: {
				tieuDe: "No archived pages yet",
				than: "Pages archived after the page owner approves an archive proposal show here.",
			},
		},
		loaiDeXuat: {
			NOI_DUNG: "Content edit",
			LUU_TRU: "Archive",
			KHOI_PHUC: "Restore",
		},
	},
};

export function taiLieuLichSuMessages(locale: Locale): TaiLieuLichSuMessages {
	return locale === "vi" ? vi : en;
}
