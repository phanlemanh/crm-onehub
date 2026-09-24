import { describe, expect, test } from "bun:test";
import type { Locale } from "../src/lib/locale";
import {
	formatMoneyInput,
	type MoneyReading,
	parseMoneyInput,
} from "../src/lib/money-input";

const ok = (cents: number): MoneyReading => ({ kind: "ok", cents });
const bad = (
	reason: Extract<MoneyReading, { kind: "invalid" }>["reason"],
): MoneyReading => ({ kind: "invalid", reason });
const EMPTY: MoneyReading = { kind: "empty" };

function ke(r: MoneyReading): string {
	if (r.kind === "ok") return String(r.cents);
	if (r.kind === "empty") return "empty";
	return r.reason;
}

type Hang = {
	dang: string;
	chuoi: Record<Locale, string>;
	VND: MoneyReading;
	USD: MoneyReading;
};

const QUA_LON = "12345678901234567890";

const MA_TRAN: Hang[] = [
	{ dang: "rong", chuoi: { vi: "   ", en: "   " }, VND: EMPTY, USD: EMPTY },
	{
		dang: "tran",
		chuoi: { vi: "150000000", en: "150000000" },
		VND: ok(15_000_000_000),
		USD: ok(15_000_000_000),
	},
	{
		dang: "nhom-dung",
		chuoi: { vi: "150.000.000", en: "150,000,000" },
		VND: ok(15_000_000_000),
		USD: ok(15_000_000_000),
	},
	{
		dang: "le-trong-han",
		chuoi: { vi: "1.500.000,5", en: "1,500,000.5" },
		VND: bad("fraction"),
		USD: ok(150_000_050),
	},
	{
		dang: "le-vuot",
		chuoi: { vi: "1.500,505", en: "1,500.505" },
		VND: bad("fraction"),
		USD: bad("fraction"),
	},
	{
		dang: "tieng-kia",
		chuoi: { vi: "1,500,000", en: "1.500.000" },
		VND: bad("otherLocale"),
		USD: bad("otherLocale"),
	},
	{
		dang: "nhom-lech",
		chuoi: { vi: "1.50.000", en: "1,50,000" },
		VND: bad("format"),
		USD: bad("format"),
	},
	{
		dang: "ky-tu-la",
		chuoi: { vi: "150k", en: "150k" },
		VND: bad("format"),
		USD: bad("format"),
	},
	{
		dang: "dau-le-tro-troi",
		chuoi: { vi: "150,", en: "150." },
		VND: bad("format"),
		USD: bad("format"),
	},
	{
		dang: "am-gach",
		chuoi: { vi: "-5", en: "-5" },
		VND: bad("negative"),
		USD: bad("negative"),
	},
	{
		dang: "am-tru",
		chuoi: { vi: "−5", en: "−5" },
		VND: bad("negative"),
		USD: bad("negative"),
	},
	{
		dang: "qua-lon",
		chuoi: { vi: QUA_LON, en: QUA_LON },
		VND: bad("tooLarge"),
		USD: bad("tooLarge"),
	},
];

const TIENG: Locale[] = ["vi", "en"];
const SO_O = 74;

describe("ma-tran", () => {
	test("ma-tran: 2 tieng x 2 dong x 12 dang, JPY giong VND, doi chung qua-lon", () => {
		const lech: string[] = [];
		let daChay = 0;
		for (const hang of MA_TRAN) {
			for (const locale of TIENG) {
				const text = hang.chuoi[locale];
				for (const currency of ["VND", "USD"] as const) {
					const that = parseMoneyInput(text, { locale, currency });
					daChay += 1;
					if (ke(that) !== ke(hang[currency])) {
						lech.push(
							`${locale}/${currency} ${hang.dang} «${text}»: ${ke(that)} != ${ke(hang[currency])}`,
						);
					}
				}
				const jpy = parseMoneyInput(text, { locale, currency: "JPY" });
				daChay += 1;
				if (ke(jpy) !== ke(hang.VND)) {
					lech.push(
						`${locale}/JPY ${hang.dang} «${text}»: ${ke(jpy)} != ${ke(hang.VND)}`,
					);
				}
			}
		}
		const doiChung: Record<Locale, string> = {
			vi: "999.999.999.999",
			en: "999,999,999,999",
		};
		for (const locale of TIENG) {
			const that = parseMoneyInput(doiChung[locale], {
				locale,
				currency: "VND",
			});
			daChay += 1;
			if (ke(that) !== "99999999999900") {
				lech.push(
					`${locale}/VND doi-chung «${doiChung[locale]}»: ${ke(that)} != 99999999999900`,
				);
			}
		}
		expect(lech).toEqual([]);
		expect(daChay).toBe(SO_O);
	});

	test("ma-tran: khoang trang hai dau duoc bo, so 0 la so", () => {
		expect(
			ke(parseMoneyInput("  150.000.000\t", { locale: "vi", currency: "VND" })),
		).toBe("15000000000");
		expect(ke(parseMoneyInput("0", { locale: "vi", currency: "VND" }))).toBe(
			"0",
		);
		expect(ke(parseMoneyInput("0,00", { locale: "vi", currency: "USD" }))).toBe(
			"0",
		);
		expect(ke(parseMoneyInput("150 000", { locale: "vi", currency: "VND" }))).toBe(
			"format",
		);
	});
});

