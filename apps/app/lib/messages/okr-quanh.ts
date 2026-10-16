import type { Locale } from "@crm/ui/lib/locale";

const vi = {
	tieuDe: "Sơ đồ quanh mục tiêu",
	moTa: "Phía trên là những gì mục tiêu này góp vào, phía dưới là KR của nó và những mục tiêu góp vào nó.",
	dangXemQuanh: "Đang xem quanh:",
	gopLenQuaKr: "Góp lên công ty qua KR",
	cuaMucTieu: "của mục tiêu",
	gopThang: "Góp thẳng vào mục tiêu công ty",
	laCongTy: "Đây là mục tiêu cấp công ty",
	chuaLenCongTy: "Không thấy đường lên công ty trong phạm vi bạn xem được.",
	chuThich:
		"Phía trên: những gì mục tiêu này góp vào. Phía dưới: KR của nó và những mục tiêu góp vào nó. Rê chuột lên một thẻ để làm nổi đường đi.",
	congTy: "Công ty",
	tienDo: (n: number) => `${n}% tiến độ`,
	dangTai: "Đang tải sơ đồ…",
	loiTieuDe: "Không tải được sơ đồ",
	loiMoTa: "Kết nối hoặc máy chủ đang trục trặc. Thử lại sau giây lát.",
	khongThay: "Không tìm thấy mục tiêu này, hoặc bạn không có quyền xem.",
	veToanCanh: "Về Toàn cảnh",
	nhom: {
		gopVao: "Góp vào",
		tam: "Mục tiêu này",
		kr: "KR của nó",
		gopVaoNo: "Góp vào nó",
	},
	nhanKhung: "Sơ đồ quanh mục tiêu",
	nutXemQuanh: "Xem quanh mục tiêu",
};

export type OkrQuanhMessages = typeof vi;

const en: OkrQuanhMessages = {
	tieuDe: "Objective map",
	moTa: "Above is what this objective contributes to; below are its key results and the objectives that contribute to it.",
	dangXemQuanh: "Centered on:",
	gopLenQuaKr: "Rolls up to the company through key result",
	cuaMucTieu: "of objective",
	gopThang: "Contributes directly to company objective",
	laCongTy: "This is a company-level objective",
	chuaLenCongTy: "No path to the company within what you can see.",
	chuThich:
		"Above: what this objective contributes to. Below: its key results and the objectives contributing to it. Hover a card to highlight its path.",
	congTy: "Company",
	tienDo: (n: number) => `${n}% progress`,
	dangTai: "Loading map…",
	loiTieuDe: "Couldn't load the map",
	loiMoTa: "The connection or server is having trouble. Try again in a moment.",
	khongThay: "This objective doesn't exist, or you don't have access to it.",
	veToanCanh: "Back to Overview",
	nhom: {
		gopVao: "Contributes to",
		tam: "This objective",
		kr: "Its key results",
		gopVaoNo: "Contributing to it",
	},
	nhanKhung: "Objective map",
	nutXemQuanh: "View objective map",
};

export function okrQuanhMessages(locale: Locale): OkrQuanhMessages {
	return locale === "en" ? en : vi;
}
