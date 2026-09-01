import { describe, expect, it } from "bun:test";
import { resolveLocale } from "../lib/locale/resolve";

describe("resolveLocale", () => {
	it("lấy cookie khi cookie hợp lệ", () => {
		expect(resolveLocale("vi", "en-US,en;q=0.9")).toBe("vi");
	});

	it("lựa chọn đã lưu thắng ngôn ngữ trình duyệt", () => {
		expect(resolveLocale("en", "vi-VN,vi;q=0.9")).toBe("en");
	});

	it("chưa chọn thì lấy theo trình duyệt", () => {
		expect(resolveLocale(undefined, "vi-VN,vi;q=0.9")).toBe("vi");
	});

	it("chưa chọn và trình duyệt tiếng Anh thì ra en", () => {
		expect(resolveLocale(undefined, "en-US,en;q=0.9")).toBe("en");
	});

	it("trình duyệt xếp hạng: en đứng trước vi thì ra en", () => {
		expect(resolveLocale(undefined, "vi;q=0.3,en;q=0.9")).toBe("en");
	});

	it("cookie hỏng thì rơi về en, không ném lỗi", () => {
		expect(resolveLocale("zz-ZZ-nonsense", "vi-VN")).toBe("en");
	});

	it("không cookie, không header thì ra en", () => {
		expect(resolveLocale(undefined, undefined)).toBe("en");
	});
});
