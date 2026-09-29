import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { GIAI_DOAN_GOC } from "../../../packages/db/src/giai-doan.ts";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SAN_QUET = 50;
const THU_MUC = [
	"apps/api/src",
	"apps/agent/agent",
	"apps/app/app",
	"apps/app/components",
	"apps/app/lib",
	"packages/db/src",
];
const TRU = [
	/^packages\/db\/src\/generated\//,
	/^packages\/db\/src\/giai-doan\.ts$/,
	/^apps\/app\/app\/proto\//,
	/^apps\/api\/src\/generated\//,
];

const tuCam = [...Object.values(GIAI_DOAN_GOC), "GIAI_DOAN_GOC"];
const mau = new RegExp(`\\b(${tuCam.join("|")})\\b`);

const tep = execFileSync("git", ["-C", GOC, "ls-files", "--", ...THU_MUC], {
	encoding: "utf8",
})
	.split("\n")
	.filter((t) => /\.(ts|tsx|mjs|js)$/.test(t))
	.filter((t) => !TRU.some((r) => r.test(t)));

const hong = [];
for (const t of tep) {
	const dong = readFileSync(join(GOC, t), "utf8").split("\n");
	for (const [i, d] of dong.entries()) {
		const khop = d.match(mau);
		if (khop) hong.push(`${t}:${i + 1}: ${khop[1]}`);
	}
}

console.log(`so tep da quet: ${tep.length}`);
if (tep.length < SAN_QUET) {
	console.log(`KHONG DO DUOC: chi quet ${tep.length} tep (< ${SAN_QUET})`);
	process.exit(2);
}
for (const h of hong) console.log(`HONG ${h}`);
process.exit(hong.length === 0 ? 0 : 1);
