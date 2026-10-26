import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SAN = join(GOC, ".acceptance-runs", "pre-push-t1", "dot-bien");
const SPEC = join(GOC, "packages", "ui", "test", "pre-push-t1.spec.ts");
const TEP = [
	".githooks/pre-push",
	".githooks/gate-shape.json",
	"scripts/pre-push-t1.mjs",
	"scripts/verify-gate-shape.mjs",
	"scripts/gate-shape-node-test.mjs",
	".github/scripts/phan-loai.mjs",
	"scripts/pre-merge-check.sh",
	"lib/workspace-record.cjs",
	"lib/evidence-core.cjs",
	"lib/eval-yaml.cjs",
	"_acceptance/config.yaml",
	"package.json",
];

const CA = [
	{
		ca: "rong-la-t1",
		tep: "scripts/pre-push-t1.mjs",
		tu: "return { boQua: kq.nang ? [] : boQua, tep, lyDo: kq.lyDo };",
		thanh: "return { boQua: kq.nang && tep.length ? [] : boQua, tep, lyDo: kq.lyDo };",
		test: "phan-loai: 8 sha remote bang sha local",
	},
	{
		ca: "bo-luat-github",
		tep: "scripts/pre-push-t1.mjs",
		tu: "const kq = quyetDinh({ ...NHU_PR_SAN_SANG, tep, laT1: (t) => t1.has(t) });",
		thanh: 'const kq = { nang: !(tep.length && tep.every((t) => t1.has(t))), lyDo: "x" };',
		test: "phan-loai: 3 ref moi chi ci.yml",
	},
	{
		ca: "goc-commit-cuoi",
		tep: "scripts/pre-push-t1.mjs",
		tu: 'return gitPhai(goc, "merge-base", ref, dong.localSha);',
		thanh: "return gitPhai(goc, \"rev-parse\", `${dong.localSha}^`);",
		test: "phan-loai: 7 ref moi, ma roi docs",
	},
	{
		ca: "bo-no-renames",
		tep: "scripts/pre-push-t1.mjs",
		tu: '"--no-renames", ',
		thanh: '"-M", ',
		test: "phan-loai: 4 doi ten ma thanh md",
	},
	{
		ca: "chi-dong-dau",
		tep: "scripts/pre-push-t1.mjs",
		tu: "for (const dong of dongs) {",
		thanh: "for (const dong of dongs.slice(0, 1)) {",
		test: "phan-loai: 10 hai ref, docs truoc ma",
	},
	{
		ca: "hook-luon-bo",
		tep: ".githooks/pre-push",
		tu: 'case " ${BO_QUA:-} " in *" $task "*) continue ;; esac',
		thanh: 'case " test build " in *" $task "*) continue ;; esac',
		test: "day-nang (a): docs va ma chay du nam",
	},
	{
		ca: "verify-khong-can-khai",
		tep: "scripts/verify-gate-shape.mjs",
		tu: "if (boQua.size > 0) checkSkip(shape, boQua, ledger, problems, report);",
		thanh: "",
		test: "verify (b): khong co khoi t1Only",
	},
	{
		ca: "hook-viet-tay",
		tep: ".githooks/pre-push",
		tu: 'case " ${BO_QUA:-} " in *" $task "*) continue ;; esac',
		thanh: 'case "$task" in test|build) [ -n "${BO_QUA:-}" ] && continue ;; esac',
		test: "mot-nguon (c): khai chi bo build thi hook chay test",
	},
];

function manifest() {
	const ds = [];
	for (const g of ["apps", "packages"]) {
		for (const d of readdirSync(join(GOC, g))) {
			const m = join(g, d, "package.json");
			if (existsSync(join(GOC, m))) ds.push(m);
		}
	}
	return ds;
}

function banSao(ten) {
	const d = join(SAN, ten);
	rmSync(d, { recursive: true, force: true });
	for (const t of [...TEP, ...manifest()]) {
		mkdirSync(dirname(join(d, t)), { recursive: true });
		copyFileSync(join(GOC, t), join(d, t));
	}
	return d;
}

function chaySpec(nguon, loc) {
	const args = ["test", "--timeout", "120000", SPEC];
	if (loc) args.push("-t", loc.replace(/[()]/g, "\\$&"));
	const r = spawnSync("bun", args, {
		cwd: join(GOC, "packages", "ui"),
		env: { ...process.env, PRE_PUSH_T1_NGUON: nguon },
		encoding: "utf8",
	});
	return { ma: r.status, ra: `${r.stdout}${r.stderr}` };
}

let ma = 0;
const lanh = chaySpec(banSao("lanh"), "");
if (lanh.ma !== 0 || !/\b0 fail\b/.test(lanh.ra)) {
	console.log("thuoc hong: doi chung duong — ban sao khong dot bien ma spec do");
	console.log(lanh.ra.split("\n").filter((d) => d.startsWith("(fail)")).join("\n"));
	process.exit(1);
}
console.log("dat doi-chung-duong: ban sao lanh, spec xanh");

for (const c of CA) {
	const d = banSao(c.ca);
	const p = join(d, c.tep);
	const chu = readFileSync(p, "utf8");
	if (chu.split(c.tu).length !== 2) {
		console.log(`thuoc hong: ${c.ca} — khong thay dung mot cho cay`);
		ma = 1;
		continue;
	}
	writeFileSync(p, chu.replace(c.tu, c.thanh));
	const r = chaySpec(d, c.test);
	const doDung = r.ma !== 0 && r.ra.includes(`(fail) `) && r.ra.split("\n").some((l) => l.startsWith("(fail)") && l.includes(c.test));
	if (doDung) console.log(`BAT ${c.ca}: ${c.test}`);
	else {
		console.log(`thuoc hong: ${c.ca} — test «${c.test}» khong do`);
		ma = 1;
	}
}
process.exit(ma);
