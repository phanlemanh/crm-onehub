import pg from "pg";
import { TEST_DATABASE } from "../src/test-database";

export function maintenanceUrl(target: string): string {
	const url = new URL(target);
	url.pathname = "/postgres";
	url.search = "";

	return url.toString();
}

export async function withMaintenance<T>(
	target: string,
	work: (client: pg.Client) => Promise<T>,
): Promise<T> {
	const client = new pg.Client({ connectionString: maintenanceUrl(target) });
	await client.connect();

	try {
		return await work(client);
	} finally {
		await client.end();
	}
}

export async function dropDatabase(
	client: pg.Client,
	database: string,
): Promise<void> {
	await client.query(
		`SELECT pg_terminate_backend(pid) FROM pg_stat_activity
		 WHERE datname = $1 AND pid <> pg_backend_pid()`,
		[database],
	);
	await client.query(`DROP DATABASE IF EXISTS "${database}"`);
}

export async function markRunDatabase(
	client: pg.Client,
	database: string,
	runId: string,
): Promise<void> {
	const comment = `${TEST_DATABASE.run.commentPrefix} ${runId} created ${new Date().toISOString()}`;
	await client.query(
		`COMMENT ON DATABASE "${database}" IS '${comment.replace(/'/g, "''")}'`,
	);
}

interface RunDatabaseRow {
	datname: string;
	description: string;
	backends: string;
}

export async function sweepStaleRunDatabases(
	client: pg.Client,
	baseName: string,
	now = Date.now(),
): Promise<string[]> {
	const stem = baseName.slice(0, -TEST_DATABASE.suffix.length);
	const rows = await client.query<RunDatabaseRow>(
		`SELECT d.datname, s.description,
		        (SELECT count(*) FROM pg_stat_activity a WHERE a.datname = d.datname) AS backends
		   FROM pg_database d
		   JOIN pg_shdescription s ON s.objoid = d.oid
		  WHERE d.datname LIKE $1 AND d.datname <> $2 AND s.description LIKE $3`,
		[
			`${stem}\\_%${TEST_DATABASE.suffix}`,
			baseName,
			`${TEST_DATABASE.run.commentPrefix} %`,
		],
	);

	const dropped: string[] = [];

	for (const row of rows.rows) {
		const created = Date.parse(row.description.split(" created ")[1] ?? "");
		if (Number.isNaN(created)) continue;
		if (now - created < TEST_DATABASE.run.maxAgeMs) continue;
		if (Number(row.backends) > 0) continue;

		await dropDatabase(client, row.datname);
		dropped.push(row.datname);
	}

	return dropped;
}
