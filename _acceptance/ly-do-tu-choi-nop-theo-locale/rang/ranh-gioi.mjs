import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "..", "..", "..");
const SLUG = "ly-do-tu-choi-nop-theo-locale";
const MA_HANG = "K2c";
const DOT = ".acceptance-runs/dieu-phoi-sau-14-10";
const NHANH_CHINH = "origin/onehub";

const RANH_GIOI_CHEP = [
	"apps/app/app/(app)/[slug]/okr/soan/**",
	"apps/app/lib/messages/okr-soan.ts",
	"packages/validation/src/okr-cuoc-soan.ts",
	"apps/agent-okr/agent/lib/nop-ban-nhap.ts",
	"apps/app/test/soan-okr*",
	"apps/app/test/messages-guard.spec.ts",
	`_acceptance/${SLUG}/**`,
];

const CHAM_TEP = [
	"apps/agent-okr/agent/lib/config.ts",
	"_acceptance/config.yaml",
	`docs/superpowers/specs/2026-10-09-${SLUG}-design.md`,
	`docs/superpowers/plans/2026-10-09-${SLUG}.md`,
	"PRODUCT-MAP.md",
	"LO-TRINH.html",
	"_acceptance/soan-okr-khong-lac/rang/man.mjs",
	"_acceptance/soan-okr-khong-lac/rang/mot-nguon.mjs",
	"_acceptance/soan-okr-khong-lac/rang/ranh-gioi.mjs",
	"_acceptance/soan-okr-khong-lac/decisions.jsonl",
	"_acceptance/soan-okr-khong-lac/evidence-report.md",
	"_acceptance/soan-okr-khong-lac/run-log.jsonl",
	"apps/app/test/khung-soan-okr.tsx",
];

const CONFIG_TS = "apps/agent-okr/agent/lib/config.ts";
const NOP = "apps/agent-okr/agent/lib/nop-ban-nhap.ts";
const CHI_THEM = ["_acceptance/config.yaml"];

