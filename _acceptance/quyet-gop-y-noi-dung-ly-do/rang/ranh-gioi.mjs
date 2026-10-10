import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "..", "..", "..");
const SLUG = "quyet-gop-y-noi-dung-ly-do";
const MA_HANG = "K3c";
const NHANH_CHINH = "origin/onehub";
const NGUON_HANG = [
	"docs/plan/dot-sau-14-10/hang-viec.json",
	".acceptance-runs/dieu-phoi-sau-14-10/hang-viec.json",
];

const RANH_GIOI_CHEP = [
	"apps/app/app/(app)/[slug]/okr/gop-y-kara.ts",
	"apps/app/lib/messages/okr-gop-y.ts",
	"apps/app/test/gop-y-dung-cho*",
	"apps/app/test/khung-gop-y*",
	`_acceptance/${SLUG}/**`,
	"apps/api/src/okr/tro-ly.service.ts",
	"apps/api/src/okr/okr.contracts.ts",
	"packages/validation/src/okr-tro-ly.ts",
	"apps/api/test/quyet-gop-y-noi-dung-ly-do.spec.ts",
	"_acceptance/config.yaml",
	"docs/api.md",
	`docs/superpowers/specs/2026-10-10-${SLUG}-design.md`,
	`docs/superpowers/plans/2026-10-10-${SLUG}.md`,
];

const CHAM_TEP = ["PRODUCT-MAP.md", "LO-TRINH.html"];

const CHI_THEM = ["_acceptance/config.yaml", "packages/validation/src/okr-tro-ly.ts"];

function git(...thamSo) {
	return execFileSync("git", thamSo, { cwd: GOC, encoding: "utf8", maxBuffer: 64 << 20 });
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
	const chung = git("rev-parse", "--path-format=absolute", "--git-common-dir").trim();
	for (const p of [join(GOC, NGUON_HANG[0]), join(dirname(chung), NGUON_HANG[1])]) {
		if (!existsSync(p)) continue;
		const viec = JSON.parse(readFileSync(p, "utf8"));
		const h = (viec.hang ?? []).find((x) => x.ma === MA_HANG);
		if (h) return { nguon: p.startsWith(GOC) ? NGUON_HANG[0] : NGUON_HANG[1], tep: [...h.ranh_gioi, ...(h.chung_chi_them ?? [])] };
	}
	return null;
}

function chonNeo() {
	try {
		git("rev-parse", "--verify", NHANH_CHINH);
	} catch {
		boCuoc(`khong co ref ${NHANH_CHINH} — chay git fetch origin onehub`);
	}
	const them = git("log", "--diff-filter=A", "--format=%H", "--", `_acceptance/${SLUG}/contract.md`).trim().split("\n").filter(Boolean);
	const dau = them.at(-1);
	if (!dau) boCuoc(`khong tim thay commit dau them _acceptance/${SLUG}/contract.md`);
	let daLen = true;
	try {
		git("merge-base", "--is-ancestor", dau, NHANH_CHINH);
	} catch {
		daLen = false;
	}
	if (!daLen) return { kieu: "nhanh-mo", tu: git("merge-base", "HEAD", NHANH_CHINH).trim(), toi: "HEAD" };
	const chuoi = git("rev-list", "--first-parent", "--ancestry-path", `${dau}..${NHANH_CHINH}`).trim().split("\n").filter(Boolean);
	const m = chuoi.at(-1);
	if (!m) boCuoc("khong tim thay merge dua ho so len onehub");
	const toi = git("rev-parse", `${m}^2`).trim();
	return { kieu: `merge ${m.slice(0, 9)}`, tu: git("merge-base", `${m}^1`, toi).trim(), toi };
}

function dongDoi(tu, toi, tep) {
	return git("diff", "-U0", tu, toi, "--", tep)
		.split("\n")
		.filter((d) => /^[+-]/.test(d) && !/^(\+\+\+|---) /.test(d))
		.map((d) => ({ dau: d[0], noi: d.slice(1).trim() }));
}

