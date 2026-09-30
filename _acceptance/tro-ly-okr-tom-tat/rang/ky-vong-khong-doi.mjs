import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "../../..");

const TEP = [
	"apps/api/test/okr-toan-canh-thuan.spec.ts",
	"apps/api/test/okr-toan-canh.spec.ts",
	"apps/api/test/okr-toan-canh-hieu-nang.spec.ts",
	"apps/api/test/okr-mau.spec.ts",
	"apps/api/test/vai-chi-okr.spec.ts",
];

const git = (...args) =>
	execFileSync("git", args, { cwd: GOC, encoding: "utf8", maxBuffer: 1 << 26 });

const boImport = (ma) =>
	ma.replace(/^import\b[^;]*?\bfrom\s+["'][^"']+["'];?[ \t]*\n/gm, "");

const goc = git("merge-base", "HEAD", "origin/onehub").trim();

let sua = 0;
for (const tep of TEP) {
	const cu = boImport(git("show", `${goc}:${tep}`));
	const nay = boImport(readFileSync(join(GOC, tep), "utf8"));
	if (cu !== nay) {
		console.log(`ky vong bi sua: ${tep}`);
		sua += 1;
	}
}

if (sua > 0) process.exit(1);
console.log(`ky vong khong doi: ${TEP.length} tep chi doi dong import`);