const TIENG_KIA: {
	locale: Locale;
	text: string;
	cuaNo: Locale;
	cents: number;
}[] = [
	{ locale: "vi", text: "1.5", cuaNo: "en", cents: 150 },
	{ locale: "vi", text: "1,500.50", cuaNo: "en", cents: 150_050 },
	{ locale: "vi", text: "1,500", cuaNo: "en", cents: 150_000 },
	{ locale: "en", text: "150.000.000", cuaNo: "vi", cents: 15_000_000_000 },
	{ locale: "en", text: "1.500,50", cuaNo: "vi", cents: 150_050 },
];

describe("tieng-kia", () => {
	test("tieng-kia: tu choi o tieng nay, doc duoc o tieng cua no", () => {
		const lech: string[] = [];
		let daChay = 0;
		for (const ca of TIENG_KIA) {
			const nay = parseMoneyInput(ca.text, {
				locale: ca.locale,
				currency: "USD",
			});
			daChay += 1;
			if (ke(nay) !== "otherLocale") {
				lech.push(`${ca.locale} «${ca.text}» USD: ${ke(nay)} != otherLocale`);
			}
			const cuaNo = parseMoneyInput(ca.text, {
				locale: ca.cuaNo,
				currency: "USD",
			});
			daChay += 1;
			if (ke(cuaNo) !== String(ca.cents)) {
				lech.push(
					`${ca.cuaNo} «${ca.text}» USD: ${ke(cuaNo)} != ${ca.cents}`,
				);
			}
		}
		expect(lech).toEqual([]);
		expect(daChay).toBe(10);
	});
});

function sinhGiaTri(): number[] {
	const co = [0, 1, 29, 99, 100, 1_000_050, 99_999_999_999_999];
	let hat = 20260924;
	const ngauNhien: number[] = [];
	while (co.length + ngauNhien.length < 300) {
		hat = (hat * 1103515245 + 12345) % 2147483648;
		const mu = hat % 15;
		const phan = (hat / 2147483648) * 10 ** mu;
		ngauNhien.push(Math.floor(phan));
	}
	return [...co, ...ngauNhien];
}

describe("chinh-xac", () => {
	test("chinh-xac: gia tri ghi san", () => {
		const ca: { locale: Locale; text: string; cents: number }[] = [
			{ locale: "vi", text: "0,29", cents: 29 },
			{ locale: "vi", text: "1.234.567,89", cents: 123_456_789 },
			{ locale: "vi", text: "999.999.999.999,99", cents: 99_999_999_999_999 },
			{ locale: "en", text: "0.29", cents: 29 },
			{ locale: "en", text: "1,234,567.89", cents: 123_456_789 },
			{ locale: "en", text: "999,999,999,999.99", cents: 99_999_999_999_999 },
		];
		const lech: string[] = [];
		for (const c of ca) {
			const that = parseMoneyInput(c.text, {
				locale: c.locale,
				currency: "USD",
			});
			if (ke(that) !== String(c.cents)) {
				lech.push(`${c.locale}/USD «${c.text}»: ${ke(that)} != ${c.cents}`);
			}
		}
		expect(lech).toEqual([]);
	});

	test("chinh-xac: vong tron formatMoneyInput -> parseMoneyInput", () => {
		const giaTri = sinhGiaTri();
		expect(giaTri.length).toBe(300);
		const lech: string[] = [];
		let daChay = 0;
		for (const locale of TIENG) {
			for (const currency of ["VND", "USD", "JPY"]) {
				for (const tho of giaTri) {
					const cents = currency === "USD" ? tho : tho - (tho % 100);
					const text = formatMoneyInput(cents, { locale, currency });
					const that = parseMoneyInput(text, { locale, currency });
					daChay += 1;
					if (ke(that) !== String(cents)) {
						lech.push(`${locale}/${currency} «${text}»: ${ke(that)} != ${cents}`);
					}
				}
			}
		}
		expect(lech.slice(0, 5)).toEqual([]);
		expect(daChay).toBe(1800);
	});

	test("chinh-xac: formatMoneyInput viet dung tieng", () => {
		expect(formatMoneyInput(15_000_000_000, { locale: "vi", currency: "VND" })).toBe(
			"150.000.000",
		);
		expect(formatMoneyInput(150_000_050, { locale: "vi", currency: "USD" })).toBe(
			"1.500.000,50",
		);
		expect(formatMoneyInput(150_000_050, { locale: "en", currency: "USD" })).toBe(
			"1,500,000.50",
		);
		expect(formatMoneyInput(150_000_050, { locale: "vi", currency: "VND" })).toBe(
			"1.500.000,50",
		);
		expect(
			ke(parseMoneyInput("1.500.000,50", { locale: "vi", currency: "VND" })),
		).toBe("fraction");
	});
});
