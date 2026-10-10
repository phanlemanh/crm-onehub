import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "../../..");
const GOP_PR = "9dc1a037c6a1e1c4cc9d0eb03eaef5bbe5c2f6cc";
const CAP = [`${GOP_PR}^1`, GOP_PR];
const DA_KY = [
	"_acceptance/hoi-crm-qua-zalo/",
	"apps/agent/test/hoi-crm-qua-zalo.integration.spec.ts",
];

const thamSo = process.argv.slice(2);
const giaTep = thamSo.flatMap((a, i) => (a === "--gia-tep" ? [thamSo[i + 1]] : []));

const ra = spawnSync("git", ["diff", "--name-only", ...CAP], {
	cwd: GOC,
	encoding: "utf8",
	maxBuffer: 64 * 1024 * 1024,
});
if (ra.status !== 0) {
	console.log(`hong: git diff --name-only ${CAP.join(" ")} thoat ${ra.status}: ${String(ra.stderr).trim()}`);
	process.exit(1);
}
const doi = [...ra.stdout.split("\n").filter(Boolean), ...giaTep];
const cham = doi.filter((duong) => DA_KY.some((g) => duong.startsWith(g)));
if (cham.length) {
	console.log(`hong: cham ho so da ky ${cham.join(", ")}`);
	process.exit(1);
}
console.log(`ok: khong cham ho so da ky (${doi.length} tep cua PR #168, cap ${GOP_PR.slice(0, 9)}^1..${GOP_PR.slice(0, 9)})`);
