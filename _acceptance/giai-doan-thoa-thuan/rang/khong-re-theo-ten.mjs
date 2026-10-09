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
	"packages/telemetry/src",
];
const TRU = [
	/^packages\/db\/src\/generated\//,
	/^packages\/db\/src\/giai-doan\.ts$/,
	/^apps\/app\/app\/proto\//,
	/^apps\/api\/src\/generated\//,
];

const CHO_PHEP = new Map([
	["packages/telemetry/src/allowlist.ts", new Set(["GIAI_DOAN_GOC"])],
]);

const tuCam = [...Object.values(GIAI_DOAN_GOC), "GIAI_DOAN_GOC"];
const mau = new RegExp(`\\b(${tuCam.join("|")})\\b`, "g");

const tep = execFileSync("git", ["-C", GOC, "ls-files", "--", ...THU_MUC], {
	encoding: "utf8",
})
	.split("\n")
	.filter((t) => /\.(ts|tsx|mjs|js)$/.test(t))
	.filter((t) => !TRU.some((r) => r.test(t)));

const hong = [];
const choPhep = [];
for (const t of tep) {
	const dong = readFileSync(join(GOC, t), "utf8").split("\n");
	const duoc = CHO_PHEP.get(t) ?? new Set();
	for (const [i, d] of dong.entries()) {
		for (const khop of d.matchAll(mau)) {
			const tu = khop[1];
			if (duoc.has(tu)) choPhep.push(`${t}:${i + 1}: ${tu}`);
			else hong.push(`${t}:${i + 1}: ${tu}`);
		}
	}
}

console.log(`so tep da quet: ${tep.length}`);
if (tep.length < SAN_QUET) {
	console.log(`KHONG DO DUOC: chi quet ${tep.length} tep (< ${SAN_QUET})`);
	process.exit(2);
}
for (const c of choPhep) console.log(`CHO PHEP ${c}`);
for (const h of hong) console.log(`HONG ${h}`);
process.exit(hong.length === 0 ? 0 : 1);
