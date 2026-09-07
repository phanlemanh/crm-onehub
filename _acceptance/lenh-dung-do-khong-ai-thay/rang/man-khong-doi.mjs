import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SHA = "3c97e759a6c87bc8b6f0621d3854cb486728b442";
const DUOC_PHEP = "apps/app/app/layout.tsx";

const doi = process.argv.slice(2);
const iGoc = doi.indexOf("--goc");
const goc = iGoc === -1 ? GOC : resolve(doi[iGoc + 1]);

let ra;
try {
	ra = execFileSync("git", ["diff", "--name-only", SHA, "--", "apps/app"], {
		cwd: goc,
		encoding: "utf8",
	});
} catch (e) {
	console.error(`MA 2: khong so duoc voi sha ghim — ${e.message}`);
	process.exit(2);
}

const doi_ = ra.split("\n").filter(Boolean);
console.log(`file cua apps/app doi so voi sha ghim: ${doi_.length}`);
for (const d of doi_) console.log(`  ${d}`);

const la = doi_.filter((d) => d !== DUOC_PHEP);
if (la.length > 0) {
	console.error(
		`DO: ${la.length} file ngoai ${DUOC_PHEP} da doi — man hoac kho chuoi bi dung, nen chu tren man co the doi:`,
	);
	for (const d of la) console.error(`  ${d}`);
	process.exit(1);
}

if (doi_.length === 0) {
	console.error(
		`MA 2: khong file nao doi — ban va chua co, phep do nay khong con nghia`,
	);
	process.exit(2);
}

console.log(`XANH: dung mot file doi, va do la ${DUOC_PHEP}.`);
