import { afterAll, describe, expect, it } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import { MAX_ATTEMPTS } from "@crm/db/agent-tasks";
import * as current from "../agent/lib/tasks";

type Tasks = typeof current;
type Captured = { query: string; params: unknown[] };

const PRE_FIX_SHA = "746d3ef8ef8667c5e59545bf5f9b71b97d98f2c9";
const SOURCE = "apps/agent/agent/lib/tasks.ts";
const TMP = join(import.meta.dir, ".tmp");
const kind = "khoa-lo-rang";
const armed = process.env.KHOA_LO_RANG === "1";
const limit = 2;
const stale = 3;
const crowd = 40;
const callers = 8;

const written: string[] = [];

function relocate(source: string): string {
	return source.replace(
		'from "./dispatch-config"',
		'from "../../agent/lib/dispatch-config"',
	);
}

async function load(name: string, source: string): Promise<Tasks> {
	mkdirSync(TMP, { recursive: true });
	const file = join(TMP, `${name}-${process.pid}.ts`);
	writeFileSync(file, relocate(source));
	written.push(file);
	return (await import(file)) as Tasks;
}

function preFixSource(): string {
	const shown = Bun.spawnSync(["git", "show", `${PRE_FIX_SHA}:${SOURCE}`], {
		cwd: import.meta.dir,
	});
	if (shown.exitCode !== 0) {
		console.error(`sha ${PRE_FIX_SHA} không có trong clone`);
		process.exit(2);
	}
	return shown.stdout.toString();
}

async function currentSource(): Promise<string> {
	return Bun.file(join(import.meta.dir, "../agent/lib/tasks.ts")).text();
}

let latest: Captured | null = null;
db.$on("query", (event) => {
	if (event.query.includes('UPDATE "agentTask"')) {
		latest = { query: event.query, params: JSON.parse(event.params) };
	}
});

async function exhausted(count: number) {
	await db.agentTask.deleteMany({});
	for (let index = 0; index < count; index++) {
		await db.agentTask.create({
			data: {
				kind,
				reason: "rang",
				dueAt: new Date(Date.now() - (count - index) * 60_000),
				attempts: MAX_ATTEMPTS,
				leasedUntil: new Date(Date.now() - 1000),
			},
		});
	}
}

async function staleStatistics() {
	await exhausted(1);
	await db.$executeRaw`ANALYZE "agentTask"`;
	for (let index = 1; index < stale; index++) {
		await db.agentTask.create({
			data: {
				kind,
				reason: "rang",
				dueAt: new Date(Date.now() - (stale - index) * 60_000),
				attempts: MAX_ATTEMPTS,
				leasedUntil: new Date(Date.now() - 1000),
			},
		});
	}
}

function typed(params: unknown[]): unknown[] {
	return params.map((value) =>
		typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)
			? new Date(value)
			: value,
	);
}

async function lockRowsLoops(
	mod: Tasks,
): Promise<{ loops: number; cte: boolean }> {
	await staleStatistics();
	latest = null;
	await mod.retireExhausted(limit);
	const captured = latest as Captured | null;
	if (!captured)
		throw new Error("no UPDATE captured from the Prisma query event");
	await staleStatistics();
	const plan: string[] = [];
	await db
		.$transaction(async (tx) => {
			const rows = await tx.$queryRawUnsafe<{ "QUERY PLAN": string }[]>(
				`EXPLAIN (ANALYZE, COSTS OFF, TIMING OFF, SUMMARY OFF) ${captured.query}`,
				...typed(captured.params),
			);
			for (const row of rows) plan.push(row["QUERY PLAN"]);
			throw new Error("rollback");
		})
		.catch((error: Error) => {
			if (error.message !== "rollback") throw error;
		});
	const lock = plan.find((line) => line.includes("LockRows"));
	const loops = Number(/loops=(\d+)/.exec(lock ?? "")?.[1] ?? Number.NaN);
	if (Number.isNaN(loops))
		throw new Error(`no LockRows node in plan:\n${plan.join("\n")}`);
	return { loops, cte: plan.some((line) => line.includes("CTE Scan")) };
}

function assertDisjoint(results: { id: string }[][]): Set<string> {
	const ids = results.flat().map((row) => row.id);
	const unique = new Set(ids);
	if (unique.size !== ids.length) {
		throw new Error(
			`duplicate ids: ${ids.length - unique.size} of ${ids.length}`,
		);
	}
	return unique;
}

async function concurrent(mod: Tasks) {
	await exhausted(crowd);
	await db.$executeRaw`ANALYZE "agentTask"`;
	return Promise.all(
		Array.from({ length: callers }, () => mod.retireExhausted(limit)),
	);
}

afterAll(async () => {
	await db.agentTask.deleteMany({ where: { kind } });
	for (const file of written) rmSync(file, { force: true });
});

describe.skipIf(!armed)("khoa-lo-giu-tran rang", () => {
	it("explain fixed: LockRows runs once behind a CTE Scan", async () => {
		const { loops, cte } = await lockRowsLoops(current);
		console.log(`LockRows loops=${loops} (fixed) cte=${cte}`);
		expect(loops).toBe(1);
		expect(cte).toBe(true);
	});

	it("explain pre-fix: LockRows runs once per outer row", async () => {
		const old = await load("pre-fix", preFixSource());
		const { loops } = await lockRowsLoops(old);
		console.log(`LockRows loops=${loops} (pre-fix)`);
		expect(loops).toBe(stale);
	});

	it("concurrent fixed: eight callers never share a row", async () => {
		const results = await concurrent(current);
		const unique = assertDisjoint(results);
		console.log(`unique=${unique.size}/${callers * limit} (fixed)`);
		for (const batch of results)
			expect(batch.length).toBeLessThanOrEqual(limit);
		expect(unique.size).toBe(callers * limit);
	});

	it("concurrent no-lock: dropping FOR UPDATE SKIP LOCKED hands out duplicates", async () => {
		const source = (await currentSource()).replaceAll(
			"FOR UPDATE SKIP LOCKED",
			"",
		);
		const noLock = await load("no-lock", source);
		const results = await concurrent(noLock);
		const ids = results.flat().map((row) => row.id);
		console.log(`unique=${new Set(ids).size}/${ids.length} (no-lock)`);
		expect(() => assertDisjoint(results)).toThrow(/duplicate ids/);
	});
});
