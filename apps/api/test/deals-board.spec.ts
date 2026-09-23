import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { type DealStage, db } from "@crm/db";
import { CLOSED_DEAL_STAGES, OPEN_DEAL_STAGES } from "@crm/db/deal-stage";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { ActivityStampService } from "../src/crm/activity-stamp.service";
import { ConversionService } from "../src/currency/conversion.service";
import { DEAL_BOARD } from "../src/deals/deal-board-config";
import {
	type DealBoardInput,
	type DealBoardResult,
	dealBoardInput,
	dealListInput,
} from "../src/deals/deals.contracts";
import { DealsService } from "../src/deals/deals.service";
import { FieldsService } from "../src/fields/fields.service";
import { withDiscardedCrmEvents } from "./agent-trigger.stub";

const suffix = process.env.TEST_RUN_ID ?? "deals-board-spec";
const domain = `deals-board-${suffix}.test`;
const ownerA = `user-board-a-${suffix}`;
const ownerB = `user-board-b-${suffix}`;
const ownerC = `user-board-c-${suffix}`;
const fieldKey = `board_nguoi_${suffix}`.replace(/[^a-z0-9_]/gi, "_");
const TOKEN = `kbtok${suffix}`.replace(/[^a-z0-9]/gi, "");
const FIXTURE_DIR = join(
	import.meta.dir,
	"..",
	"..",
	"app",
	"test",
	"fixtures",
);

const STAGES = [...OPEN_DEAL_STAGES, ...CLOSED_DEAL_STAGES] as DealStage[];

const agent = {
	withCrmEvents: withDiscardedCrmEvents,
} as unknown as AgentTriggerService;

const conversion = new ConversionService(db);
const deals = new DealsService(
	db,
	agent,
	new ActivityStampService(db),
	conversion,
	new FieldsService(db, { fieldBackfill: async () => undefined } as never),
);

type Seed = {
	name: string;
	stage: DealStage;
	owner: string;
	cents: number | null;
	counted: boolean;
	archived?: boolean;
	close?: Date | null;
	fieldUser?: string;
};

type Made = Seed & { id: string };

let companyId = "";
let base = "USD";
let fieldId = "";
const madeA: Made[] = [];

function other(currency: string) {
	return currency === "USD" ? "EUR" : "USD";
}

async function seed(rows: Seed[]): Promise<Made[]> {
	const made: Made[] = [];
	for (const [i, row] of rows.entries()) {
		const deal = await db.deal.create({
			data: {
				name: row.name,
				stage: row.stage,
				companyId,
				ownerId: row.owner,
				amount: row.cents === null ? null : row.cents / 100,
				currency: row.counted ? base : other(base),
				baseAmount: row.cents === null ? null : row.cents / 100,
				baseCurrency:
					row.cents === null ? null : row.counted ? base : other(base),
				archivedAt: row.archived ? new Date() : null,
				expectedCloseDate: row.close ?? null,
				createdAt: new Date(Date.UTC(2026, 0, 1, 0, 0, i)),
			},
			select: { id: true },
		});
		if (row.fieldUser) {
			await db.fieldValue.create({
				data: { fieldId, dealId: deal.id, userId: row.fieldUser },
			});
		}
		made.push({ ...row, id: deal.id });
	}
	return made;
}

function input(over: Partial<DealBoardInput>): DealBoardInput {
	return dealBoardInput.parse({ sort: "name", dir: "asc", ...over });
}

function column(board: DealBoardResult, stage: DealStage) {
	const found = board.columns.find((c) => c.stage === stage);
	if (!found) throw new Error(`thieu cot ${stage}`);
	return found;
}

function writeFixture(name: string, board: DealBoardResult) {
	const file = join(FIXTURE_DIR, name);
	mkdirSync(dirname(file), { recursive: true });
	writeFileSync(file, `${JSON.stringify(board, null, "\t")}\n`);
}

async function clean() {
	await db.deal.deleteMany({ where: { company: { domain } } });
	await db.company.deleteMany({ where: { domain } });
	await db.fieldDefinition.deleteMany({
		where: { entity: "DEAL", key: fieldKey },
	});
	await db.user.deleteMany({ where: { id: { in: [ownerA, ownerB, ownerC] } } });
}

