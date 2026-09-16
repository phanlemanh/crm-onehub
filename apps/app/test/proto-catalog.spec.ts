import { describe, expect, test } from "bun:test";
import { PROTO_CATALOG } from "../app/proto/catalog";

describe("sổ đăng ký proto", () => {
	test("có ít nhất một proto", () => {
		expect(PROTO_CATALOG.length).toBeGreaterThan(0);
	});

	test("proto mẫu (slug bằng slug hồ sơ) khai đúng năm state", () => {
		const mau = PROTO_CATALOG.find(
			(muc) => muc.slug === "duong-proto-cho-design-pass",
		);
		expect(mau).toBeDefined();
		expect(mau?.states.map((s) => s.id)).toEqual([
			"mac-dinh",
			"rong",
			"dang-tai",
			"loi",
			"tran-dai",
		]);
	});

	test("mọi mục có slug, tên và state id duy nhất", () => {
		for (const muc of PROTO_CATALOG) {
			expect(muc.slug).not.toBe("");
			expect(muc.ten).not.toBe("");
			expect(muc.states.length).toBeGreaterThan(0);
			const ids = muc.states.map((s) => s.id);
			expect(new Set(ids).size).toBe(ids.length);
		}
	});
});
