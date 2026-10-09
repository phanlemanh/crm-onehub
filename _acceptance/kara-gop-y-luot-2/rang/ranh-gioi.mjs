import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "..", "..", "..");
const SLUG = "kara-gop-y-luot-2";
const MA_HANG = "K3";
const NHANH_CHINH = "origin/onehub";
const NGUON_HANG = [
	"docs/plan/dot-sau-14-10/hang-viec.json",
	".acceptance-runs/dieu-phoi-sau-14-10/hang-viec.json",
];

const RANH_GIOI_CHEP = [
	"apps/app/app/(app)/[slug]/okr/gop-y-kara.ts",
	"apps/app/app/(app)/[slug]/okr/chip-gop-y.tsx",
	"apps/app/app/(app)/[slug]/okr/nhom-kara.tsx",
	"apps/app/app/(app)/[slug]/okr/dong-dan-gop-y.tsx",
	"apps/app/app/(app)/[slug]/okr/the-gop-y-props.ts",
	"apps/app/app/(app)/[slug]/okr/diem-cam.ts",
	"apps/app/app/(app)/[slug]/okr/bang-kr.tsx",
	"apps/app/app/(app)/[slug]/okr/hop-thoai-kr.tsx",
	"apps/app/app/(app)/[slug]/okr/hop-thoai-muc-tieu.tsx",
	"apps/app/app/(app)/[slug]/okr/cua-toi.tsx",
	"apps/app/app/(app)/[slug]/okr/bang-vet.tsx",
	"apps/app/app/(app)/[slug]/okr/bang-muc-tieu.tsx",
	"apps/app/components/crm/record-sheet/objective-sheet.tsx",
	"apps/app/components/crm/record-sheet/kr-sheet.tsx",
	"apps/app/lib/messages/okr-gop-y.ts",
	"apps/app/lib/messages/tro-ly-okr.ts",
	"apps/api/src/okr/dem-gop-y.ts",
	"apps/api/src/okr/tro-ly.service.ts",
	"apps/api/src/okr/tro-ly-so-do.ts",
	"packages/validation/src/okr-tro-ly.ts",
	"packages/validation/src/okr-ca-gop-y.ts",
	"packages/db/src/okr-tro-ly-danh-muc.ts",
	"packages/ui/src/components/proposed-change.tsx",
	"apps/app/test/gop-y-dung-cho*",
	"apps/app/test/khung-gop-y*",
	"apps/app/test/the-gop-y-okr.dom.tsx",
	"apps/app/test/hop-thoai-kr-sau-thu.dom.tsx",
	"apps/app/test/okr-sheet.dom.tsx",
	`_acceptance/${SLUG}/**`,
	"apps/api/src/okr/okr-config.ts",
	"packages/ui/src/components/kara/transcript.tsx",
	"packages/ui/src/components/kara/steps.tsx",
];

const CHAM_TEP = [
	"packages/ui/src/components/kara/state.tsx",
	"apps/app/test/messages-guard.spec.ts",
	"packages/ui/src/lib/format.ts",
	"apps/app/app/(app)/[slug]/okr/soan/nut-soan.tsx",
	"apps/app/app/(app)/[slug]/okr/soan/danh-sach-cuoc.tsx",
	"apps/app/app/(app)/[slug]/okr/soan/bang-nhap.tsx",
	"apps/api/test/kara-gop-y-luot-2.spec.ts",
	"_acceptance/config.yaml",
	`docs/superpowers/specs/2026-10-09-${SLUG}-design.md`,
	`docs/superpowers/plans/2026-10-09-${SLUG}.md`,
	"PRODUCT-MAP.md",
	"LO-TRINH.html",
];

const CHAM_TEP_XIN = [
	"apps/app/lib/search-param-keys.ts",
	"apps/api/test/tro-ly-okr-de-xuat-quyen.spec.ts",
	"docs/api.md",
];

const CHI_THEM = [
	"packages/ui/src/lib/format.ts",
	"_acceptance/config.yaml",
	"apps/app/lib/search-param-keys.ts",
	"apps/api/src/okr/okr-config.ts",
	"packages/ui/src/components/kara/transcript.tsx",
	"packages/ui/src/components/kara/steps.tsx",
];
const STATE = "packages/ui/src/components/kara/state.tsx";
const DONG_KIEU_DUOC_DOI = /^\| \{ kind: "(empty|off)";/;

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

const argv = process.argv.slice(2);
const lay = (ten) => {
	const i = argv.indexOf(ten);
	return i < 0 ? null : (argv[i + 1] ?? null);
};

const dot = docDot();
const ranhGioi = dot?.tep ?? RANH_GIOI_CHEP;
const mau = [...ranhGioi, ...CHAM_TEP, ...CHAM_TEP_XIN].map(mauRegex);
const neo = chonNeo();
const tep = git("diff", "--name-only", neo.tu, neo.toi).split("\n").filter(Boolean);
if (lay("--them")) tep.push(lay("--them"));
console.log(`neo ${neo.kieu}: ${neo.tu.slice(0, 9)}..${neo.toi === "HEAD" ? "HEAD" : neo.toi.slice(0, 9)} · ${tep.length} tep · ranh gioi ${dot ? dot.nguon : "chep"}`);

const loi = [];
for (const t of tep) if (!mau.some((r) => r.test(t))) loi.push(`ngoai-ranh-gioi:${t}`);
for (const t of CHI_THEM)
	if (tep.includes(t) && dongDoi(neo.tu, neo.toi, t).some((d) => d.dau === "-" && d.noi !== ""))
		loi.push(`xoa dong o tep chi them: ${t}`);
if (tep.includes(STATE))
	for (const d of dongDoi(neo.tu, neo.toi, STATE))
		if (d.dau === "-" && d.noi !== "" && !DONG_KIEU_DUOC_DOI.test(d.noi))
			loi.push(`state.tsx doi dong ngoai khai kieu: -${d.noi}`);

if (loi.length) {
	for (const l of loi) console.log(`   ${l}`);
	console.log(`DO: ${loi.length} vi pham ranh gioi`);
	process.exit(1);
}
console.log(`ranh-gioi: ${tep.length} tep, 0 ngoai (neo ${neo.kieu})`);
