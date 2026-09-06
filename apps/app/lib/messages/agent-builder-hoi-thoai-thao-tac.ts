import type { Locale } from "@crm/ui/lib/locale";

const en = {
	xoa: {
		daXoa: "Chat deleted.",
		xoaMot: (ten: string) => `Delete ${ten}`,
		xoaHoi: (ten: string) => `Delete ${ten}?`,
		themThaoTac: "More chat actions",
		xoaHoiThoai: "Delete chat",
		xoa: "Delete",
		xoaMoTa:
			"This permanently deletes the chat, its messages, attachments, and shared link. Any agent created from it stays available.",
		huy: "Cancel",
		dangXoa: "Deleting",
		daXong: "Deleted",
		thuLai: "Try again",
	},
	chiaSe: {
		daHuyLink: "Chat link revoked.",
		daChep: "Chat link copied.",
		tieuDe: "Share chat",
		dong: "Close",
		dangTai: "Loading sharing status…",
		taiHong: "Sharing status could not be loaded.",
		thuLai: "Try again",
		chiMinhBan: "Only you",
		aiCoLink: "Anyone in OneHub with the link",
		chiDoc: "Read-only",
		dangCoLink: "An active read-only link exists",
		dangChep: "Copying",
		dangTaoLink: "Creating link",
		daChepXong: "Copied",
		daTaoLink: "Link created",
		chepLink: "Copy link",
		thayLink: "Replace link",
		ghiChu: "Sharing this chat does not change who can edit or run the agent.",
		dangHuy: "Revoking",
		daHuy: "Revoked",
		huyLink: "Revoke link",
		huy: "Cancel",
		xong: "Done",
	},
};

export type HoiThoaiThaoTacMessages = typeof en;

const vi = {
	xoa: {
		daXoa: "Đã xoá hội thoại.",
		xoaMot: (ten: string) => `Xoá ${ten}`,
		xoaHoi: (ten: string) => `Xoá ${ten}?`,
		themThaoTac: "Thêm thao tác với hội thoại",
		xoaHoiThoai: "Xoá hội thoại",
		xoa: "Xoá",
		xoaMoTa:
			"Việc này xoá vĩnh viễn hội thoại, mọi tin nhắn, tệp đính kèm và đường chia sẻ của nó. Tác nhân đã dựng ra từ đây vẫn còn dùng được.",
		huy: "Huỷ",
		dangXoa: "Đang xoá",
		daXong: "Đã xoá",
		thuLai: "Thử lại",
	},
	chiaSe: {
		daHuyLink: "Đã huỷ đường chia sẻ.",
		daChep: "Đã chép đường chia sẻ.",
		tieuDe: "Chia sẻ hội thoại",
		dong: "Đóng",
		dangTai: "Đang tải trạng thái chia sẻ…",
		taiHong: "Không tải được trạng thái chia sẻ.",
		thuLai: "Thử lại",
		chiMinhBan: "Chỉ mình bạn",
		aiCoLink: "Ai trong OneHub có đường dẫn",
		chiDoc: "Chỉ đọc",
		dangCoLink: "Đang có một đường chỉ-đọc còn hiệu lực",
		dangChep: "Đang chép",
		dangTaoLink: "Đang tạo đường dẫn",
		daChepXong: "Đã chép",
		daTaoLink: "Đã tạo đường dẫn",
		chepLink: "Chép đường dẫn",
		thayLink: "Thay đường dẫn khác",
		ghiChu: "Chia sẻ hội thoại này không đổi ai được sửa hay chạy tác nhân.",
		dangHuy: "Đang huỷ",
		daHuy: "Đã huỷ",
		huyLink: "Huỷ đường dẫn",
		huy: "Huỷ",
		xong: "Xong",
	},
} satisfies HoiThoaiThaoTacMessages;

const BANG = { en, vi } satisfies Record<Locale, HoiThoaiThaoTacMessages>;

export function hoiThoaiThaoTacMessages(
	locale: Locale,
): HoiThoaiThaoTacMessages {
	return BANG[locale];
}
