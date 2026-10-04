import "@crm/env/load";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import pg from "pg";
import {
	currentTree,
	lastTouched,
	MEASURE_DATABASE,
	MeasureDatabaseError,
	measureDatabaseName,
	parseMeasureComment,
	sessionComment,
	templateComment,
	templateDatabaseName,
} from "../src/measure-database";
import { markOnboarded, WORKSPACE_ID } from "../src/workspace";
import { dropDatabase, withMaintenance } from "./test-db-admin";

export { currentTree, MeasureDatabaseError };

const PACKAGE = resolve(import.meta.dirname, "..");
const MIGRATIONS = join(PACKAGE, "prisma", "migrations");
const SCHEMA = join(PACKAGE, "prisma", "schema.prisma");
const SEED = join(PACKAGE, "prisma", "seed.ts");
const PRISMA = join(PACKAGE, "node_modules", ".bin", "prisma");
const LOCAL_HOSTS = new Set([
	"localhost",
	"127.0.0.1",
	"::1",
	"[::1]",
	"0.0.0.0",
]);

type Log = (line: string) => void;

interface DatabaseRow {
	datname: string;
	description: string | null;
	backends: string;
}

export function serverUrl(source = process.env.DATABASE_URL): string {
	if (!source) {
		throw new MeasureDatabaseError(
			"DATABASE_URL is not set, so there is no server to put a measure database on. Copy .env.example to .env at the repo root.",
		);
	}

	const url = new URL(source);

	if (!LOCAL_HOSTS.has(url.hostname)) {
		throw new MeasureDatabaseError(
			`DATABASE_URL points at ${url.hostname}, which is not local. A measure database is created and dropped on every run, so it only goes on a local server.`,
		);
	}

	return url.toString();
}

export function databaseUrl(base: string, name: string): string {
	const url = new URL(base);
	url.pathname = `/${name}`;

	return url.toString();
}

export interface FingerprintSources {
	migrations: string;
	schema: string;
	seed: string;
}

export const FINGERPRINT_SOURCES: FingerprintSources = {
	migrations: MIGRATIONS,
	schema: SCHEMA,
	seed: SEED,
};

export function sourceFingerprint(
	sources: FingerprintSources = FINGERPRINT_SOURCES,
): string {
	const hash = createHash("sha256");
	const migrations = existsSync(sources.migrations)
		? readdirSync(sources.migrations, { withFileTypes: true })
				.filter((entry) => entry.isDirectory())
				.map((entry) => entry.name)
				.sort()
		: [];

	hash.update(migrations.join("\n"));
	hash.update(readFileSync(sources.schema));
	hash.update(readFileSync(sources.seed));

	return hash.digest("hex").slice(0, 16);
}

export async function markMeasureDatabase(
	client: pg.Client,
	name: string,
	createdAt: number,
): Promise<void> {
	await comment(client, name, sessionComment(createdAt));
}

export async function markTemplate(
	client: pg.Client,
	name: string,
	fingerprint: string,
	createdAt: number,
	usedAt: number,
): Promise<void> {
	await comment(client, name, templateComment(fingerprint, createdAt, usedAt));
}

async function comment(
	client: pg.Client,
	name: string,
	text: string,
): Promise<void> {
	await client.query(
		`COMMENT ON DATABASE "${name}" IS '${text.replace(/'/g, "''")}'`,
	);
}

async function describe(
	client: pg.Client,
	name: string,
): Promise<DatabaseRow | null> {
	const rows = await client.query<DatabaseRow>(
		`SELECT d.datname, s.description,
		        (SELECT count(*) FROM pg_stat_activity a WHERE a.datname = d.datname) AS backends
		   FROM pg_database d
		   LEFT JOIN pg_shdescription s ON s.objoid = d.oid
		  WHERE d.datname = $1`,
		[name],
	);

	return rows.rows[0] ?? null;
}

