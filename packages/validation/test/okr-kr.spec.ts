import { describe, expect, test } from "bun:test";
import { docSoOkr, KIEU_KR, kiemSoTheoKieu, tienDoKr } from "../src/okr-kr";

const BANG: [string, number, number, number, number][] = [
	["tang-toi", 0, 40, 0, 0],
	["tang-toi", 0, 40, 17, 43],
	["tang-toi", 0, 40, 50, 100],
	["giam-xuong", 8, 2, 8, 0],
	["giam-xuong", 8, 2, 3.5, 75],
	["giam-xuong", 8, 2, 1, 100],
	["giu-tren", 0, 50, 49, 0],
	["giu-tren", 0, 50, 50, 100],
	["giu-tren", 0, 50, 90, 100],
	["giu-duoi", 0, 5, 6, 0],
	["giu-duoi", 0, 5, 5, 100],
	["giu-duoi", 0, 5, 1, 100],
	["moc", 0, 1, 0, 0],
	["moc", 0, 1, 1, 100],
	["moc", 0, 1, 3, 100],
	["phan-tram", 0, 100, 0, 0],
	["phan-tram", 0, 100, 37, 37],
	["phan-tram", 0, 100, 100, 100],
];

describe("okr-kr", () => {
	test("sau kieu, ba gia tri moi kieu = 18 khang dinh", () => {
		expect(KIEU_KR).toHaveLength(6);
		for (const [kieu, khoi, dich, hien, mong] of BANG) {
			expect(
				`${kieu} ${hien} -> ${tienDoKr(kieu as never, khoi, dich, hien)}`,
			).toBe(`${kieu} ${hien} -> ${mong}`);
		}
	});

	test("rang buoc theo kieu", () => {
		expect(kiemSoTheoKieu("tang-toi", 10, 10)).toBe(
			"dich-phai-lon-hon-khoi-diem",
		);
		expect(kiemSoTheoKieu("giam-xuong", 2, 8)).toBe(
			"dich-phai-nho-hon-khoi-diem",
		);
		expect(kiemSoTheoKieu("phan-tram", 0, 101)).toBe("phan-tram-ngoai-0-100");
		expect(kiemSoTheoKieu("giu-tren", 0, 50)).toBeNull();
		expect(kiemSoTheoKieu("moc", 0, 1)).toBeNull();
	});
});

describe("docSoOkr", () => {
	test("doc so kieu Viet giong het bang nhap", () => {
		expect(docSoOkr("1.500")).toBe(1500);
		expect(docSoOkr("1.250,5")).toBe(1250.5);
		expect(docSoOkr("3.5")).toBe(3.5);
		expect(docSoOkr("3,5")).toBe(3.5);
		expect(docSoOkr("1.250.000")).toBe(1250000);
		expect(docSoOkr("-12.500")).toBe(-12500);
		expect(docSoOkr("")).toBeNull();
		expect(docSoOkr("   ")).toBeNull();
		expect(docSoOkr("abc")).toBeNull();
		expect(docSoOkr("1e13")).toBeNull();
	});
});
