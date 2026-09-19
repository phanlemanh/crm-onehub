import { describe, expect, it } from "bun:test";
import { authMessages } from "@/lib/messages/auth";

describe("kho chuoi cua vao", () => {
	it("ba tieu de tai lieu khac nhau giua hai thu tieng", () => {
		const en = authMessages("en").docTitle;
		const vi = authMessages("vi").docTitle;
		for (const khoa of ["signIn", "onboarding", "research"] as const) {
			expect(vi[khoa]).not.toBe(en[khoa]);
		}
	});

	it("nhan nut ghep dong, khong duc san mot cau tron", () => {
		const vi = authMessages("vi").signIn;
		const en = authMessages("en").signIn;
		expect(vi.continueWith("Đất Xanh")).toContain("Đất Xanh");
		expect(vi.continueWith("Đất Xanh")).not.toBe(en.continueWith("Đất Xanh"));
	});

	it("chu luc dang gui khac chu luc thuong, o ca hai thu tieng", () => {
		for (const tieng of ["en", "vi"] as const) {
			const m = authMessages(tieng);
			expect(m.signIn.signingIn).not.toBe(m.signIn.continueWith("X"));
			expect(m.onboarding.submitting).not.toBe(m.onboarding.submit);
			expect(m.research.submitting).not.toBe(m.research.submit);
		}
	});

	it("cau bao loi du phong noi nguoi dung lam gi tiep", () => {
		const vi = authMessages("vi").signIn.error.unreachable;
		expect(vi.length).toBeGreaterThan(
			authMessages("en").signIn.error.unreachable.length / 2,
		);
		expect(vi).toMatch(/thử lại|kiểm tra/i);
	});
});
