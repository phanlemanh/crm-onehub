import { type DangCho, TAI_LIEU } from "@crm/validation/tai-lieu";
import type { TrangThaiNguon } from "@crm/validation/tai-lieu-nguon";

const HE_SO_NFD = 3;
const PHUT_MS = 60_000;

const soVi = (n: number) => new Intl.NumberFormat("vi-VN").format(n);

export const TAI_LIEU_API = {
	vao: {
		tenToiDa: TAI_LIEU.ten.max * HE_SO_NFD,
		noiDungToiDa: TAI_LIEU.noiDung.max * HE_SO_NFD,
		lyDoToiDa: TAI_LIEU.lyDo.max * HE_SO_NFD,
		ma: 120,
	},
	deXuat: { coTrang: TAI_LIEU.danhSach.coTrang },
	dangDung: { toiDa: 500 },
	nhanNguon: { khoa: "kho-tai-lieu:nhan-nguon", timeoutMs: 2 * PHUT_MS },
	phieuNguon: { tienTo: "kho-tai-lieu:phieu-nguon", hanMs: 60 * PHUT_MS },
	khoaSlug: "tai-lieu-slug",
	khoaHoi: "tai-lieu-hoi:",
	gioXacMinh: "12:00:00+07:00",
	suKienCu: "ban-goc-da-doi",
	thongDiep: {
		khongCo: "Không tìm thấy trang hay bản đề xuất này.",
		tenTrong: "Nhập tên trang.",
		tenDai: (n: number) => `Tên trang dài quá ${n} ký tự.`,
		tenKhongChu: "Tên trang cần có ít nhất một chữ hoặc số.",
		noiDungDai: (n: number) => `Nội dung trang dài quá ${n} ký tự.`,
		chienLuocQuaTran: (tran: number, so: number) =>
			`Trang chiến lược tối đa ${soVi(tran)} ký tự (đang ${soVi(so)})`,
		lyDoTrong: "Nhập lý do trả lại.",
		lyDoDai: (n: number) => `Lý do trả lại dài quá ${n} ký tự.`,
		chuaDoi: "Chưa có thay đổi so với bản đang dùng.",
		donViKhongCo: "Không tìm thấy đơn vị này.",
		chuTrangKhongCo: "Chủ trang phải là thành viên của workspace.",
		khongDuocDuyet: "Chỉ chủ trang hoặc quản trị duyệt được bản đề xuất này.",
		cu: "Bản đề xuất này đã cũ: bản đang dùng đã đổi sau khi nó được tạo.",
		daDoi:
			"Nội dung so sánh đã đổi từ lúc mở màn duyệt. Tải lại rồi duyệt lại.",
		daXuLy: "Bản đề xuất này đã được xử lý.",
		chuaDoiChieu:
			"Chưa đối chiếu hết con số với nguồn. Đánh dấu từng con số rồi mới duyệt được.",
		cauHoiNgan: "Câu hỏi cần ít nhất 2 ký tự.",
		cauHoiDai: (n: number) => `Câu hỏi dài quá ${n} ký tự.`,
		ghiChuDai: (n: number) => `Ghi chú dài quá ${n} ký tự.`,
		baoSaiChiTraLoi: "Chỉ báo sai được câu trợ lý AI đã trả lời.",
		khongDuocXuLy: "Chỉ chủ trang liên quan hoặc quản trị xử lý được việc này.",
		khongDuocDatXacMinh:
			"Chỉ chủ trang hoặc quản trị đặt được hạn xác minh của trang này.",
	},
} as const;

export const NGUON_CHO = {
	CHO_DOC: "may-soan",
	CHO_SOAN: "may-soan",
	DANG_SOAN: "may-soan",
	DA_SOAN: null,
	CAN_GO_TAY: "go-tay",
	LOI: "loi",
} as const satisfies Record<TrangThaiNguon, DangCho | null>;
