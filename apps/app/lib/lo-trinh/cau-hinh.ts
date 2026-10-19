import type { WorkspaceRole } from "@crm/validation/vai-workspace";

export const LO_TRINH = {
	tep: "LO-TRINH.html",
	nguonCrm: "crm",
	tenCrm: "CRM",
	nguonCrmMoTa: "phanlemanh/crm-onehub · onehub · LO-TRINH.html",
	nhipLamMoiMs: 60_000,
	coTrang: 25,
	tranTheCot: 8,
	ngayMs: 86_400_000,
	maNgan: 7,
	canhBaoThieuGioMay: "chưa có giờ máy và ngày dự kiến",
	canhBaoThieuMoHinh: "khối chưa mang mô hình hiển thị",
	vaiThaySoLieu: "owner" satisfies WorkspaceRole,
	canhBaoKhuonMoi: "mới hơn bộ đọc",
	timPr: (ma: string, kho?: string | null) =>
		`https://github.com/search?q=${encodeURIComponent(kho ? `${ma} repo:${kho}` : ma)}&type=pullrequests`,
} as const;
