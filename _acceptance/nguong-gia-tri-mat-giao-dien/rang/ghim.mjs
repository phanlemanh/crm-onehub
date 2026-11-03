import { spawnSync } from "node:child_process";
import { BANG, GOC, khongDo } from "./chung.mjs";

const BASE = process.env.PRE_MERGE_BASE || "origin/onehub";

export function hoSoCu(out, ds) {
	const ra = new Set();
	for (const l of out.split("\n")) {
		const m = /VIOLATION \[([^\]]+)\]: evidence is stale/.exec(l);
		if (m && ds.includes(m[1])) ra.add(m[1]);
	}
	return [...ra].sort();
}

const mau = [
	"VIOLATION [a]: evidence is stale — code changed after verify",
	"VIOLATION [b]: status=implemented but no evidence-report.md",
	"VIOLATION [c]: evidence is stale — code changed after verify",
].join("\n");
if (hoSoCu(mau, ["a", "b"]).join(",") !== "a")
	khongDo("doi chung duong khong bat dong bang chung cu");
console.log("doi chung duong: bat dong bang chung cu, bo qua ho so ngoai danh sach");

const ds = [...new Set(BANG.de_xuat.map((r) => r.ho_so))].sort();
const r = spawnSync(
	"bash",
	[
		"scripts/pre-merge-check.sh",
		".",
		"--base",
		BASE,
		...ds.flatMap((s) => ["--slug", s]),
	],
	{ cwd: GOC, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
);
if (r.error) khongDo(`khong chay duoc pre-merge-check — ${r.error.message}`);
const out = `${r.stdout ?? ""}\n${r.stderr ?? ""}`;
if (!/VIOLATION|OK|PASS|NOTE/.test(out))
	khongDo(`pre-merge-check khong in gi doc duoc (ma ${r.status})`);
const cu = hoSoCu(out, ds);
for (const s of cu) console.log(`SAI ${s}: pre-merge-check bao bang chung cu`);
console.log(
	`KET LUAN F39 ghim: ${ds.length} ho so, ${cu.length} bang chung cu (pre-merge-check --base ${BASE}, ma ${r.status})`,
);
process.exit(cu.length === 0 ? 0 : 1);
