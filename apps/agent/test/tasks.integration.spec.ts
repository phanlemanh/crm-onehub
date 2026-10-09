import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
} from "bun:test";
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

async function clear() {
	await db.agentTask.deleteMany({
		where: { OR: [{ kind }, { reason: VISIBLE_REASON }] },
	});
	await db.contact.deleteMany({ where: { email: { startsWith: "lease-" } } });
}

beforeEach(clear);
afterEach(clear);

async function queue(
	overrides: { priority?: number; dueAt?: Date; contactId?: string } = {},
) {
	return db.agentTask.create({
		data: {
			kind,
			reason: "test",
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
		const later = await queue({ dueAt: new Date(Date.now() + 60_000) });
		const due = await queue();

		const claimed = await claimDue(10, MINE);
		expect(claimed.map((t) => t.id)).toEqual([due.id]);
		expect(claimed.map((t) => t.id)).not.toContain(later.id);
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
		expect((await claimDue(10, MINE)).map((t) => t.id)).toContain(task.id);
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
			expect((await claimDue(10, MINE)).map((t) => t.id)).toContain(task.id);
			if (attempt < MAX_ATTEMPTS - 1) await expire(task.id);
		}

		const leased = await db.agentTask.findUnique({ where: { id: task.id } });
		expect(leased?.attempts).toBe(MAX_ATTEMPTS);
		expect(leased?.leasedUntil?.getTime()).toBeGreaterThan(Date.now());

		expect((await retireExhausted()).map((t) => t.id)).not.toContain(task.id);
		const row = await db.agentTask.findUnique({ where: { id: task.id } });
		expect(row?.finishedAt).toBeNull();
	});

	it("leaves work that still has attempts left", async () => {
		const task = await queue();
		expect((await claimDue(10, MINE)).map((t) => t.id)).toContain(task.id);
		await expire(task.id);

		expect((await retireExhausted()).map((t) => t.id)).not.toContain(task.id);
		const row = await db.agentTask.findUnique({ where: { id: task.id } });
		expect(row?.finishedAt).toBeNull();
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

const AUTOVACUUM_OFF = "autovacuum_enabled=false";
type RestoredReloptions = { value: string[] | null | undefined };

const restoredReloptions: RestoredReloptions = { value: undefined };

async function reloptions(): Promise<string[] | null> {
	const [row] = await db.$queryRaw<{ reloptions: string[] | null }[]>`
		SELECT reloptions FROM pg_class WHERE relname = 'agentTask'
	`;
	return row?.reloptions ?? null;
}

async function autovacuumOff(): Promise<string[] | null> {
	const before = await reloptions();
	await db.$executeRawUnsafe(`ALTER TABLE "agentTask" SET (${AUTOVACUUM_OFF})`);
	return before;
}

async function autovacuumRestore(before: string[] | null): Promise<void> {
	const earlier = before?.find((o) => o.startsWith("autovacuum_enabled="));
	await db.$executeRawUnsafe(
		earlier
			? `ALTER TABLE "agentTask" SET (${earlier})`
			: `ALTER TABLE "agentTask" RESET (autovacuum_enabled)`,
	);
}

let reloptionsBefore: string[] | null = null;

async function tatTrongKhoi(): Promise<void> {
	reloptionsBefore = await autovacuumOff();
}

async function traSauKhoi(): Promise<void> {
	await autovacuumRestore(reloptionsBefore);
	restoredReloptions.value = reloptionsBefore;
}

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
	}

	async function reltuplesNow(): Promise<number> {
		const [stats] = await db.$queryRaw<{ reltuples: number }[]>`
			SELECT reltuples::float8 AS reltuples FROM pg_class WHERE relname = 'agentTask'
		`;
		if (!stats) throw new Error("khong doc duoc reltuples cua agentTask");
		return stats.reltuples;
	}

	const PROBE_SQL = `UPDATE "agentTask" AS t SET "outcome" = 'probe' FROM (SELECT c.id FROM "agentTask" AS c WHERE c.kind = '${kind}' AND c."finishedAt" IS NULL ORDER BY c."dueAt" ASC LIMIT ${limit} FOR UPDATE SKIP LOCKED) AS due WHERE t.id = due.id RETURNING t.id`;

	async function planChanged(got: number): Promise<never> {
		const plan = await db.$queryRawUnsafe<{ "QUERY PLAN": string }[]>(
			`EXPLAIN ${PROBE_SQL}`,
		);
		const [stats] = await db.$queryRaw<
			{
				reltuples: number;
				relpages: number;
				so_trang: number;
				n_dead_tup: number;
				last_analyze: Date | null;
				last_autoanalyze: Date | null;
			}[]
		>`
			SELECT c.reltuples::float8 AS reltuples, c.relpages::int AS relpages,
				(pg_relation_size(c.oid) / current_setting('block_size')::int)::int AS so_trang,
				s.n_dead_tup::int AS n_dead_tup, s.last_analyze, s.last_autoanalyze
			FROM pg_class AS c JOIN pg_stat_user_tables AS s ON s.relid = c.oid
			WHERE c.relname = 'agentTask'
		`;
		throw new Error(
			`ke hoach doi: ${got}/${rows} hang; reltuples=${stats?.reltuples} relpages=${stats?.relpages} so_trang=${stats?.so_trang} n_dead_tup=${stats?.n_dead_tup} last_analyze=${stats?.last_analyze?.toISOString() ?? "null"} last_autoanalyze=${stats?.last_autoanalyze?.toISOString() ?? "null"}; plan: ${plan.map((p) => p["QUERY PLAN"].trim()).join(" | ")}`,
		);
	}

	async function probe() {
		const got = await db.$queryRawUnsafe<{ id: string }[]>(PROBE_SQL);
		if (got.length !== rows || (await reltuplesNow()) > 1)
			await planChanged(got.length);
		return got;
	}

	beforeAll(tatTrongKhoi);
	afterAll(traSauKhoi);

	it("autovacuum stays off for the whole block", async () => {
		if (!(await reloptions())?.includes(AUTOVACUUM_OFF))
			throw new Error("autovacuum van bat trong khoi");
	});

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

describe("a limited lock subquery: autovacuum is handed back after the block", () => {
	it("reloptions match what the block found", async () => {
		if (restoredReloptions.value === undefined)
			throw new Error("khoi chua chay truoc ca nay");
		const now = await reloptions();
		if (JSON.stringify(now) !== JSON.stringify(restoredReloptions.value))
			throw new Error(
				`autovacuum khong duoc tra lai: ${JSON.stringify(now)} khac ${JSON.stringify(restoredReloptions.value)}`,
			);
	});
});

describe("a limited lock subquery: autovacuum already off before the block", () => {
	it("restoring keeps the earlier off flag", async () => {
		const original = await reloptions();
		await db.$executeRawUnsafe(
			`ALTER TABLE "agentTask" SET (${AUTOVACUUM_OFF})`,
		);
		try {
			const preset = await reloptions();
			await tatTrongKhoi();
			await traSauKhoi();
			const now = await reloptions();
			if (JSON.stringify(now) !== JSON.stringify(preset))
				throw new Error(
					`autovacuum khong duoc tra lai: ${JSON.stringify(now)} khac ${JSON.stringify(preset)}`,
				);
		} finally {
			await autovacuumRestore(original);
		}
	});
});
