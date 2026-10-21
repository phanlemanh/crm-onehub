import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SAN = join(GOC, ".acceptance-runs", "pre-push-phan-rieng-pr", "dot-bien");
const SPEC = join(GOC, "packages", "ui", "test", "pre-push-t1.spec.ts");
const LOC_LANH = "gop-onehub|dong-gop|day-gop";
const PHAN_LOAI = "scripts/pre-push-t1.mjs";
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
		ca: "khong-giao",
		tu: "if (rieng.has(t)) tep.add(t);",
		thanh: "tep.add(t);",
		test: "day-gop (a): chi gop onehub bo test va build",
	},
	{
		ca: "bo-rieng-truoc",
		tu: "return new Set([...tepDiff(goc, nen, dong.localSha), ...tepDiff(goc, truoc, dong.remoteSha)]);",
		thanh: "return new Set(tepDiff(goc, nen, dong.localSha));",
		test: "gop-onehub: G5 ",
	},
	{
		ca: "nen-dau-onehub",
		tu: 'const nen = gitPhai(goc, "merge-base", dong.localSha, ref);',
		thanh: 'const nen = gitPhai(goc, "rev-parse", ref);',
		test: "gop-onehub: G6 ",
	},
	{
		ca: "truoc-so-voi-nen",
		tu: 'const truoc = gitPhai(goc, "merge-base", nen, dong.remoteSha);',
		thanh: "const truoc = nen;",
		test: "gop-onehub: G1 ",
	},
	{
		ca: "tap-rong-la-nang",
		tu: "if (tep.length === 0 && cuaNen.length > 0) return { boQua, tep, lyDo: LY_DO_CHI_NEN };",
		thanh: "",
		test: "dong-gop (a): phan PR tu them rong",
	},
	{
		ca: "tang-tu-cha-dau",
		tu: "const ds = tepDiff(goc, goc0, dong.localSha);",
		thanh: "const ds = tepDiff(goc, `${dong.localSha}^`, dong.localSha);",
		test: "gop-onehub: G16 ",
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

const thoat = (s) => s.trim().replace(/[()]/g, "\\$&");

function chaySpec(nguon, loc) {
	const r = spawnSync("bun", ["test", "--timeout", "120000", SPEC, "-t", loc], {
		cwd: join(GOC, "packages", "ui"),
		env: { ...process.env, PRE_PUSH_T1_NGUON: nguon },
		encoding: "utf8",
		maxBuffer: 1 << 26,
	});
	return { ma: r.status, ra: `${r.stdout}${r.stderr}` };
}

const lanh = chaySpec(banSao("lanh"), LOC_LANH);
if (lanh.ma !== 0 || !/\b0 fail\b/.test(lanh.ra)) {
	console.log("thuoc hong: doi chung duong — ban sao khong dot bien ma spec do");
	console.log(lanh.ra.split("\n").filter((d) => d.startsWith("(fail)")).join("\n"));
	process.exit(1);
}
console.log("dat doi-chung-duong: ban sao lanh, spec xanh");

let ma = 0;
for (const c of CA) {
	const d = banSao(c.ca);
	const p = join(d, PHAN_LOAI);
	const chu = readFileSync(p, "utf8");
	if (chu.split(c.tu).length !== 2) {
		console.log(`thuoc hong: ${c.ca} — khong thay dung mot cho cay`);
		ma = 1;
		continue;
	}
	writeFileSync(p, chu.replace(c.tu, c.thanh));
	const r = chaySpec(d, thoat(c.test));
	const doDung = r.ma !== 0 && r.ra.split("\n").some((l) => l.startsWith("(fail)") && l.includes(c.test));
	if (doDung) console.log(`BAT ${c.ca}: ${c.test.trim()}`);
	else {
		console.log(`thuoc hong: ${c.ca} — test «${c.test.trim()}» khong do`);
		ma = 1;
	}
}
process.exit(ma);
