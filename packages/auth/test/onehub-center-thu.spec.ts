import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { THU_MAT_KHAU } from "../src/thu-mat-khau";

const AUTH = readFileSync(
	join(import.meta.dir, "..", "src", "auth.ts"),
	"utf8",
);

describe("thu va ten ung dung", () => {
	it("tieu de thu dat lai", () => {
		expect(THU_MAT_KHAU.xin.tieuDe).toBe("Đặt lại mật khẩu OneHub Center");
	});

	it("tieu de thu da doi", () => {
		expect(THU_MAT_KHAU.daDoi.tieuDe).toBe(
			"Mật khẩu OneHub Center vừa được đổi",
		);
	});

	it("appName", () => {
		expect(AUTH).toContain('appName: "OneHub Center"');
	});

	it("chuoi phan loai loi khong doi", () => {
		expect(AUTH, "chuoi phan loai loi doi").toMatch(
			/`This CRM is private\. Sign in with your @\$\{domain\} account\.`/,
		);
		expect(AUTH, "chuoi phan loai loi doi").toContain(
			'"This CRM is private. That address is not on the allow-list."',
		);
	});
});
