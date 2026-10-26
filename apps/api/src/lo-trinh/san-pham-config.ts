export const SAN_PHAM_API = {
	messages: {
		forbidden: "Only an owner or an admin can change products.",
		khongCo: "That product no longer exists.",
		maRong: "Name: give the product a name with at least one letter or digit.",
		maCrm: "Name: CRM is already on the roadmap page — pick another name.",
		maTrung: "Name: another product already uses this name.",
		coLichSu:
			"This product has been read before — archive it instead of deleting it.",
		chuaLuuTru: "Only an archived product can be restored or deleted for good.",
		khongPhaiThanhVien: "Everyone you pick must be a member of this workspace.",
	},
} as const;
