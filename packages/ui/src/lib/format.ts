import type { Locale } from "./locale";

const numberFormats = new Map<string, Intl.NumberFormat>();
const dateFormats = new Map<string, Intl.DateTimeFormat>();

function numberFormat(
	locale: Locale,
	options: Intl.NumberFormatOptions,
): Intl.NumberFormat {
	const key = `${locale}|${JSON.stringify(options)}`;
	const cached = numberFormats.get(key);
	if (cached) return cached;
	const made = new Intl.NumberFormat(locale, options);
	numberFormats.set(key, made);
	return made;
}

export function dateFormat(
	locale: Locale,
	options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
	const key = `${locale}|${JSON.stringify(options)}`;
	const cached = dateFormats.get(key);
	if (cached) return cached;
	const made = new Intl.DateTimeFormat(locale, options);
	dateFormats.set(key, made);
	return made;
}

export function formatCount(
	count: number,
	noun: string,
	locale: Locale,
	plural = `${noun}s`,
): string {
	if (locale === "vi") return `${count} ${noun}`;
	return `${count} ${count === 1 ? noun : plural}`;
}

export function formatDecimal(value: number, locale: Locale): string {
	return numberFormat(locale, { maximumFractionDigits: 1 }).format(value);
}

const WELL_FORMED_CURRENCY_CODE = /^[A-Za-z]{3}$/;

function displayCurrencyCode(currency: string): string {
	return WELL_FORMED_CURRENCY_CODE.test(currency)
		? currency.toUpperCase()
		: "USD";
}

const currencyDigits = new Map<string, number>();

function fractionDigits(code: string): number {
	const cached = currencyDigits.get(code);
	if (cached !== undefined) return cached;

	const digits =
		numberFormat("en", {
			style: "currency",
			currency: code,
		}).resolvedOptions().maximumFractionDigits ?? 2;

	currencyDigits.set(code, digits);
	return digits;
}

export function formatMoney(
	cents: number,
	currency = "usd",
	locale: Locale,
): string {
	const code = displayCurrencyCode(currency);
	const whole = cents % 100 === 0;
	const digits = fractionDigits(code);

	return numberFormat(locale, {
		style: "currency",
		currency: code,
		minimumFractionDigits: whole ? 0 : Math.min(2, digits),
		maximumFractionDigits: whole ? 0 : digits,
	}).format(cents / 100);
}

export function formatMoneyCompact(
	cents: number,
	currency = "usd",
	locale: Locale,
): string {
	return numberFormat(locale, {
		style: "currency",
		currency: displayCurrencyCode(currency),
		notation: "compact",
		maximumFractionDigits: cents % 100_000 === 0 ? 0 : 1,
	}).format(cents / 100);
}

export function formatMonth(iso: string, locale: Locale): string {
	const [nam, thang] = iso.split("-").map(Number);
	if (!nam || !thang) return iso;
	return dateFormat(locale, { month: "short", timeZone: "UTC" }).format(
		new Date(Date.UTC(nam, thang - 1, 1)),
	);
}

export function formatPercent(rate: number, locale: Locale): string {
	return numberFormat(locale, {
		style: "percent",
		maximumFractionDigits: 0,
	}).format(rate);
}

function pad(value: number): string {
	return String(value).padStart(2, "0");
}

export function toDay(date: Date): string {
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromDay(value: string | null | undefined): Date | undefined {
	if (!value) return undefined;
	const [year, month, day] = value.slice(0, 10).split("-").map(Number);
	if (!year || !month || !day) return undefined;
	const date = new Date(year, month - 1, day);
	return Number.isNaN(date.getTime()) ? undefined : date;
}

export function formatDay(
	value: string | null | undefined,
	locale: Locale,
): string {
	const date = fromDay(value);
	return date
		? dateFormat(locale, {
				month: "short",
				day: "numeric",
				year: "numeric",
			}).format(date)
		: (value ?? "—");
}

export function formatDayShort(
	value: string | null | undefined,
	locale: Locale,
): string {
	const date = fromDay(value);
	if (!date) return value ?? "—";
	return dateFormat(locale, { month: "2-digit", day: "2-digit" })
		.formatToParts(date)
		.filter((part) => part.type === "day" || part.type === "month")
		.map((part) => part.value)
		.join("/");
}

export function initialsFromName(name: string | null | undefined): string {
	const parts = (name ?? "").split(/\s+/).filter(Boolean);
	const first = parts[0];
	if (!first) return "?";
	if (parts.length === 1) return first.slice(0, 2).toUpperCase();
	const last = parts[parts.length - 1] ?? first;
	return (first.slice(0, 1) + last.slice(0, 1)).toUpperCase();
}

export function formatNgayGio(
	at: string | number | Date,
	locale: Locale,
	cach: { timeZone: string; phan: "ngay-gio" | "ngay" | "ngay-thang" | "gio" },
): string {
	const luc = new Date(at);
	if (Number.isNaN(luc.getTime())) return "—";
	const phan = new Map(
		dateFormat(locale, {
			timeZone: cach.timeZone,
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			hourCycle: "h23",
		})
			.formatToParts(luc)
			.map((p) => [p.type, p.value]),
	);
	const ngayThang =
		locale === "vi"
			? `${phan.get("day")}/${phan.get("month")}`
			: `${phan.get("month")}/${phan.get("day")}`;
	const ngay = `${ngayThang}/${phan.get("year")}`;
	const gio = `${phan.get("hour")}:${phan.get("minute")}`;
	switch (cach.phan) {
		case "ngay-thang":
			return ngayThang;
		case "ngay":
			return ngay;
		case "gio":
			return gio;
		case "ngay-gio":
			return locale === "vi" ? `${gio} ${ngay}` : `${ngay}, ${gio}`;
	}
}
