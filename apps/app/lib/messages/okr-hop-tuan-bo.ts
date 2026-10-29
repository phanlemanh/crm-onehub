import type { Locale } from "@crm/ui/lib/locale";

const vi = {
	hangSo: {
		daCapNhat: "Đã cập nhật",
		dangBan: "Đáng bàn",
		tuTinThap: "Tự tin thấp",
		ngayCon: "Ngày còn lại",
	},
	moTa: {
		tuan: (ngay: string) => `Tuần ${ngay}`,
		canBan: "KR cần bàn tuần này",
		moiNhat: "theo lần cập nhật mới nhất",
		ketThuc: (ngay: string) => `Kết thúc ${ngay}`,
		batDau: (ngay: string) => `Bắt đầu ${ngay}`,
		daKetThuc: (ngay: string) => `Đã kết thúc ${ngay}`,
	},
	rong: {
		chuKyChuaChay: (ten: string, ngay: string) =>
			`Chu kỳ ${ten} bắt đầu ${ngay} — Họp tuần có số từ tuần đầu của chu kỳ.`,
		chuaKr: (bo: string, chuKy: string) =>
			`${bo} chưa có KR công bố trong ${chuKy}.`,
		chiSangMenu: (bo: string) =>
			`KR của từng khối và phòng ban nằm ở Họp tuần của bộ ấy — bấm ${bo} trên dòng vị trí để sang.`,
	},
	donViCoKr: {
		xemMoiBo: "Xem mọi bộ OKR",
	},
};

type OkrHopTuanBoMessages = typeof vi;

const en: OkrHopTuanBoMessages = {
	hangSo: {
		daCapNhat: "Updated",
		dangBan: "Worth discussing",
		tuTinThap: "Low confidence",
		ngayCon: "Days left",
	},
	moTa: {
		tuan: (ngay: string) => `Week of ${ngay}`,
		canBan: "KRs to discuss this week",
		moiNhat: "from the latest update",
		ketThuc: (ngay: string) => `Ends ${ngay}`,
		batDau: (ngay: string) => `Starts ${ngay}`,
		daKetThuc: (ngay: string) => `Ended ${ngay}`,
	},
	rong: {
		chuKyChuaChay: (ten: string, ngay: string) =>
			`Cycle ${ten} starts ${ngay} — the weekly meeting has numbers from the cycle's first week.`,
		chuaKr: (bo: string, chuKy: string) =>
			`${bo} has no published KRs in ${chuKy}.`,
		chiSangMenu: (bo: string) =>
			`Each division's and department's KRs live in that set's weekly meeting — click ${bo} in the breadcrumb to go there.`,
	},
	donViCoKr: {
		xemMoiBo: "See all OKR sets",
	},
};

export function okrHopTuanBoMessages(locale: Locale): OkrHopTuanBoMessages {
	return locale === "en" ? en : vi;
}
