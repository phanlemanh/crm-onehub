import { execFileSync, spawnSync } from "node:child_process";
import {
	cpSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const DB = join(GOC, "packages", "db");
const require = createRequire(join(DB, "package.json"));
const { Client } = require("pg");

const VONG = "20261006010000_giai_doan_thoa_thuan";
const MIG_VONG =
	process.env.GDTT_MIG ??
	join(DB, "prisma", "migrations", VONG, "migration.sql");
const KY_MONG = 53;

function docEnv(khoa) {
	if (process.env[khoa]) return process.env[khoa];
	const dong = readFileSync(join(GOC, ".env"), "utf8")
		.split("\n")
		.find((d) => d.startsWith(`${khoa}=`));
	if (!dong) throw new Error(`thieu ${khoa} trong .env`);
	return dong.slice(khoa.length + 1).replace(/^"|"$/g, "");
}

const git = (...doi) =>
	execFileSync("git", ["-C", GOC, ...doi], { encoding: "utf8" }).trim();

function mocTruoc() {
	if (process.env.GDTT_MOC) return process.env.GDTT_MOC;
	const them = git(
		"log",
		"--diff-filter=A",
		"--format=%H",
		"--",
		`packages/db/prisma/migrations/${VONG}`,
	)
		.split("\n")
		.filter(Boolean)
		.at(-1);
	if (!them) throw new Error(`khong tim thay commit them migration ${VONG}`);
	return git("rev-parse", `${them}^`);
}

function kyVong(moc) {
	const nguon = git("show", `${moc}:apps/app/lib/deal-stage.ts`);
	const thuTu = [
		...nguon
			.match(/const ORDER = \[([\s\S]*?)\] as const/)[1]
			.matchAll(/DealStage\.(\w+)/g),
	].map((m) => m[1]);
	const nhan = Object.fromEntries(
		[...nguon.matchAll(/(\w+): \{ label: "([^"]+)"/g)].map((m) => [m[1], m[2]]),
	);
	const mo = thuTu.slice(0, 4);
	const loai = (id) =>
		mo.includes(id) ? "OPEN" : id === "CLOSED_WON" ? "WON" : "LOST";
	const viTri = (id) => thuTu.filter((x) => loai(x) === loai(id)).indexOf(id);
	return thuTu.map((id) => ({
		id,
		label: nhan[id],
		kind: loai(id),
		position: viTri(id),
	}));
}

const sapKhoa = (o) =>
	JSON.stringify(Object.fromEntries(Object.entries(o ?? {}).sort()));

const hong = [];
let dem = 0;
function khang(dung, thongDiep) {
	dem += 1;
	if (!dung) hong.push(thongDiep);
}

const base = docEnv("TEST_DATABASE_URL");
const ten = `crm_gdtt${Date.now().toString(36)}_test`;
const url = base.replace(/\/[^/?]+(\?|$)/, `/${ten}$1`);
const tam = join(GOC, ".acceptance-runs", "giai-doan-thoa-thuan", `mig-${ten}`);
const quanTri = new Client({ connectionString: base });
await quanTri.connect();
await quanTri.query(`CREATE DATABASE "${ten}"`);
const kho = new Client({ connectionString: url });

try {
	const moc = mocTruoc();
	const mong = kyVong(moc);
	mkdirSync(join(tam, "migrations"), { recursive: true });
	for (const muc of readdirSync(join(DB, "prisma", "migrations"))) {
		if (muc === VONG) continue;
		cpSync(
			join(DB, "prisma", "migrations", muc),
			join(tam, "migrations", muc),
			{
				recursive: true,
			},
		);
	}
	writeFileSync(
		join(tam, "schema.prisma"),
		git("show", `${moc}:packages/db/prisma/schema.prisma`),
	);
	writeFileSync(
		join(tam, "prisma.config.ts"),
		`import { defineConfig } from "${join(DB, "node_modules", "prisma", "config")}";\nexport default defineConfig({ schema: "${join(tam, "schema.prisma")}", migrations: { path: "${join(tam, "migrations")}" }, datasource: { url: process.env.DATABASE_URL } });\n`,
	);
	const trien = spawnSync(
		join(DB, "node_modules", ".bin", "prisma"),
		["migrate", "deploy", "--config", join(tam, "prisma.config.ts")],
		{ env: { ...process.env, DATABASE_URL: url }, encoding: "utf8" },
	);
	if (trien.status !== 0) {
		console.error(trien.stdout, trien.stderr);
		throw new Error("migrate deploy toi moc truoc hong");
	}

	await kho.connect();
	await kho.query(
		`INSERT INTO "user" (id, name, email, "updatedAt") VALUES ('gdtt-u', 'Người đo', 'gdtt@example.test', now())`,
	);
	await kho.query(
		`INSERT INTO company (id, name, "updatedAt") VALUES ('gdtt-c', 'Công ty đo', now())`,
	);
	const gieo = mong.map((g) => ({
		id: `gdtt-d-${g.id}`,
		stage: g.id,
		archivedAt: ["UNQUALIFIED_TO_BUY", "CLOSED_WON"].includes(g.id)
			? "2026-09-01T00:00:00Z"
			: null,
		closedAt: g.kind === "OPEN" ? null : "2026-09-02 00:00:00",
		closedReason: g.id === "CLOSED_LOST" ? "Hết nhu cầu" : null,
	}));
	for (const d of gieo) {
		await kho.query(
			`INSERT INTO deal (id, name, "companyId", "ownerId", stage, "archivedAt", "closedAt", "closedReason", "updatedAt")
			 VALUES ($1, $1, 'gdtt-c', 'gdtt-u', $2::"DealStage", $3, $4, $5, now())`,
			[d.id, d.stage, d.archivedAt, d.closedAt, d.closedReason],
		);
	}
	const lichSu = [
		{ from: null, to: "DEMO_BOOKED" },
		{ from: "DEMO_BOOKED", to: "CONTRACT_SENT" },
		{ from: "CONTRACT_SENT", to: "CLOSED_LOST" },
	];
	for (const [i, meta] of lichSu.entries()) {
		await kho.query(
			`INSERT INTO activity (id, type, "createdById", "dealId", "companyId", meta, "updatedAt")
			 VALUES ($1, 'STAGE_CHANGE', 'gdtt-u', 'gdtt-d-CLOSED_LOST', 'gdtt-c', $2, now())`,
			[`gdtt-a-${i}`, JSON.stringify(meta)],
		);
	}

	await kho.query(readFileSync(MIG_VONG, "utf8"));

	const { rows: hang } = await kho.query(
		`SELECT id, label, kind::text AS kind, position FROM "dealStage"`,
	);
	const theoId = new Map(hang.map((h) => [h.id, h]));
	for (const g of mong) {
		const co = theoId.get(g.id);
		for (const cot of ["id", "label", "kind", "position"]) {
			khang(
				co && co[cot] === g[cot],
				`${g.id}: ${cot} ${co ? co[cot] : "vang"} != ${g[cot]}`,
			);
		}
	}
	const { rows: deal } = await kho.query(
		`SELECT id, stage, to_char("closedAt", 'YYYY-MM-DD HH24:MI:SS') AS "closedAt", "closedReason" FROM deal WHERE id LIKE 'gdtt-d-%'`,
	);
	const dealTheoId = new Map(deal.map((d) => [d.id, d]));
	for (const d of gieo) {
		const co = dealTheoId.get(d.id);
		khang(co?.stage === d.stage, `${d.id}: stage ${co?.stage} != ${d.stage}`);
		khang(
			(co?.closedAt ?? null) === d.closedAt,
			`${d.id}: closedAt ${co?.closedAt} != ${d.closedAt}`,
		);
		khang(
			(co?.closedReason ?? null) === d.closedReason,
			`${d.id}: closedReason doi`,
		);
	}
	const { rows: act } = await kho.query(
		`SELECT id, meta FROM activity WHERE id LIKE 'gdtt-a-%' ORDER BY id`,
	);
	for (const [i, meta] of lichSu.entries()) {
		khang(
			sapKhoa(act[i]?.meta) === sapKhoa(meta),
			`gdtt-a-${i}: meta bi viet lai`,
		);
	}
	const { rows: kieu } = await kho.query(
		`SELECT 1 FROM pg_type WHERE typname = 'DealStage'`,
	);
	khang(kieu.length === 0, "enum DealStage con song");
} finally {
	await kho.end().catch(() => undefined);
	await quanTri.query(`DROP DATABASE IF EXISTS "${ten}" WITH (FORCE)`);
	await quanTri.end();
	rmSync(tam, { recursive: true, force: true });
}

for (const h of hong) console.log(`HONG ${h}`);
console.log(`khang-dinh=${dem - hong.length}/${KY_MONG}`);
if (dem !== KY_MONG) {
	console.log(`KHONG DO DUOC: dem ${dem} != ${KY_MONG}`);
	process.exit(2);
}
process.exit(hong.length === 0 ? 0 : 1);
