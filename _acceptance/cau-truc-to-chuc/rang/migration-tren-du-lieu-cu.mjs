import { execFileSync, spawnSync } from "node:child_process";
import {
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
import { VONG } from "./cau-hinh.mjs";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const DB_GOI = join(GOC, "packages/db");
const pg = createRequire(join(DB_GOI, "package.json"))("pg");
const { dropDatabase, withMaintenance } = await import(
	join(DB_GOI, "scripts/test-db-admin.ts")
);

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
const ten = `crm_ttc_mig_${process.pid}_test`;
const dich = new URL(goc);
dich.pathname = `/${ten}`;
const url = dich.toString();

function migrate(thuMuc) {
	const tam = mkdtempSync(join(tmpdir(), "ttc-prisma-"));
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
const MIGRATIONS = "packages/db/prisma/migrations";
function rut(sha, tienTo) {
	const thuMuc = mkdtempSync(join(tmpdir(), tienTo));
	execFileSync("sh", [
		"-c",
		`git -C "${GOC}" archive ${sha} ${MIGRATIONS} | tar -x -C "${thuMuc}"`,
	]);
	return thuMuc;
}
const cu = rut(VONG.truoc, "ttc-mig-cu-");
const thuMucCu = join(cu, MIGRATIONS);
const sau = rut(VONG.sau, "ttc-mig-moi-");
const moi = join(sau, MIGRATIONS);
if (chieuDo) {
	mkdirSync(join(moi, "29990101000000_do"));
	writeFileSync(
		join(moi, "29990101000000_do", "migration.sql"),
		'ALTER TABLE "department" ADD COLUMN "x" TEXT NOT NULL;\n',
	);
}

const PHONG_BAN = [
	["pb0", "Kinh doanh", 0, false],
	["pb1", "Kinh doanh", 3, true],
	["pb2", "Van hanh", 7, false],
	["pb3", "Ke toan", 8, false],
	["pb4", "Phap che", 12, false],
];
const BUOC = [
	["b1", "kh1", "pb0"],
	["b2", "kh1", "pb0"],
	["b3", "kh1", "pb2"],
	["b4", "kh2", "pb1"],
	["b5", "kh2", "pb3"],
	["b6", "kh2", "pb3"],
];
const ANH = `SELECT d.id, d.name, d.position, d."archivedAt" IS NOT NULL AS luu,
	(SELECT count(*)::int FROM "onboardingStep" s WHERE s."departmentId" = d.id) AS buoc
	FROM "department" d ORDER BY d.id`;

async function voiKetNoi(viec) {
	const c = new pg.Client({ connectionString: url });
	await c.connect();
	try {
		return await viec(c);
	} finally {
		await c.end();
	}
}

async function gieo(c) {
	await c.query(
		`INSERT INTO "user" ("id","name","email","emailVerified","createdAt","updatedAt") VALUES ('ttc-u','ttc','ttc@thu.test',true,now(),now())`,
	);
	await c.query(
		`INSERT INTO "company" ("id","name","createdAt","updatedAt") VALUES ('ttc-cty','ttc cty',now(),now())`,
	);
	for (const [id, n, p, luu] of PHONG_BAN) {
		await c.query(
			`INSERT INTO "department" ("id","name","position","archivedAt","createdAt","updatedAt") VALUES ($1,$2,$3,${luu ? "now()" : "NULL"},now(),now())`,
			[id, n, p],
		);
	}
	for (const kh of ["kh1", "kh2"]) {
		await c.query(
			`INSERT INTO "onboardingPlan" ("id","companyId","startedAt","targetDays","ownerId","createdAt","updatedAt") VALUES ($1,'ttc-cty',now(),30,'ttc-u',now(),now())`,
			[kh],
		);
	}
	for (const [i, [id, kh, pb]] of BUOC.entries()) {
		await c.query(
			`INSERT INTO "onboardingStep" ("id","planId","label","departmentId","dueAt","position","createdAt","updatedAt") VALUES ($1,$2,'buoc',$3,now(),$4,now(),now())`,
			[id, kh, pb, i],
		);
	}
	return (await c.query(ANH)).rows;
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
			`KHONG DO DUOC: migrate luoc do cu hong\n${r1.stdout}${r1.stderr}`,
		);
		ma = 2;
	} else {
		const truoc = await voiKetNoi(gieo);
		const r2 = migrate(moi);
		if (r2.status !== 0) {
			console.log(
				`migration do tren du lieu cu\n${`${r2.stdout}${r2.stderr}`.slice(-1500)}`,
			);
			ma = 1;
		} else {
			const { sau, dac, soViTri } = await voiKetNoi(async (c) => ({
				sau: (await c.query(ANH)).rows,
				dac: (
					await c.query(`SELECT "divisionId", "headUserId" FROM "department"`)
				).rows,
				soViTri: (
					await c.query(`SELECT count(*)::int AS n FROM "orgPlacement"`)
				).rows[0].n,
			}));
			const hong = [];
			let khang = 0;
			for (const t of truoc) {
				const s = sau.find((x) => x.id === t.id);
				for (const k of ["name", "position", "luu", "buoc"]) {
					khang += 1;
					if (String(s?.[k]) !== String(t[k])) {
						hong.push(`${t.id}.${k}: ${s?.[k]} != ${t[k]}`);
					}
				}
			}
			khang += 1;
			if (dac.some((d) => d.divisionId !== null))
				hong.push("co phong ban cu mang divisionId");
			khang += 1;
			if (dac.some((d) => d.headUserId !== null))
				hong.push("co phong ban cu mang headUserId");
			khang += 1;
			if (soViTri !== 0) hong.push(`orgPlacement ${soViTri} != 0`);
			console.log(`khang-dinh=${khang}/23`);
			for (const h of hong) console.log(`HONG ${h}`);
			ma = khang === 23 && hong.length === 0 ? 0 : 1;
		}
	}
} finally {
	await withMaintenance(goc, (c) => dropDatabase(c, ten));
	rmSync(cu, { recursive: true, force: true });
	rmSync(sau, { recursive: true, force: true });
}
process.exit(ma);
