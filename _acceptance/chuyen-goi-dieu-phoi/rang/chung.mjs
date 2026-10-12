import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

export const GOC = resolve(import.meta.dirname, "..", "..", "..");
export const SLUG = "chuyen-goi-dieu-phoi";
export const RA = join(GOC, ".acceptance-runs", SLUG);
export const DESIGN = join(GOC, "_acceptance", SLUG, "design.md");
const BO_DEM = 512 * 1024 * 1024;

export function moiTruongSach(them = {}) {
	const env = { ...process.env, ...them };
	for (const k of Object.keys(env)) {
		if (/^GIT_(DIR|WORK_TREE|INDEX_FILE|COMMON_DIR|OBJECT_DIRECTORY)/.test(k)) delete env[k];
	}
	return env;
}

export function git(cwd, ...a) {
	return execFileSync("git", ["-C", cwd, ...a], {
		encoding: "utf8",
		maxBuffer: BO_DEM,
		env: moiTruongSach(),
		stdio: ["ignore", "pipe", "pipe"],
	});
}

export const docTai = (sha, tep) => git(GOC, "show", `${sha}:${tep}`);

function laToTien(sha, ref) {
	try {
		git(GOC, "merge-base", "--is-ancestor", sha, ref);
		return true;
	} catch {
		return false;
	}
}

export function neoVong() {
	const dau = git(GOC, "log", "--diff-filter=A", "--format=%H", "--", `_acceptance/${SLUG}/contract.md`).split("\n").filter(Boolean).at(-1);
	if (!dau) khongDoDuoc("khong tim thay commit dau cua ho so");
	if (!laToTien(dau, "origin/onehub")) {
		const truoc = git(GOC, "merge-base", "HEAD", "origin/onehub").trim();
		return { truoc, sau: null, nhan: `nhanh mo, merge-base ${truoc.slice(0, 12)}` };
	}
	const chuoiChinh = new Set(git(GOC, "rev-list", "--first-parent", "origin/onehub").split("\n").filter(Boolean));
	const gop = git(GOC, "rev-list", "--ancestry-path", `${dau}..origin/onehub`).split("\n").filter((c) => chuoiChinh.has(c)).at(-1);
	if (!gop) khongDoDuoc("ho so da len onehub nhung khong tim thay commit gop");
	const [cha1, cha2] = [git(GOC, "rev-parse", `${gop}^1`).trim(), git(GOC, "rev-parse", `${gop}^2`).trim()];
	const truoc = git(GOC, "merge-base", cha1, cha2).trim();
	return { truoc, sau: cha2, nhan: `da gop ${gop.slice(0, 12)}, ${truoc.slice(0, 12)}..${cha2.slice(0, 12)}` };
}

export const NEO = neoVong();
export const docSau = (tep) => (NEO.sau ? docTai(NEO.sau, tep) : readFileSync(join(GOC, tep), "utf8"));
export const diffVong = (tuyChon, duong = []) => git(GOC, "diff", ...tuyChon, NEO.truoc, ...(NEO.sau ? [NEO.sau] : []), "--", ...duong);

export function thuMucTam(ten) {
	return mkdtempSync(join(realpathSync(tmpdir()), `cgdp-${ten}-`));
}

export function thuMucRa(ten) {
	const d = join(RA, ten);
	rmSync(d, { recursive: true, force: true });
	mkdirSync(d, { recursive: true });
	return d;
}

export function cloneDocLap(sha, ten) {
	const tam = thuMucTam(ten);
	const goc = join(tam, "kho");
	execFileSync("git", ["clone", "-q", "--no-checkout", GOC, goc], {
		env: moiTruongSach(),
		stdio: ["ignore", "pipe", "pipe"],
	});
	git(goc, "checkout", "-q", "--detach", sha);
	return { goc, tam, don: () => rmSync(tam, { recursive: true, force: true }) };
}

export function bangTrongDesign(tieuDe) {
	const chu = readFileSync(DESIGN, "utf8");
	const i = chu.indexOf(tieuDe);
	if (i < 0) throw new Error(`design doc khong co muc «${tieuDe}»`);
	const sau = chu.slice(i).split("\n");
	const dong = [];
	let trongBang = false;
	for (const d of sau.slice(1)) {
		if (d.startsWith("|")) {
			trongBang = true;
			dong.push(d);
		} else if (trongBang) break;
	}
	return dong
		.slice(2)
		.map((d) => d.split("|").slice(1, -1).map((o) => o.trim()));
}

export class Ket {
	constructor() {
		this.sai = 0;
	}
	kiem(ok, nhan, lyDo = "") {
		if (ok) console.log(`dat ${nhan}`);
		else {
			this.sai += 1;
			console.log(`sai ${nhan}${lyDo ? `: ${lyDo}` : ""}`);
		}
		return ok;
	}
	bat(ca, dsDo, mong) {
		const trung = dsDo.find((d) => d.startsWith(mong));
		if (trung) console.log(`BAT ${ca} — ${trung}`);
		else {
			this.sai += 1;
			console.log(`thuoc hong: ${ca} — mong «${mong}», duoc ${JSON.stringify(dsDo.slice(0, 5))}`);
		}
	}
	ket() {
		console.log(this.sai === 0 ? "KET LUAN: xanh" : `KET LUAN: ${this.sai} sai`);
		process.exit(this.sai === 0 ? 0 : 1);
	}
}

export function khongDoDuoc(lyDo) {
	console.log(`KHONG DO DUOC: ${lyDo}`);
	process.exit(2);
}
