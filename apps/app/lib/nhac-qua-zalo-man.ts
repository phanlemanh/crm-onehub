const SECOND_MS = 1_000;

export const ZALO_MAN = {
	lamMoiMs: 5 * SECOND_MS,
	nhomMa: 3,
} as const;

export function nhomMa(ma: string): string {
	return `${ma.slice(0, ZALO_MAN.nhomMa)} ${ma.slice(ZALO_MAN.nhomMa)}`;
}

export function gioPhut(locale: string, luc: string | Date): string {
	return new Intl.DateTimeFormat(locale, {
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date(luc));
}

export function ngayGio(locale: string, luc: string | Date): string {
	return new Intl.DateTimeFormat(locale, {
		day: "2-digit",
		month: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date(luc));
}
