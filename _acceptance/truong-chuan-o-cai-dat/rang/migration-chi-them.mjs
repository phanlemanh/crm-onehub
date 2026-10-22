import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const THU_MUC = "packages/db/prisma/migrations";
const NHANH = "origin/onehub";

function git(...doi) {
	return execFileSync("git", doi, { cwd: GOC, encoding: "utf8" }).trim();
}

function thuMucTai(ref) {
	return git("ls-tree", "--name-only", `${ref}:${THU_MUC}`)
		.split("\n")
		.filter((d) => /^\d{14}_/.test(d));
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

function bangCua(c) {
	return (
		c.match(
			/^(?:CREATE TABLE|ALTER TABLE)\s+(?:IF NOT EXISTS\s+)?"?([^"\s(]+)"?/i,
		)?.[1] ??
		c.match(/\sON\s+"?([^"\s(]+)"?/i)?.[1] ??
		""
	);
}

function bangTaoTrong(sql) {
	return cauLenh(sql)
		.filter((c) => /^CREATE TABLE\b/i.test(c))
		.map(bangCua);
}

function quetSql(sql, bangCoTruoc) {
	const bangMoi = new Set(bangTaoTrong(sql));
	for (const c of cauLenh(sql)) {
		const hoa = c.toUpperCase();
		const bang = bangCua(c);
		if (/^ALTER TABLE\b/.test(hoa) && !bangMoi.has(bang))
			throw new Error(`tcc migration: doi bang cu ${bang}`);
		const duocPhep =
			/^CREATE TABLE\b/.test(hoa) ||
			/^CREATE (UNIQUE )?INDEX\b/.test(hoa) ||
			(/^ALTER TABLE\b/.test(hoa) &&
				/ ADD CONSTRAINT /.test(hoa) &&
				!/\bDROP\b/.test(hoa));
		if (!duocPhep)
			throw new Error(`tcc migration: khong chi them ${c.slice(0, 80)}`);
		for (const m of c.matchAll(/REFERENCES\s+"?([^"\s(]+)"?/gi)) {
			if (!bangMoi.has(m[1]) && !bangCoTruoc.has(m[1]))
				throw new Error(`tcc migration: tro bang sau ${m[1]}`);
		}
	}
}

function bangTruoc(ten) {
	const bang = new Set();
	for (const d of thuMucTai("HEAD").filter((x) => x < ten)) {
		for (const b of bangTaoTrong(
			git("show", `HEAD:${THU_MUC}/${d}/migration.sql`),
		))
			bang.add(b);
	}
	return bang;
}

const goc = git("merge-base", "HEAD", NHANH);
const cu = new Set(thuMucTai(goc));
const moi = thuMucTai("HEAD").filter((d) => !cu.has(d));
if (moi.length !== 1)
	throw new Error(`tcc migration: so thu muc ${moi.length}`);
const [ten] = moi;
const lonNhatOnehub = thuMucTai(NHANH).sort().at(-1) ?? "";
if (ten.slice(0, 14) <= lonNhatOnehub.slice(0, 14))
	throw new Error(`tcc migration: ten ${ten}`);

const sql = readFileSync(join(GOC, THU_MUC, ten, "migration.sql"), "utf8");
const coTruoc = bangTruoc(ten);
quetSql(sql, coTruoc);

const tam = mkdtempSync(join(tmpdir(), "tcc-migration-"));
try {
	const ban = join(tam, "migration.sql");
	writeFileSync(
		ban,
		`${sql}\nALTER TABLE "fieldDefinition" DROP COLUMN "required";\n`,
	);
	let bat = "";
	try {
		quetSql(readFileSync(ban, "utf8"), coTruoc);
	} catch (loi) {
		bat = String(loi.message);
	}
	if (!bat.includes("tcc migration: doi bang cu"))
		throw new Error("tcc migration: thuoc mu");
} finally {
	rmSync(tam, { recursive: true, force: true });
}

console.log(`tcc migration: dat ${ten}`);
