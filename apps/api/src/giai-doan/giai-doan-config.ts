export const GIAI_DOAN_API = {
	messages: {
		forbidden: "Only an owner or an admin can change deal stages.",
		trung: "A stage with that name already exists.",
		tran: "There can be at most 20 stages — remove one first.",
		cuoiCung: "Keep at least one stage of each kind.",
		conThoaThuan: "This stage still has deals — choose where to move them.",
		dichSai: "Move the deals to another live stage of the same kind.",
		khongCo: "That stage no longer exists.",
		danhSachLech: "The order must list every stage of that kind exactly once.",
	},
} as const;
