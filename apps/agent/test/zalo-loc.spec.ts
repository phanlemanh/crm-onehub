import { describe, expect, test } from "bun:test";
import { ZALO } from "../agent/lib/zalo-config";
import { locTraLoi } from "../agent/lib/zalo-loc";

const PHAI_CHE = [
	"0912 345 678",
	"0912.345.678",
	"0912345678",
	"+84 912 345 678",
	"+84912345678",
	"(+84) 912-345-678",
	"a.b@congty.vn",
	"<a@b.com>",
	"A.B@Gmail.COM",
	"093 4567 890",
	"gọi 0912345678 nhé",
];

const GIU_NGUYEN = [
	"1.500.000",
	"2026",
	"TT-2026-001",
	"482913",
	"26/09/2026",
	"12%",
];

const CHU_SO_LIEN = /\d{9,}/;
const CHU_SO_CACH = /\d[\s.-]\d{3}[\s.-]\d{3}/;

function doanDai(so: number, dai: number): string {
	return Array.from({ length: so }, (_, i) =>
		`Đoạn ${i + 1}. ${"chữ ".repeat(dai)}`.trim(),
	).join("\n\n");
}

function motDoan(dai: number): string {
	return "Câu dài không xuống dòng ".repeat(Math.ceil(dai / 25)).slice(0, dai);
}

function kiemTran(phan: string[]): void {
	expect(phan.length).toBeGreaterThanOrEqual(1);
	expect(phan.length).toBeLessThanOrEqual(ZALO.hoi.toiDaTin);
	expect(Math.max(...phan.map((p) => p.length))).toBeLessThanOrEqual(
		ZALO.tranKyTu,
	);
}

describe("loc-che", () => {
	test("loc-che: ma tran phai che du phan tu", () => {
		expect(PHAI_CHE.length).toBe(11);
	});
	test.each(PHAI_CHE)("loc-che: %s", (s) => {
		const ra = locTraLoi(`Liên hệ ${s} để biết thêm`);
		const noi = ra.join("");
		expect(noi).toContain(ZALO.hoi.an);
		expect(noi).not.toMatch(CHU_SO_LIEN);
		expect(noi).not.toMatch(CHU_SO_CACH);
		expect(noi).not.toContain("@");
		kiemTran(ra);
	});
});

describe("loc-giu", () => {
	test("loc-giu: ma tran giu nguyen du phan tu", () => {
		expect(GIU_NGUYEN.length).toBe(6);
	});
	test.each(GIU_NGUYEN)("loc-giu: %s", (s) => {
		const vao = `Giá trị ${s} ở đây`;
		expect(locTraLoi(vao)).toEqual([vao]);
	});
});

describe("loc-cat", () => {
	test("loc-cat: van ban ngan giu mot tin", () => {
		expect(locTraLoi("Chào bạn.")).toEqual(["Chào bạn."]);
	});

	test("loc-cat: muoi hai doan 5000 ky tu cat o ranh doan", () => {
		const vao = doanDai(12, 130);
		expect(vao.length).toBeGreaterThan(5000);
		const ra = locTraLoi(vao);
		kiemTran(ra);
		for (const phan of ra.slice(0, -1)) {
			expect(phan.endsWith(ZALO.hoi.luoc)).toBe(false);
			expect(vao).toContain(phan);
		}
		expect(ra.at(-1)?.endsWith(ZALO.hoi.luoc)).toBe(true);
	});

	test("loc-cat: mot doan 2500 ky tu khong xuong dong khong vuot tran", () => {
		const vao = motDoan(2500);
		const ra = locTraLoi(vao);
		kiemTran(ra);
		expect(ra.length).toBe(2);
		expect(
			ra.join("").replaceAll(ZALO.hoi.luoc, "").length,
		).toBeLessThanOrEqual(vao.length);
	});

	test("loc-cat: bang markdown thanh dong cham", () => {
		const ra = locTraLoi("| Công ty | Giai đoạn |\n|---|---|\n| Acme | Chốt |");
		expect(ra).toEqual(["Công ty · Giai đoạn\nAcme · Chốt"]);
	});
});
