import { describe, expect, test } from "bun:test";
import {
	krTheoKara,
	TIEN_TO_VET_KARA,
	type VetTen,
} from "../src/okr-theo-kara";

const vet = (
	at: string,
	keyResultId: string | null,
	truoc: string,
	sau: string,
	note: string | null,
): VetTen => ({
	at,
	keyResultId,
	note,
	before: { title: truoc },
	after: { title: sau },
});

const kara = `${TIEN_TO_VET_KARA}dx-1`;

const MA_TRAN: readonly {
	ten: string;
	trail: VetTen[];
	ky: readonly string[];
}[] = [
	{
		ten: "kara-doi-ten",
		trail: [vet("2026-10-01T01:00:00Z", "kr1", "A", "B", kara)],
		ky: ["kr1"],
	},
	{
		ten: "kara-roi-nguoi-sua",
		trail: [
			vet("2026-10-01T01:00:00Z", "kr1", "A", "B", kara),
			vet("2026-10-01T02:00:00Z", "kr1", "B", "C", null),
		],
		ky: [],
	},
	{
		ten: "chi-nguoi-sua",
		trail: [vet("2026-10-01T01:00:00Z", "kr2", "A", "B", null)],
		ky: [],
	},
	{
		ten: "kara-khong-doi-ten",
		trail: [
			{
				at: "2026-10-01T01:00:00Z",
				keyResultId: "kr1",
				note: kara,
				before: { title: "A", targetValue: 1 },
				after: { title: "A", targetValue: 2 },
			},
		],
		ky: [],
	},
	{
		ten: "nguoi-roi-kara-khong-theo-thu-tu-mang",
		trail: [
			vet("2026-10-01T03:00:00Z", "kr3", "B", "C", kara),
			vet("2026-10-01T02:00:00Z", "kr3", "A", "B", null),
		],
		ky: ["kr3"],
	},
	{
		ten: "vet-muc-tieu-khong-tinh",
		trail: [vet("2026-10-01T01:00:00Z", null, "A", "B", kara)],
		ky: [],
	},
];

describe("krTheoKara", () => {
	for (const ca of MA_TRAN) {
		test(ca.ten, () => {
			expect([...krTheoKara(ca.trail)].sort()).toEqual([...ca.ky].sort());
		});
	}

	test("so ca bang ma tran viet truoc", () => {
		expect(MA_TRAN.length).toBe(6);
	});

	test("chieu do: ban nhin vet kara dau tien thay vi cuoi cung", () => {
		const dauTien = (trail: readonly VetTen[]): ReadonlySet<string> => {
			const tap = new Set<string>();
			for (const v of trail) {
				if (v.keyResultId && v.note?.startsWith(TIEN_TO_VET_KARA))
					tap.add(v.keyResultId);
			}
			return tap;
		};
		const ca = MA_TRAN[1];
		if (!ca) throw new Error("thieu ca kara-roi-nguoi-sua");
		const sai = dauTien(ca.trail);
		const loi = sai.has("kr1")
			? "dau theo kara con sau khi sua tay: KR1"
			: "khong phan biet";
		expect(loi).toBe("dau theo kara con sau khi sua tay: KR1");
		expect(krTheoKara(ca.trail).has("kr1")).toBe(false);
	});
});