beforeAll(async () => {
	await clean();
	base = await conversion.reportingCurrency();
	for (const id of [ownerA, ownerB, ownerC]) {
		await db.user.create({
			data: {
				id,
				name: id,
				email: `${id}@example.test`,
				emailVerified: true,
			},
		});
	}
	const company = await db.company.create({
		data: { name: `Board Co ${suffix}`, domain },
		select: { id: true },
	});
	companyId = company.id;
	const field = await db.fieldDefinition.create({
		data: {
			entity: "DEAL",
			key: fieldKey,
			label: "Người đi cùng",
			type: "USER",
			showOnFilter: true,
			position: 9999,
		},
		select: { id: true },
	});
	fieldId = field.id;

	madeA.push(
		...(await seed([
			{
				name: `A1 ${TOKEN}`,
				stage: "DEMO_BOOKED",
				owner: ownerA,
				cents: 100_00,
				counted: true,
				fieldUser: ownerB,
			},
			{
				name: "A2",
				stage: "DEMO_BOOKED",
				owner: ownerA,
				cents: 250_00,
				counted: true,
			},
			{
				name: "A3",
				stage: "DEMO_BOOKED",
				owner: ownerA,
				cents: 900_00,
				counted: false,
			},
			{
				name: "A4",
				stage: "DEMO_BOOKED",
				owner: ownerA,
				cents: 777_00,
				counted: true,
				archived: true,
			},
			{
				name: `A5 ${TOKEN}`,
				stage: "QUALIFIED_TO_BUY",
				owner: ownerA,
				cents: null,
				counted: true,
			},
			{
				name: "A6",
				stage: "CONTRACT_SENT",
				owner: ownerA,
				cents: 1_000_00,
				counted: true,
				close: new Date(Date.UTC(2030, 5, 1)),
			},
			{
				name: "A7",
				stage: "CONTRACT_SENT",
				owner: ownerA,
				cents: 50_00,
				counted: true,
				archived: true,
			},
			{
				name: "A8",
				stage: "CLOSED_WON",
				owner: ownerA,
				cents: 3_000_00,
				counted: true,
				fieldUser: ownerB,
			},
			{
				name: "A9",
				stage: "CLOSED_LOST",
				owner: ownerA,
				cents: 40_00,
				counted: true,
			},
			{
				name: "B1",
				stage: "DEMO_BOOKED",
				owner: ownerB,
				cents: 60_00,
				counted: true,
			},
			{
				name: `B2 ${TOKEN}`,
				stage: "DECISION_MAKER_BOUGHT_IN",
				owner: ownerB,
				cents: 70_00,
				counted: true,
			},
		])),
	);
});

afterAll(clean);

