import { execFileSync } from "node:child_process";
import path from "node:path";

const GOC = path.resolve(import.meta.dirname, "..", "..", "..");
const TEP = [
	"apps/app/test/agent-results.spec.ts",
	"apps/agent/test/giai-doan-agent.integration.spec.ts",
	"apps/api/test/giai-doan-bao-cao.spec.ts",
	"packages/telemetry/test/allowlist.spec.ts",
];
const CHO_PHEP = ["deals_by_stage thieu", "payload mang nhan"];

function dongBiXoa(diff) {
	return diff
		.split("\n")
		.filter((d) => d.startsWith("-") && !d.startsWith("---"))
		.filter((d) => d.includes("expect("));
}

function lech(diff) {
	const xoa = dongBiXoa(diff);
	const sai = xoa.filter((d) => !CHO_PHEP.some((c) => d.includes(c)));
	const choPhep = xoa.length - sai.length;
	return { sai, choPhep };
}

function git(...args) {
	return execFileSync("git", ["-C", GOC, ...args], { encoding: "utf8" });
}

if (process.argv.includes("--tu-thu")) {
	const gia = [
		"--- a/x.spec.ts",
		"+++ b/x.spec.ts",
		'-\t\texpect(theoStage[id], `deals_by_stage thieu ${id}`).toBeGreaterThan(0);',
		'-\t\texpect(ra?.deals.length).toBe(2);',
	].join("\n");
	const { sai } = lech(gia);
	if (sai.length !== 1) {
		console.error(`tu-thu: mong 1 dong sai, duoc ${sai.length}`);
		process.exit(2);
	}
	console.log("tu-thu: diff gia xoa mot expect khac -> bat duoc");
	process.exit(0);
}

const moc = git("merge-base", "HEAD", "origin/onehub").trim();
const diff = git("diff", moc, "--", ...TEP);
const { sai, choPhep } = lech(diff);
console.log(`moc ${moc.slice(0, 9)} · ${TEP.length} tep · ${choPhep} dong expect cho phep xoa`);
if (sai.length > 0) {
	for (const d of sai) console.error(`expect bi xoa hay sua: ${d}`);
	process.exit(1);
}
console.log("khong expect san co nao bi xoa hay sua");
