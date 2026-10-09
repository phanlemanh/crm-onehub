import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const GOC = path.resolve(import.meta.dirname, "..", "..", "..");
const TEP = "apps/app/lib/agent-transcript.ts";

function viPham(nguon) {
	const loi = [];
	if (!/import\s*\{[^}]*\bparseDealListResult\b[^}]*\}\s*from\s*"@crm\/validation\/deal-list"/.test(nguon)) {
		loi.push("app khong nhap parseDealListResult tu @crm/validation/deal-list");
	}
	if (/\b(const|let)\s+dealList(Item|Result)\s*=/.test(nguon)) loi.push("app con schema viet tay");
	if (/type\s+DealList(Item|Result)\s*=\s*\{/.test(nguon)) loi.push("app con schema viet tay");
	return loi;
}

const tuThu = process.argv.includes("--tu-thu");
const iTep = process.argv.indexOf("--tep");

if (tuThu) {
	const lanh = 'import {\n\tparseDealListResult,\n} from "@crm/validation/deal-list";\n';
	const hong = `${lanh}const dealListItem = z.object({ id: z.string() });\n`;
	const a = viPham(lanh);
	const b = viPham(hong);
	if (a.length !== 0 || !b.includes("app con schema viet tay")) {
		console.error(`tu-thu hong: lanh=${JSON.stringify(a)} hong=${JSON.stringify(b)}`);
		process.exit(2);
	}
	console.log("tu-thu 2/2: tep lanh xanh, tep con schema viet tay do");
	process.exit(0);
}

const nguon = readFileSync(iTep > 0 ? process.argv[iTep + 1] : path.join(GOC, TEP), "utf8");
const loi = viPham(nguon);
for (const l of loi) console.error(l);
if (loi.length > 0) process.exit(1);
const r = spawnSync("bun", ["test", "./test/agent-results.spec.ts"], {
	cwd: path.join(GOC, "apps/app"),
	encoding: "utf8",
});
const pass = Number(`${r.stdout}${r.stderr}`.match(/(\d+) pass/)?.[1] ?? 0);
console.log(`agent-results.spec.ts thoat ${r.status} · ${pass} pass`);
process.exit(r.status === 0 && pass > 0 ? 0 : 1);
