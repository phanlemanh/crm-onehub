import { describe, expect, test } from "bun:test";
import { ANONYMOUS, isAnonymous } from "../lib/proxy-paths";

describe("đường ẩn danh của proxy", () => {
	test("danh sách dài đúng ba mục", () => {
		expect([...ANONYMOUS].sort()).toEqual(["/dat-mat-khau", "/proto", "/t"]);
	});

	test("nhánh proto đi qua", () => {
		expect(isAnonymous("/proto")).toBe(true);
		expect(isAnonymous("/proto/duong-proto")).toBe(true);
	});

	test("nhánh dat-mat-khau đi qua — người chưa đăng nhập vẫn mở được liên kết", () => {
		expect(isAnonymous("/dat-mat-khau")).toBe(true);
		expect(isAnonymous("/dat-mat-khau/mot-token-bat-ky")).toBe(true);
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
