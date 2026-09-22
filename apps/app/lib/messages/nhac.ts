import type { Locale } from "@crm/ui/lib/locale";

const en = {
	keHoachIm: "Quiet plan",
	mocNgay: "Day checkpoint",
	imNgay: "quiet {n} days",
	ngayThu: "day {n}/{tong}",
	ngay: "day {n}",
	buocXong: "{xong}/{tong} steps done",
	keHoach: "Plan",
	theoDoi: "Watch",
	dangTheoDoi: "Watching",
	khongLuu: "Couldn't save watch",
	khongLuuMoTa: "The button is back to how it was. Press it again to retry.",
	moTaIm: "{n} quiet plans",
	nguoiTheoDoi: "Watchers",
	chuaAi: "No one is watching this plan yet",
};

export type NhacMessages = typeof en;

const vi: NhacMessages = {
	keHoachIm: "Kế hoạch im",
	mocNgay: "Mốc ngày",
	imNgay: "im {n} ngày",
	ngayThu: "ngày {n}/{tong}",
	ngay: "ngày {n}",
	buocXong: "{xong}/{tong} bước xong",
	keHoach: "Kế hoạch",
	theoDoi: "Theo dõi",
	dangTheoDoi: "Đang theo dõi",
	khongLuu: "Không lưu được theo dõi",
	khongLuuMoTa: "Nút đã về như trước. Bấm lại để thử lần nữa.",
	moTaIm: "{n} kế hoạch im",
	nguoiTheoDoi: "Người theo dõi",
	chuaAi: "Chưa ai theo dõi kế hoạch này",
};

const BANG = { en, vi } satisfies Record<Locale, NhacMessages>;

export function nhacMessages(locale: Locale): NhacMessages {
	return BANG[locale];
}
