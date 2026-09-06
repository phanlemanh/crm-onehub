import "@crm/env/load";
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import pg from "pg";
import {
	databaseName,
	runScopedUrl,
	TEST_DATABASE,
} from "../src/test-database";
import {
	dropDatabase,
	maintenanceUrl,
	markRunDatabase,
	sweepStaleRunDatabases,
} from "./test-db-admin";

const SCHEMA = join(dirname(import.meta.dirname), "prisma", "schema.prisma");
const MIGRATIONS = join(dirname(import.meta.dirname), "prisma", "migrations");

const base = resolve();

if (!base) {
	fail([
		"Neither TEST_DATABASE_URL nor DATABASE_URL is set.",
		"Copy .env.example to .env at the repo root.",
	]);
}

const baseName = databaseName(base);

if (!baseName.endsWith(TEST_DATABASE.suffix)) {
	fail([
		`TEST_DATABASE_URL names "${baseName}", which does not end in ${TEST_DATABASE.suffix}.`,
		"The suite refuses anything else, because it deletes rows it expects to",
		"put back and an interrupted run leaves them deleted.",
	]);
}

const runId = process.env.TEST_RUN_ID;
const url = runScopedUrl(base, runId);
const name = databaseName(url);

await create(url, name, process.argv.includes("--reset"), runId);
migrate(url);

if (!process.env.TEST_DATABASE_URL) {
	console.log(
		[
			"",
			"  Add this to .env so the suite finds it:",
			"",
			`    TEST_DATABASE_URL="${base}"`,
			"",
		].join("\n"),
	);
}

if (runId) {
	console.log(`  TEST_RUN_ID=${runId} runs against ${name}`);
}

async function create(
	target: string,
	database: string,
	forced: boolean,
	runId: string | undefined,
): Promise<void> {
	const client = new pg.Client({ connectionString: maintenanceUrl(target) });

	try {
		await client.connect();
	} catch (error) {
		fail([
			`Could not reach the server at ${new URL(target).host}.`,
			"Is Postgres running?  docker compose up -d",
			"",
			error instanceof Error ? error.message : String(error),
		]);
	}

	try {
		const existing = await client.query(
			"SELECT 1 FROM pg_database WHERE datname = $1",
			[database],
		);

		for (const stale of await sweepStaleRunDatabases(client, baseName)) {
			console.log(`  dropped ${stale}: an older run left it behind`);
		}

		if (existing.rowCount) {
			const reason = forced
				? "you asked for --reset"
				: await stale(target, database);

			if (!reason) {
				console.log(`  ${database} already exists`);
				return;
			}

			console.log(`  rebuilding ${database}: ${reason}`);
			await dropDatabase(client, database);
		}

		await client.query(`CREATE DATABASE "${database}"`);
		if (runId) await markRunDatabase(client, database, runId);
		console.log(`  created ${database}`);
	} finally {
		await client.end();
	}
}

async function stale(target: string, database: string): Promise<string | null> {
	const applied = await appliedMigrations(target);

	if (applied === null) return null;

	const onDisk = new Set(
		existsSync(MIGRATIONS)
			? readdirSync(MIGRATIONS, { withFileTypes: true })
					.filter((entry) => entry.isDirectory())
					.map((entry) => entry.name)
			: [],
	);

	const foreign = applied.filter((migration) => !onDisk.has(migration));

	if (foreign.length > 0) {
		return `${database} holds ${foreign.length} migration(s) this branch does not have, starting with ${foreign[0]}`;
	}

	return drifted(target) ? `${database} no longer matches schema.prisma` : null;
}

async function appliedMigrations(target: string): Promise<string[] | null> {
	const client = new pg.Client({ connectionString: target });

	try {
		await client.connect();
	} catch {
		return null;
	}

	try {
		const rows = await client.query<{ migration_name: string }>(
			`SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NOT NULL`,
		);
		return rows.rows.map((row) => row.migration_name);
	} catch {
		return null;
	} finally {
		await client.end();
	}
}

function drifted(target: string): boolean {
	const result = spawnSync(
		"prisma",
		[
			"migrate",
			"diff",
			"--from-config-datasource",
			"--to-schema",
			SCHEMA,
			"--exit-code",
		],
		{ stdio: "ignore", env: { ...process.env, DATABASE_URL: target } },
	);

	return result.status === 2;
}

function migrate(target: string): void {
	const result = spawnSync("prisma", ["migrate", "deploy"], {
		stdio: "inherit",
		env: { ...process.env, DATABASE_URL: target },
	});

	if (result.error) {
		fail([
			"Could not run prisma migrate deploy.",
			"Run this through the package script, which puts prisma on PATH:",
			"",
			"    bun run db:test",
			"",
			result.error.message,
		]);
	}

	if (result.status !== 0) process.exit(result.status ?? 1);
}

function resolve(): string | null {
	const explicit = process.env.TEST_DATABASE_URL;
	if (explicit) return explicit;

	const live = process.env.DATABASE_URL;
	if (!live) return null;

	try {
		const parsed = new URL(live);
		const database = parsed.pathname.replace(/^\//, "");
		if (!database) return null;

		parsed.pathname = `/${database.endsWith(TEST_DATABASE.suffix) ? database : `${database}${TEST_DATABASE.suffix}`}`;

		return parsed.toString();
	} catch {
		return null;
	}
}

function fail(lines: string[]): never {
	console.error(["", ...lines.map((line) => `  ${line}`), ""].join("\n"));
	process.exit(1);
}
