import { minorUnitsOf } from "@crm/db/currency";
import { LOCALES, type Locale } from "./locale";

export type MoneyRejection =
	| "format"
	| "otherLocale"
	| "fraction"
	| "negative"
	| "tooLarge";

export type MoneyReading =
	| { kind: "empty" }
	| { kind: "ok"; cents: number }
	| { kind: "invalid"; reason: MoneyRejection };

export type MoneyInputOptions = { locale: Locale; currency: string };

export type MoneySeparators = { group: string; decimal: string };

export const MONEY_EXAMPLE_CENTS = {
	whole: 15_000_000_000,
	fraction: 150_000_050,
} as const;

const CENT_DIGITS = 2;
const NEGATIVE = /^[-−]/;
const MAX_CENTS = BigInt(Number.MAX_SAFE_INTEGER);
const CENT_UNIT = BigInt(10) ** BigInt(CENT_DIGITS);

const separators = new Map<Locale, MoneySeparators>();

export function moneySeparators(locale: Locale): MoneySeparators {
	const cached = separators.get(locale);
	if (cached) return cached;
	const parts = new Intl.NumberFormat(locale).formatToParts(1234567.5);
	const made = {
		group: parts.find((part) => part.type === "group")?.value ?? ",",
		decimal: parts.find((part) => part.type === "decimal")?.value ?? ".",
	};
	separators.set(locale, made);
	return made;
}

const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

type Read =
	| { kind: "ok"; cents: number }
	| { kind: "invalid"; reason: "format" | "fraction" | "tooLarge" };

function readWith(text: string, seps: MoneySeparators, minor: number): Read {
	const group = escape(seps.group);
	const decimal = escape(seps.decimal);
	const shape = new RegExp(
		`^(\\d{1,3}(?:${group}\\d{3})+|\\d+)(?:${decimal}(\\d+))?$`,
	);
	const match = shape.exec(text);
	if (!match) return { kind: "invalid", reason: "format" };
	const whole = (match[1] ?? "").split(seps.group).join("");
	const fraction = match[2] ?? "";
	if (fraction.length > Math.min(minor, CENT_DIGITS)) {
		return { kind: "invalid", reason: "fraction" };
	}
	const cents =
		BigInt(whole) * CENT_UNIT +
		BigInt(fraction.padEnd(CENT_DIGITS, "0"));
	if (cents > MAX_CENTS) return { kind: "invalid", reason: "tooLarge" };
	return { kind: "ok", cents: Number(cents) };
}

export function parseMoneyInput(
	text: string,
	{ locale, currency }: MoneyInputOptions,
): MoneyReading {
	const trimmed = text.trim();
	if (trimmed === "") return { kind: "empty" };
	if (NEGATIVE.test(trimmed)) return { kind: "invalid", reason: "negative" };

	const minor = minorUnitsOf(currency);
	const own = moneySeparators(locale);
	const read = readWith(trimmed, own, minor);
	if (read.kind === "ok" || read.reason === "tooLarge") return read;

	const otherReads = LOCALES.filter((other) => other !== locale)
		.map(moneySeparators)
		.filter(
			(seps) => seps.group !== own.group || seps.decimal !== own.decimal,
		)
		.map((seps) => readWith(trimmed, seps, minor));
	if (otherReads.some((other) => other.kind === "ok")) {
		return { kind: "invalid", reason: "otherLocale" };
	}
	return read;
}

const wholeFormats = new Map<Locale, Intl.NumberFormat>();

function wholeFormat(locale: Locale): Intl.NumberFormat {
	const cached = wholeFormats.get(locale);
	if (cached) return cached;
	const made = new Intl.NumberFormat(locale, {
		useGrouping: true,
		maximumFractionDigits: 0,
	});
	wholeFormats.set(locale, made);
	return made;
}

export function formatMoneyInput(
	cents: number,
	{ locale }: MoneyInputOptions,
): string {
	const all = BigInt(Math.round(Math.abs(cents)));
	const whole = wholeFormat(locale).format(all / CENT_UNIT);
	const rest = all % CENT_UNIT;
	if (rest === BigInt(0)) return whole;
	const fraction = rest.toString().padStart(CENT_DIGITS, "0");
	return `${whole}${moneySeparators(locale).decimal}${fraction}`;
}
