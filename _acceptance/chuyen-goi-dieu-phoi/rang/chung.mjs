import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

export const GOC = resolve(import.meta.dirname, "..", "..", "..");
export const SLUG = "chuyen-goi-dieu-phoi";
export const MB = "b9a3b1609b47f175d44b9a9236b26b7cabec84af";
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
