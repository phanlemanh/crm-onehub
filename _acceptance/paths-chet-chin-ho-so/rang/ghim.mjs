import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CHIN } from "./chet.mjs";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const GOC_SHA = JSON.parse(
	readFileSync(
		join(GOC, "_acceptance/paths-chet-chin-ho-so/rang/bang-sua.json"),
		"utf8",
	),
).goc;
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
	const repin = dongLog.filter((d) => d.kind === "repin");
	const cuoi = repin.at(-1);
	if (!cuoi) return "chua co dong repin";
	if (cuoi.sha !== verified)
		return `dong repin cuoi ${String(cuoi.sha).slice(0, 9)} khac verified_commit ${String(verified).slice(0, 9)}`;
	if (!laToFn(sua, cuoi.sha))
		return `ghim ${String(cuoi.sha).slice(0, 9)} co truoc lan sua paths ${sua.slice(0, 9)}`;
	const su = (cuoi.suites_exit ?? []).filter((x) => x !== 0);
	const ev = Object.entries(cuoi.evals_exit ?? {}).filter(([, x]) => x !== 0);
	if (!cuoi.evals_exit) return "dong repin thieu evals_exit";
	if (su.length || ev.length)
		return `do: suites ${su.join(",")} evals ${ev.map(([k, x]) => `${k}=${x}`).join(",")}`;
	return null;
}

const dc = xetGhim(
	[{ kind: "repin", sha: "b", suites_exit: [0], evals_exit: { E1: 0 } }],
	"b",
	"c",
	() => false,
);
if (!dc?.startsWith("ghim b co truoc lan sua paths")) {
	console.log(`KHONG DO DUOC: doi chung duong khong bat ghim cu (${dc})`);
	process.exit(2);
}
console.log("doi chung duong: bat ghim truoc lan sua paths");

let sai = 0;
const DS = [
	...CHIN.map((hs) => [hs, "evals.yaml"]),
	["gom-tin-hieu-tu-chay", "decisions.jsonl"],
];
for (const [hs, theoDoi] of DS) {
	const ws = join(GOC, "_acceptance", hs);
	const doi = git(
		"diff",
		"--name-only",
		GOC_SHA,
		"--",
		`_acceptance/${hs}/${theoDoi}`,
	);
	if (!doi) {
		sai += 1;
		console.log(`SAI ${hs}: ${theoDoi} chua doi so voi goc ${GOC_SHA}`);
		continue;
	}
	const sua = git(
		"log",
		"-1",
		"--format=%H",
		"--",
		`_acceptance/${hs}/${theoDoi}`,
	);
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
	const loi = xetGhim(dong, verified, sua, laTo);
	if (loi) sai += 1;
	console.log(
		`${loi ? "SAI" : "DUNG"} ${hs}${loi ? `: ${loi}` : ` ghim ${verified.slice(0, 9)}`}`,
	);
}
console.log(`KET LUAN F38 ghim: ${DS.length - sai} DUNG, ${sai} SAI`);
process.exit(sai === 0 ? 0 : 1);
