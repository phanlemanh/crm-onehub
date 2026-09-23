import pg from "pg";
import { cauXemTruoc, sqlLuotDon } from "./luot-don-sql";

const BIEN_DICH = "XEM_TRUOC_DATABASE_URL";

async function chay(): Promise<void> {
	const url = process.env[BIEN_DICH];
	if (!url) {
		console.error(
			`dat ${BIEN_DICH} tro vao co so du lieu can xem truoc — lenh khong doc DATABASE_URL de khong dem nham may`,
		);
		process.exit(2);
	}
	const client = new pg.Client({ connectionString: url });
	await client.connect();
	try {
		await client.query("BEGIN READ ONLY");
		const { rows } = await client.query(cauXemTruoc(sqlLuotDon()));
		await client.query("ROLLBACK");
		console.log(
			JSON.stringify({ may: new URL(url).host, ...rows[0] }, null, 2),
		);
	} finally {
		await client.end();
	}
}

await chay();
