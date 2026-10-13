import { describe, expect, test } from "bun:test";
import { homNayVN, quaHanTheoNgayVN } from "../src/ngay-vn";

const BANG = [
	{ luc: "2026-10-12T17:00:00Z", han: "2026-10-12", quaHan: true },
	{ luc: "2026-10-12T17:00:00Z", han: "2026-10-13", quaHan: false },
	{ luc: "2026-10-12T16:59:59Z", han: "2026-10-12", quaHan: false },
	{ luc: "2026-10-12T16:59:59Z", han: "2026-10-11", quaHan: true },
] as const;

describe("ngay-vn", () => {
	test("homNayVN doi ngay dung nua dem gio Viet Nam", () => {
		expect(homNayVN(new Date("2026-10-12T16:59:59Z"))).toBe("2026-10-12");
		expect(homNayVN(new Date("2026-10-12T17:00:00Z"))).toBe("2026-10-13");
	});

	for (const { luc, han, quaHan } of BANG) {
		test(`han ${han} luc ${luc} -> ${quaHan ? "qua han" : "chua"}`, () => {
			expect(
				quaHanTheoNgayVN(han, new Date(luc)),
				`bien nua dem VN: han ${han} luc ${luc}`,
			).toBe(quaHan);
		});
	}
});
