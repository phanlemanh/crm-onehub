import "@crm/env/load";
import { spawn, spawnSync } from "node:child_process";
import { join, resolve } from "node:path";
import {
	databaseName,
	mintRunId,
	runScopedUrl,
	TEST_DATABASE,
} from "../src/test-database";
import { dropDatabase, withMaintenance } from "./test-db-admin";

const PACKAGE = resolve(import.meta.dirname, "..");
const ROOT = resolve(PACKAGE, "..", "..");
const TURBO = join(ROOT, "node_modules", ".bin", "turbo");

const base = process.env.TEST_DATABASE_URL;

if (!base) {
	fail([
		"TEST_DATABASE_URL is not set, so there is no server to put a run database on.",
		"Copy .env.example to .env at the repo root, then run:",
		"",
		"    bun run db:test",
		"",
	]);
}

const runId = process.env.TEST_RUN_ID || mintRunId();
const url = runScopedUrl(base, runId);
const name = databaseName(url);
const env = { ...process.env, TEST_RUN_ID: runId, TEST_DATABASE_URL: url };

console.log(`test-run: ${name} is this run's database (TEST_RUN_ID=${runId})`);

const prepared = spawnSync("bun", ["run", "db:test"], {
	cwd: PACKAGE,
	stdio: "inherit",
	env,
});

if (prepared.status !== 0) {
	fail([`bun run db:test could not prepare ${name}, so nothing ran.`]);
}

const command = commandFor(process.argv.slice(2));
let interrupted = false;

const child = spawn(command[0], command.slice(1), {
	cwd: ROOT,
	stdio: "inherit",
	env,
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
	process.on(signal, () => {
		interrupted = true;
		child.kill(signal);
	});
}

const code = await new Promise<number>((done) => {
	child.on("error", (error) => {
		console.error(
			`test-run: could not start ${command.join(" ")}: ${error.message}`,
		);
		done(1);
	});
	child.on("exit", (exitCode) => done(exitCode ?? 1));
});

try {
	await withMaintenance(base, (client) => dropDatabase(client, name));
	console.log(`test-run: dropped ${name}`);
} catch (error) {
	console.error(
		`test-run: could not drop ${name}; the next db:test sweeps it after ${TEST_DATABASE.run.maxAgeMs / 3_600_000}h: ${error instanceof Error ? error.message : String(error)}`,
	);
}

process.exit(interrupted && code === 0 ? 130 : code);

function commandFor(args: string[]): string[] {
	if (args.every((arg) => arg.startsWith("--"))) {
		return [TURBO, "run", "test", "--concurrency=1", ...args];
	}

	return ["sh", "-c", args.join(" ")];
}

function fail(lines: string[]): never {
	console.error(["", ...lines.map((line) => `  ${line}`), ""].join("\n"));
	process.exit(1);
}
