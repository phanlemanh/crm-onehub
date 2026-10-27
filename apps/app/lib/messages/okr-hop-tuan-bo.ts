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
	},
	donViCoKr: {
		tieuDe: "Đơn vị có KR",
		dong: (n: string, m: string) => `${n} KR · đã cập nhật ${m}`,
		xemMoiBo: "Xem mọi bộ OKR",
		loi: "Không tải được các đơn vị có KR.",
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
	},
	donViCoKr: {
		tieuDe: "Units with KRs",
		dong: (n: string, m: string) => `${n} KRs · ${m} updated`,
		xemMoiBo: "See all OKR sets",
		loi: "Couldn't load the units with KRs.",
	},
};

export function okrHopTuanBoMessages(locale: Locale): OkrHopTuanBoMessages {
	return locale === "en" ? en : vi;
}
