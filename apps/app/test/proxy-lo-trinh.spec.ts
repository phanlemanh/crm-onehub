import { describe, expect, test } from "bun:test";
import { NextRequest } from "next/server";
import { proxy } from "../proxy";

describe("lo-trinh: proxy", () => {
	test("lo-trinh: chua dang nhap thi ve trang dang nhap", async () => {
		for (const duong of ["/onehub/lo-trinh", "/lo-trinh"]) {
			const tra = await proxy(new NextRequest(`http://localhost${duong}`));
			expect(tra.status, duong).toBe(307);
			expect(new URL(tra.headers.get("location") ?? "").pathname, duong).toBe(
				"/sign-in",
			);
		}
	});
});
