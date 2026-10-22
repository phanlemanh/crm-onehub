import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { docJson, GOC, HO_SO } from "./chung.mjs";

export const NHANH_VONG = [/^feat\/don-ho-so-cu$/, /^chore\/don-ho-so-cu-lo-\d+$/];

export function hoSoChan(prs, cu) {
	return prs
		.filter((p) => !NHANH_VONG.some((re) => re.test(p.headRefName)))
		.map((p) => {
			const cham = new Set();
			const tuGhim = new Set();
			for (const f of p.files ?? []) {
				const m = f.path.match(/^_acceptance\/([^/]+)\/(.+)$/);
				if (!m || !cu.has(m[1])) continue;
				cham.add(m[1]);
				if (m[2] === "evidence-report.md") tuGhim.add(m[1]);
			}
			return { number: p.number, headRefName: p.headRefName, ho_so: [...cham].filter((s) => !tuGhim.has(s)).sort() };
		})
		.filter((p) => p.ho_so.length);
}

if (import.meta.main) {
	const r = spawnSync("gh", ["pr", "list", "--state", "open", "--limit", "100", "--json", "number,headRefName,files"], { cwd: GOC, encoding: "utf8" });
	if (r.status !== 0) {
		console.error(`chan-pr: gh pr list hong: ${(r.stderr || "").trim()}`);
		process.exit(2);
	}
	const prs = JSON.parse(r.stdout).map((p) => ({ number: p.number, headRefName: p.headRefName, files: p.files.map((f) => ({ path: f.path })) }));
	const cu = new Set(docJson(join(HO_SO, "kiem-ke-goc.json")).ho_so.map((h) => h.slug));
	const chan = hoSoChan(prs, cu);
	writeFileSync(join(HO_SO, "chan-pr.json"), `${JSON.stringify({ luc: new Date().toISOString(), pr_mo: prs, chan }, null, 2)}\n`);
	for (const p of chan) console.log(`#${p.number} ${p.headRefName}: ${p.ho_so.join(", ")}`);
}
