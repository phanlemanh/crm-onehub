export const NGAY_VN = { muiGio: "Asia/Ho_Chi_Minh" } as const;

const dinhNgay = new Intl.DateTimeFormat("en-CA", {
	timeZone: NGAY_VN.muiGio,
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
});

export function homNayVN(now: Date): string {
	return dinhNgay.format(now);
}

export function quaHanTheoNgayVN(hanNgay: string, now: Date): boolean {
	return hanNgay < homNayVN(now);
}
