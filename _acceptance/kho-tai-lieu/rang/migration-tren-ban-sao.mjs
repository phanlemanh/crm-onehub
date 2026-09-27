import { execFileSync, spawnSync } from "node:child_process";
import {
	cpSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const DB_GOI = join(GOC, "packages/db");
const MIGRATIONS = "packages/db/prisma/migrations";
const pg = createRequire(join(DB_GOI, "package.json"))("pg");
const { dropDatabase, withMaintenance } = await import(
	join(DB_GOI, "scripts/test-db-admin.ts")
);

const MA_TRAN = [
	["user", 2],
	["organization", 1],
	["member", 2],
	["company", 3],
	["department", 2],
];
const EXTENSION = ["unaccent", "pg_trgm"];

function coSo() {
	if (process.env.TEST_DATABASE_URL) return process.env.TEST_DATABASE_URL;
	const dong = readFileSync(join(GOC, ".env"), "utf8")
		.split("\n")
		.find((d) => d.startsWith("TEST_DATABASE_URL="));
	return dong?.split("=").slice(1).join("=").replace(/"/g, "").trim() ?? "";
}

const goc = coSo();
if (!goc) {
	console.log("KHONG DO DUOC: khong doc duoc TEST_DATABASE_URL");
	process.exit(2);
}
const ten = `crm_ktl_mig_${process.pid}_test`;
const dich = new URL(goc);
dich.pathname = `/${ten}`;
const url = dich.toString();

function migrate(thuMuc) {
	const tam = mkdtempSync(join(tmpdir(), "ktl-prisma-"));
	const cauHinh = join(tam, "prisma.config.ts");
	writeFileSync(
		cauHinh,
		`export default ${JSON.stringify({
			schema: join(DB_GOI, "prisma/schema.prisma"),
			migrations: { path: thuMuc },
			datasource: { url },
		})};\n`,
	);
	const r = spawnSync(
		"bunx",
		["prisma", "migrate", "deploy", "--config", cauHinh],
		{
			cwd: DB_GOI,
			env: { ...process.env, DATABASE_URL: url },
			encoding: "utf8",
		},
	);
	rmSync(tam, { recursive: true, force: true });
	return r;
}

const chieuDo = process.argv[2] === "--chieu-do";
const base = execFileSync(
	"git",
	["-C", GOC, "merge-base", "HEAD", "origin/onehub"],
	{ encoding: "utf8" },
).trim();

const cu = mkdtempSync(join(tmpdir(), "ktl-mig-cu-"));
execFileSync("sh", [
	"-c",
	`git -C "${GOC}" archive ${base} ${MIGRATIONS} | tar -x -C "${cu}"`,
]);
const thuMucCu = join(cu, MIGRATIONS);
const sau = mkdtempSync(join(tmpdir(), "ktl-mig-moi-"));
const thuMucMoi = join(sau, "migrations");
cpSync(join(GOC, MIGRATIONS), thuMucMoi, { recursive: true });
if (chieuDo) {
	mkdirSync(join(thuMucMoi, "29990101000000_do"));
	writeFileSync(
		join(thuMucMoi, "29990101000000_do", "migration.sql"),
		'DELETE FROM "department";\n',
	);
}

async function voiKetNoi(viec) {
	const c = new pg.Client({ connectionString: url });
	await c.connect();
	try {
		return await viec(c);
	} finally {
		await c.end();
	}
}

async function demDong(c) {
	const kq = {};
	for (const [bang] of MA_TRAN) {
		kq[bang] = (
			await c.query(`SELECT count(*)::int AS n FROM "${bang}"`)
		).rows[0].n;
	}
	return kq;
}

async function gieo(c) {
	for (const i of [1, 2]) {
		await c.query(
			`INSERT INTO "user" ("id","name","email","emailVerified","createdAt","updatedAt") VALUES ($1,$2,$3,true,now(),now())`,
			[`ktl-u${i}`, `ktl ${i}`, `ktl${i}@thu.test`],
		);
	}
	await c.query(
		`INSERT INTO "organization" ("id","name","slug","createdAt") VALUES ('ktl-org','ktl','ktl-org',now())`,
	);
	for (const [i, vai] of [
		[1, "owner"],
		[2, "member"],
	]) {
		await c.query(
			`INSERT INTO "member" ("id","organizationId","userId","role","createdAt") VALUES ($1,'ktl-org',$2,$3,now())`,
			[`ktl-m${i}`, `ktl-u${i}`, vai],
		);
	}
	for (const i of [1, 2, 3]) {
		await c.query(
			`INSERT INTO "company" ("id","name","createdAt","updatedAt") VALUES ($1,$2,now(),now())`,
			[`ktl-cty${i}`, `Cong ty ${i}`],
		);
	}
	for (const [i, n] of [
		[1, "Phap che"],
		[2, "Van hanh"],
	]) {
		await c.query(
			`INSERT INTO "department" ("id","name","position","createdAt","updatedAt") VALUES ($1,$2,$3,now(),now())`,
			[`ktl-pb${i}`, n, i],
		);
	}
	return demDong(c);
}

let ma = 1;
try {
	await withMaintenance(goc, async (c) => {
		await dropDatabase(c, ten);
		await c.query(`CREATE DATABASE "${ten}"`);
	});
	const r1 = migrate(thuMucCu);
	if (r1.status !== 0) {
		console.log(
			`KHONG DO DUOC: migrate luoc do cu hong\n${`${r1.stdout}${r1.stderr}`.slice(-1500)}`,
		);
		ma = 2;
	} else {
		const truoc = await voiKetNoi(gieo);
		const lechGieo = MA_TRAN.filter(([b, n]) => truoc[b] !== n);
		if (lechGieo.length > 0) {
			console.log(
				`KHONG DO DUOC: gieo lech ma tran: ${lechGieo.map(([b, n]) => `${b} ${truoc[b]} != ${n}`).join(", ")}`,
			);
			ma = 2;
		} else {
			console.log(
				`anh chup truoc: ${MA_TRAN.map(([b]) => `${b}=${truoc[b]}`).join(" ")}`,
			);
			const r2 = migrate(thuMucMoi);
			if (r2.status !== 0) {
				console.log(
					`migration do tren ban sao\n${`${r2.stdout}${r2.stderr}`.slice(-1500)}`,
				);
				ma = 1;
			} else {
				const { sauDem, ext, khongDau } = await voiKetNoi(async (c) => {
					const ext = (
						await c.query(
							"SELECT extname FROM pg_extension WHERE extname = ANY($1)",
							[EXTENSION],
						)
					).rows.map((r) => r.extname);
					return {
						sauDem: await demDong(c),
						ext,
						khongDau: ext.includes("unaccent")
							? (await c.query("SELECT unaccent('Quy định') AS v")).rows[0].v
							: "(khong co unaccent)",
					};
				});
				const hong = [];
				let khang = 0;
				for (const [bang, n] of MA_TRAN) {
					khang += 1;
					if (sauDem[bang] !== n) {
						hong.push(`bang cu mat dong: ${bang} ${n} -> ${sauDem[bang]}`);
					}
				}
				for (const e of EXTENSION) {
					khang += 1;
					if (!ext.includes(e)) hong.push(`thieu extension ${e}`);
				}
				khang += 1;
				if (khongDau !== "Quy dinh") {
					hong.push(`unaccent('Quy định') = '${khongDau}' != 'Quy dinh'`);
				}
				console.log(
					`anh chup sau: ${MA_TRAN.map(([b]) => `${b}=${sauDem[b]}`).join(" ")}`,
				);
				console.log(
					`extension: ${ext.sort().join(", ")} · unaccent: ${khongDau}`,
				);
				console.log(
					`khang-dinh=${khang}/${MA_TRAN.length + EXTENSION.length + 1}`,
				);
				for (const h of hong) console.log(h);
				ma = hong.length === 0 ? 0 : 1;
			}
		}
	}
} finally {
	await withMaintenance(goc, (c) => dropDatabase(c, ten));
	rmSync(cu, { recursive: true, force: true });
	rmSync(sau, { recursive: true, force: true });
}
process.exit(ma);
