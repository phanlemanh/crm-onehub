const DAY_MS = 24 * 60 * 60 * 1000;

export const ONBOARDING = {
	plan: {
		defaultTargetDays: 30,
	},
	stale: {
		warnAfterMs: 7 * DAY_MS,
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
	thongDiep: {
		canQuyenQuanTri: "Cần quyền quản trị để đổi cấu hình điều phối.",
		daTrongPheu: "Người này đã có trong phễu.",
		chuaLuuTru: "Chỉ xoá vĩnh viễn được thứ đã lưu trữ.",
		daDung:
			"Đã được dùng nên không xoá vĩnh viễn được — lịch sử kế hoạch còn trỏ tới.",
		khuonDaLuuTru: (ten: string) =>
			`Khuôn ${ten} đã lưu trữ — khôi phục trước khi tạo kế hoạch.`,
		boPhanTrongKhuon: (khuon: string[]) =>
			`Bộ phận này còn nằm trong khuôn ${khuon.join(", ")} — sửa khuôn trước.`,
		boPhanDaLuuTru: (ten: string[]) =>
			`Bộ phận ${ten.join(", ")} đã lưu trữ — khôi phục hoặc chọn bộ phận khác.`,
	},
} as const;

export const MA_NEN_TANG = {
	key: "ma_moi_gioi_nen_tang",
	label: "Mã môi giới trên nền tảng",
} as const;
