import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const THU_MUC = join(GOC, "packages", "ui", "src", "components", "reui");
const GOI = join(GOC, "packages", "ui", "package.json");

function boChuoi(nguon) {
	return nguon.replace(
		/`(?:\\[\s\S]|[^`\\])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g,
		'""',
	);
}

const tep = readdirSync(THU_MUC).filter((t) => /\.(tsx?|jsx?)$/.test(t));
console.log(`so tep reui: ${tep.length}`);
if (tep.length === 0) {
	console.log("KHONG DO DUOC: thu muc reui rong — khong co gi de quet");
	process.exit(2);
}

const hong = [];
for (const t of tep) {
	const nguon = readFileSync(join(THU_MUC, t), "utf8");
	if (/from\s+["']cn["']/.test(nguon)) hong.push(`${t}: nhap tu goi cn`);
	if (/from\s+["']lucide-react["']/.test(nguon))
		hong.push(`${t}: dung icon Lucide`);
	if (/\/\/|\/\*/.test(boChuoi(nguon))) hong.push(`${t}: co chu thich`);
}
const goi = JSON.parse(readFileSync(GOI, "utf8"));
if (goi.dependencies?.cn || goi.devDependencies?.cn) {
	hong.push("packages/ui/package.json: co goi cn");
}

for (const h of hong) console.log(`HONG ${h}`);
console.log(`khang-dinh: ${tep.length * 3 + 1}, hong: ${hong.length}`);
process.exit(hong.length === 0 ? 0 : 1);
