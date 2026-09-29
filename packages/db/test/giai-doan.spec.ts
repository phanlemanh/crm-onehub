import { describe, expect, test } from "bun:test";
import {
	GIAI_DOAN,
	GIAI_DOAN_GOC,
	laChotDuoc,
	laDaDong,
	laThua,
} from "../src/giai-doan";

describe("giai-doan", () => {
	test("ba loai va luat dong", () => {
		expect([...GIAI_DOAN.loai]).toEqual(["OPEN", "WON", "LOST"]);
		expect(GIAI_DOAN.loai.map(laDaDong)).toEqual([false, true, true]);
		expect(GIAI_DOAN.loai.map(laThua)).toEqual([false, false, true]);
		expect(GIAI_DOAN.loai.map(laChotDuoc)).toEqual([false, true, false]);
	});

	test("bay id goc", () => {
		expect(Object.keys(GIAI_DOAN_GOC)).toHaveLength(7);
		expect(Object.entries(GIAI_DOAN_GOC).every(([k, v]) => k === v)).toBe(true);
	});
});