export async function sweepMeasureDatabases(
	client: pg.Client,
	now = Date.now(),
	namePrefix = "",
): Promise<string[]> {
	const rows = await client.query<DatabaseRow>(
		`SELECT d.datname, s.description,
		        (SELECT count(*) FROM pg_stat_activity a WHERE a.datname = d.datname) AS backends
		   FROM pg_database d
		   JOIN pg_shdescription s ON s.objoid = d.oid
		  WHERE d.datname LIKE $1 AND s.description LIKE $2`,
		[
			`${namePrefix.replace(/_/g, "\\_")}%${MEASURE_DATABASE.suffix.replace(/_/g, "\\_")}`,
			`${MEASURE_DATABASE.commentPrefix} %`,
		],
	);

	const dropped: string[] = [];

	for (const row of rows.rows) {
		const parsed = parseMeasureComment(row.description);
		if (!parsed) continue;
		if (now - lastTouched(parsed) <= MEASURE_DATABASE.maxAgeMs) continue;
		if (Number(row.backends) > 0) continue;

		await dropDatabase(client, row.datname);
		dropped.push(row.datname);
	}

	return dropped.sort();
}

function run(
	command: string,
	args: string[],
	env: NodeJS.ProcessEnv,
	what: string,
): void {
	const result = spawnSync(command, args, {
		cwd: PACKAGE,
		stdio: ["ignore", "ignore", "pipe"],
		encoding: "utf8",
		env,
	});

	if (result.status !== 0) {
		throw new MeasureDatabaseError(
			`${what} exited ${result.status ?? result.signal}: ${(result.stderr ?? "").trim().split("\n").slice(-5).join(" | ")}`,
		);
	}
}

async function buildTemplate(
	client: pg.Client,
	base: string,
	name: string,
	fingerprint: string,
	log: Log,
): Promise<void> {
	const url = databaseUrl(base, name);
	const env = {
		...process.env,
		DATABASE_URL: url,
		NODE_ENV: "development",
		BLOB_READ_WRITE_TOKEN: "",
	};

	await dropDatabase(client, name);
	await client.query(`CREATE DATABASE "${name}"`);

	try {
		log(
			`  building ${name}: migrate deploy + seed (once per source fingerprint)`,
		);
		run(PRISMA, ["migrate", "deploy"], env, "prisma migrate deploy");
		run("bun", [SEED], env, "prisma/seed.ts");
	} catch (error) {
		await dropDatabase(client, name);
		throw error;
	}

	const now = Date.now();
	await markTemplate(client, name, fingerprint, now, now);
}

export interface CreateOptions {
	base: string;
	tree: string;
	fingerprint?: string;
	now?: number;
	log?: Log;
}

export async function createMeasureDatabase({
	base,
	tree,
	fingerprint = sourceFingerprint(),
	now = Date.now(),
	log = () => {},
}: CreateOptions): Promise<string> {
	const name = measureDatabaseName(tree);
	const template = templateDatabaseName(tree);

	await withMaintenance(base, async (client) => {
		for (const stale of await sweepMeasureDatabases(client, now)) {
			log(
				`  dropped ${stale}: older than ${MEASURE_DATABASE.maxAgeMs / 3_600_000}h`,
			);
		}

		const current = await describe(client, template);
		const parsed = parseMeasureComment(current?.description);
		const fresh =
			parsed?.kind === "template" && parsed.fingerprint === fingerprint;

		if (!fresh) {
			await buildTemplate(client, base, template, fingerprint, log);
		}

		await dropDatabase(client, name);
		await client.query(
			`SELECT pg_terminate_backend(pid) FROM pg_stat_activity
			 WHERE datname = $1 AND pid <> pg_backend_pid()`,
			[template],
		);
		await client.query(`CREATE DATABASE "${name}" TEMPLATE "${template}"`);

		const created = Date.now();
		await markMeasureDatabase(client, name, created);

		const kept = parseMeasureComment(
			(await describe(client, template))?.description,
		);
		if (kept?.kind === "template") {
			await markTemplate(
				client,
				template,
				kept.fingerprint,
				kept.createdAt,
				created,
			);
		}
	});

	return databaseUrl(base, name);
}

export async function dropMeasureDatabase(
	base: string,
	name: string,
): Promise<void> {
	if (!name.endsWith(MEASURE_DATABASE.suffix)) {
		throw new MeasureDatabaseError(
			`"${name}" is not a measure database: the name does not end in ${MEASURE_DATABASE.suffix}. Nothing was dropped.`,
		);
	}

	await withMaintenance(base, async (client) => {
		const row = await describe(client, name);
		if (!row) return;

		if (!parseMeasureComment(row.description)) {
			throw new MeasureDatabaseError(
				`"${name}" does not carry the measure-session mark (COMMENT "${MEASURE_DATABASE.commentPrefix} …"), so this command did not create it. Nothing was dropped.`,
			);
		}

		await dropDatabase(client, name);
	});
}

export interface LockOptions {
	waitMs: number;
	pollMs: number;
	onWait: () => void;
}

