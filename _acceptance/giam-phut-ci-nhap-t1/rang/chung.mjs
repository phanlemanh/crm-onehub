import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

export const GOC = resolve(import.meta.dir, "..", "..", "..");
export const SLUG = "giam-phut-ci-nhap-t1";
export const SHA_GHIM = "27d47de04725bc04d8d6deff870ac16751f3bf69";
export const CHAY = join(GOC, ".acceptance-runs", SLUG);
export const WF_CI = ".github/workflows/ci.yml";
export const WF_ACC = ".github/workflows/acceptance.yml";
export const NEU_THEO = "${{ !cancelled() && needs.phan-loai.outputs.nang != 'false' }}";
export const NEU_OKR = "${{ github.event_name == 'pull_request' && !cancelled() && needs.phan-loai.outputs.nang != 'false' }}";

export function git(...args) {
	const r = spawnSync("git", args, { cwd: GOC, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
	if (r.status !== 0) throw new Error(`git ${args.join(" ")}: ${r.stderr}`);
	return r.stdout;
}

export const docTai = (sha, duong) => git("show", `${sha}:${duong}`);
export const yaml = (chu) => Bun.YAML.parse(chu);
export const yamlTai = (sha, duong) => yaml(docTai(sha, duong));
export const yamlHead = async (duong) => yaml(await Bun.file(join(GOC, duong)).text());
export const bang = (a, b) => Bun.deepEquals(a, b);

export function thuMucSach(ten) {
	const p = join(CHAY, ten);
	rmSync(p, { recursive: true, force: true });
	mkdirSync(p, { recursive: true });
	return p;
}

export function chepVao(dich, ...duong) {
	for (const d of duong) {
		mkdirSync(dirname(join(dich, d)), { recursive: true });
		cpSync(join(GOC, d), join(dich, d), { recursive: true });
	}
}

export class Ket {
	sai = [];
	khongBat = [];
	soDat = 0;
	dat(nhan) {
		this.soDat++;
		console.log(`dat ${nhan}`);
	}
	kiem(dieuKien, nhan, ly) {
		if (dieuKien) this.dat(nhan);
		else {
			this.sai.push(nhan);
			console.log(`sai ${nhan}: ${ly}`);
		}
		return dieuKien;
	}
	bat(ca, daBat, chiTiet = "") {
		if (daBat) console.log(`BAT ${ca}${chiTiet ? ` — ${chiTiet}` : ""}`);
		else {
			this.khongBat.push(ca);
			console.log(`thuoc hong: ${ca} khong bi bat${chiTiet ? ` — ${chiTiet}` : ""}`);
		}
	}
	xong() {
		if (this.sai.length || this.khongBat.length) {
			console.log(`KET: ${this.sai.length} sai, ${this.khongBat.length} ca dot bien khong bat`);
			process.exit(1);
		}
		console.log(`KET: dat ${this.soDat} o, moi ca dot bien bi bat`);
		process.exit(0);
	}
}
