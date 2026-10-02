import { TO_CHUC_TRAN } from "@crm/validation/to-chuc";

const HE_SO_NFD = 3;

export const TO_CHUC = {
	ten: { toiDa: 80 },
	moTa: { toiDa: TO_CHUC_TRAN.moTa },
	chucDanh: { toiDa: TO_CHUC_TRAN.chucDanh },
	vao: {
		moTaToiDa: TO_CHUC_TRAN.moTa * HE_SO_NFD,
		chucDanhToiDa: TO_CHUC_TRAN.chucDanh * HE_SO_NFD,
	},
	lo: { toiDa: 50 },
	nhap: {
		toiDaDong: 1000,
		toiDaKyTu: 200_000,
		tenCotEmail: ["email", "e-mail", "dia chi email", "email address"],
	},
	thongDiep: {
		canQuyenQuanTri: "Cần quyền quản trị để sửa cây tổ chức.",
		tenTrong: "Tên không được để trống.",
		tenDai: (n: number) => `Tên dài quá ${n} ký tự.`,
		moTaDai: (n: number) => `Mô tả dài quá ${n} ký tự.`,
		chucDanhDai: (n: number) => `Chức danh dài quá ${n} ký tự.`,
		tenTrung: (ten: string) => `Đã có «${ten}» ở cấp này.`,
		khongCoBoPhan: (id: string) => `Không có bộ phận nào mang mã ${id}.`,
		khongCoPhongBan: (id: string) => `Không có phòng ban nào mang mã ${id}.`,
		boPhanDaLuuTru: "Bộ phận này đã lưu trữ — khôi phục trước.",
		phongBanDaLuuTru: "Phòng ban này đã lưu trữ — khôi phục trước.",
		boPhanConPhongBan: (n: number) =>
			`Bộ phận còn ${n} phòng ban — chuyển hoặc lưu trữ chúng trước.`,
		phongBanConNguoi: (n: number) =>
			`Còn ${n} người có phòng ban chính ở đây — chuyển họ trước.`,
		chuaLuuTru: "Chỉ xoá hẳn được đơn vị đã lưu trữ.",
		boPhanConTro: "Bộ phận còn phòng ban trỏ tới nên không xoá hẳn được.",
		phongBanConNguoiXoa: "Phòng ban còn người trỏ tới nên không xoá hẳn được.",
		phongBanConBuoc:
			"Phòng ban còn bước kế hoạch trỏ tới nên không xoá hẳn được.",
		phongBanTrongKhuon: (khuon: readonly string[]) =>
			`Phòng ban này còn nằm trong khuôn ${khuon.join(", ")} — sửa khuôn trước.`,
		phongBanConTrongKhuon: (khuon: readonly string[]) =>
			`Phòng ban này còn nằm trong khuôn ${khuon.join(", ")} — xoá vĩnh viễn khuôn đó hoặc bỏ phòng ban khỏi khuôn trước.`,
		phongBanConOkrMo: (n: number) =>
			`Phòng ban còn ${n} mục tiêu OKR ở chu kỳ chưa đóng — chuyển OKR sang phòng ban khác hoặc bỏ mục tiêu rồi mới lưu trữ.`,
		boPhanConOkrMo: (n: number) =>
			`Bộ phận còn ${n} mục tiêu OKR ở chu kỳ chưa đóng — chuyển OKR sang bộ phận khác hoặc bỏ mục tiêu rồi mới lưu trữ.`,
		phongBanConOkrXoa: (n: number) =>
			`Phòng ban còn ${n} mục tiêu OKR trỏ tới, kể cả chu kỳ đã đóng — không xoá hẳn được, chỉ giữ ở lưu trữ.`,
		boPhanConOkrXoa: (n: number) =>
			`Bộ phận còn ${n} mục tiêu OKR trỏ tới, kể cả chu kỳ đã đóng — không xoá hẳn được, chỉ giữ ở lưu trữ.`,
		khongPhaiThanhVien: (id: string) =>
			`Người ${id} không phải thành viên đang hoạt động.`,
		truongNgoaiPhongBan: "Trưởng phòng ban phải là người của phòng ban đó.",
		phuTrungChinh: "Phòng ban phụ không được trùng phòng ban chính.",
		thuTuBoPhanLech:
			"Danh sách bộ phận đã đổi trong lúc sắp — tải lại rồi sắp lại.",
		quanLyLaChinhMinh: "Quản lý trực tiếp phải là người khác.",
		loQuaDai: (n: number) => `Lô có quá ${n} dòng — chia nhỏ rồi nhập lại.`,
		loRong: "Không có dòng nào để nhập.",
		khongDongHopLe: "Không có dòng hợp lệ nào để ghi.",
		nhap: {
			emailKhongPhaiThanhVien: "Email này chưa là thành viên OneHub Center",
			emailLap: "Email này xuất hiện nhiều lần trong lô",
			thieuEmail: "Thiếu email",
			thieuPhongBan: "Thiếu phòng ban",
			thieuBoPhanTruong:
				"Trưởng bộ phận cần cột bộ phận, hoặc phòng ban đã thuộc một bộ phận",
			phongBanBoPhanKhac: (pb: string, bp: string) =>
				`Phòng ban «${pb}» đang thuộc bộ phận «${bp}»`,
			phongBanHaiBoPhan: (pb: string) =>
				`Phòng ban «${pb}» mang hai bộ phận khác nhau trong lô`,
			truongLa: "Cột trưởng chỉ nhận «phòng ban», «bộ phận» hoặc để trống",
			haiTruong: (don: string) => `Hai người cùng làm trưởng «${don}» trong lô`,
		},
	},
} as const;
