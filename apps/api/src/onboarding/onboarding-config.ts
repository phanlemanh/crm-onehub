export const ONBOARDING = {
	plan: {
		defaultTargetDays: 30,
	},
	ingest: {
		maxItemsPerBatch: 500,
	},
	danhMuc: {
		pageSize: 25,
	},
	bangCot: {
		tranThe: 30,
	},
	viecCuaToi: {
		cuaSoNgay: 3,
		tran: 10,
	},
	thongDiep: {
		keHoachDaDong: "Kế hoạch đã đóng — mở lại trước khi sửa.",
		khongPhaiThanhVien: (id: string) =>
			`Người ${id} không phải thành viên đang hoạt động.`,
		vaiChiOkr: (ten: string) =>
			`${ten} mang vai «chỉ OKR» — không nhận được việc của kế hoạch đối tác.`,
		sapLaiSaiTap:
			"Danh sách sắp lại phải gồm đúng mọi bước của kế hoạch, mỗi bước một lần.",
		khongCoBuoc: (id: string) => `Không có bước nào mang mã ${id}.`,
		khongCoKeHoach: (id: string) => `Không có kế hoạch nào mang mã ${id}.`,
		canQuyenQuanTri: "Cần quyền quản trị để đổi cấu hình điều phối.",
		chuyenChoChinhMinh: "Người nhận phải khác người đang có việc.",
		daTrongPheu: "Người này đã có trong phễu.",
		chuaLuuTru: "Chỉ xoá vĩnh viễn được thứ đã lưu trữ.",
		daDung:
			"Đã được dùng nên không xoá vĩnh viễn được — lịch sử kế hoạch còn trỏ tới.",
		khuonDaLuuTru: (ten: string) =>
			`Khuôn ${ten} đã lưu trữ — khôi phục trước khi tạo kế hoạch.`,
		boPhanDaLuuTru: (ten: string[]) =>
			`Phòng ban ${ten.join(", ")} đã lưu trữ — khôi phục hoặc chọn phòng ban khác.`,
	},
} as const;

export const MA_NEN_TANG = {
	key: "ma_moi_gioi_nen_tang",
	label: "Mã môi giới trên nền tảng",
} as const;
