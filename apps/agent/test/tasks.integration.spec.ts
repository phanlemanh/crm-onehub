import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { db } from "@crm/db";
import { DIRECT_KINDS } from "@crm/db/agent-tasks";
import {
	claimDue,
	completeTask,
	MAX_ATTEMPTS,
	retireExhausted,
	scheduleTask,
} from "../agent/lib/tasks";

const kind = "test-lease";

const RESEARCH = { except: DIRECT_KINDS } as const;

const MINE = { only: [kind] } as const;

const VISIBLE_KIND = "brand";
const VISIBLE_REASON = "test-lease-visible";
const TOP_PRIORITY = 2_147_483_647;

let testMarker = "";

async function clear() {
	await db.agentTask.deleteMany({
		where: {
			OR: [
				{ kind: kind },
				{ reason: VISIBLE_REASON },
				{ reason: "chung-luot-gieo" },
				{ reason: "lane-test" },
				...(testMarker ? [{ reason: testMarker }] : []),
			],
		},
	});
	await db.contact.deleteMany({ where: { email: { startsWith: "lease-" } } });
}

beforeEach(() => {
	testMarker = `chung-luot-test-${crypto.randomUUID()}`;
	return clear();
});
afterEach(clear);

async function queue(
	overrides: { priority?: number; dueAt?: Date; contactId?: string } = {},
) {
	return db.agentTask.create({
		data: {
			kind,
			reason: testMarker,
			dueAt: overrides.dueAt ?? new Date(Date.now() - 1000),
			priority: overrides.priority ?? 0,
			budget: 4,
			contactId: overrides.contactId ?? null,
		},
		select: { id: true },
	});
}

async function expire(taskId: string) {
	await db.agentTask.update({
		where: { id: taskId },
		data: { leasedUntil: new Date(Date.now() - 1000) },
	});
}

async function someone() {
	return db.contact.create({
		data: {
			firstName: "Lease",
			email: `lease-${crypto.randomUUID()}@example.test`,
		},
		select: { id: true },
	});
}

describe("claimDue", () => {
	it("claims due work and leases it", async () => {
		const task = await queue();

		const claimed = await claimDue(10, MINE);
		expect(claimed.map((t) => t.id)).toContain(task.id);

		const row = await db.agentTask.findUnique({ where: { id: task.id } });
		expect(row?.leasedUntil).not.toBeNull();
		expect(row?.startedAt).not.toBeNull();
	});

	it("does not hand the same row to two dispatchers", async () => {
		await Promise.all([queue(), queue(), queue()]);

		const [first, second] = await Promise.all([
			claimDue(3, MINE),
			claimDue(3, MINE),
		]);
		const ids = [...first, ...second].map((t) => t.id);

		expect(new Set(ids).size).toBe(ids.length);
		expect(ids).toHaveLength(3);
	});

	it("leaves work that is not due yet", async () => {
		await queue({ dueAt: new Date(Date.now() + 60_000) });
		const claimed = await claimDue(10, MINE);
		expect(claimed).toHaveLength(0);
	});

	it("leaves a visible kind to the visible lane", async () => {
		expect(DIRECT_KINDS).toContain(VISIBLE_KIND);
		const visible = await db.agentTask.create({
			data: {
				kind: VISIBLE_KIND,
				reason: VISIBLE_REASON,
				dueAt: new Date(Date.now() - 2000),
				priority: TOP_PRIORITY,
				budget: 2,
			},
			select: { id: true },
		});
		const research = await queue({ priority: TOP_PRIORITY });

		const claimed = await claimDue(1, RESEARCH);
		expect(claimed.map((t) => t.id)).toEqual([research.id]);

		const row = await db.agentTask.findUnique({ where: { id: visible.id } });
		expect(row?.leasedUntil).toBeNull();
	});

	it("takes the most urgent first", async () => {
		const low = await queue({ priority: 0 });
		const high = await queue({ priority: 100 });

		const claimed = await claimDue(1, MINE);
		expect(claimed[0]?.id).toBe(high.id);
		expect(claimed[0]?.id).not.toBe(low.id);
	});

	it("does not re-claim a leased row, and does re-claim an expired one", async () => {
		const task = await queue();
		await claimDue(10, MINE);

		expect(await claimDue(10, MINE)).toHaveLength(0);

		await db.agentTask.update({
			where: { id: task.id },
			data: { leasedUntil: new Date(Date.now() - 1000) },
		});

		expect((await claimDue(10, MINE)).map((t) => t.id)).toContain(task.id);
	});

	it("stops handing out a row that has spent its attempts", async () => {
		const task = await queue();

		for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
			expect((await claimDue(10, MINE)).map((t) => t.id)).toContain(task.id);
			await expire(task.id);
		}

		expect(await claimDue(10, MINE)).toHaveLength(0);
	});

	it("counts the attempts it has handed out", async () => {
		const task = await queue();

		expect((await claimDue(10, MINE))[0]?.attempts).toBe(1);
		await expire(task.id);
		expect((await claimDue(10, MINE))[0]?.attempts).toBe(2);
	});

	it("stops claiming once the work is finished", async () => {
		const task = await queue();
		await claimDue(10, MINE);
		await completeTask(task.id, "ran");

		await db.agentTask.update({
			where: { id: task.id },
			data: { leasedUntil: null },
		});

		expect(await claimDue(10, MINE)).toHaveLength(0);
	});
});

