import type { Locale } from "@crm/ui/lib/locale";
import type { TrangThaiLay } from "@crm/validation/san-pham-lo-trinh";

const en = {
	trangThai: {
		"chua-lay": "Waiting for the first fetch",
		"da-lay": "Fetched",
		"chua-cau-hinh": "The server has no GitHub app",
		"chua-cai": "The GitHub app is not installed on this repository",
		"khong-thay-kho": "Repository or branch not found",
		"khong-thay-tep": "No roadmap file on this branch",
		"khoi-hong": "The file has no readable roadmap block",
		"qua-tran": "The file is larger than 2 MB",
		"loi-github": "GitHub did not answer — retrying next round",
	} satisfies Record<TrangThaiLay, string>,
	trang: {
		tieuDe: "Products",
		moTa: "The GitHub repository the Roadmap page reads for each product.",
		them: "Add product",
		khongQuyen: "Only owners and admins can add products.",
	},
	the: {
		tieuDe: "Products on the Roadmap page",
		moTa: "CRM is declared in code. Other products are fetched through a read-only GitHub app every 5 minutes.",
		khaiTrongMa: "declared in code",
		khuon: (n: number) => `format ${n}`,
		layLuc: (gio: string) => `fetched ${gio}`,
		thaoTac: (ten: string) => `Actions for ${ten}`,
		sua: "Edit",
		nguoiXem: "Who can see",
		luuTru: "Archive",
		xoa: "Delete",
		rongTieuDe: "No other products yet",
		rongMoTa:
			"Add a GitHub repository with the read-only app installed to read its roadmap here.",
		loiTai: "Products could not be loaded.",
	},
	daLuuTru: {
		nhan: "Archived",
		khoiPhuc: "Restore",
		xoaVinhVien: "Delete permanently",
	},
	bao: {
		daTao: (ten: string) => `${ten} added — it is fetched within 5 minutes.`,
		daLuu: "Saved.",
		daLuuTru: (ten: string) => `${ten} archived.`,
		hoanTac: "Undo",
		daKhoiPhuc: (ten: string) => `${ten} restored.`,
		daXoa: (ten: string) => `${ten} deleted.`,
	},
	hoiXoa: {
		tieuDe: (ten: string) => `Delete ${ten}?`,
		moTa: "It has never been fetched, so nobody has read its roadmap. This cannot be undone.",
		nut: "Delete",
	},
	hoiXoaVinhVien: {
		tieuDe: (ten: string) => `Delete ${ten} permanently?`,
		moTa: "Its fetched roadmap and the list of who can see it are deleted with it. This cannot be undone.",
		nut: "Delete permanently",
	},
	sheet: {
		themTieuDe: "Add product",
		suaTieuDe: (ten: string) => `Edit ${ten}`,
		moTa: "The Roadmap page reads this file at the head of the branch every 5 minutes.",
		ten: "Name",
		kho: "GitHub repository",
		khoMoTa: "owner/repo, for example phanlemanh/acceptance-gate-kit.",
		nhanh: "Branch",
		tep: "File path",
		loi: {
			ten: "Give the product a name of 1–60 characters.",
			kho: "Write the repository as owner/repo.",
			nhanh: "Write a branch name without spaces.",
			duongTep:
				"Write a path inside the repository, without «..» and not starting with /.",
		},
		huy: "Cancel",
		luu: "Save",
	},
	nguoiXem: {
		tieuDe: (ten: string) => `Who can see ${ten}`,
		moTa: "Owners and admins always see every product.",
		luonThay: "always",
		vai: {
			owner: "Owner",
			admin: "Admin",
			member: "Member",
			okr: "OKR only",
		},
	},
};

export type SanPhamMessages = typeof en;

