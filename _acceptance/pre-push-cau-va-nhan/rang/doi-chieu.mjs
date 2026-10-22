import { spawnSync } from "node:child_process";
import {
	copyFileSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SAN = join(GOC, ".acceptance-runs", "pre-push-cau-va-nhan", "doi-chieu");
const SPEC = join(GOC, "packages", "ui", "test", "pre-push-t1.spec.ts");
const TRUOC_VONG = "d6267b1d4eb65f28e1e2cede64e9e8e34de6aebf";
const LOC_LANH = "G14|hinh-gop";
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
		ca: "nhan-cu",
		tep: "scripts/pre-push-t1.mjs",
		test: "gop-onehub: G14 ",
	},
	{
		ca: "cau-cu",
		tep: ".githooks/gate-shape.json",
		test: "hinh-gop (b): vi_sao ta ve dau tu xa",
	},
	{
		ca: "ma-truoc-github",
		tep: "scripts/pre-push-t1.mjs",
		tu: "kq.lyDo === LY_DO_GITHUB",
		thanh:
			"kq.lyDo === LY_DO_GITHUB && !ngoai.some((t) => !t.startsWith(THU_MUC_GITHUB))",
		test: "gop-onehub: G14 ",
		ghim: "có tệp ngoài T1 (apps/api/a.ts)",
	},
	{
		ca: "ds-ngoai-t1",
		tep: "scripts/pre-push-t1.mjs",
		tu: '? ["tệp dưới .github/", github]',
		thanh: '? ["tệp dưới .github/", ngoai.length ? ngoai : kq.tep]',
		test: "gop-onehub: G14 ",
		ghim: ".github/ghi-chu.md, docs/c.md",
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

function banTruocVong(tep) {
	const r = spawnSync("git", ["show", `${TRUOC_VONG}:${tep}`], {
		cwd: GOC,
		encoding: "utf8",
		maxBuffer: 1 << 26,
	});
	if (r.status !== 0) {
		console.log(
			`thuoc hong: khong doc duoc ${tep} o ${TRUOC_VONG.slice(0, 9)}`,
		);
		process.exit(2);
	}
	return r.stdout;
}

const thoat = (s) => s.trim().replace(/[()|]/g, "\\$&");

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
const soQua = Number(lanh.ra.match(/^\s*(\d+) pass$/m)?.[1] ?? 0);
if (lanh.ma !== 0 || !/\b0 fail\b/.test(lanh.ra) || soQua < 3) {
	console.log(
		`thuoc hong: doi chung duong — ban sao lanh ma spec do hoac khong chay (pass ${soQua})`,
	);
	console.log(
		lanh.ra
			.split("\n")
			.filter((d) => d.startsWith("(fail)"))
			.join("\n"),
	);
	process.exit(1);
}
console.log(`dat doi-chung: ban sao lanh, ${soQua} test xanh`);

let ma = 0;
for (const c of CA) {
	const d = banSao(c.ca);
	const p = join(d, c.tep);
	if (c.tu) {
		const chu = readFileSync(p, "utf8");
		if (chu.split(c.tu).length !== 2) {
			console.log(`thuoc hong: ${c.ca} — khong thay dung mot cho cay`);
			ma = 1;
			continue;
		}
		writeFileSync(p, chu.replace(c.tu, c.thanh));
	} else writeFileSync(p, banTruocVong(c.tep));
	const r = chaySpec(d, thoat(c.test));
	const doDung =
		r.ma !== 0 &&
		r.ra
			.split("\n")
			.some((l) => l.startsWith("(fail)") && l.includes(c.test)) &&
		(!c.ghim || r.ra.includes(c.ghim));
	if (doDung) console.log(`BAT ${c.ca}: ${c.test.trim()}`);
	else {
		console.log(`thuoc hong: ${c.ca} — test «${c.test.trim()}» khong do`);
		ma = 1;
	}
}
process.exit(ma);