describe("retireExhausted", () => {
	it("gives up on a row that never reported back, and says who it was about", async () => {
		const contact = await someone();
		const task = await queue({ contactId: contact.id });

		for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
			await claimDue(10, MINE);
			await expire(task.id);
		}

		const retired = await retireExhausted();
		expect(retired.map((t) => t.id)).toContain(task.id);
		expect(retired.find((t) => t.id === task.id)?.contactId).toBe(contact.id);

		const row = await db.agentTask.findUnique({ where: { id: task.id } });
		expect(row?.finishedAt).not.toBeNull();
		expect(row?.outcome).toContain("Gave up");
	});

	it("leaves a row that is still leased on its last attempt alone", async () => {
		const task = await queue();

		for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
			await claimDue(10, MINE);
			if (attempt < MAX_ATTEMPTS - 1) await expire(task.id);
		}

		expect(await retireExhausted()).toHaveLength(0);
	});

	it("leaves work that still has attempts left", async () => {
		await queue();
		await claimDue(10, MINE);

		expect(await retireExhausted()).toHaveLength(0);
	});

	it("retires no more rows than the limit allows", async () => {
		const mine: string[] = [];
		for (let row = 0; row < 3; row++) mine.push((await queue()).id);

		for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
			const claimed = await claimDue(10, MINE);
			for (const task of claimed) await expire(task.id);
		}

		for (let pass = 0; pass < 3; pass++) {
			expect((await retireExhausted(2)).length).toBeLessThanOrEqual(2);
		}

		const open = await db.agentTask.count({
			where: { id: { in: mine }, finishedAt: null },
		});
		expect(open).toBe(0);
	});
});

describe("completeTask", () => {
	it("retires a row once, and reports who it was about", async () => {
		const contact = await someone();
		const task = await queue({ contactId: contact.id });
		await claimDue(10, MINE);

		const subject = await completeTask(task.id, "ran");
		expect(subject?.contactId).toBe(contact.id);

		expect(await completeTask(task.id, "ran again")).toBeNull();
		const row = await db.agentTask.findUnique({ where: { id: task.id } });
		expect(row?.outcome).toBe("ran");
	});
});

describe("scheduleTask", () => {
	it("books work with the agent's own reason", async () => {
		const dueAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
		const { id } = await scheduleTask({
			kind,
			reason: "a job change here would move the Acme deal",
			dueAt,
		});

		const row = await db.agentTask.findUnique({ where: { id } });
		expect(row?.reason).toContain("Acme");
	});

	it("moves the existing booking rather than queueing a second one", async () => {
		const soon = new Date(Date.now() + 1000);
		const later = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

		const first = await scheduleTask({ kind, reason: "first", dueAt: soon });
		const second = await scheduleTask({ kind, reason: "second", dueAt: later });

		expect(second.id).toBe(first.id);
		expect(await db.agentTask.count({ where: { kind } })).toBe(1);
	});
});

describe("a limited lock subquery when the planner re-runs it per row", () => {
	const limit = 2;
	const rows = 3;

	async function insert(index: number, attempts: number) {
		return db.agentTask.create({
			data: {
				kind,
				reason: "stale",
				dueAt: new Date(Date.now() - (rows - index) * 60_000),
				priority: 0,
				budget: 4,
				attempts,
				leasedUntil: new Date(Date.now() - 1000),
			},
			select: { id: true },
		});
	}

	async function staleStatistics(attempts: number) {
		await db.agentTask.deleteMany({});
		await insert(0, attempts);
		await db.$executeRaw`ANALYZE "agentTask"`;
		for (let index = 1; index < rows; index++) await insert(index, attempts);
		const [stats] = await db.$queryRaw<{ reltuples: number }[]>`
			SELECT reltuples::float8 AS reltuples FROM pg_class WHERE relname = 'agentTask'
		`;
		if (!stats || stats.reltuples > 1) {
			throw new Error(`statistics drifted: reltuples=${stats?.reltuples}`);
		}
	}

	function probe() {
		return db.$queryRaw<{ id: string }[]>`
			UPDATE "agentTask" AS t
			SET "outcome" = 'probe'
			FROM (
				SELECT c.id FROM "agentTask" AS c
				WHERE c.kind = ${kind} AND c."finishedAt" IS NULL
				ORDER BY c."dueAt" ASC
				LIMIT ${limit}
				FOR UPDATE SKIP LOCKED
			) AS due
			WHERE t.id = due.id
			RETURNING t.id;
		`;
	}

	it("the fixture bites: a subquery joined in FROM hands out every row", async () => {
		await staleStatistics(MAX_ATTEMPTS);
		expect(await probe()).toHaveLength(rows);
	});

	it("the fixture bites for due work too", async () => {
		await staleStatistics(0);
		expect(await probe()).toHaveLength(rows);
	});

	it("retireExhausted still retires exactly the limit", async () => {
		await staleStatistics(MAX_ATTEMPTS);
		expect(await retireExhausted(limit)).toHaveLength(limit);
		expect(
			await db.agentTask.count({ where: { kind, finishedAt: null } }),
		).toBe(rows - limit);
	});

	it("claimDue still claims exactly the limit", async () => {
		await staleStatistics(0);
		expect(await claimDue(limit, RESEARCH)).toHaveLength(limit);
		expect(
			await db.agentTask.count({
				where: { kind, leasedUntil: { lt: new Date() } },
			}),
		).toBe(rows - limit);
	});
});
