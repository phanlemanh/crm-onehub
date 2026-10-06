import { afterAll, describe, expect, it } from "bun:test";
import { spawnSync } from "node:child_process";
import {
	appendFileSync,
	cpSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import pg from "pg";
import {
	createMeasureDatabase,
	databaseFingerprint,
	databaseUrl,
	dropMeasureDatabase,
	FINGERPRINT_SOURCES,
	type FingerprintSources,
	markMeasureDatabase,
	markTemplate,
	sourceFingerprint,
	sweepMeasureDatabases,
} from "../scripts/measure-db";
import { dropDatabase, withMaintenance } from "../scripts/test-db-admin";
import {
	isMeasureDatabase,
	isTemplateDatabase,
	lastTouched,
	MEASURE_DATABASE,
	measureDatabaseName,
	parseMeasureComment,
	templateBuildingComment,
	templateDatabaseName,
} from "../src/measure-database";

const PACKAGE = resolve(import.meta.dirname, "..");
const MIGRATIONS = join(PACKAGE, "prisma", "migrations");
const SLOW_MS = 240_000;
const MINUTE_MS = 60_000;
const base = process.env.TEST_DATABASE_URL ?? "";
const id = (process.env.TEST_RUN_ID ?? Date.now().toString(36))
	.toLowerCase()
	.replace(/[^a-z0-9]/g, "");
const made = new Set<string>();

function tree(label: string): string {
	const name = `thu${id}${label}`;
	made.add(measureDatabaseName(name));
	made.add(templateDatabaseName(name));
	return name;
}

async function query<T extends pg.QueryResultRow>(
	url: string,
	sql: string,
	values: unknown[] = [],
): Promise<T[]> {
	const client = new pg.Client({ connectionString: url });
	await client.connect();
	try {
		return (await client.query<T>(sql, values)).rows;
	} finally {
		await client.end();
	}
}

async function commentOf(name: string): Promise<string | null> {
	const rows = await query<{ description: string | null }>(
		databaseUrl(base, "postgres"),
		`SELECT s.description FROM pg_database d
		   LEFT JOIN pg_shdescription s ON s.objoid = d.oid
		  WHERE d.datname = $1`,
		[name],
	);
	return rows[0]?.description ?? null;
}

async function exists(name: string): Promise<boolean> {
	const rows = await query(
		databaseUrl(base, "postgres"),
		"SELECT 1 FROM pg_database WHERE datname = $1",
		[name],
	);
	return rows.length === 1;
}

async function createEmpty(name: string): Promise<void> {
	made.add(name);
	await withMaintenance(base, async (client) => {
		await dropDatabase(client, name);
		await client.query(`CREATE DATABASE "${name}"`);
	});
}

function cli(args: string[]) {
	return spawnSync("bun", ["scripts/measure-db.ts", ...args], {
		cwd: PACKAGE,
		encoding: "utf8",
		env: { ...process.env, DATABASE_URL: base },
	});
}

afterAll(async () => {
	await withMaintenance(base, async (client) => {
		for (const name of made) await dropDatabase(client, name);
	});
});

describe("ten-kho", () => {
	const cases: [string, string, string][] = [
		[
			"compassionate-hofstadter-928035",
			"crm_compassionate_hofstadter_928035_do",
			"crm_compassionate_hofstadter_928035__mau_do",
		],
		["crm", "crm_crm_do", "crm_crm__mau_do"],
		["x-mau", "crm_x_mau_do", "crm_x_mau__mau_do"],
		[
			"Toan-Canh.OKR",
			"crm_toan_canh_okr__5a49b2_do",
			"crm_toan_canh_okr__5a49b2__mau_do",
		],
		["a--b", "crm_a_b__90827a_do", "crm_a_b__90827a__mau_do"],
	];

	it("names the measure and template databases of a tree", () => {
		for (const [name, measure, template] of cases) {
			expect(measureDatabaseName(name), `ten kho do cua ${name}`).toEqual(
				measure,
			);
			expect(templateDatabaseName(name), `ten kho mau cua ${name}`).toEqual(
				template,
			);
		}
	});

	it("keeps a long tree name inside 63 characters with its suffix and a hash", () => {
		const long = `cay-${"x".repeat(76)}`;
		const other = `cay-${"x".repeat(75)}y`;

		for (const name of [
			measureDatabaseName(long),
			templateDatabaseName(long),
		]) {
			expect(name.length, "ten kho qua 63 ky tu").toBeLessThanOrEqual(63);
		}
		expect(measureDatabaseName(long).endsWith("_do")).toBe(true);
		expect(templateDatabaseName(long).endsWith("__mau_do")).toBe(true);
		expect(measureDatabaseName(long), "hai cay dai trung ten kho").not.toEqual(
			measureDatabaseName(other),
		);
	});

	it("refuses a tree name with no letter or digit", () => {
		expect(() => measureDatabaseName("__")).toThrow(
			/has no letter or digit left/,
		);
	});

	it("gives every distinct tree name its own database names, and no measure name is a template name", () => {
		const trees = [
			"a-b",
			"a.b",
			"A-B",
			"a_b",
			"a--b",
			"-a-b",
			"toan-canh-okr",
			"Toan-Canh.OKR",
			"toan_canh_okr",
			"x",
			"x-mau",
			"x_mau",
			"crm",
			"compassionate-hofstadter-928035",
			`cay-${"x".repeat(76)}`,
			`cay-${"x".repeat(75)}y`,
			`Cay-${"x".repeat(76)}`,
		];
		const names = trees.flatMap((tree) => [
			[`do ${tree}`, measureDatabaseName(tree)],
			[`mau ${tree}`, templateDatabaseName(tree)],
		]);
		const owner = new Map<string, string>();

		for (const [label, name] of names) {
			expect(
				owner.get(name),
				`trung ten kho: ${label} va ${owner.get(name)}`,
			).toBe(undefined);
			owner.set(name, label);
			expect(name, "ten kho chi gom a-z0-9_").toMatch(/^[a-z0-9_]+$/);
			expect(name.length, `ten kho qua 63 ky tu: ${label}`).toBeLessThanOrEqual(
				63,
			);
			expect(
				name.endsWith(label.startsWith("mau ") ? "__mau_do" : "_do"),
				`ten kho sai duoi: ${label}`,
			).toBe(true);
			expect(["crm", "crm_test"]).not.toContain(name);
			expect(name.endsWith("_test")).toBe(false);
		}

		for (const tree of trees) {
			expect(
				isTemplateDatabase(measureDatabaseName(tree)),
				`kho do cua ${tree} bi coi la kho mau`,
			).toBe(false);
			expect(
				isMeasureDatabase(templateDatabaseName(tree)),
				`kho mau cua ${tree} bi coi la kho do`,
			).toBe(false);
		}
	});
});

describe("tao", () => {
	it(
		"builds the tree's measure database from a migrated, seeded template and leaves the shared database alone",
		async () => {
			await query(
				base,
				`INSERT INTO "okrCycle" (id, kind, name, "startsOn", "endsOn", "updatedAt")
				 VALUES ($1, 'quy', 'chu ky la cua luot khac', '2026-10-01', '2026-12-31', now())
				 ON CONFLICT (id) DO NOTHING`,
				[`la-${id}`],
			);
			const before = await databaseFingerprint(base);
			const name = tree("tao");

			const url = await createMeasureDatabase({ base, tree: name });
			const measure = measureDatabaseName(name);

			expect(new URL(url).pathname).toEqual(`/${measure}`);
			const applied = (
				await query<{ migration_name: string }>(
					url,
					`SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NOT NULL`,
				)
			)
				.map((row) => row.migration_name)
				.sort();
			const onDisk = readdirSync(MIGRATIONS, { withFileTypes: true })
				.filter((entry) => entry.isDirectory())
				.map((entry) => entry.name)
				.sort();
			expect(applied, "thieu migration").toEqual(onDisk);

			const deal = await query(url, `SELECT 1 FROM deal WHERE id = $1`, [
				"seed-deal-wise-1",
			]);
			expect(deal.length, "thieu deal seed-deal-wise-1").toBe(1);

			const mark = parseMeasureComment(await commentOf(measure));
			expect(mark?.kind, "kho do khong mang dau phien do").toBe("session");
			expect(Date.now() - (mark?.createdAt ?? 0)).toBeLessThan(10 * MINUTE_MS);

			const run = cli(["--tao", "--ten", name]);
			expect(run.status, run.stderr).toBe(0);
			expect(run.stdout.trim().split("\n").pop()).toEqual(url);

			const after = await databaseFingerprint(base);
			expect(after, "dau van tay kho chung doi").toEqual(before);
		},
		SLOW_MS,
	);
});

describe("kho-mau", () => {
	function mirrorSources(): FingerprintSources {
		const root = mkdtempSync(join(tmpdir(), "dau-nguon-"));
		const migrations = join(root, "migrations");
		mkdirSync(migrations);
		for (const entry of readdirSync(FINGERPRINT_SOURCES.migrations, {
			withFileTypes: true,
		})) {
			if (entry.isDirectory()) mkdirSync(join(migrations, entry.name));
		}
		const schema = join(root, "schema.prisma");
		const seed = join(root, "seed.ts");
		cpSync(FINGERPRINT_SOURCES.schema, schema);
		cpSync(FINGERPRINT_SOURCES.seed, seed);
		return { migrations, schema, seed };
	}

	it("changes the source fingerprint when a migration, schema.prisma or seed.ts changes", () => {
		const real = sourceFingerprint();
		const mirror = mirrorSources();
		expect(
			sourceFingerprint(mirror),
			"ban sao nguon khong ra cung dau",
		).toEqual(real);

		const changes: [string, (sources: FingerprintSources) => void][] = [
			[
				"migration moi",
				(sources) => mkdirSync(join(sources.migrations, "29990101000000_thu")),
			],
			["schema.prisma doi", (sources) => appendFileSync(sources.schema, "\n")],
			["seed.ts doi", (sources) => appendFileSync(sources.seed, "\n")],
		];

		for (const [label, change] of changes) {
			const sources = mirrorSources();
			change(sources);
			expect(
				sourceFingerprint(sources),
				`dau khong doi khi ${label}`,
			).not.toEqual(real);
		}
	});

	it(
		"reuses the template while the source fingerprint matches and rebuilds it when the source changes",
		async () => {
			const name = tree("mau");
			const template = templateDatabaseName(name);
			const measure = measureDatabaseName(name);
			const sources = mirrorSources();

			await createMeasureDatabase({
				base,
				tree: name,
				fingerprint: sourceFingerprint(sources),
			});
			const firstTemplate = parseMeasureComment(await commentOf(template));
			const firstMeasure = parseMeasureComment(await commentOf(measure));

			await createMeasureDatabase({
				base,
				tree: name,
				fingerprint: sourceFingerprint(sources),
			});
			const secondTemplate = parseMeasureComment(await commentOf(template));
			const secondMeasure = parseMeasureComment(await commentOf(measure));

			expect(
				secondTemplate?.createdAt,
				"kho mau bi dung lai du dau khop",
			).toEqual(firstTemplate?.createdAt);
			expect(secondMeasure?.createdAt ?? 0).toBeGreaterThan(
				firstMeasure?.createdAt ?? 0,
			);

			appendFileSync(sources.seed, "\n");
			await createMeasureDatabase({
				base,
				tree: name,
				fingerprint: sourceFingerprint(sources),
			});
			const third = parseMeasureComment(await commentOf(template));
			expect(
				third?.createdAt ?? 0,
				"dau doi ma kho mau khong dung lai",
			).toBeGreaterThan(secondTemplate?.createdAt ?? 0);
		},
		SLOW_MS * 2,
	);
});

describe("xoa", () => {
	it(
		"drops the tree's measure database even while something is connected",
		async () => {
			const name = tree("xoa");
			const url = await createMeasureDatabase({ base, tree: name });
			const held = new pg.Client({ connectionString: url });
			await held.connect();
			held.on("error", () => {});

			await dropMeasureDatabase(base, measureDatabaseName(name));
			await held.end().catch(() => {});

			expect(await exists(measureDatabaseName(name))).toBe(false);
		},
		SLOW_MS,
	);

	it(
		"refuses a name that is not a measure database, and one without the mark",
		async () => {
			const plain = `crm_thu${id}_khac`;
			const unmarked = `crm_thu${id}b_do`;
			await createEmpty(plain);
			await createEmpty(unmarked);

			const refusals: [string, RegExp][] = [
				[plain, /is not a measure database/],
				[unmarked, /does not carry the measure-session mark/],
			];

			for (const [target, message] of refusals) {
				const run = cli(["--xoa", "--kho", target]);
				expect(await exists(target), "kho khong dau bi xoa").toBe(true);
				expect(run.status, `--xoa ${target}`).toBe(2);
				expect(run.stderr).toMatch(message);
			}
		},
		SLOW_MS,
	);
});

describe("quet-mo-coi", () => {
	it(
		"drops only marked databases untouched for longer than maxAgeMs",
		async () => {
			const real = Date.now();
			const age = MEASURE_DATABASE.maxAgeMs;
			const now = real + 2 * age + MINUTE_MS;
			const before = real + age - MINUTE_MS;
			const own = `crm_thu${id}`;
			const old = `crm_thu${id}gia_do`;
			const young = `crm_thu${id}non_do`;
			const unmarked = `crm_thu${id}kd_do`;
			const usedTemplate = `crm_thu${id}mcd__mau_do`;
			const idleTemplate = `crm_thu${id}mb__mau_do`;
			const five = [old, young, unmarked, usedTemplate, idleTemplate];

			for (const name of five) await createEmpty(name);

			await withMaintenance(base, async (client) => {
				await markMeasureDatabase(client, old, real);
				await markMeasureDatabase(client, young, now - MINUTE_MS);
				await markTemplate(client, usedTemplate, "f", real, now - MINUTE_MS);
				await markTemplate(client, idleTemplate, "f", real, real);
			});

			const early = await withMaintenance(base, (client) =>
				sweepMeasureDatabases(client, before, own),
			);
			const labels: [string, string][] = [
				[young, "non"],
				[usedTemplate, "mau-con-dung"],
				[unmarked, "khong-dau"],
				[old, "gia"],
				[idleTemplate, "mau-bo"],
			];
			for (const [name, label] of labels) {
				expect(
					early.includes(name),
					`kho ${label} bi xoa khi quet truoc han`,
				).toBe(false);
			}

			const dropped = await withMaintenance(base, (client) =>
				sweepMeasureDatabases(client, now, own),
			);

			const left: string[] = [];
			for (const name of five) if (await exists(name)) left.push(name);
			expect(left.includes(young), "kho non tuoi bi xoa").toBe(true);
			expect(left.includes(unmarked), "kho khong dau bi xoa").toBe(true);
			expect(left.includes(usedTemplate), "kho mau con dung bi xoa").toBe(true);
			expect(left.sort()).toEqual([young, unmarked, usedTemplate].sort());
			expect(dropped.filter((name) => five.includes(name))).toEqual(
				[old, idleTemplate].sort(),
			);
		},
		SLOW_MS,
	);
});

describe("dau-dang-dung", () => {
	it("reads back the building mark written by the module and refuses a broken one", () => {
		const at = Date.UTC(2026, 9, 7, 5, 0, 0);
		const written = templateBuildingComment(at);
		const parsed = parseMeasureComment(written);

		expect(parsed, "dau dang dung doc lai sai").toEqual({
			kind: "building",
			createdAt: at,
		});
		expect(parsed ? lastTouched(parsed) : 0, "dau dang dung doc lai sai").toBe(
			at,
		);

		const broken: [string, string][] = [
			[
				"gio hong",
				`${MEASURE_DATABASE.commentPrefix} ${MEASURE_DATABASE.buildingMark} created khong-phai-gio`,
			],
			["duoi thua", `${written} x`],
		];
		for (const [label, text] of broken) {
			expect(
				parseMeasureComment(text),
				`dau dang dung hong van doc duoc: ${label}`,
			).toBe(null);
		}
	});
});
