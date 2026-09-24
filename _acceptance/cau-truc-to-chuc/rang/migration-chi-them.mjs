import { execFileSync } from "node:child_process";
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
	if (
		cuBang &&
		/ADD COLUMN/.test(hoa) &&
		/NOT NULL/.test(hoa) &&
		!/DEFAULT/.test(hoa)
	) {
		return "ADD COLUMN NOT NULL";
	}
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
		["DROP COLUMN", 'ALTER TABLE "department" DROP COLUMN "name";'],
		[
			"ADD COLUMN NOT NULL",
			'ALTER TABLE "department" ADD COLUMN "x" TEXT NOT NULL;',
		],
		["UNIQUE", 'ALTER TABLE "department" ADD CONSTRAINT "u" UNIQUE ("name");'],
	]) {
		const v = cauLenh(sql).map(viPham).filter(Boolean);
		if (v.length > 0) bat += 1;
		console.log(
			`${nhan}: ${v.length > 0 ? `migration khong chi them: ${v.join(" | ")}` : "KHONG BAT"}`,
		);
	}
	process.exit(bat === 3 ? 1 : 0);
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
console.log(
	`migration moi: ${moi.join(", ") || "(khong co)"} · so cau lenh: ${dem}`,
);
if (moi.length === 0 || dem === 0) {
	console.log("KHONG DO DUOC: khong co migration moi nao so voi base");
	process.exit(2);
}
for (const h of hong) console.log(h);
process.exit(hong.length === 0 ? 0 : 1);
