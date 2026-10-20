import { execFileSync, spawnSync } from "node:child_process";
import {
	existsSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TEP = fileURLToPath(import.meta.url);
const GOC = join(dirname(TEP), "..", "..", "..");
const THU_MUC = "packages/db/prisma/migrations";
const SCHEMA = "packages/db/prisma/schema.prisma";
const MIGRATION_HO_SO = "20261020053000_go_tin_hieu_rac";
const BANG_MOI = "tinHieuVet";
const BANG_THEM_COT = "tinHieu";
const DUOC_DUNG = new Set([BANG_MOI, BANG_THEM_COT]);
const THONG_DIEP = "migration khong chi them";
const THONG_DIEP_THU_TU = "migration tro toi bang tao sau no";
const THONG_DIEP_TROI = "schema troi so voi migration";

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

function tenBang(c) {
	return (
		c.match(
			/^(?:CREATE TABLE|ALTER TABLE)\s+(?:IF NOT EXISTS\s+)?"?([^"\s(]+)"?/i,
		)?.[1] ??
		c.match(/\sON\s+"?([^"\s(]+)"?/i)?.[1] ??
		""
	);
}

function viPhamThemCot(c) {
	const cot = c.match(/ADD COLUMN\s+"?([^"\s]+)"?\s+(.*)$/i);
	if (!cot) return `ALTER TABLE la: ${c.slice(0, 60)}`;
	const du = cot[2].toUpperCase();
	if (/\bNOT NULL\b/.test(du)) return "ADD COLUMN NOT NULL";
	if (/\bDEFAULT\b/.test(du)) return "ADD COLUMN DEFAULT";
	return null;
}

function viPham(c) {
	const hoa = c.toUpperCase();
	if (/^UPDATE\b/.test(hoa)) return "UPDATE";
	if (/^DELETE\b/.test(hoa)) return "DELETE";
	if (/^INSERT\b/.test(hoa)) return "INSERT";
	if (/\bDROP\b/.test(hoa)) return "DROP";
	if (/\bALTER COLUMN\b/.test(hoa)) return "ALTER COLUMN";
	if (/\bRENAME\b/.test(hoa)) return "RENAME";
	if (/^CREATE EXTENSION\b/.test(hoa)) return "CREATE EXTENSION";
	if (/^CREATE TABLE\b/.test(hoa))
		return tenBang(c) === BANG_MOI ? null : `CREATE TABLE la: ${tenBang(c)}`;
	if (/^CREATE (UNIQUE )?INDEX\b/.test(hoa))
		return DUOC_DUNG.has(tenBang(c)) ? null : "CREATE INDEX tren bang khac";
	if (/^ALTER TABLE\b/.test(hoa)) {
		const bang = tenBang(c);
		if (!DUOC_DUNG.has(bang)) return "ALTER TABLE tren bang khac";
		if (/ ADD CONSTRAINT "?[^"\s]+"? FOREIGN KEY/.test(hoa)) return null;
		if (bang === BANG_THEM_COT && / ADD COLUMN /.test(hoa))
			return viPhamThemCot(c);
		return `ALTER TABLE la: ${c.slice(0, 60)}`;
	}
	return `lenh la: ${c.slice(0, 60)}`;
}

