import { describe, expect, test } from "bun:test";
import {
	cachLocTruong,
	FIELD_TYPES,
	LOC_THEO_KIEU,
	locDuocTrong,
} from "@crm/db/fields-shape";
import {
	LocTruongError,
	laGiaTriHopLe,
	phanTichLocTruong,
} from "../src/bo-loc-truong";

describe("bo-loc-truong", () => {
	test("bang co dung mot dong cho moi kieu", () => {
		expect(Object.keys(LOC_THEO_KIEU).sort()).toEqual([...FIELD_TYPES].sort());
		expect(cachLocTruong("TEXT")).toBe("chua");
		expect(cachLocTruong("PHONE")).toBe("chua");
		expect(cachLocTruong("NUMBER")).toBe("khoang");
		expect(cachLocTruong("DATE")).toBe("moc");
		expect(cachLocTruong("CHECKBOX")).toBe("tich");
		expect(cachLocTruong("SELECT")).toBe("luaChon");
		expect(cachLocTruong("USER")).toBe("nguoi");
		expect(locDuocTrong("CHECKBOX")).toBe(false);
		expect(locDuocTrong("TEXT")).toBe(true);
	});

	test("doc dung moi cach loc", () => {
		expect(phanTichLocTruong("chua", ["has:Lmt", "none"])).toEqual({
			cach: "chua",
			chu: ["Lmt"],
			trong: true,
		});
		expect(phanTichLocTruong("khoang", ["gte:5", "lte:20.5"])).toEqual({
			cach: "khoang",
			tu: 5,
			den: 20.5,
			trong: false,
		});
		expect(phanTichLocTruong("khoang", ["lte:-3"])).toEqual({
			cach: "khoang",
			tu: null,
			den: -3,
			trong: false,
		});
		expect(phanTichLocTruong("moc", ["this-month", "none"])).toEqual({
			cach: "moc",
			moc: ["this-month"],
			trong: true,
		});
		expect(phanTichLocTruong("tich", ["yes", "no"])).toEqual({
			cach: "tich",
			co: [true, false],
		});
		expect(phanTichLocTruong("luaChon", ["opt_1", "none"])).toEqual({
			cach: "luaChon",
			id: ["opt_1"],
			trong: true,
		});
		expect(phanTichLocTruong("chua", ["has:a:b"])).toEqual({
			cach: "chua",
			chu: ["a:b"],
			trong: false,
		});
	});

	test("gia tri sai cu phap thi nem", () => {
		const hong: Array<[Parameters<typeof phanTichLocTruong>[0], string]> = [
			["chua", "has:"],
			["chua", "has:   "],
			["chua", "abc"],
			["khoang", "gte:abc"],
			["khoang", "gte:"],
			["khoang", "between:1"],
			["moc", "tomorrow"],
			["moc", "has:x"],
			["tich", "maybe"],
			["tich", "none"],
			["luaChon", ""],
		];
		for (const [cach, gia] of hong) {
			expect(() => phanTichLocTruong(cach, [gia])).toThrow(LocTruongError);
			expect(laGiaTriHopLe(cach, gia)).toBe(false);
		}
		expect(laGiaTriHopLe("khoang", "gte:1234.5")).toBe(true);
	});
});