function khoi(noi, mo, dong) {
	const dongs = noi.split("\n");
	const ra = [];
	for (let i = 0; i < dongs.length; i++) {
		if (!mo.test(dongs[i])) continue;
		let j = i;
		while (j < dongs.length && !dong.test(dongs[j])) j++;
		ra.push([i + 1, j + 1]);
	}
	return ra;
}
const khoiImport = (noi) => khoi(noi, /^import\b/, /\bfrom\s+["']/);

const LUAT_KHOI = {
	"apps/api/src/okr/okr.contracts.ts": (noi) => [
		...khoiImport(noi),
		...khoi(noi, /^export const troLyQuyetOutput\b/, /^\]\);$/),
	],
	"apps/api/src/okr/tro-ly.service.ts": (noi) => [
		...khoiImport(noi),
		...khoi(noi, /^export const CAU_CUA_LY_DO_KHONG_QUYET\b/, /satisfies Record<LyDoKhongQuyet/),
		...khoi(noi, /^export function lyDoKhongQuyetCua\b/, /^}$/),
		...khoi(noi, /^\tasync troLyQuyet\(/, /^\t}$/),
	],
};

function noiDungTai(ref, tep) {
	if (ref === "HEAD") return readFileSync(join(GOC, tep), "utf8");
	try {
		return git("show", `${ref}:${tep}`);
	} catch {
		return "";
	}
}

function dongDoiSo(tu, toi, tep) {
	const ra = [];
	let cu = 0;
	let moi = 0;
	for (const d of git("diff", "-U0", tu, toi, "--", tep).split("\n")) {
		const h = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(d);
		if (h) {
			cu = Number(h[1]);
			moi = Number(h[2]);
			continue;
		}
		if (/^(\+\+\+|---) /.test(d)) continue;
		if (d.startsWith("+")) ra.push({ ben: "moi", so: moi++ });
		else if (d.startsWith("-")) ra.push({ ben: "cu", so: cu++ });
	}
	return ra;
}

const trong = (so, ds) => ds.some(([a, b]) => so >= a && so <= b);

const argv = process.argv.slice(2);
const lay = (ten) => {
	const i = argv.indexOf(ten);
	return i < 0 ? null : (argv[i + 1] ?? null);
};

const dot = docDot();
const ranhGioi = dot?.tep ?? RANH_GIOI_CHEP;
const mau = [...ranhGioi, ...CHAM_TEP].map(mauRegex);
const neo = chonNeo();
const tep = git("diff", "--name-only", neo.tu, neo.toi).split("\n").filter(Boolean);
if (lay("--them")) tep.push(lay("--them"));
const giaDong = lay("--gia-dong");
console.log(`neo ${neo.kieu}: ${neo.tu.slice(0, 9)}..${neo.toi === "HEAD" ? "HEAD" : neo.toi.slice(0, 9)} · ${tep.length} tep · ranh gioi ${dot ? dot.nguon : "chep"}`);

const loi = [];
for (const t of tep) if (!mau.some((r) => r.test(t))) loi.push(`ngoai-ranh-gioi:${t}`);
for (const t of CHI_THEM)
	if (tep.includes(t) && dongDoi(neo.tu, neo.toi, t).some((d) => d.dau === "-" && d.noi !== ""))
		loi.push(`xoa dong o tep chi them: ${t}`);
for (const [t, luat] of Object.entries(LUAT_KHOI)) {
	const doi = tep.includes(t) ? dongDoiSo(neo.tu, neo.toi, t) : [];
	if (giaDong?.startsWith(`${t}:`)) doi.push({ ben: "moi", so: Number(giaDong.slice(t.length + 1)) });
	if (doi.length === 0) continue;
	const moi = noiDungTai(neo.toi, t);
	const cu = noiDungTai(neo.tu, t);
	const khoiMoi = luat(moi);
	const khoiCu = luat(cu);
	const dongMoi = moi.split("\n");
	const dongCu = cu.split("\n");
	for (const d of doi)
		if ((d.ben === "moi" ? dongMoi : dongCu)[d.so - 1]?.trim() === "") continue;
		else if (!trong(d.so, d.ben === "moi" ? khoiMoi : khoiCu)) loi.push(`ngoai-khoi:${t}:${d.ben === "cu" ? "-" : ""}${d.so}`);
}

if (loi.length) {
	for (const l of loi) console.log(`   ${l}`);
	console.log(`DO: ${loi.length} vi pham ranh gioi`);
	process.exit(1);
}
console.log(`ranh-gioi: ${tep.length} tep, 0 ngoai (neo ${neo.kieu})`);
