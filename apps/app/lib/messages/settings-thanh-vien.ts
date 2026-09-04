import type { Locale } from "@crm/ui/lib/locale";

const en = {
	trang: {
		tieuDeTab: "Members",
		tieuDe: "Members",
		moTa: "Everyone who has access to your CRM.",
	},
	vaiTro: {
		owner: "Owner",
		admin: "Admin",
		member: "Member",
	},
	bang: {
		ten: "Name",
		ban: "You",
		email: "Email",
		vaiTro: "Role",
		thamGia: "Joined",
		thamGiaDayDu: "Joined date",
		hanhDong: "Actions",
		doiVaiTro: (ten: string) => `Change ${ten}'s role`,
		daDoi: "Role changed.",
		tim: "Search by name or email…",
		trong: "Nobody matches this view.",
	},
};

export type ThanhVienMessages = typeof en;

const vi = {
	trang: {
		tieuDeTab: "Thành viên",
		tieuDe: "Thành viên",
		moTa: "Những người vào được CRM của bạn.",
	},
	vaiTro: {
		owner: "Chủ sở hữu",
		admin: "Quản trị",
		member: "Thành viên",
	},
	bang: {
		ten: "Tên",
		ban: "Bạn",
		email: "Địa chỉ email",
		vaiTro: "Vai trò",
		thamGia: "Ngày vào",
		thamGiaDayDu: "Ngày tham gia",
		hanhDong: "Hành động",
		doiVaiTro: (ten: string) => `Đổi vai trò của ${ten}`,
		daDoi: "Đã đổi vai trò.",
		tim: "Tìm theo tên hoặc email…",
		trong: "Không ai khớp với bộ lọc này.",
	},
} satisfies ThanhVienMessages;

const BANG = { en, vi } satisfies Record<Locale, ThanhVienMessages>;

export function thanhVienMessages(locale: Locale): ThanhVienMessages {
	return BANG[locale];
}
