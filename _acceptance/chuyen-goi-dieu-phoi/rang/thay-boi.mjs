import { cpSync, existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { bangTrongDesign, cloneDocLap, docSau, docTai, git, GOC, Ket, khongDoDuoc, NEO, SLUG, thuMucRa } from "./chung.mjs";

const require = createRequire(import.meta.url);
const ey = require(join(GOC, "lib", "eval-yaml.cjs"));
const ac = require(join(GOC, "lib", "ac-line.cjs"));
const ec = require(join(GOC, "lib", "evidence-core.cjs"));
const ket = new Ket();

const giaTri = (v) => String(v ?? "").replace(/\s+#.*$/, "").trim().replace(/^["'](.*)["']$/, "$1");
const hopDong = readFileSync(join(GOC, "_acceptance", SLUG, "contract.md"), "utf8");
const trangThai = /^status:\s*(\S+)/m.exec(hopDong)?.[1];
const acCo = new Set(ac.parseACBlock(hopDong).map((x) => x.id));
const evMoi = ey.parseEvals(readFileSync(join(GOC, "_acceptance", SLUG, "evals.yaml"), "utf8"), ["criterion", "status"]);
const acSong = (id) => evMoi.some((e) => giaTri(e.status) !== "not-run" && (String(e.criterion).match(/AC-\d+/g) ?? []).includes(id));

const bangGoc = bangTrongDesign("Eval cũ thay bởi vòng này").map(([ref, acId]) => {
	const [slug, id] = ref.split("/");
	return { slug, id, ac: acId };
});
if (bangGoc.length === 0) khongDoDuoc("bang thay boi rong");
console.log(`bang: ${bangGoc.length} dong, ${new Set(bangGoc.map((r) => r.slug)).size} ho so`);

function khoiTruoc(text, id) {
	const dong = text.split("\n");
	const i = dong.indexOf(`  - id: ${id}`);
	if (i < 0) return null;
	let j = i + 1;
	while (j < dong.length && !/^ {2}- id:/.test(dong[j]) && !/^\S/.test(dong[j])) j++;
	return dong.slice(i, j);
}

function hieuMultiset(a, b) {
	const dem = new Map();
	for (const x of a) dem.set(x, (dem.get(x) ?? 0) + 1);
	const ra = [];
	for (const x of b) {
		if (dem.get(x)) dem.set(x, dem.get(x) - 1);
		else ra.push(x);
	}
	return ra;
}

const slugDoiTai = (goc) =>
	git(goc, "diff", "--name-only", "--diff-filter=M", NEO.truoc, ...(goc === GOC && NEO.sau ? [NEO.sau] : []), "--", "_acceptance/*/evals.yaml")
		.split("\n")
		.map((t) => /^_acceptance\/([^/]+)\/evals\.yaml$/.exec(t)?.[1])
		.filter((s) => s && s !== SLUG);
const SLUG_DOI = slugDoiTai(GOC);

function kiemCauTruc(bang, docEvals, inRa = false, slugDoi = SLUG_DOI) {
	const doDs = [];
	for (const r of bang) {
		const e = ey.parseEvals(docEvals(r.slug), ["status", "superseded_by"]).find((x) => x.id === r.id);
		if (giaTri(e?.status) !== "not-run") doDs.push(`DO ${r.slug}/${r.id} status ${giaTri(e?.status) || "vang"}`);
		if (giaTri(e?.superseded_by) !== `${SLUG}#${r.ac}`) doDs.push(`DO ${r.slug}/${r.id} con-tro ${giaTri(e?.superseded_by) || "vang"}`);
		if (!acCo.has(r.ac)) doDs.push(`DO ${r.ac} khong co trong hop dong`);
		else if (!acSong(r.ac)) doDs.push(`DO ${r.ac} khong co eval song`);
	}
	for (const slug of new Set([...bang.map((r) => r.slug), ...slugDoi])) {
		const cu = docTai(NEO.truoc, `_acceptance/${slug}/evals.yaml`);
		const moi = docEvals(slug);
		const themMong = [];
		const boMong = [];
		for (const r of bang.filter((x) => x.slug === slug)) {
			const khoi = khoiTruoc(cu, r.id) ?? [];
			const supCu = khoi.find((d) => /^ {4}superseded_by:/.test(d));
			if (supCu) boMong.push(supCu);
			else themMong.push("    status: not-run");
			themMong.push(`    superseded_by: ${SLUG}#${r.ac}`);
		}
		const them = hieuMultiset(cu.split("\n"), moi.split("\n"));
		const bo = hieuMultiset(moi.split("\n"), cu.split("\n"));
		const lechThem = [...hieuMultiset(themMong, them), ...hieuMultiset(them, themMong)];
		const lechBo = [...hieuMultiset(boMong, bo), ...hieuMultiset(bo, boMong)];
		if (lechThem.length || lechBo.length) doDs.push(`DO ${slug} doi ngoai bang: ${JSON.stringify([...lechThem, ...lechBo].slice(0, 3))}`);
		else if (inRa) console.log(`dat ${slug} chi doi bang (+${them.length} -${bo.length})`);
	}
	return doDs;
}

function moiConTro() {
	const ra = [];
	for (const slug of readdirSync(join(GOC, "_acceptance"))) {
		const p = join(GOC, "_acceptance", slug, "evals.yaml");
		if (!existsSync(p)) continue;
		for (const e of ey.parseEvals(readFileSync(p, "utf8"), ["superseded_by"])) {
			if (e.superseded_by) ra.push({ slug, id: e.id, conTro: giaTri(e.superseded_by) });
		}
	}
	return ra;
}

function quetConTro(root, ds) {
	const doDs = [];
	const dem = {};
	for (const c of ds) {
		const r = ec.chungThayBoi({ root, slug: c.slug, id: c.id, conTro: c.conTro });
		const hopLe = r.ok || (r.lyDo === "ho-so-thay-chua-ky" && c.conTro.startsWith(`${SLUG}#`) && trangThai !== "signed-off");
		const nhan = r.ok ? "ok" : r.lyDo;
		dem[nhan] = (dem[nhan] ?? 0) + 1;
		if (!hopLe) doDs.push(`DO con-tro-gay ${c.slug}/${c.id} ${r.lyDo} (${c.conTro})`);
	}
	return { doDs, dem };
}

const docThat = (slug) => docSau(`_acceptance/${slug}/evals.yaml`);
const kiemMien = (bang, slugDoi) => [...new Set(bang.map((r) => r.slug))].filter((s) => !slugDoi.includes(s)).map((s) => `DO mien-git-diff thieu ${s}`);
console.log(`neo: ${NEO.nhan}`);
console.log(`evals.yaml doi so voi merge-base (ngoai ho so nay): ${SLUG_DOI.length} tep`);
const mien = kiemMien(bangGoc, SLUG_DOI);
ket.kiem(mien.length === 0, `mien git diff phu moi ho so cua bang (${new Set(bangGoc.map((r) => r.slug)).size})`, mien.join(" | "));
const that = kiemCauTruc(bangGoc, docThat, true);
ket.kiem(that.length === 0, `${bangGoc.length} eval cua bang khai dung, AC co va con eval song`, that.slice(0, 6).join(" | "));

const conTro = moiConTro();
const q = quetConTro(GOC, conTro);
console.log(`con tro trong kho: ${conTro.length} · ${JSON.stringify(q.dem)} · ho so nay: ${trangThai}`);
ket.kiem(q.doDs.length === 0, "moi con tro superseded_by hop le theo chungThayBoi", q.doDs.slice(0, 6).join(" | "));
const tienLe = ec.chungThayBoi({ root: GOC, slug: "ci-ma-tran-ba-o", id: "E5", conTro: "thuoc-7-ngay-loc-pr#AC-4" });
ket.kiem(tienLe.ok === true, "doi-chung-duong tien le ci-ma-tran-ba-o/E5", JSON.stringify(tienLe));

const r0 = bangGoc[0];
const sua = (slug, f) => (s) => (s === slug ? f(docThat(s)) : docThat(s));
const boStatus = (t, id) => {
	const dong = t.split("\n");
	const i = dong.indexOf(`  - id: ${id}`);
	const k = dong.findIndex((d, n) => n > i && /^ {4}status: not-run/.test(d));
	dong.splice(k, 1);
	return dong.join("\n");
};
ket.bat("mat-status", kiemCauTruc(bangGoc, sua(r0.slug, (t) => boStatus(t, r0.id))), `DO ${r0.slug}/${r0.id} status`);
const bang99 = bangGoc.map((r, i) => (i === 0 ? { ...r, ac: "AC-99" } : r));
ket.bat(
	"tro-ac-99",
	kiemCauTruc(bang99, sua(r0.slug, (t) => t.replace(`superseded_by: ${SLUG}#${r0.ac}\n`, `superseded_by: ${SLUG}#AC-99\n`))),
	"DO AC-99 khong co",
);
const ngoaiBang = "luat-kho-vong-doi";
if (bangGoc.some((r) => r.slug === ngoaiBang)) khongDoDuoc(`${ngoaiBang} da co trong bang, chon ho so khac cho ca do`);
ket.bat("mien-git-diff-rong", kiemMien(bangGoc, []), "DO mien-git-diff thieu");
const banClone = cloneDocLap(git(GOC, "rev-parse", "HEAD").trim(), "thay-boi");
try {
	const pNgoai = join(banClone.goc, "_acceptance", ngoaiBang, "evals.yaml");
	writeFileSync(pNgoai, readFileSync(pNgoai, "utf8").replace(/^( {4}expected: )/m, "$1«sua» "));
	const docClone = (s) => readFileSync(join(banClone.goc, "_acceptance", s, "evals.yaml"), "utf8");
	ket.bat("sua-ho-so-ngoai-bang", kiemCauTruc(bangGoc, docClone, false, slugDoiTai(banClone.goc)), `DO ${ngoaiBang} doi ngoai bang`);
} finally {
	banClone.don();
}
ket.bat(
	"doi-ngoai-bang",
	kiemCauTruc(bangGoc, sua(r0.slug, (t) => t.replace(/^( {4}expected: )/m, "$1«sua» "))),
	`DO ${r0.slug} doi ngoai bang`,
);
const goc = thuMucRa("thay-thu");
const DICH = "giam-phut-ci-nhap-t1";
cpSync(join(GOC, "_acceptance", DICH), join(goc, "_acceptance", DICH), { recursive: true });
const pEv = join(goc, "_acceptance", DICH, "evals.yaml");
const evDich = readFileSync(pEv, "utf8");
const dongEv = evDich.split("\n");
const iE12 = dongEv.indexOf("  - id: E12");
const iCmd = dongEv.findIndex((d, n) => n > iE12 && /^ {4}cmd:/.test(d));
dongEv.splice(iCmd + 1, 0, "    status: not-run");
writeFileSync(pEv, dongEv.join("\n"));
ket.bat(
	"con-tro-gay",
	quetConTro(goc, conTro.filter((c) => c.conTro === `${DICH}#AC-12`)).doDs,
	"DO con-tro-gay",
);
ket.ket();