const DONG_TU_CHOI_CU = [
	"tuChoi: {",
	'cuocKhongThuocPhien: "cuoc khong thuoc phien",',
	'cuocKhongDang: "cuoc khong con dang",',
	'donViChuaBat: "don-vi-chua-bat",',
	'saiMucDich: "phien khong phai okr-soan",',
	'chuKyKhongLapKeHoach: "chu ky khong o pha lap ke hoach",',
	'dongTrungKhoa: "dong trung khoa",',
	'phienKhongSong: "phien khong con song",',
	"},",
];
const DONG_IMPORT_CONFIG = [
	'import { BAN_NHAP_TRAN, type BuocCat } from "@crm/validation/okr-cuoc-soan";',
	"import {",
	"BAN_NHAP_TRAN,",
	"type BuocCat,",
	"LY_DO_TU_CHOI_NOP,",
	'} from "@crm/validation/okr-cuoc-soan";',
];
const DONG_NOP = /^(lyDo: (z\.string\(\)|lyDoTuChoiGhi),|lyDoTuChoiGhi,|const tuChoi = \(lyDo: .*\): KetQuaNop => \(\{|lyDo,)$/;

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
	try {
		const chung = git("rev-parse", "--path-format=absolute", "--git-common-dir").trim();
		const hang = join(dirname(chung), DOT, "hang-viec.json");
		if (!existsSync(hang)) return null;
		const viec = JSON.parse(readFileSync(hang, "utf8"));
		const ds = Array.isArray(viec) ? viec : (viec.hang ?? viec.viec ?? Object.values(viec)[0]);
		const h = ds.find((x) => x.ma === MA_HANG);
		return h ? [...h.ranh_gioi, ...(h.chung_chi_them ?? [])] : null;
	} catch {
		return null;
	}
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
	if (!daLen) {
		const mb = git("merge-base", "HEAD", NHANH_CHINH).trim();
		return { kieu: "nhanh-mo", tu: mb, toi: "HEAD" };
	}
	const chuoi = git("rev-list", "--first-parent", "--ancestry-path", `${dau}..${NHANH_CHINH}`).trim().split("\n").filter(Boolean);
	const m = chuoi.at(-1);
	if (!m) boCuoc("khong tim thay merge dua ho so len onehub");
	const toi = git("rev-parse", `${m}^2`).trim();
	const tu = git("merge-base", `${m}^1`, toi).trim();
	return { kieu: `merge ${m.slice(0, 9)}`, tu, toi };
}

function dongDoi(tu, toi, tep) {
	return git("diff", "-U0", tu, toi, "--", tep)
		.split("\n")
		.filter((d) => /^[+-]/.test(d) && !/^(\+\+\+|---) /.test(d))
		.map((d) => ({ dau: d[0], noi: d.slice(1).trim() }));
}

function xetConfigTs(dong) {
	return dong
		.filter((d) => d.noi !== "")
		.filter((d) =>
			d.dau === "-"
				? !DONG_TU_CHOI_CU.includes(d.noi) && !DONG_IMPORT_CONFIG.includes(d.noi)
				: d.noi !== "tuChoi: LY_DO_TU_CHOI_NOP," && !DONG_IMPORT_CONFIG.includes(d.noi),
		);
}

function xetNop(dong) {
	return dong.filter((d) => d.noi !== "" && !DONG_NOP.test(d.noi));
}

function docMau(tep) {
	return readFileSync(resolve(tep), "utf8")
		.split("\n")
		.filter((d) => /^[+-]/.test(d))
		.map((d) => ({ dau: d[0], noi: d.slice(1).trim() }));
}

const argv = process.argv.slice(2);
const lay = (ten) => {
	const i = argv.indexOf(ten);
	return i < 0 ? null : (argv[i + 1] ?? null);
};

if (lay("--diff-mau")) {
	const sai = xetConfigTs(docMau(lay("--diff-mau")));
	if (sai.length) {
		console.log(`config.ts doi ngoai khoi tuChoi: ${sai.map((d) => d.dau + d.noi).join(" | ")}`);
		process.exit(1);
	}
	console.log("CHIEU DO HONG: mau khong co dong ngoai khoi");
	process.exit(3);
}
if (lay("--diff-mau-nop")) {
	const sai = xetNop(docMau(lay("--diff-mau-nop")));
	if (sai.length) {
		console.log(`nop-ban-nhap doi ngoai lyDo: ${sai.map((d) => d.dau + d.noi).join(" | ")}`);
		process.exit(1);
	}
	console.log("CHIEU DO HONG: mau khong co dong ngoai lyDo");
	process.exit(3);
}

const ranhGioi = docDot() ?? RANH_GIOI_CHEP;
const mau = [...ranhGioi, ...CHAM_TEP].map(mauRegex);
const neo = chonNeo();
const tep = git("diff", "--name-only", neo.tu, neo.toi).split("\n").filter(Boolean);
if (lay("--them")) tep.push(lay("--them"));
console.log(`neo ${neo.kieu}: ${neo.tu.slice(0, 9)}..${neo.toi === "HEAD" ? "HEAD" : neo.toi.slice(0, 9)} · ${tep.length} tep · ranh gioi ${docDot() ? "tu hang-viec.json" : "chep"}`);

const loi = [];
for (const t of tep) if (!mau.some((r) => r.test(t))) loi.push(`ngoai-ranh-gioi:${t}`);
for (const t of CHI_THEM)
	if (tep.includes(t) && dongDoi(neo.tu, neo.toi, t).some((d) => d.dau === "-")) loi.push(`xoa dong o tep chi them: ${t}`);
if (tep.includes(CONFIG_TS))
	for (const d of xetConfigTs(dongDoi(neo.tu, neo.toi, CONFIG_TS))) loi.push(`config.ts doi ngoai khoi tuChoi: ${d.dau}${d.noi}`);
if (tep.includes(NOP)) for (const d of xetNop(dongDoi(neo.tu, neo.toi, NOP))) loi.push(`nop-ban-nhap doi ngoai lyDo: ${d.dau}${d.noi}`);

if (loi.length) {
	for (const l of loi) console.log(`   ${l}`);
	console.log(`DO: ${loi.length} vi pham ranh gioi`);
	process.exit(1);
}
console.log(`ranh-gioi: ${tep.length} tep, 0 ngoai (neo ${neo.kieu})`);
