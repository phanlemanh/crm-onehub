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
const EXTENSION_CHO_PHEP = new Set(["unaccent", "pg_trgm"]);
const THONG_DIEP = "migration khong chi them";

const git = (...d) =>
	execFileSync("git", ["-C", GOC, ...d], { encoding: "utf8" }).trim();

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

function bangMoi(dsCau) {
	return new Set(
		dsCau
			.filter((c) => /^CREATE TABLE/i.test(c))
			.map(tenBang)
			.filter(Boolean),
	);
}

function viPham(c, moi) {
	const hoa = c.toUpperCase();
	if (/^UPDATE\b/.test(hoa)) return "UPDATE";
	if (/^DELETE\b/.test(hoa)) return "DELETE";
	if (/\bDROP\b/.test(hoa)) return "DROP";
	if (/\bALTER COLUMN\b/.test(hoa)) return "ALTER COLUMN";
	if (/\bRENAME\b/.test(hoa)) return "RENAME";
	if (/^CREATE EXTENSION\b/.test(hoa)) {
		const m = c.match(
			/^CREATE EXTENSION\s+(IF NOT EXISTS\s+)?"?([a-z_0-9]+)"?/i,
		);
		const ten = m?.[2] ?? "";
		if (!EXTENSION_CHO_PHEP.has(ten.toLowerCase())) {
			return `CREATE EXTENSION ${ten}`;
		}
		return m?.[1] ? null : "CREATE EXTENSION thieu IF NOT EXISTS";
	}
	if (/^CREATE TYPE\b/.test(hoa)) return null;
	if (/^CREATE TABLE\b/.test(hoa)) return null;
	if (/^CREATE (UNIQUE )?INDEX\b/.test(hoa)) {
		return moi.has(tenBang(c)) ? null : "CREATE INDEX tren bang da co";
	}
	if (/^ALTER TABLE\b/.test(hoa)) {
		if (!moi.has(tenBang(c))) return "ALTER TABLE tren bang da co";
		return /^ALTER TABLE "?[^"\s]+"? ADD CONSTRAINT "?[^"\s]+"? FOREIGN KEY/.test(
			hoa,
		)
			? null
			: `ALTER TABLE la: ${c.slice(0, 60)}`;
	}
	return `lenh la: ${c.slice(0, 60)}`;
}

function soTep(dsTep) {
	const theoTep = dsTep.map(([nhan, sql]) => [nhan, cauLenh(sql)]);
	const moi = bangMoi(theoTep.flatMap(([, ds]) => ds));
	const hong = [];
	let dem = 0;
	for (const [nhan, ds] of theoTep) {
		for (const c of ds) {
			dem += 1;
			const v = viPham(c, moi);
			if (v) hong.push(`${THONG_DIEP}: ${v} (${nhan})`);
		}
	}
	return { dem, hong };
}

function ketLuan(dsTep) {
	const { dem, hong } = soTep(dsTep);
	console.log(
		`migration moi: ${dsTep.map(([n]) => n).join(", ") || "(khong co)"} · so cau lenh: ${dem}`,
	);
	if (dsTep.length === 0 || dem === 0) {
		console.log(
			"KHONG DO DUOC: khong co cau lenh migration moi nao so voi base",
		);
		return 2;
	}
	for (const h of hong) console.log(h);
	return hong.length === 0 ? 0 : 1;
}

const [, , cheDo, duongDan] = process.argv;

if (cheDo === "--tep") {
	process.exit(ketLuan([[duongDan, readFileSync(duongDan, "utf8")]]));
}

if (cheDo === "--chieu-do") {
	const tam = mkdtempSync(join(tmpdir(), "ktl-chi-them-"));
	const CA = [
		["DROP", "DROP TABLE contact;\n"],
		[
			"ALTER TABLE tren bang da co",
			"ALTER TABLE department ADD COLUMN x TEXT NOT NULL;\n",
		],
		["CREATE EXTENSION vector", "CREATE EXTENSION vector;\n"],
	];
	let bat = 0;
	try {
		for (const [i, [loai, sql]] of CA.entries()) {
			const tep = join(tam, `gia-${i}.sql`);
			writeFileSync(tep, sql);
			const r = spawnSync(process.execPath, [TEP, "--tep", tep], {
				encoding: "utf8",
			});
			const ghim = `${THONG_DIEP}: ${loai}`;
			const trung = r.status === 1 && r.stdout.includes(ghim);
			if (trung) bat += 1;
			console.log(
				`${sql.trim()} -> exit ${r.status} · ${trung ? ghim : `KHONG BAT (${r.stdout.trim()})`}`,
			);
		}
	} finally {
		rmSync(tam, { recursive: true, force: true });
	}
	console.log(`chieu do bat ${bat}/${CA.length}`);
	process.exit(bat === CA.length ? 1 : 0);
}

const base = git("merge-base", "HEAD", "origin/onehub");
const cu = new Set(
	git("ls-tree", "--name-only", `${base}:${THU_MUC}`).split("\n"),
);
const goc = join(GOC, THU_MUC);
const dsTep = readdirSync(goc, { withFileTypes: true })
	.filter((d) => d.isDirectory() && !cu.has(d.name))
	.map((d) => d.name)
	.sort()
	.filter((t) => existsSync(join(goc, t, "migration.sql")))
	.map((t) => [t, readFileSync(join(goc, t, "migration.sql"), "utf8")]);
console.log(`merge-base: ${base.slice(0, 12)}`);
process.exit(ketLuan(dsTep));
