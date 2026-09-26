import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC =
	process.env.GOC_KHO ??
	join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const THU_MUC = join(GOC, "apps/agent/agent");
const API = join(GOC, "apps/api");
const NHAP = /(?:from\s+|import\s*\(\s*|import\s+)["']([^"']+)["']/g;

function tep(dir) {
	return readdirSync(dir).flatMap((ten) => {
		const duong = join(dir, ten);
		if (statSync(duong).isDirectory()) return tep(duong);
		return /\.(ts|tsx|mts)$/.test(ten) ? [duong] : [];
	});
}

const ds = tep(THU_MUC);
const hong = [];
for (const f of ds) {
	for (const [, nguon] of readFileSync(f, "utf8").matchAll(NHAP)) {
		const toi = nguon.startsWith(".") ? resolve(dirname(f), nguon) : "";
		if (nguon.startsWith("@crm/api") || (toi && toi.startsWith(API))) {
			hong.push(`${relative(GOC, f)} -> ${nguon}`);
		}
	}
}
console.log(`da quet ${ds.length} tep duoi apps/agent/agent`);
if (ds.length === 0) {
	console.error("khong quet duoc tep nao");
	process.exit(1);
}
if (hong.length > 0) {
	for (const h of hong) console.error(`import tu apps/api: ${h}`);
	process.exit(1);
}
console.log("khong tep nao import tu apps/api");
