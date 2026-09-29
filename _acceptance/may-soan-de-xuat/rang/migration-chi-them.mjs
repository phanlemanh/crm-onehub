import { spawnSync } from "node:child_process";
import {
	existsSync,
	mkdtempSync,
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
const BANG_MOI = "taiLieuNguon";
const BANG_THEM_COT = "taiLieuDeXuat";
const THONG_DIEP = "migration khong chi them";
const MIGRATION_HO_SO = ["20261003010000_may_soan_de_xuat"];

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

const DUOC_DUNG = new Set([BANG_MOI, BANG_THEM_COT]);

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
	if (/\bDROP\b/.test(hoa)) return "DROP";
	if (/\bALTER COLUMN\b/.test(hoa)) return "ALTER COLUMN";
	if (/\bRENAME\b/.test(hoa)) return "RENAME";
	if (/^CREATE EXTENSION\b/.test(hoa)) return "CREATE EXTENSION";
	if (/^CREATE TABLE\b/.test(hoa)) {
		return tenBang(c) === BANG_MOI ? null : `CREATE TABLE la: ${tenBang(c)}`;
	}
	if (/^CREATE (UNIQUE )?INDEX\b/.test(hoa)) {
		return DUOC_DUNG.has(tenBang(c)) ? null : "CREATE INDEX tren bang khac";
	}
	if (/^ALTER TABLE\b/.test(hoa)) {
		const bang = tenBang(c);
		if (!DUOC_DUNG.has(bang)) return "ALTER TABLE tren bang khac";
		if (/ ADD CONSTRAINT "?[^"\s]+"? FOREIGN KEY/.test(hoa)) return null;
		if (bang === BANG_THEM_COT && / ADD COLUMN /.test(hoa)) {
			return viPhamThemCot(c);
		}
		return `ALTER TABLE la: ${c.slice(0, 60)}`;
	}
	return `lenh la: ${c.slice(0, 60)}`;
}

function soTep(dsTep) {
	const hong = [];
	let dem = 0;
	for (const [nhan, sql] of dsTep) {
		for (const c of cauLenh(sql)) {
			dem += 1;
			const v = viPham(c);
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

const CA_DO = [
	["DROP", 'DROP TABLE "taiLieuDeXuat";\n'],
	[
		"ADD COLUMN NOT NULL",
		'ALTER TABLE "taiLieuDeXuat" ADD COLUMN "x" TEXT NOT NULL;\n',
	],
	[
		"ALTER TABLE tren bang khac",
		'ALTER TABLE "taiLieuTrang" ADD COLUMN "y" TEXT;\n',
	],
	["UPDATE", `UPDATE "taiLieuDeXuat" SET "lyDo" = 'x';\n`],
];

function chieuDo() {
	const tam = mkdtempSync(join(tmpdir(), "msd-chi-them-"));
	let bat = 0;
	try {
		for (const [i, [loai, sql]] of CA_DO.entries()) {
			const tep = join(tam, `gia-${i}.sql`);
			writeFileSync(tep, sql);
			const r = spawnSync(process.execPath, [TEP, "--tep", tep], {
				encoding: "utf8",
			});
			const ghim = `${THONG_DIEP}: ${loai}`;
			const trung = r.status === 1 && r.stdout.includes(ghim);
			if (trung) bat += 1;
			console.log(
				`chieu do · ${sql.trim()} -> exit ${r.status} · ${trung ? ghim : `KHONG BAT (${r.stdout.trim()})`}`,
			);
		}
	} finally {
		rmSync(tam, { recursive: true, force: true });
	}
	return bat;
}

const [, , cheDo, duongDan] = process.argv;

if (cheDo === "--tep") {
	process.exit(ketLuan([[duongDan, readFileSync(duongDan, "utf8")]]));
}

const bat = chieuDo();
if (bat !== CA_DO.length) {
	console.log(`doi chung: SAI — chieu do chi bat ${bat}/${CA_DO.length}`);
	process.exit(3);
}
console.log(`doi chung: do dung ${bat}/${CA_DO.length}`);

const goc = join(GOC, THU_MUC);
const dsTep = MIGRATION_HO_SO.map((t) => {
	const tep = join(goc, t, "migration.sql");
	if (!existsSync(tep)) {
		console.log(`KHONG DO DUOC: thieu migration cua ho so: ${THU_MUC}/${t}`);
		process.exit(2);
	}
	return [t, readFileSync(tep, "utf8")];
});
console.log(`migration cua ho so: ${MIGRATION_HO_SO.join(", ")}`);
process.exit(ketLuan(dsTep));