const vi: SanPhamMessages = {
	trangThai: {
		"chua-lay": "Đang chờ lấy",
		"da-lay": "Đã lấy",
		"chua-cau-hinh": "Máy chủ chưa có ứng dụng GitHub",
		"chua-cai": "Ứng dụng GitHub chưa cài vào kho này",
		"khong-thay-kho": "Không thấy kho hay nhánh",
		"khong-thay-tep": "Không thấy tệp lộ trình ở nhánh này",
		"khoi-hong": "Tệp không mang khối lộ trình đọc được",
		"qua-tran": "Tệp lớn hơn 2 MB",
		"loi-github": "GitHub chưa trả lời — thử lại ở nhịp sau",
	},
	trang: {
		tieuDe: "Sản phẩm",
		moTa: "Kho GitHub mà trang Lộ trình đọc cho từng sản phẩm.",
		them: "Thêm sản phẩm",
		khongQuyen: "Chỉ chủ và quản trị khai được sản phẩm.",
	},
	the: {
		tieuDe: "Sản phẩm trên trang Lộ trình",
		moTa: "CRM khai trong mã. Sản phẩm khác lấy lộ trình qua ứng dụng GitHub chỉ đọc, mỗi 5 phút.",
		khaiTrongMa: "khai trong mã",
		khuon: (n: number) => `khuôn bản ${n}`,
		layLuc: (gio: string) => `lấy lúc ${gio}`,
		thaoTac: (ten: string) => `Thao tác với ${ten}`,
		sua: "Sửa",
		nguoiXem: "Người xem",
		luuTru: "Lưu trữ",
		xoa: "Xoá",
		rongTieuDe: "Chưa có sản phẩm nào khác",
		rongMoTa:
			"Thêm một kho GitHub đã cài ứng dụng chỉ đọc để đọc lộ trình của nó ở đây.",
		loiTai: "Không tải được danh sách sản phẩm.",
	},
	daLuuTru: {
		nhan: "Đã lưu trữ",
		khoiPhuc: "Khôi phục",
		xoaVinhVien: "Xoá vĩnh viễn",
	},
	bao: {
		daTao: (ten: string) =>
			`Đã thêm ${ten} — lộ trình được lấy trong vòng 5 phút.`,
		daLuu: "Đã lưu.",
		daLuuTru: (ten: string) => `Đã lưu trữ ${ten}.`,
		hoanTac: "Hoàn tác",
		daKhoiPhuc: (ten: string) => `Đã khôi phục ${ten}.`,
		daXoa: (ten: string) => `Đã xoá ${ten}.`,
	},
	hoiXoa: {
		tieuDe: (ten: string) => `Xoá ${ten}?`,
		moTa: "Sản phẩm chưa từng được lấy, nên chưa ai đọc lộ trình của nó. Không hoàn tác được.",
		nut: "Xoá",
	},
	hoiXoaVinhVien: {
		tieuDe: (ten: string) => `Xoá vĩnh viễn ${ten}?`,
		moTa: "Lộ trình đã lấy và danh sách người xem mất theo. Không hoàn tác được.",
		nut: "Xoá vĩnh viễn",
	},
	sheet: {
		themTieuDe: "Thêm sản phẩm",
		suaTieuDe: (ten: string) => `Sửa ${ten}`,
		moTa: "Trang Lộ trình đọc tệp này ở đầu nhánh, mỗi 5 phút.",
		ten: "Tên",
		kho: "Kho trên GitHub",
		khoMoTa: "Dạng chủ/kho, ví dụ phanlemanh/acceptance-gate-kit.",
		nhanh: "Nhánh",
		tep: "Đường tệp",
		loi: {
			ten: "Đặt tên sản phẩm dài 1–60 ký tự.",
			kho: "Viết kho theo dạng chủ/kho.",
			nhanh: "Viết tên nhánh, không có khoảng trắng.",
			duongTep:
				"Viết đường tệp trong kho, không chứa «..» và không bắt đầu bằng /.",
		},
		huy: "Huỷ",
		luu: "Lưu",
	},
	nguoiXem: {
		tieuDe: (ten: string) => `Người xem ${ten}`,
		moTa: "Chủ và quản trị luôn thấy mọi sản phẩm.",
		luonThay: "luôn thấy",
		vai: {
			owner: "Chủ",
			admin: "Quản trị",
			member: "Thành viên",
			okr: "Chỉ OKR",
		},
	},
};

export function sanPhamMessages(locale: Locale): SanPhamMessages {
	return locale === "vi" ? vi : en;
}
