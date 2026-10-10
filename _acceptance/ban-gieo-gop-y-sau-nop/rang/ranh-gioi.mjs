import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "..", "..", "..");
const SLUG = "ban-gieo-gop-y-sau-nop";
const MA_HANG = "K3b";
const NHANH_CHINH = "origin/onehub";
const NGUON_HANG = [
	"docs/plan/dot-sau-14-10/hang-viec.json",
	".acceptance-runs/dieu-phoi-sau-14-10/hang-viec.json",
];

const RANH_GIOI_CHEP = [
	"_acceptance/gop-y-dung-cho/rang/san-gop-y.mjs",
	`_acceptance/${SLUG}/**`,
	"_acceptance/config.yaml",
];

const CHAM_TEP = [
	`docs/superpowers/specs/2026-10-09-${SLUG}-design.md`,
	`docs/superpowers/plans/2026-10-09-${SLUG}.md`,
	"PRODUCT-MAP.md",
	"LO-TRINH.html",
];

const CHAM_TEP_XIN = [
	"_acceptance/gop-y-dung-cho/rang/thay-the.mjs",
	"_acceptance/gop-y-dung-cho/decisions.jsonl",
	"_acceptance/gop-y-dung-cho/evals.yaml",
	"_acceptance/gop-y-dung-cho/run-log.jsonl",
	"_acceptance/gop-y-dung-cho/evidence-report.md",
];

const CHI_THEM = ["_acceptance/config.yaml"];

function git(...thamSo) {
	return execFileSync("git", thamSo, {
		cwd: GOC,
		encoding: "utf8",
		maxBuffer: 64 << 20,
	});
}

function boCuoc(cau) {
	console.log(`KHONG DO DUOC: ${cau}`);
	process.exit(2);
}

function mauRegex(mau) {
	let r = "";
	for (let i = 0; i < mau.length; i++) {
		const c = mau[i];
		if (c === "*" && mau[i + 1] === "*") {
			r += ".*";
			i++;
		} else if (c === "*") r += "[^/]*";
		else r += c.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
	}
	return new RegExp(`^${r}$`);
}

function docDot() {
	const chung = git(
		"rev-parse",
		"--path-format=absolute",
		"--git-common-dir",
	).trim();
	for (const p of [
		join(GOC, NGUON_HANG[0]),
		join(dirname(chung), NGUON_HANG[1]),
	]) {
		if (!existsSync(p)) continue;
		const viec = JSON.parse(readFileSync(p, "utf8"));
		const h = (viec.hang ?? []).find((x) => x.ma === MA_HANG);
		if (h)
			return {
				nguon: p.startsWith(GOC) ? NGUON_HANG[0] : NGUON_HANG[1],
				tep: [...h.ranh_gioi, ...(h.chung_chi_them ?? [])],
			};
	}
	return null;
}

function chonNeo() {
	try {
		git("rev-parse", "--verify", NHANH_CHINH);
	} catch {
		boCuoc(`khong co ref ${NHANH_CHINH} — chay git fetch origin onehub`);
	}
	const them = git(
		"log",
		"--diff-filter=A",
		"--format=%H",
		"--",
		`_acceptance/${SLUG}/contract.md`,
	)
		.trim()
		.split("\n")
		.filter(Boolean);
	const dau = them.at(-1);
	if (!dau)
		boCuoc(`khong tim thay commit dau them _acceptance/${SLUG}/contract.md`);
	let daLen = true;
	try {
		git("merge-base", "--is-ancestor", dau, NHANH_CHINH);
	} catch {
		daLen = false;
	}
	if (!daLen)
		return {
			kieu: "nhanh-mo",
			tu: git("merge-base", "HEAD", NHANH_CHINH).trim(),
			toi: "HEAD",
		};
	const chuoi = git(
		"rev-list",
		"--first-parent",
		"--ancestry-path",
		`${dau}..${NHANH_CHINH}`,
	)
		.trim()
		.split("\n")
		.filter(Boolean);
	const m = chuoi.at(-1);
	if (!m) boCuoc("khong tim thay merge dua ho so len onehub");
	const toi = git("rev-parse", `${m}^2`).trim();
	return {
		kieu: `merge ${m.slice(0, 9)}`,
		tu: git("merge-base", `${m}^1`, toi).trim(),
		toi,
	};
}

function dongDoi(tu, toi, tep) {
	return git("diff", "-U0", tu, toi, "--", tep)
		.split("\n")
		.filter((d) => /^[+-]/.test(d) && !/^(\+\+\+|---) /.test(d))
		.map((d) => ({ dau: d[0], noi: d.slice(1).trim() }));
}

const argv = process.argv.slice(2);
const lay = (ten) => {
	const i = argv.indexOf(ten);
	return i < 0 ? null : (argv[i + 1] ?? null);
};

const dot = docDot();
const ranhGioi = dot?.tep ?? RANH_GIOI_CHEP;
const mau = [...ranhGioi, ...CHAM_TEP, ...CHAM_TEP_XIN].map(mauRegex);
const neo = chonNeo();
const tep = git("diff", "--name-only", neo.tu, neo.toi)
	.split("\n")
	.filter(Boolean);
if (lay("--them")) tep.push(lay("--them"));
console.log(
	`neo ${neo.kieu}: ${neo.tu.slice(0, 9)}..${neo.toi === "HEAD" ? "HEAD" : neo.toi.slice(0, 9)} · ${tep.length} tep · ranh gioi ${dot ? dot.nguon : "chep"}`,
);

const loi = [];
for (const t of tep)
	if (!mau.some((r) => r.test(t))) loi.push(`ngoai-ranh-gioi:${t}`);
for (const t of CHI_THEM)
	if (
		tep.includes(t) &&
		dongDoi(neo.tu, neo.toi, t).some((d) => d.dau === "-" && d.noi !== "")
	)
		loi.push(`xoa dong o tep chi them: ${t}`);
if (loi.length) {
	for (const l of loi) console.log(`   ${l}`);
	console.log(`DO: ${loi.length} vi pham ranh gioi`);
	process.exit(1);
}
console.log(`ranh-gioi: ${tep.length} tep, 0 ngoai (neo ${neo.kieu})`);
