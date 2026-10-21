import { describe, expect, test } from "bun:test";
import type { Locale } from "@crm/ui/lib/locale";
import {
	type DocNhap,
	docSoNhap,
	hienThiSo,
} from "../components/crm/fields/doc-nhap";

type ODocSo = {
	locale: Locale;
	chuoi: string;
	ket: DocNhap<number>;
};

const MA_TRAN_DOC_SO: ODocSo[] = [
	{ locale: "vi", chuoi: "1.234,5", ket: { kind: "ok", giaTri: 1234.5 } },
	{ locale: "vi", chuoi: "1234,5", ket: { kind: "ok", giaTri: 1234.5 } },
	{ locale: "vi", chuoi: "-2,75", ket: { kind: "ok", giaTri: -2.75 } },
	{ locale: "vi", chuoi: "1.234.567", ket: { kind: "ok", giaTri: 1234567 } },
	{ locale: "vi", chuoi: "0,000123", ket: { kind: "ok", giaTri: 0.000123 } },
	{ locale: "vi", chuoi: "", ket: { kind: "rong" } },
	{ locale: "vi", chuoi: "abc", ket: { kind: "tu-choi", ma: "so" } },
	{ locale: "vi", chuoi: "1234.5", ket: { kind: "tu-choi", ma: "locale-khac" } },
	{
		locale: "vi",
		chuoi: "1,234.5",
		ket: { kind: "tu-choi", ma: "locale-khac" },
	},
	{ locale: "en", chuoi: "1,234.5", ket: { kind: "ok", giaTri: 1234.5 } },
	{
		locale: "en",
		chuoi: "1.234,5",
		ket: { kind: "tu-choi", ma: "locale-khac" },
	},
	{ locale: "en", chuoi: "-3", ket: { kind: "ok", giaTri: -3 } },
	{ locale: "vi", chuoi: "  1.234,5  ", ket: { kind: "ok", giaTri: 1234.5 } },
];

const MA_TRAN_HIEN_SO: { locale: Locale; so: number; chu: string }[] = [
	{ locale: "vi", so: 1234.5, chu: "1.234,5" },
	{ locale: "en", so: 1234.5, chu: "1,234.5" },
	{ locale: "vi", so: 0.000123, chu: "0,000123" },
	{ locale: "vi", so: 0.0000001, chu: "0,0000001" },
];

describe("tmc-doc-so", () => {
	test("doc so theo locale: ma tran viet truoc", () => {
		let daSo = 0;
		for (const o of MA_TRAN_DOC_SO) {
			const ra = docSoNhap(o.chuoi, o.locale);
			if (JSON.stringify(ra) !== JSON.stringify(o.ket)) {
				throw new Error(
					`tmc doc so: ${o.locale} ${o.chuoi} ra ${JSON.stringify(ra)}`,
				);
			}
			daSo += 1;
		}
		if (daSo !== MA_TRAN_DOC_SO.length) {
			throw new Error(`tmc doc so: thieu o ${daSo}`);
		}
		expect(daSo).toBe(13);
	});

	test("hien so theo locale, khong lam tron", () => {
		let daSo = 0;
		for (const o of MA_TRAN_HIEN_SO) {
			const chu = hienThiSo(o.so, o.locale);
			if (chu !== o.chu) {
				throw new Error(`tmc hien so: ${o.locale} ${o.so} ra ${chu}`);
			}
			daSo += 1;
		}
		expect(daSo).toBe(4);
	});
});
