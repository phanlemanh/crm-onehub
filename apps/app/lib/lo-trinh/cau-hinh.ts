import type { WorkspaceRole } from "@crm/validation/vai-workspace";

export const LO_TRINH = {
	tep: "LO-TRINH.html",
	nguonCrm: "crm",
	nhipLamMoiMs: 60_000,
	coTrang: 25,
	tranTheCot: 8,
	ngayMs: 86_400_000,
	maNgan: 7,
	canhBaoThieuGioMay: "chưa có giờ máy và ngày dự kiến",
	vaiThaySoLieu: "owner" satisfies WorkspaceRole,
	timPr: (ma: string) =>
		`https://github.com/search?q=${encodeURIComponent(ma)}&type=pullrequests`,
} as const;