describe("deals.board", () => {
	it("dem-tong: bay cot, dem va tong lay tu fixture, bo luu tru", async () => {
		const board = await deals.board(input({ owner: [ownerA] }));
		expect(board.columns.map((c) => c.stage)).toEqual(STAGES);
		const mine = madeA.filter((d) => d.owner === ownerA && !d.archived);
		let checks = 0;
		for (const stage of STAGES) {
			const want = mine.filter((d) => d.stage === stage);
			const got = column(board, stage);
			if (got.count !== want.length) {
				throw new Error(`cot ${stage}: dem ${got.count} != ${want.length}`);
			}
			const wantCents = want
				.filter((d) => d.counted && d.cents !== null)
				.reduce((s, d) => s + (d.cents ?? 0), 0);
			const hasCounted = want.some((d) => d.counted && d.cents !== null);
			expect(got.valueCents).toBe(hasCounted ? wantCents : null);
			expect(new Set(got.cards.map((c) => c.id))).toEqual(
				new Set(want.map((d) => d.id)),
			);
			checks += 3;
		}
		expect(checks).toBe(STAGES.length * 3);
		expect(board.reportingCurrency).toBe(base);
		writeFixture("deals-board-dem-tong.json", board);
	});

	it("tran-50: 53 thoa thuan con 50 the theo thu tu cua list", async () => {
		const rows: Seed[] = Array.from({ length: 53 }, (_, i) => ({
			name: `C${String(i).padStart(2, "0")}`,
			stage: "QUALIFIED_TO_BUY",
			owner: ownerC,
			cents: 10_00,
			counted: true,
		}));
		const made = await seed(rows);
		const board = await deals.board(input({ owner: [ownerC] }));
		const col = column(board, "QUALIFIED_TO_BUY");
		expect(col.count).toBe(53);
		if (col.cards.length !== DEAL_BOARD.cardsPerColumn) {
			throw new Error(`tran cot: ${col.cards.length} the != 50`);
		}
		const list = await deals.list(
			dealListInput.parse({
				owner: [ownerC],
				stage: ["QUALIFIED_TO_BUY"],
				sort: "name",
				dir: "asc",
				pageSize: 100,
			}),
		);
		expect(col.cards.map((c) => c.id)).toEqual(
			list.rows.slice(0, 50).map((r) => r.id),
		);
		writeFixture("deals-board-tran-50.json", board);

		await db.deal.deleteMany({
			where: { id: { in: made.slice(50).map((d) => d.id) } },
		});
		const exact = column(
			await deals.board(input({ owner: [ownerC] })),
			"QUALIFIED_TO_BUY",
		);
		expect(exact.count).toBe(50);
		expect(exact.cards.length).toBe(50);
		await db.deal.deleteMany({ where: { ownerId: ownerC } });
	});

	it("cung-tap-voi-list: tung bo loc, tung cot khop deals.list", async () => {
		const both = [ownerA, ownerB];
		const cases: [string, Partial<DealBoardInput>][] = [
			["q", { q: TOKEN, owner: both }],
			["owner", { owner: [ownerB] }],
			["closing", { closing: ["none"], owner: both }],
			["fields", { fields: { [fieldKey]: [ownerB] }, owner: both }],
		];
		const countedIds = new Set(
			madeA.filter((d) => d.counted && d.cents !== null).map((d) => d.id),
		);
		let checks = 0;
		for (const [name, over] of cases) {
			const board = await deals.board(input(over));
			const list = await deals.list(
				dealListInput.parse({
					...over,
					sort: "name",
					dir: "asc",
					status: "all",
					archived: false,
					pageSize: 100,
				}),
			);
			for (const stage of STAGES) {
				const rows = list.rows.filter((r) => r.stage === stage);
				const got = column(board, stage);
				if (got.count !== rows.length) {
					throw new Error(
						`bo loc ${name}, cot ${stage}: dem ${got.count} != ${rows.length}`,
					);
				}
				const counted = rows.filter((r) => countedIds.has(r.id));
				const wantCents = counted.reduce(
					(s, r) => s + (r.baseAmountCents ?? 0),
					0,
				);
				if (got.valueCents !== (counted.length > 0 ? wantCents : null)) {
					throw new Error(
						`bo loc ${name}, cot ${stage}: tong ${got.valueCents} != ${wantCents}`,
					);
				}
				expect(new Set(got.cards.map((c) => c.id))).toEqual(
					new Set(rows.map((r) => r.id)),
				);
				checks += 3;
			}
		}
		expect(checks).toBe(4 * STAGES.length * 3);
	});

	it("tha-ghi-giai-doan: setStage roi board thay the o cot moi", async () => {
		const deal = madeA.find((d) => d.name === "A2");
		if (!deal) throw new Error("thieu A2");
		const before = await deals.board(input({ owner: [ownerA] }));
		const stamp = await db.deal.findUniqueOrThrow({
			where: { id: deal.id },
			select: { stageChangedAt: true },
		});
		await deals.setStage({ id: deal.id, stage: "CONTRACT_SENT" }, ownerA);
		const after = await deals.board(input({ owner: [ownerA] }));
		if (!column(after, "CONTRACT_SENT").cards.some((c) => c.id === deal.id)) {
			throw new Error("the khong o cot CONTRACT_SENT");
		}
		expect(column(after, "DEMO_BOOKED").count).toBe(
			column(before, "DEMO_BOOKED").count - 1,
		);
		expect(column(after, "CONTRACT_SENT").count).toBe(
			column(before, "CONTRACT_SENT").count + 1,
		);
		const row = await db.deal.findUniqueOrThrow({
			where: { id: deal.id },
			select: { stageChangedAt: true },
		});
		expect(row.stageChangedAt.getTime()).toBeGreaterThan(
			stamp.stageChangedAt.getTime(),
		);
		const activities = await db.activity.findMany({
			where: { dealId: deal.id, type: "STAGE_CHANGE" },
			select: { meta: true },
		});
		expect(activities).toEqual([
			{ meta: { from: "DEMO_BOOKED", to: "CONTRACT_SENT" } },
		]);

		await deals.setStage({ id: deal.id, stage: "CLOSED_WON" }, ownerA);
		const won = await db.deal.findUniqueOrThrow({
			where: { id: deal.id },
			select: { closedAt: true },
		});
		expect(won.closedAt).not.toBeNull();
		deal.stage = "CLOSED_WON";
	});

	it("thua-can-ly-do: khong ly do thi tu choi, co ly do thi ghi", async () => {
		const deal = madeA.find((d) => d.name === "A6");
		if (!deal) throw new Error("thieu A6");
		let rejected = false;
		try {
			await deals.setStage(
				{ id: deal.id, stage: "CLOSED_LOST", closedReason: "  " },
				ownerA,
			);
		} catch {
			rejected = true;
		}
		if (!rejected) throw new Error("ly do rong van ghi");
		const still = await deals.board(input({ owner: [ownerA] }));
		if (column(still, "CLOSED_LOST").cards.some((c) => c.id === deal.id)) {
			throw new Error("ly do rong van ghi");
		}
		await deals.setStage(
			{ id: deal.id, stage: "CLOSED_LOST", closedReason: "Hết ngân sách" },
			ownerA,
		);
		const after = await deals.board(input({ owner: [ownerA] }));
		expect(
			column(after, "CLOSED_LOST").cards.some((c) => c.id === deal.id),
		).toBe(true);
		const row = await db.deal.findUniqueOrThrow({
			where: { id: deal.id },
			select: { closedReason: true },
		});
		expect(row.closedReason).toBe("Hết ngân sách");
	});
});
