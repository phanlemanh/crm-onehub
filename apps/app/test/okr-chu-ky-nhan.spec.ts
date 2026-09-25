import { describe, expect, test } from "bun:test";
import { okrMessages } from "@/lib/messages/okr";
import { canNhanLoai, goiYChuKy, homNayVn } from "@/lib/okr-chu-ky-nhan";

const vi = okrMessages("vi");
const en = okrMessages("en");

describe("nhan-loai", () => {
	const MA_TRAN = [
		["vi", "Quý 3/2026", "quy", false],
		["vi", "quý 3", "quy", false],
		["vi", "Năm 2026", "nam", false],
		["vi", "Lượt đo", "quy", true],
		["vi", "Năm 2026", "quy", true],
		["en", "Q4 2026", "quy", true],
		["en", "Quarter 4", "quy", false],
		["en", "2026", "nam", true],
	] as const;

	for (const [tieng, ten, loai, can] of MA_TRAN)
		test(`${tieng} «${ten}» ${loai} -> ${can ? "kem nhan" : "khong nhan"}`, () => {
			const m = tieng === "vi" ? vi : en;
			expect(canNhanLoai(ten, m.loaiChuKy[loai], tieng)).toBe(can);
		});

	test("ma tran du 8 ca", () => {
		expect(MA_TRAN.length).toBe(8);
	});
});

describe("goi-y", () => {
	const MA_TRAN = [
		["2026-09-25", 2026, 4, 2026],
		["2026-10-26", 2026, 1, 2027],
		["2026-12-31", 2026, 1, 2027],
		["2027-01-01", 2027, 2, 2027],
		["2026-03-31", 2026, 2, 2026],
		["2026-04-01", 2026, 3, 2026],
	] as const;

	for (const [ngay, nam, so, namQuy] of MA_TRAN)
		test(`goiYChuKy ${ngay} -> Năm ${nam}, Quý ${so}/${namQuy}`, () => {
			expect(goiYChuKy(ngay)).toEqual({ nam, quy: { so, nam: namQuy } });
		});

	test("homNayVn 2026-12-31T17:30Z la 2027-01-01 gio Viet Nam", () => {
		expect(homNayVn(new Date("2026-12-31T17:30:00Z"))).toBe("2027-01-01");
	});

	test("homNayVn 2026-12-31T16:59Z con la 2026-12-31 gio Viet Nam", () => {
		expect(homNayVn(new Date("2026-12-31T16:59:00Z"))).toBe("2026-12-31");
	});

	test("chuoi goi y vi va en", () => {
		const g = goiYChuKy("2026-09-25");
		expect(vi.caiDat.mo.tenGoiY.nam(g.nam)).toBe("Năm 2026");
		expect(vi.caiDat.mo.tenGoiY.quy(g.quy.so, g.quy.nam)).toBe("Quý 4/2026");
		expect(en.caiDat.mo.tenGoiY.nam(g.nam)).toBe("2026");
		expect(en.caiDat.mo.tenGoiY.quy(g.quy.so, g.quy.nam)).toBe("Q4 2026");
	});
});
