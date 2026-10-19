import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { GOC, gitThu, HO_SO, kit, MOC_NEN, SLUG } from "./chung.mjs";

const laTo = (a, b) =>
	spawnSync("git", ["-C", GOC, "merge-base", "--is-ancestor", a, b]).status ===
	0;

export function dongGhimCuoi(runLog) {
	const ds = runLog
		.split("\n")
		.filter(Boolean)
		.map((l) => {
			try {
				return JSON.parse(l);
			} catch {
				return null;
			}
		})
		.filter((x) => x && (x.kind === "repin" || x.kind === "repin-do"));
	return ds.at(-1) ?? null;
}

export function lyDoCua(report, runId) {
	const dong = report.split("\n");
	const i = dong.findIndex((d) => d.trim() === `run_id: ${runId}`);
	if (i < 1) return null;
	const m = /^### Re-pin lần \d+ — [^,]+, do (.*)$/.exec(dong[i - 1]);
	return m ? m[1] : null;
}

export function soiGhim({ slug, dong, report, evalsText, commitCuoi }) {
	const loi = [];
	if (!dong) return [`CHUA GHIM ${slug}: khong co dong repin`];
	if (dong.kind === "repin-do")
		return [`GHIM DO ${slug}: ${dong.lan_id ?? dong.run_id ?? ""}`];
	const lyDo = lyDoCua(report, dong.run_id);
	if (!lyDo || !lyDo.includes(SLUG) || !laTo(MOC_NEN, dong.sha))
		return [
			`CHUA GHIM ${slug}: dong repin cuoi ${dong.run_id} khong phai luot cua ${SLUG}`,
		];
	(dong.suites_exit ?? [1]).forEach((m, i) => {
		if (m !== 0) loi.push(`GHIM DO ${slug}: suite ${i + 1} ma ${m}`);
	});
	const kyVong = kit().Y.expectedExits(evalsText).byId;
	for (const [id, ma] of Object.entries(dong.evals_exit ?? {}))
		if (ma !== (kyVong.get(id) ?? 0))
			loi.push(`GHIM DO ${slug}: ${id} ma ${ma}`);
	const vc = /^verified_commit:\s*([0-9a-f]{40})\s*$/m.exec(report)?.[1];
	if (vc !== dong.sha)
		loi.push(`GHIM LECH ${slug}: verified_commit ${vc} ≠ sha ${dong.sha}`);
	if (commitCuoi && !laTo(commitCuoi, dong.sha))
		loi.push(
			`GHIM CU ${slug}: ${commitCuoi.slice(0, 9)} khong la to tien cua ${dong.sha.slice(0, 9)}`,
		);
	return loi;
}

function commitCuoiSuaHoSo(slug) {
	const ra = gitThu(
		"log",
		"-1",
		"--format=%H",
		"HEAD",
		"--",
		`_acceptance/${slug}`,
		`:(exclude)_acceptance/${slug}/run-log.jsonl`,
		`:(exclude)_acceptance/${slug}/evidence-report.md`,
	);
	return ra?.trim() || null;
}

const hong = [];
const tuKiem = soiGhim({
	slug: "gia",
	dong: { kind: "repin-do", lan_id: "x" },
	report: "",
	evalsText: "",
});
if (!tuKiem[0]?.startsWith("GHIM DO"))
	hong.push("HONG TU KIEM: dong repin-do khong bi bat");
else console.log("OK tu kiem repin-do");

for (const slug of HO_SO) {
	const thuMuc = join(GOC, "_acceptance", slug);
	const dong = dongGhimCuoi(
		readFileSync(join(thuMuc, "run-log.jsonl"), "utf8"),
	);
	const report = readFileSync(join(thuMuc, "evidence-report.md"), "utf8");
	const evalsText = readFileSync(join(thuMuc, "evals.yaml"), "utf8");
	const loi = soiGhim({
		slug,
		dong,
		report,
		evalsText,
		commitCuoi: commitCuoiSuaHoSo(slug),
	});
	const r = spawnSync(
		"node",
		[
			join(GOC, "scripts", "recheck-evidence.cjs"),
			join(thuMuc, "evidence-report.md"),
		],
		{ cwd: GOC, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
	);
	if (r.status !== 0)
		loi.push(
			`RECHECK DO ${slug}: ma ${r.status} ${`${r.stdout}${r.stderr}`.trim().split("\n").slice(-3).join(" | ")}`,
		);
	if (loi.length === 0)
		console.log(`${slug}: ghim xanh ${dong.run_id} o ${dong.sha.slice(0, 9)}`);
	hong.push(...loi);
}

for (const h of hong) console.log(h);
console.log(`ghim-xanh: ${hong.length === 0 ? "dat" : `${hong.length} hong`}`);
process.exit(hong.length === 0 ? 0 : 1);
