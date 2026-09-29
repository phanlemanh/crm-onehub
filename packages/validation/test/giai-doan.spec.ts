import { describe, expect, test } from "bun:test";
import { nhanGiaiDoan, parseStageChangeMeta } from "../src/giai-doan";

describe("giai-doan validation", () => {
	test("nhan cat khoang trang va gioi han 40", () => {
		expect(nhanGiaiDoan.parse("  Đã ký  ")).toBe("Đã ký");
		expect(nhanGiaiDoan.safeParse("   ").success).toBe(false);
		expect(nhanGiaiDoan.safeParse("a".repeat(40)).success).toBe(true);
		expect(nhanGiaiDoan.safeParse("a".repeat(41)).success).toBe(false);
	});

	test("meta hong thanh null, meta dung giu nguyen", () => {
		expect(parseStageChangeMeta({ from: "A", to: "B" })).toEqual({
			from: "A",
			to: "B",
		});
		expect(parseStageChangeMeta({ from: null, to: "B" })).toEqual({
			from: null,
			to: "B",
		});
		expect(parseStageChangeMeta(null)).toBeNull();
		expect(parseStageChangeMeta({ foo: 1 })).toBeNull();
	});
});
