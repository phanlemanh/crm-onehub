import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import {
	applyMoves,
	type DealBoard,
} from "@/app/(app)/[slug]/deals/use-deal-board-move";
import { dealBoardOutput } from "../../api/src/deals/deals.contracts";

const stage = dealBoardOutput.shape.columns.element.shape.stage;

const fixture = z.object({
	cases: z.array(
		z.object({
			ten: z.string(),
			luot: z.array(z.object({ id: z.string(), from: stage, to: stage })),
			truoc: dealBoardOutput,
			sau: dealBoardOutput,
		}),
	),
});

const { cases } = fixture.parse(
	JSON.parse(
		readFileSync(
			join(import.meta.dir, "fixtures", "deals-board-sau-luu.json"),
			"utf8",
		),
	),
);

function ca(ten: string) {
	const found = cases.find((c) => c.ten === ten);
	if (!found) throw new Error(`fixture thieu ca ${ten}`);
	return found;
}

type Ca = {
	ten: string;
	truoc: DealBoard;
	sau: DealBoard;
	luot: {
		id: string;
		from: z.infer<typeof stage>;
		to: z.infer<typeof stage>;
	}[];
};

const MA_TRAN: Ca[] = [
	...[
		"the-duoc-tinh",
		"the-eur",
		"chua-quy-doi-that",
		"khong-so-tien",
		"cuoi-cung",
		"hai-luot",
		"cot-bi-cat",
	].map((ten) => ca(ten)),
	{
		ten: "mot-luot-da-tai",
		truoc: ca("the-duoc-tinh").sau,
		sau: ca("hai-luot").sau,
		luot: ca("hai-luot").luot,
	},
	{
		ten: "sau-tai-lai",
		truoc: ca("the-duoc-tinh").sau,
		sau: ca("the-duoc-tinh").sau,
		luot: ca("the-duoc-tinh").luot,
	},
];

const TRUONG = [
	["count", (c: DealBoard["columns"][number]) => c.count],
	["valueCents", (c: DealBoard["columns"][number]) => c.valueCents],
	["countedCount", (c: DealBoard["columns"][number]) => c.countedCount],
	[
		"unconverted.count",
		(c: DealBoard["columns"][number]) => c.unconverted.count,
	],
	[
		"currencies",
		(c: DealBoard["columns"][number]) => c.unconverted.currencies.join(","),
	],
] as const;

describe("dau-cot-khi-dang-luu", () => {
	test("applyMoves bang dau ra may chu that sau khi luu, moi ca moi cot", () => {
		expect(MA_TRAN.length).toBe(9);
		let khang = 0;
		let tapThe = 0;
		for (const c of MA_TRAN) {
			const moved = new Map(
				c.luot.map((l) => [l.id, { from: l.from, to: l.to }] as const),
			);
			const got = applyMoves(c.truoc.columns, moved);
			if (got.length !== c.sau.columns.length) {
				throw new Error(
					`ca ${c.ten}: ${got.length} cot != ${c.sau.columns.length}`,
				);
			}
			for (const want of c.sau.columns) {
				const col = got.find((x) => x.stage === want.stage);
				if (!col) throw new Error(`ca ${c.ten}: thieu cot ${want.stage}`);
				for (const [ten, doc] of TRUONG) {
					const a = doc(col);
					const b = doc(want);
					if (a !== b) {
						throw new Error(
							`ca ${c.ten}: cot ${want.stage} ${ten} ${a} != ${b}`,
						);
					}
					khang += 1;
				}
				if (
					col.count === col.cards.length &&
					want.count === want.cards.length
				) {
					const a = col.cards
						.map((x) => x.id)
						.sort()
						.join(",");
					const b = want.cards
						.map((x) => x.id)
						.sort()
						.join(",");
					if (a !== b) {
						throw new Error(`ca ${c.ten}: cot ${want.stage} tap the lech`);
					}
					tapThe += 1;
				}
			}
		}
		expect(khang).toBe(MA_TRAN.length * 7 * TRUONG.length);
		expect(tapThe).toBe(MA_TRAN.length * 7 - 1);
	});

	test("khong co luot doi thi tra nguyen du lieu", () => {
		const truoc = ca("the-duoc-tinh").truoc.columns;
		expect(applyMoves(truoc, new Map())).toBe(truoc);
	});
});
