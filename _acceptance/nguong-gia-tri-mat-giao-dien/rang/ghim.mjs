import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { BANG, GOC, khongDo } from "./chung.mjs";

const git = (...a) =>
	execFileSync("git", a, { cwd: GOC, encoding: "utf8" }).trim();
const laTo = (a, b) => {
	try {
		execFileSync("git", ["merge-base", "--is-ancestor", a, b], { cwd: GOC });
		return true;
	} catch {
		return false;
	}
};

export function xetGhim(dongLog, verified, sua, laToFn) {
	const cuoi = dongLog.filter((d) => d.kind === "repin").at(-1);
	if (!cuoi) return "chua co dong repin";
	if (cuoi.sha !== verified)
		return `dong repin cuoi ${String(cuoi.sha).slice(0, 9)} khac verified_commit`;
	if (!laToFn(sua, cuoi.sha))
		return `ghim ${String(cuoi.sha).slice(0, 9)} co truoc lan sua ${sua.slice(0, 9)}`;
	if (!cuoi.evals_exit) return "dong repin thieu evals_exit";
	const loi = [
		...(cuoi.suites_exit ?? []).filter((x) => x !== 0),
		...Object.values(cuoi.evals_exit).filter((x) => x !== 0),
	];
	return loi.length ? `ghim do (${loi.length} lenh khac 0)` : null;
}

if (
	xetGhim(
		[{ kind: "repin", sha: "b", suites_exit: [0], evals_exit: {} }],
		"b",
		"c",
		() => false,
	) !== "ghim b co truoc lan sua c"
)
	khongDo("doi chung duong khong bat ghim truoc lan sua");
console.log("doi chung duong: bat ghim truoc lan sua");

const ds = [...new Set(BANG.de_xuat.map((r) => r.ho_so))].sort();
let sai = 0;
for (const hs of ds) {
	const tep = `_acceptance/${hs}/opportunity.md`;
	if (!git("diff", "--name-only", BANG.goc, "--", tep)) {
		sai += 1;
		console.log(`SAI ${hs}: opportunity.md chua doi so voi goc ${BANG.goc}`);
		continue;
	}
	const ws = join(GOC, "_acceptance", hs);
	const verified =
		/^verified_commit:\s*(\S+)/m.exec(
			readFileSync(join(ws, "evidence-report.md"), "utf8"),
		)?.[1] ?? "";
	const dong = readFileSync(join(ws, "run-log.jsonl"), "utf8")
		.split("\n")
		.filter(Boolean)
		.flatMap((l) => {
			try {
				return [JSON.parse(l)];
			} catch {
				return [];
			}
		});
	const loi = xetGhim(
		dong,
		verified,
		git("log", "-1", "--format=%H", "--", tep),
		laTo,
	);
	if (loi) sai += 1;
	console.log(`${loi ? "SAI" : "DUNG"} ${hs}${loi ? `: ${loi}` : ""}`);
}
console.log(`KET LUAN F39 ghim: ${ds.length - sai} DUNG, ${sai} SAI`);
process.exit(sai === 0 ? 0 : 1);
