import { afterEach, describe, expect, test } from "bun:test";
import { act, createElement as h, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { LocaleProvider } from "../src/components/locale-provider";
import { MoneyInput } from "../src/components/money-input";
import { formatMoney } from "../src/lib/format";
import type { Locale } from "../src/lib/locale";

let root: Root | null = null;
let khung: HTMLElement | null = null;
let daDoi: string[] = [];

type Dat = { locale: Locale; currency: string; value: string };

function Vo({ locale, currency, value }: Dat) {
	const [chu, setChu] = useState(value);
	return h(
		LocaleProvider,
		{ locale },
		h(MoneyInput, {
			id: "so-tien",
			value: chu,
			currency,
			onValueChange: (moi: string) => {
				daDoi.push(moi);
				setChu(moi);
			},
		}),
	);
}

function dung(dat: Dat): HTMLElement {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	act(() => {
		root?.render(h(Vo, { ...dat, key: "giu" }));
	});
	return khung;
}

function ve(dat: Dat) {
	act(() => {
		root?.render(h(Vo, { ...dat, key: "giu" }));
	});
}

function o(k: HTMLElement): HTMLInputElement {
	const found = k.querySelector<HTMLInputElement>("#so-tien");
	if (!found) throw new Error("khong thay o so tien");
	return found;
}

function dong(k: HTMLElement): HTMLElement {
	const found = k.querySelector<HTMLElement>("#so-tien-reading");
	if (!found) throw new Error("khong thay dong doc lai");
	return found;
}

function go(k: HTMLElement, chu: string) {
	const input = o(k);
	const dat = Object.getOwnPropertyDescriptor(
		window.HTMLInputElement.prototype,
		"value",
	)?.set;
	act(() => {
		dat?.call(input, chu);
		input.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

function roi(k: HTMLElement) {
	const input = o(k);
	act(() => {
		input.focus();
		input.blur();
	});
}

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	daDoi = [];
});

type Ca = {
	locale: Locale;
	tinh: string;
	currency: string;
	chu: string;
	dong: string;
	loi: boolean;
};

const MA_TRAN: Ca[] = [
	{
		locale: "vi",
		tinh: "doc-duoc",
		currency: "VND",
		chu: "150.000.000",
		dong: `Đọc là ${formatMoney(15_000_000_000, "VND", "vi")}`,
		loi: false,
	},
	{
		locale: "vi",
		tinh: "tieng-kia",
		currency: "USD",
		chu: "1,500.50",
		dong: "Số này viết theo kiểu tiếng Anh. Ở đây dấu chấm ngăn hàng nghìn, dấu phẩy đứng trước phần lẻ — ví dụ 1.500.000,50.",
		loi: true,
	},
	{
		locale: "vi",
		tinh: "le-vuot",
		currency: "USD",
		chu: "1.500,505",
		dong: "USD có tối đa 2 chữ số lẻ.",
		loi: true,
	},
	{
		locale: "vi",
		tinh: "sai-dang",
		currency: "VND",
		chu: "150k",
		dong: "Chưa đọc được số này. Dấu chấm ngăn hàng nghìn, dấu phẩy đứng trước phần lẻ — ví dụ 150.000.000.",
		loi: true,
	},
	{
		locale: "vi",
		tinh: "am",
		currency: "VND",
		chu: "-5",
		dong: "Số tiền không được âm.",
		loi: true,
	},
	{
		locale: "en",
		tinh: "doc-duoc",
		currency: "VND",
		chu: "150,000,000",
		dong: `Reads as ${formatMoney(15_000_000_000, "VND", "en")}`,
		loi: false,
	},
	{
		locale: "en",
		tinh: "tieng-kia",
		currency: "USD",
		chu: "1.500,50",
		dong: "This number is written the Vietnamese way. Here a comma separates thousands and a period comes before decimals — for example 1,500,000.50.",
		loi: true,
	},
	{
		locale: "en",
		tinh: "le-vuot",
		currency: "USD",
		chu: "1,500.505",
		dong: "USD takes at most 2 decimal places.",
		loi: true,
	},
	{
		locale: "en",
		tinh: "sai-dang",
		currency: "VND",
		chu: "150k",
		dong: "Can't read this number. Use a comma between thousands and a period before decimals — for example 150,000,000.",
		loi: true,
	},
	{
		locale: "en",
		tinh: "am",
		currency: "VND",
		chu: "-5",
		dong: "The amount can't be negative.",
		loi: true,
	},
];

describe("doc-lai", () => {
	test("doc-lai: ma tran 2 tieng x 5 tinh huong", () => {
		const lech: string[] = [];
		let daChay = 0;
		for (const ca of MA_TRAN) {
			const k = dung({ locale: ca.locale, currency: ca.currency, value: "" });
			go(k, ca.chu);
			const nhan = `${ca.locale}/${ca.tinh}`;
			const input = o(k);
			const d = dong(k);
			daChay += 1;
			if (d.textContent !== ca.dong) {
				lech.push(`${nhan}: dong «${d.textContent}» != «${ca.dong}»`);
			}
			const invalid = input.getAttribute("aria-invalid");
			const muonInvalid = ca.loi ? "true" : null;
			if (invalid !== muonInvalid) {
				lech.push(`${nhan}: aria-invalid ${invalid} != ${muonInvalid}`);
			}
			if (input.getAttribute("aria-describedby") !== d.id) {
				lech.push(
					`${nhan}: aria-describedby ${input.getAttribute("aria-describedby")} != ${d.id}`,
				);
			}
			if (d.getAttribute("aria-live") !== "polite") {
				lech.push(
					`${nhan}: aria-live ${d.getAttribute("aria-live")} != polite`,
				);
			}
			if (!ca.loi) {
				const so = d.querySelector("[translate]");
				const tien = formatMoney(15_000_000_000, "VND", ca.locale);
				if (so?.getAttribute("translate") !== "no" || so.textContent !== tien) {
					lech.push(
						`${nhan}: translate ${so?.getAttribute("translate") ?? null} != no`,
					);
				}
				if (d.hasAttribute("translate")) {
					lech.push(`${nhan}: tien to mang translate`);
				}
			}
			act(() => root?.unmount());
			k.remove();
			root = null;
		}
		expect(lech).toEqual([]);
		expect(daChay).toBe(10);
	});

	test("doc-lai: o rong khong co dong, o khong tro toi dong", () => {
		for (const locale of ["vi", "en"] as const) {
			const k = dung({ locale, currency: "VND", value: "" });
			expect(dong(k).textContent).toBe("");
			expect(o(k).getAttribute("aria-describedby")).toBeNull();
			expect(o(k).getAttribute("aria-invalid")).toBeNull();
			act(() => root?.unmount());
			k.remove();
			root = null;
		}
	});

	test("doc-lai: doi dong tien doc lai theo so chu so le moi", () => {
		const k = dung({ locale: "vi", currency: "USD", value: "1.500,50" });
		expect(dong(k).textContent).toBe(
			`Đọc là ${formatMoney(150_050, "USD", "vi")}`,
		);
		ve({ locale: "vi", currency: "VND", value: "1.500,50" });
		expect(dong(k).textContent).toBe(
			"VND không có phần lẻ — gõ số tròn, ví dụ 150.000.000.",
		);
		expect(o(k).getAttribute("aria-invalid")).toBe("true");
	});

	test("doc-lai: doi tieng khi o dang co chu thi doc theo tieng moi", () => {
		const k = dung({ locale: "vi", currency: "USD", value: "1.500,50" });
		expect(o(k).getAttribute("aria-invalid")).toBeNull();
		ve({ locale: "en", currency: "USD", value: "1.500,50" });
		expect(o(k).getAttribute("aria-invalid")).toBe("true");
		expect(dong(k).textContent).toContain("Vietnamese way");
	});

	test("doc-lai: kieu ban phim theo so chu so le", () => {
		const k = dung({ locale: "vi", currency: "VND", value: "" });
		expect(o(k).getAttribute("inputmode")).toBe("numeric");
		ve({ locale: "vi", currency: "USD", value: "" });
		expect(o(k).getAttribute("inputmode")).toBe("decimal");
		expect(o(k).getAttribute("placeholder")).toBe("150.000.000");
	});
});

describe("roi-o", () => {
	test("roi-o: doc duoc thi viet lai dau nghin, tu choi thi de nguyen", () => {
		const lech: string[] = [];
		const ca: { dat: Dat; chu: string; sau: string }[] = [
			{
				dat: { locale: "vi", currency: "VND", value: "" },
				chu: "150000000",
				sau: "150.000.000",
			},
			{
				dat: { locale: "vi", currency: "VND", value: "" },
				chu: "1.5",
				sau: "1.5",
			},
			{
				dat: { locale: "en", currency: "USD", value: "" },
				chu: "1500000.5",
				sau: "1,500,000.50",
			},
		];
		for (const c of ca) {
			const k = dung(c.dat);
			go(k, c.chu);
			daDoi = [];
			roi(k);
			const nhan = `roi o ${c.dat.locale}/${c.dat.currency}`;
			if (o(k).value !== c.sau) {
				lech.push(`${nhan}: «${o(k).value}» != «${c.sau}»`);
			}
			const muon = c.chu === c.sau ? [] : [c.sau];
			if (JSON.stringify(daDoi) !== JSON.stringify(muon)) {
				lech.push(
					`${nhan}: goi ${JSON.stringify(daDoi)} != ${JSON.stringify(muon)}`,
				);
			}
			act(() => root?.unmount());
			k.remove();
			root = null;
		}
		expect(lech).toEqual([]);
	});
});
