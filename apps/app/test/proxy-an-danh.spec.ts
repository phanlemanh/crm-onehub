import { describe, expect, test } from "bun:test";
import { ANONYMOUS, isAnonymous } from "../lib/proxy-paths";

describe("đường ẩn danh của proxy", () => {
	test("danh sách dài đúng hai mục", () => {
		expect([...ANONYMOUS].sort()).toEqual(["/proto", "/t"]);
	});

	test("nhánh proto đi qua", () => {
		expect(isAnonymous("/proto")).toBe(true);
		expect(isAnonymous("/proto/duong-proto")).toBe(true);
	});

	test("tiền tố giống nhưng khác đoạn thì KHÔNG ẩn danh", () => {
		expect(isAnonymous("/protoXYZ")).toBe(false);
		expect(isAnonymous("/proto-cu")).toBe(false);
	});

	test("phần còn lại vẫn đòi đăng nhập", () => {
		for (const duong of ["/settings", "/contacts", "/deals", "/"]) {
			expect(isAnonymous(duong)).toBe(false);
		}
	});
});
