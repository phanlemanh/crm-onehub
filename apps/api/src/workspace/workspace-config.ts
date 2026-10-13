export const WORKSPACE_CONFIG = {
	staffDomains: {
		max: 20,
	},
	messages: {
		alreadyAMember:
			"That person is already a member. Change their role in the members table.",
		staffDomainsForbidden:
			"Only an owner or an admin can change the staff email domains.",
		staffDomainsTooMany: (max: number) => `Enter at most ${max} domains.`,
		staffDomainIsAddress: (entry: string) =>
			`${entry} is an email address. Enter only the part after @.`,
		staffDomainInvalid: (entry: string) =>
			`${entry} is not a domain. Enter one like onehub.vn.`,
		staffDomainPublic: (entry: string) =>
			`${entry} is a public mail domain, not one of ours. Remove it and save again.`,
		conViecKeHoach: (keHoach: number, buoc: number) =>
			`Người này còn cầm trịch ${keHoach} kế hoạch và làm ${buoc} bước đang mở. Chuyển việc ở màn Thành viên trước, rồi mới đổi sang vai «chỉ OKR».`,
		conViec: (keHoach: number, buoc: number, viec: number) => {
			const huongDan =
				"Chuyển việc ở màn Thành viên trước, rồi mới đổi sang vai «chỉ OKR».";
			if (viec === 0) {
				return `Người này còn cầm trịch ${keHoach} kế hoạch và làm ${buoc} bước đang mở. ${huongDan}`;
			}
			const phan = [
				keHoach > 0 ? `cầm trịch ${keHoach} kế hoạch` : null,
				buoc > 0 ? `làm ${buoc} bước` : null,
				`giữ ${viec} việc đang mở`,
			].filter((p): p is string => p !== null);
			const cuoi = phan.at(-1);
			const dau = phan.slice(0, -1);
			const noi = dau.length > 0 ? `${dau.join(", ")} và ${cuoi}` : cuoi;
			return `Người này còn ${noi}. ${huongDan}`;
		},
	},
} as const;