export async function holdMeasureLock(
	base: string,
	name: string,
	{ waitMs, pollMs, onWait }: LockOptions,
): Promise<() => Promise<void>> {
	const client = new pg.Client({
		connectionString: databaseUrl(base, "postgres"),
	});
	client.on("error", () => {});
	await client.connect();

	const key = BigInt.asIntN(
		64,
		BigInt(`0x${createHash("sha256").update(name).digest("hex").slice(0, 16)}`),
	).toString();
	const started = Date.now();
	let told = false;

	for (;;) {
		const result = await client.query<{ held: boolean }>(
			"SELECT pg_try_advisory_lock($1::bigint) AS held",
			[key],
		);

		if (result.rows[0]?.held) {
			return async () => {
				await client
					.query("SELECT pg_advisory_unlock($1::bigint)", [key])
					.catch(() => {});
				await client.end().catch(() => {});
			};
		}

		if (!told) {
			onWait();
			told = true;
		}

		if (Date.now() - started > waitMs) {
			await client.end().catch(() => {});
			throw new MeasureDatabaseError(
				`another measure session held ${name} for longer than ${Math.round(waitMs / 60_000)} min, so this one gave up waiting.`,
			);
		}

		await new Promise((done) => setTimeout(done, pollMs));
	}
}

export async function markWorkspaceOnboarded(url: string): Promise<boolean> {
	const client = new pg.Client({ connectionString: url });
	await client.connect();

	try {
		const rows = await client.query<{ metadata: string | null }>(
			"SELECT metadata FROM organization WHERE id = $1",
			[WORKSPACE_ID],
		);
		const row = rows.rows[0];
		if (!row) return false;

		await client.query("UPDATE organization SET metadata = $1 WHERE id = $2", [
			markOnboarded(row.metadata, new Date()),
			WORKSPACE_ID,
		]);
		return true;
	} finally {
		await client.end();
	}
}

export async function databaseFingerprint(
	url: string,
): Promise<Record<string, { rows: number; md5: string }>> {
	const client = new pg.Client({ connectionString: url });
	await client.connect();

	try {
		const tables = await client.query<{ table_name: string }>(
			`SELECT table_name FROM information_schema.tables
			  WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
			  ORDER BY table_name`,
		);
		const print: Record<string, { rows: number; md5: string }> = {};

		for (const { table_name: table } of tables.rows) {
			const result = await client.query<{ rows: string; md5: string | null }>(
				`SELECT count(*) AS rows,
				        md5(coalesce(string_agg(t::text, E'\\n' ORDER BY t::text), '')) AS md5
				   FROM "${table}" t`,
			);
			print[table] = {
				rows: Number(result.rows[0]?.rows ?? 0),
				md5: result.rows[0]?.md5 ?? "",
			};
		}

		return print;
	} finally {
		await client.end();
	}
}

async function main(argv: string[]): Promise<number> {
	const flag = (name: string) => argv.includes(name);
	const named = argv[argv.indexOf("--ten") + 1];
	const tree = argv.includes("--ten") && named ? named : currentTree();
	const base = serverUrl();
	const log: Log = (line) => console.error(line);

	if (flag("--tao")) {
		const url = await createMeasureDatabase({ base, tree, log });
		console.error(
			`  created ${measureDatabaseName(tree)} from ${templateDatabaseName(tree)}`,
		);
		console.log(url);
		return 0;
	}

	if (flag("--xoa")) {
		const target = argv.includes("--kho")
			? (argv[argv.indexOf("--kho") + 1] ?? "")
			: measureDatabaseName(tree);
		await dropMeasureDatabase(base, target);
		console.error(`  dropped ${target}`);
		return 0;
	}

	if (flag("--quet")) {
		const dropped = await withMaintenance(base, (client) =>
			sweepMeasureDatabases(client),
		);
		for (const name of dropped) console.error(`  dropped ${name}`);
		console.error(`  swept ${dropped.length} measure database(s)`);
		return 0;
	}

	console.error(
		"usage: bun run db:do --tao | --xoa [--kho <name>] | --quet  [--ten <tree>]",
	);
	return 3;
}

if (import.meta.main) {
	try {
		process.exit(await main(process.argv.slice(2)));
	} catch (error) {
		if (error instanceof MeasureDatabaseError) {
			console.error(`db:do: ${error.message}`);
			process.exit(2);
		}
		throw error;
	}
}