function bangTroToi(c) {
	const ds = new Set();
	const bang = tenBang(c);
	if (bang && bang !== BANG_MOI) ds.add(bang);
	for (const m of c.matchAll(/REFERENCES\s+"?([^"\s(]+)"?/gi)) ds.add(m[1]);
	ds.delete(BANG_MOI);
	return [...ds];
}

function bangTaoTruoc(thuMuc, ten) {
	const da = new Set();
	for (const d of readdirSync(thuMuc).sort()) {
		if (d >= ten) break;
		const tep = join(thuMuc, d, "migration.sql");
		if (!existsSync(tep)) continue;
		for (const c of cauLenh(readFileSync(tep, "utf8")))
			if (/^CREATE TABLE\b/i.test(c)) da.add(tenBang(c));
	}
	return da;
}

function soLenh(sql, thuMuc, ten) {
	const truoc = bangTaoTruoc(thuMuc, ten);
	const hong = [];
	const ds = cauLenh(sql);
	for (const c of ds) {
		const v = viPham(c);
		console.log(`${v ? "SAI" : "DUNG"} · ${c.slice(0, 90)}`);
		if (v) hong.push(`${THONG_DIEP}: ${v}`);
		for (const b of bangTroToi(c))
			if (!truoc.has(b)) hong.push(`${THONG_DIEP_THU_TU}: ${b}`);
	}
	return { dem: ds.length, hong };
}

function troiSchema(sql) {
	const base = execFileSync(
		"git",
		["-C", GOC, "merge-base", "HEAD", "origin/onehub"],
		{ encoding: "utf8" },
	).trim();
	const tam = mkdtempSync(join(tmpdir(), "gtr-schema-"));
	try {
		const cu = join(tam, "cu.prisma");
		writeFileSync(
			cu,
			execFileSync("git", ["-C", GOC, "show", `${base}:${SCHEMA}`], {
				encoding: "utf8",
			}),
		);
		const r = spawnSync(
			"bunx",
			[
				"prisma",
				"migrate",
				"diff",
				"--from-schema",
				cu,
				"--to-schema",
				join(GOC, SCHEMA),
				"--script",
			],
			{ cwd: join(GOC, "packages/db"), encoding: "utf8" },
		);
		if (r.status !== 0)
			return `KHONG DO DUOC: prisma migrate diff thoat ${r.status}: ${r.stderr.trim().slice(0, 200)}`;
		const muon = new Set(cauLenh(r.stdout));
		const co = new Set(cauLenh(sql));
		const thieu = [...muon].filter((c) => !co.has(c));
		const thua = [...co].filter((c) => !muon.has(c));
		if (thieu.length === 0 && thua.length === 0) return null;
		return `${THONG_DIEP_TROI}: thieu ${thieu.length}, thua ${thua.length}${thieu[0] ? ` · vd thieu: ${thieu[0].slice(0, 80)}` : ""}${thua[0] ? ` · vd thua: ${thua[0].slice(0, 80)}` : ""}`;
	} finally {
		rmSync(tam, { recursive: true, force: true });
	}
}

function chay(sql, thuMuc, ten, coTroi) {
	const { dem, hong } = soLenh(sql, thuMuc, ten);
	console.log(`migration ${ten} · so cau lenh: ${dem}`);
	if (dem === 0) {
		console.log("KHONG DO DUOC: migration rong");
		return 2;
	}
	if (coTroi) {
		const t = troiSchema(sql);
		if (t?.startsWith("KHONG DO DUOC")) {
			console.log(t);
			return 2;
		}
		if (t) hong.push(t);
	}
	for (const h of hong) console.log(h);
	return hong.length === 0 ? 0 : 1;
}

const CA_DO = [
	["UPDATE", `UPDATE "tinHieu" SET "archivedAt" = now();\n`, THONG_DIEP],
	[
		"ADD COLUMN NOT NULL",
		'ALTER TABLE "tinHieu" ADD COLUMN "x" TEXT NOT NULL;\n',
		THONG_DIEP,
	],
	["DROP", 'DROP TABLE "tinHieuVet";\n', THONG_DIEP],
	[
		"bang tao sau",
		'ALTER TABLE "tinHieuVet" ADD CONSTRAINT "f" FOREIGN KEY ("x") REFERENCES "bangChuaCo"("id");\n',
		THONG_DIEP_THU_TU,
	],
];

const thuMuc = join(GOC, THU_MUC);
if (process.argv[2] === "--tep") {
	process.exit(
		chay(
			readFileSync(process.argv[3], "utf8"),
			thuMuc,
			MIGRATION_HO_SO,
			false,
		),
	);
}

const tam = mkdtempSync(join(tmpdir(), "gtr-chi-them-"));
let bat = 0;
try {
	for (const [i, [loai, sql, ghim]] of CA_DO.entries()) {
		const tep = join(tam, `gia-${i}.sql`);
		writeFileSync(tep, sql);
		const r = spawnSync(process.execPath, [TEP, "--tep", tep], {
			encoding: "utf8",
		});
		const trung = r.status === 1 && r.stdout.includes(ghim);
		if (trung) bat += 1;
		console.log(
			`chieu do · ${loai} -> exit ${r.status} · ${trung ? ghim : "KHONG BAT"}`,
		);
	}
} finally {
	rmSync(tam, { recursive: true, force: true });
}
if (bat !== CA_DO.length) {
	console.log(`doi chung: SAI — chieu do chi bat ${bat}/${CA_DO.length}`);
	process.exit(3);
}
console.log(`doi chung: do dung ${bat}/${CA_DO.length}`);

const tep = join(thuMuc, MIGRATION_HO_SO, "migration.sql");
if (!existsSync(tep)) {
	console.log(`KHONG DO DUOC: thieu migration cua ho so: ${THU_MUC}/${MIGRATION_HO_SO}`);
	process.exit(2);
}
process.exit(chay(readFileSync(tep, "utf8"), thuMuc, MIGRATION_HO_SO, true));
