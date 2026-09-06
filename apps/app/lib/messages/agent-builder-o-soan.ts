import type { Locale } from "@crm/ui/lib/locale";

const en = {
	oSoan: {
		taoTacNhan: "Create agent",
		datCauHoi: "Ask about your CRM or automate a task…",
		guiTin: "Send a message",
		nhanOSoan: "Message the agent builder",
		gui: "Send message",
		dangChuanBiTep: "Preparing attachments",
		dangGui: "Sending",
		daGui: "Sent",
		guiHong: "Send failed",
		gan: "Tag CRM records and integrations",
		timCrm: "Search CRM",
		nhomBanGhi: "CRM records",
		khongKhop: "No matching records.",
		dinhTep: "Attach files",
		moLenh: "Open slash commands",
		dinhTepHong: "Those files could not be attached. Try again.",
	},
	tep: {
		rong: (ten: string) => `${ten} is empty.`,
		quaLon: (ten: string) => `${ten} is larger than 2 MB.`,
		tenQuaDai: "That file name is too long.",
		loaiKhongNhan: (ten: string) => `${ten} has an unsupported file type.`,
		khongDocDuoc: (ten: string) => `${ten} could not be read.`,
		kiloByte: (so: string) => `${so} KB`,
		megaByte: (so: string) => `${so} MB`,
	},
	the: {
		go: (ten: string) => `Remove ${ten}`,
	},
};

export type OSoanMessages = typeof en;

const vi = {
	oSoan: {
		taoTacNhan: "Tạo tác nhân",
		datCauHoi: "Hỏi về CRM của bạn, hoặc tả một việc cần tự động…",
		guiTin: "Gửi một tin",
		nhanOSoan: "Nhắn cho bộ dựng tác nhân",
		gui: "Gửi tin",
		dangChuanBiTep: "Đang chuẩn bị tệp",
		dangGui: "Đang gửi",
		daGui: "Đã gửi",
		guiHong: "Gửi hỏng",
		gan: "Gắn bản ghi CRM và kết nối",
		timCrm: "Tìm trong CRM",
		nhomBanGhi: "Bản ghi CRM",
		khongKhop: "Không có bản ghi nào khớp.",
		dinhTep: "Đính tệp",
		moLenh: "Mở danh sách lệnh",
		dinhTepHong: "Không đính được những tệp đó. Thử lại.",
	},
	tep: {
		rong: (ten: string) => `${ten} rỗng.`,
		quaLon: (ten: string) => `${ten} lớn hơn 2 MB.`,
		tenQuaDai: "Tên tệp đó dài quá.",
		loaiKhongNhan: (ten: string) => `${ten} thuộc loại tệp không nhận được.`,
		khongDocDuoc: (ten: string) => `${ten} đọc không được.`,
		kiloByte: (so: string) => `${so} KB`,
		megaByte: (so: string) => `${so} MB`,
	},
	the: {
		go: (ten: string) => `Gỡ ${ten}`,
	},
} satisfies OSoanMessages;

const BANG = { en, vi } satisfies Record<Locale, OSoanMessages>;

export function oSoanMessages(locale: Locale): OSoanMessages {
	return BANG[locale];
}
