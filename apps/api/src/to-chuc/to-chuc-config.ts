export const TO_CHUC = {
	ten: { toiDa: 80 },
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
			emailKhongPhaiThanhVien: "Email này chưa là thành viên CRM",
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
