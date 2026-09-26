import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { VONG } from "./cau-hinh.mjs";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const THU_MUC = "packages/db/prisma/migrations";
const git = (...d) =>
	execFileSync("git", ["-C", GOC, ...d], { encoding: "utf8" }).trim();

const lietKe = (sha) =>
	git("ls-tree", "--name-only", `${sha}:${THU_MUC}`).split("\n");
const cu = new Set(lietKe(VONG.truoc));
const BANG_CU = new Set(
	git("show", `${VONG.truoc}:packages/db/prisma/schema.prisma`)
		.split("\n")
		.map((d) => d.match(/@@map\("([^"]+)"\)/)?.[1])
		.filter(Boolean),
);

const pg = createRequire(join(GOC, "packages", "db", "package.json"))("pg");

function urlKho(ten) {
	const goc =
		process.env.DATABASE_URL ??
		readFileSync(join(GOC, ".env"), "utf8").match(/^DATABASE_URL=(.*)$/m)?.[1];
	if (!goc)
		throw new Error("khong tim thay DATABASE_URL trong moi truong hay .env");
	const u = new URL(goc.replace(/^["']|["']$/g, ""));
	u.pathname = `/${ten}`;
	u.search = "";
	return u.toString();
}

async function voiKho(ten, viec) {
	const c = new pg.Client({ connectionString: urlKho(ten) });
	await c.connect();
	try {
		return await viec(c);
	} finally {
		await c.end();
	}
}

const sqlMigration = (sha, t) =>
	git("show", `${sha}:${THU_MUC}/${t}/migration.sql`);

const GIEO = [
	`INSERT INTO "user" ("id","name","email","updatedAt") VALUES ('u-mig','Người đo migration','mig@thu.test',now())`,
	`INSERT INTO "company" ("id","name","updatedAt") VALUES ('c-mig','Công ty đo migration',now())`,
	`INSERT INTO "division" ("id","name","position","headUserId","updatedAt") VALUES ('dv-mig','Khối đo',0,'u-mig',now())`,
	`INSERT INTO "department" ("id","name","position","divisionId","headUserId","updatedAt") VALUES ('dp-mig','Phòng đo',0,'dv-mig','u-mig',now())`,
	`INSERT INTO "orgPlacement" ("userId","primaryDepartmentId","updatedAt") VALUES ('u-mig','dp-mig',now())`,
	`INSERT INTO "onboardingPlan" ("id","companyId","startedAt","targetDays","ownerId","updatedAt") VALUES ('p-mig','c-mig',now(),30,'u-mig',now())`,
	`INSERT INTO "okrCycle" ("id","kind","name","startsOn","endsOn","phase","updatedAt") VALUES ('cy-mig','quy','Quý đo','2026-07-01','2026-09-30','dang-chay',now())`,
	`INSERT INTO "okrObjective" ("id","cycleId","level","departmentId","ownerUserId","kind","status","title","publishedAt","updatedAt") VALUES ('o-mig','cy-mig','phong-ban','dp-mig','u-mig','cam-ket','cong-bo','Mục tiêu đo migration',now(),now())`,
	`INSERT INTO "okrKeyResult" ("id","objectiveId","title","kind","ownerUserId","startValue","targetValue","currentValue","updatedAt") VALUES ('k-mig','o-mig','KR đo migration','tang-toi','u-mig',0,10,3,now())`,
	`INSERT INTO "okrTrail" ("id","actorUserId","cycleId","objectiveId","keyResultId","action","after") VALUES ('t-mig','u-mig','cy-mig','o-mig','k-mig','tao-kr','{"title":"KR đo migration"}')`,
];
const BANG_GIEO = [
	"user",
	"company",
	"division",
	"department",
	"orgPlacement",
	"onboardingPlan",
	"okrCycle",
	"okrObjective",
	"okrKeyResult",
	"okrTrail",
];

async function vanTay(c, cacBang) {
	const ra = new Map();
	for (const b of cacBang) {
		const r = await c.query(
			`SELECT count(*)::int AS n, md5(coalesce(string_agg(t::text, '|' ORDER BY t::text), '')) AS h FROM "${b}" t`,
		);
		ra.set(b, `${r.rows[0].n}:${r.rows[0].h}`);
	}
	return ra;
}

async function chayTrenDuLieu(moi, sqlThem = "") {
	const kho = `crm_cnt_mig_${process.pid}`;
	const hong = [];
	await voiKho("postgres", async (c) => {
		await c.query(`DROP DATABASE IF EXISTS "${kho}"`);
		await c.query(`CREATE DATABASE "${kho}"`);
	});
	try {
		return await voiKho(kho, async (c) => {
			for (const t of [...cu]
				.filter((x) => x !== "migration_lock.toml" && x !== "")
				.sort())
				await c.query(sqlMigration(VONG.truoc, t));
			for (const cau of GIEO) await c.query(cau);
			const bangCu = (
				await c.query(
					`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`,
				)
			).rows.map((r) => r.table_name);
			const truoc = await vanTay(c, bangCu);
			const rong = BANG_GIEO.filter((b) => truoc.get(b)?.startsWith("0:"));
			if (rong.length > 0) hong.push(`gieo khong vao bang: ${rong.join(", ")}`);
			await c.query("BEGIN");
			for (const t of moi) await c.query(sqlMigration(VONG.sau, t));
			if (sqlThem) await c.query(sqlThem);
			await c.query("COMMIT");
			const sau = await vanTay(c, bangCu);
			const doi = bangCu.filter((b) => truoc.get(b) !== sau.get(b));
			for (const b of doi) hong.push(`migration lam doi du lieu bang cu: ${b}`);
			const bangSau = (
				await c.query(
					`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`,
				)
			).rows.map((r) => r.table_name);
			const bangMoi = bangSau.filter((b) => !bangCu.includes(b)).sort();
			const kr = await c.query(
				`SELECT "title", "currentValue"::text AS v FROM "okrKeyResult" WHERE "id" = 'k-mig'`,
			);
			if (kr.rows[0]?.title !== "KR đo migration" || kr.rows[0]?.v !== "3.0000")
				hong.push(
					`doc lai KR gieo sau migration sai: ${JSON.stringify(kr.rows[0] ?? null)}`,
				);
			console.log(
				`chay that tren kho tam ${kho}: ${bangCu.length} bang cu, ${BANG_GIEO.length} bang co dong gieo, bang moi: ${bangMoi.join(", ") || "(khong co)"}`,
			);
			return hong;
		});
	} finally {
		await voiKho("postgres", (c) =>
			c.query(`DROP DATABASE IF EXISTS "${kho}" WITH (FORCE)`),
		);
	}
}

function cauLenh(sql) {
	return sql
		.replace(/\/\*[\s\S]*?\*\//g, "")
		.split("\n")
		.filter((d) => !d.trim().startsWith("--"))
		.join("\n")
		.split(";")
		.map((c) => c.replace(/\s+/g, " ").trim())
		.filter((c) => c !== "");
}

function bang(c) {
	return c.match(/(?:TABLE|ON)\s+"([^"]+)"/i)?.[1] ?? "";
}

function viPham(c) {
	const hoa = c.toUpperCase();
	if (/^(UPDATE|DELETE)\b/.test(hoa) || /\bDROP\b/.test(hoa)) return "DROP";
	if (/ALTER COLUMN|RENAME/.test(hoa)) return "ALTER COLUMN/RENAME";
	const cuBang = BANG_CU.has(bang(c));
	if (cuBang && /ADD COLUMN/.test(hoa)) return "ADD COLUMN tren bang co san";
	if (cuBang && /ADD CONSTRAINT/.test(hoa) && /\b(UNIQUE|CHECK)\b/.test(hoa)) {
		return "ADD CONSTRAINT UNIQUE/CHECK";
	}
	if (cuBang && /^CREATE UNIQUE INDEX/.test(hoa)) return "CREATE UNIQUE INDEX";
	const hopLe = [
		/^CREATE TABLE/,
		/^CREATE INDEX/,
		/^CREATE UNIQUE INDEX/,
		/^ALTER TABLE "[^"]+" ADD COLUMN/,
		/^ALTER TABLE "[^"]+" ADD CONSTRAINT "[^"]+" FOREIGN KEY/,
	];
	return hopLe.some((m) => m.test(hoa)) ? null : `lenh la: ${c.slice(0, 60)}`;
}

if (process.argv[2] === "--chieu-do") {
	let bat = 0;
	for (const [nhan, sql] of [
		["DROP COLUMN", 'ALTER TABLE "okrKeyResult" DROP COLUMN "title";'],
		[
			"ADD COLUMN x tren okrKeyResult",
			'ALTER TABLE "okrKeyResult" ADD COLUMN "x" TEXT;',
		],
	]) {
		const v = cauLenh(sql).map(viPham).filter(Boolean);
		if (v.length > 0) bat += 1;
		console.log(
			`${nhan}: ${v.length > 0 ? `migration khong chi them: ${v.join(" | ")}` : "KHONG BAT"}`,
		);
	}
	const schemaGia = "model OkrA {}\nmodel Khac {}\nmodel OkrB {}";
	const modelsGia = [...schemaGia.matchAll(/^model (\w+) \{/gm)].map(
		(m) => m[1],
	);
	const dauGia = modelsGia.findIndex((m) => m.startsWith("Okr"));
	const sauOkrGia = modelsGia.slice(dauGia).filter((m) => !m.startsWith("Okr"));
	const viPhamLienKhoi = dauGia !== -1 && sauOkrGia.length > 0;
	if (viPhamLienKhoi) bat += 1;
	console.log(
		`model Okr xen giua: ${viPhamLienKhoi ? `migration khong chi them: model Okr khong lien cuoi schema: sau chung con ${sauOkrGia.join(", ")}` : "KHONG BAT"}`,
	);
	const moiDo = lietKe(VONG.sau).filter(
		(t) => !cu.has(t) && t !== "migration_lock.toml",
	);
	const hongDo = await chayTrenDuLieu(
		moiDo,
		`UPDATE "okrKeyResult" SET "currentValue" = 0`,
	);
	const batDuLieu = hongDo.includes(
		"migration lam doi du lieu bang cu: okrKeyResult",
	);
	if (batDuLieu) bat += 1;
	console.log(
		`sua du lieu bang cu trong luot migration: ${batDuLieu ? hongDo.join(" | ") : "KHONG BAT"}`,
	);
	process.exit(bat === 4 ? 1 : 0);
}

const moi = lietKe(VONG.sau).filter(
	(t) => !cu.has(t) && t !== "migration_lock.toml",
);
let dem = 0;
const hong = [];
for (const t of moi) {
	for (const c of cauLenh(
		git("show", `${VONG.sau}:${THU_MUC}/${t}/migration.sql`),
	)) {
		dem += 1;
		const v = viPham(c);
		if (v) hong.push(`migration khong chi them: ${v} (${t})`);
	}
}

const schema = git("show", `${VONG.sau}:packages/db/prisma/schema.prisma`);
const models = [...schema.matchAll(/^model (\w+) \{/gm)].map((m) => m[1]);
const dau = models.findIndex((m) => m.startsWith("Okr"));
const sauOkr = models.slice(dau).filter((m) => !m.startsWith("Okr"));
if (dau === -1) hong.push("khong co model Okr nao");
if (sauOkr.length > 0)
	hong.push(
		`model Okr khong lien cuoi schema: sau chung con ${sauOkr.join(", ")}`,
	);

console.log(
	`migration moi: ${moi.join(", ") || "(khong co)"} · so cau lenh: ${dem}`,
);
if (moi.length === 0 || dem === 0) {
	console.log("KHONG DO DUOC: khong co migration moi nao so voi base");
	process.exit(2);
}
hong.push(...(await chayTrenDuLieu(moi)));
for (const h of hong) console.log(h);
process.exit(hong.length === 0 ? 0 : 1);
