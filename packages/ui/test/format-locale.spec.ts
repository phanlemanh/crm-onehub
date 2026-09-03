import { describe, expect, it } from "bun:test";
import {
	formatCount,
	formatDay,
	formatMoney,
	formatMoneyCompact,
	formatPercent,
} from "../src/lib/format";

describe("định dạng theo ngôn ngữ", () => {
	it("ngày: hai ngôn ngữ, hai kết quả ghim sẵn", () => {
		expect(formatDay("2026-09-01", "en")).toBe("Sep 1, 2026");
		expect(formatDay("2026-09-01", "vi")).toBe("1 thg 9, 2026");
	});

	it("tiền: dấu ngăn nghìn, vị trí ký hiệu, và dấu cách không ngắt dòng", () => {
		expect(formatMoney(123456, "usd", "en")).toBe("$1,234.56");
		expect(formatMoney(123456, "usd", "vi")).toBe("1.234,56\u00A0US$");
	});

	it("tiền gọn: đơn vị rút gọn đổi theo tiếng", () => {
		expect(formatMoneyCompact(123456789, "usd", "en")).toBe("$1.2M");
		expect(formatMoneyCompact(123456789, "usd", "vi")).toBe(
			"1,2\u00A0Tr\u00A0US$",
		);
	});

	it("phần trăm: cùng chữ số, nhưng đi qua đúng ngôn ngữ", () => {
		expect(formatPercent(0.125, "en")).toBe("13%");
		expect(formatPercent(0.125, "vi")).toBe("13%");
	});

	it("đếm: tiếng Anh đổi dạng số nhiều, tiếng Việt thì không", () => {
		expect(formatCount(1, "company", "en", "companies")).toBe("1 company");
		expect(formatCount(3, "company", "en", "companies")).toBe("3 companies");
		expect(formatCount(1, "công ty", "vi", "công ty")).toBe("1 công ty");
		expect(formatCount(3, "công ty", "vi", "công ty")).toBe("3 công ty");
	});

	it("không còn mặc định: mọi chỗ gọi phải nói ra tiếng của nó", () => {
		expect(formatDay("2026-09-01", "en")).toBe("Sep 1, 2026");
		expect(formatMoney(123456, "usd", "en")).toBe("$1,234.56");
	});

	it("số nhiều mặc định chỉ dựng ở tiếng Anh, không dựng ở tiếng Việt", () => {
		expect(formatCount(3, "deal", "en")).toBe("3 deals");
		expect(formatCount(1, "deal", "en")).toBe("1 deal");
		expect(formatCount(3, "thoả thuận", "vi")).toBe("3 thoả thuận");
	});
});
