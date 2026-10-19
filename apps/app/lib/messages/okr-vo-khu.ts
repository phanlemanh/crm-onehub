import type { Locale } from "@crm/ui/lib/locale";

const vi = {
	nhom: {
		okr: "OKR",
		baoCao: "Báo cáo",
	},
	muc: {
		cuaToi: "Của tôi",
		boOkr: "Bộ OKR",
		layYKien: "Lấy ý kiến",
		sucKhoe: "Sức khoẻ",
		soDo: "Sơ đồ",
	},
	chuongTrinh: "Chương trình OKR",
};

type OkrVoKhuMessages = typeof vi;

const en: OkrVoKhuMessages = {
	nhom: {
		okr: "OKR",
		baoCao: "Reports",
	},
	muc: {
		cuaToi: "Mine",
		boOkr: "OKR sets",
		layYKien: "Call for ideas",
		sucKhoe: "Health",
		soDo: "Map",
	},
	chuongTrinh: "OKR program",
};

export function okrVoKhuMessages(locale: Locale): OkrVoKhuMessages {
	return locale === "en" ? en : vi;
}
