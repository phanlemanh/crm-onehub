import { describe, expect, test } from "bun:test";
import { quaHan } from "@/lib/qua-han";

const HOM_NAY = new Date(2026, 8, 22, 23, 30);

const MA_TRAN: [string, Date, boolean][] = [
	["han hom qua 2026-09-21", new Date("2026-09-21T00:00:00.000Z"), true],
	["han hom nay 2026-09-22", new Date("2026-09-22T00:00:00.000Z"), false],
	["han ngay mai 2026-09-23", new Date("2026-09-23T00:00:00.000Z"), false],
];

describe("qua-han-theo-ngay", () => {
	test("ma tran ba dong viet truoc, so ngay lich chu khong so gio", () => {
		expect(MA_TRAN.length).toBe(3);
		for (const [ten, han, mong] of MA_TRAN) {
			expect(quaHan(han, null, HOM_NAY), `${ten}: mong ${mong}`).toBe(mong);
		}
	});

	test("buoc da xong thi khong qua han du han hom qua", () => {
		expect(
			quaHan(new Date("2026-09-21T00:00:00.000Z"), new Date(), HOM_NAY),
		).toBe(false);
	});
});
