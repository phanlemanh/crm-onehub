import { describe, expect, test } from "bun:test";
import {
	docSoDienThoai,
	hienThiSoDienThoai,
	soQuocNoi,
	soQuocNoiDeTim,
} from "../src/so-dien-thoai";

const DOC_SO: [string, string][] = [
	["0901 234 567", "ok +84901234567"],
	["0901.234.567", "ok +84901234567"],
	["(+84) 901-234-567", "ok +84901234567"],
	["84901234567", "ok +84901234567"],
	["+84901234567", "ok +84901234567"],
	["028 3812 3456", "ok +842838123456"],
	["+65 6123 4567", "ok +6561234567"],
	["", "rong"],
	["   ", "rong"],
	["abc", "sai"],
	["12345", "sai"],
	["0901 234 56", "sai"],
	["+84 12", "sai"],
	["1234567890123456", "sai"],
];

const HIEN_SO: [string, string][] = [
	["+84901234567", "0901 234 567"],
	["0901.234.567", "0901 234 567"],
	["+842838123456", "028 3812 3456"],
	["+6561234567", "+6561234567"],
	["máy lẻ 123", "máy lẻ 123"],
];

const MANH_TIM: [string, string | null][] = [
	["0901234567", "901234567"],
	["+84 901 234 567", "901234567"],
	["234 567", "234567"],
	["12", null],
	["Lan 0901", null],
];

function tomTat(raw: string): string {
	const doc = docSoDienThoai(raw);
	return doc.kind === "ok" ? `ok ${doc.so}` : doc.kind;
}

describe("doc-so", () => {
	test("ma tran viet truoc du 14 dong", () => {
		expect(DOC_SO.length).toBe(14);
	});

	for (const [vao, ra] of DOC_SO) {
		test(`doc-so: ${JSON.stringify(vao)}`, () => {
			expect(`doc-so: ${vao} -> ${tomTat(vao)}`).toBe(
				`doc-so: ${vao} -> ${ra}`,
			);
		});
	}
});

describe("hien-so", () => {
	test("ma tran viet truoc du 5 dong", () => {
		expect(HIEN_SO.length).toBe(5);
	});

	for (const [vao, ra] of HIEN_SO) {
		test(`hien-so: ${vao}`, () => {
			expect(`hien-so: ${vao} -> ${hienThiSoDienThoai(vao)}`).toBe(
				`hien-so: ${vao} -> ${ra}`,
			);
		});
	}
});

describe("manh-tim", () => {
	test("ma tran viet truoc du 5 dong", () => {
		expect(MANH_TIM.length).toBe(5);
	});

	for (const [vao, ra] of MANH_TIM) {
		test(`manh-tim: ${vao}`, () => {
			expect(`manh-tim: ${vao} -> ${soQuocNoiDeTim(vao)}`).toBe(
				`manh-tim: ${vao} -> ${ra}`,
			);
		});
	}
});

describe("so-quoc-noi", () => {
	test("hai dang cua cung mot so co cung so quoc noi", () => {
		expect(soQuocNoi("+84901234567")).toBe("901234567");
		expect(soQuocNoi("0901.234.567")).toBe("901234567");
		expect(soQuocNoi("+6561234567")).toBe("6561234567");
	});
});
