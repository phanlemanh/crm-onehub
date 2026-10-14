import type { Locale } from "@crm/ui/lib/locale";

const en = {
	ma: {
		danhSachTep: "Generated agent files",
		dangDoc: "Loading agent code",
		dangGhi: "Writing agent code",
		tieuDe: "Agent code",
		soTep: (so: string) => `${so} files`,
		ngangXem: "Code view",
		xemMa: "Code",
		xemThayDoi: "Changes",
		cayTep: "Agent files",
		daLuu: "Saved.",
		dangDocTep: "Reading the agent's files…",
		chuaCoTep:
			"This agent has no files yet. The builder writes them when it deploys.",
		moTa: "What the agent actually runs.",
		anThayDoi: "Hide changes",
		xong: "Done",
		sua: "Edit",
		chuaLuu: "Unsaved code",
		soTepDoi: (so: string) =>
			`${so} files changed. Saving writes a new revision.`,
		boQua: "Discard",
		dangLuu: "Saving…",
		luu: "Save",
	},
	thoaThuan: {
		cot: {
			deal: "Deal",
			company: "Company",
			stage: "Stage",
			amount: "Amount",
			owner: "Owner",
			closeDate: "Close date",
			idle: "Idle",
		},
		khongCo: "No deals met these pipeline filters.",
		chuaCoHoatDong: "No activity has ever been recorded",
		tinhDen: "As of",
		khongKhop: "No matching deals",
		namIm: "stale",
		trangThai: {
			open: "open",
			won: "won",
			lost: "lost",
		} as Record<string, string>,
		soThoaThuan: (so: string) => `${so} deals`,
		ngayNamIm: (so: string) => `${so}+ days inactive`,
		conNua: "More results available",
		duongOng: (ten: string) => `${ten} pipeline`,
		tongGiaTri: (ten: string) => `${ten} total`,
	},
};

export type KetQuaMessages = typeof en;

const vi = {
	ma: {
		danhSachTep: "Các tệp đã dựng của tác nhân",
		dangDoc: "Đang đọc mã tác nhân",
		dangGhi: "Đang ghi mã tác nhân",
		tieuDe: "Mã tác nhân",
		soTep: (so: string) => `${so} tệp`,
		ngangXem: "Ngăn xem mã",
		xemMa: "Mã",
		xemThayDoi: "Thay đổi",
		cayTep: "Cây tệp của tác nhân",
		daLuu: "Đã lưu.",
		dangDocTep: "Đang đọc các tệp của tác nhân…",
		chuaCoTep:
			"Tác nhân này chưa có tệp nào. Bộ dựng ghi chúng khi đưa vào chạy.",
		moTa: "Thứ tác nhân thật sự chạy.",
		anThayDoi: "Ẩn thay đổi",
		xong: "Xong",
		sua: "Sửa",
		chuaLuu: "Mã chưa lưu",
		soTepDoi: (so: string) => `${so} tệp đã đổi. Lưu là ghi thành một bản mới.`,
		boQua: "Bỏ thay đổi",
		dangLuu: "Đang lưu…",
		luu: "Lưu",
	},
	thoaThuan: {
		cot: {
			deal: "Thoả thuận",
			company: "Công ty",
			stage: "Giai đoạn",
			amount: "Giá trị",
			owner: "Phụ trách",
			closeDate: "Ngày chốt",
			idle: "Nằm im",
		},
		khongCo: "Không thoả thuận nào lọt qua bộ lọc này.",
		chuaCoHoatDong: "Chưa ghi nhận hoạt động nào",
		tinhDen: "Tính đến",
		khongKhop: "Không thoả thuận nào khớp",
		namIm: "nằm im",
		trangThai: {
			open: "đang mở",
			won: "chốt được",
			lost: "không thành",
		} as Record<string, string>,
		soThoaThuan: (so: string) => `${so} thoả thuận`,
		ngayNamIm: (so: string) => `nằm im từ ${so} ngày`,
		conNua: "Còn kết quả nữa",
		duongOng: (ten: string) => `${ten} đang mở`,
		tongGiaTri: (ten: string) => `tổng ${ten}`,
	},
} satisfies KetQuaMessages;

const BANG = { en, vi } satisfies Record<Locale, KetQuaMessages>;

export function ketQuaMessages(locale: Locale): KetQuaMessages {
	return BANG[locale];
}
