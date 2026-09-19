import { describe, expect, test } from "bun:test";
import { UNGATED } from "../proxy";

const PHAI_CO = [
	"/grant-access",
	"/eve",
	"/het-quyen",
	"/dat-mat-khau",
] as const;

describe("duong-mo", () => {
	test("tap duong ngoai cong bang DUNG bon phan tu da ghim", () => {
		const thuc = new Set(UNGATED);
		const ghim = new Set<string>(PHAI_CO);

		const thua = [...thuc].filter((p) => !ghim.has(p));
		const thieu = [...ghim].filter((p) => !thuc.has(p));

		expect({ thua, thieu }).toEqual({ thua: [], thieu: [] });
		expect(thuc.size).toBe(PHAI_CO.length);
	});
});
