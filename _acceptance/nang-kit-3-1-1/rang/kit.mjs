import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync } from "node:fs";
import os from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const SLUG = "nang-kit-3-1-1";
export const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
export const THE = "v3.1.1";
export const THE_SHA = "1193bc2203a47f7a5664999bd9b1259595baa1e3";
export const THE_CU = "v3.0.0";
export const KHO_KIT_URL = "https://github.com/phanlemanh/delivery-loop";
export const LOI = "plugins/acceptance-gate";
export const NHANH_CHINH = "origin/onehub";
export const NEN = "4aebb767d0b09239d56d556d6e0f184804cbe5fa";
export const MOC_VONG = "d69f95761004191f8e01eb06354f5f424c3e3bb3";

export function git(cwd, ...a) {
	return execFileSync("git", ["-C", cwd, ...a], { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
}

function khoKitCucBo() {
	const ung = [
		process.env.KHO_DELIVERY_LOOP,
		join(os.homedir(), "dev", "delivery-loop"),
		join(os.homedir(), ".claude", "plugins", "marketplaces", "delivery-loop"),
	].filter(Boolean);
	for (const k of ung) {
		try {
			if (git(k, "rev-parse", `${THE}^{commit}`).trim() === THE_SHA) return k;
		} catch {}
	}
	return null;
}

let khoKit = null;
export function kitGit() {
	if (khoKit) return khoKit;
	const cucBo = khoKitCucBo();
	if (cucBo) return (khoKit = cucBo);
	const dich = join(GOC, ".acceptance-runs", SLUG, "kit-delivery-loop.git");
	if (!existsSync(dich)) {
		mkdirSync(dirname(dich), { recursive: true });
		execFileSync("git", ["clone", "-q", "--bare", "--filter=blob:none", KHO_KIT_URL, dich]);
	}
	git(dich, "fetch", "-q", "origin", `refs/tags/${THE}:refs/tags/${THE}`);
	const sha = git(dich, "rev-parse", `${THE}^{commit}`).trim();
	if (sha !== THE_SHA) throw new Error(`thẻ ${THE} của kho kit trỏ ${sha}, không phải ${THE_SHA}`);
	return (khoKit = dich);
}

export function docKit(duong) {
	return git(kitGit(), "show", `${THE_SHA}:${duong}`);
}

export function giaiNenKit(duong, dich) {
	mkdirSync(dich, { recursive: true });
	const tar = execFileSync("git", ["-C", kitGit(), "archive", THE_SHA, duong], { maxBuffer: 512 * 1024 * 1024 });
	execFileSync("tar", ["-x", "-C", dich], { input: tar });
	return join(dich, duong);
}

export function thuMucTam(ten) {
	return realpathSync(mkdtempSync(join(os.tmpdir(), `nk311-${ten}-`)));
}

export function docKho(duong) {
	return readFileSync(join(GOC, duong), "utf8");
}

export function docTai(sha, duong) {
	return git(GOC, "show", `${sha}:${duong}`);
}

function laTo(goc, a, b) {
	try {
		git(goc, "merge-base", "--is-ancestor", a, b);
		return true;
	} catch {
		return false;
	}
}

export function capVong({ goc = GOC, dau = "HEAD" } = {}) {
	const gop = git(goc, "rev-list", "--first-parent", "--merges", "--reverse", `${NEN}..${dau}`)
		.split("\n")
		.filter(Boolean);
	for (const m of gop) {
		if (!laTo(goc, MOC_VONG, m)) continue;
		const [, cha1, cha2] = git(goc, "rev-list", "--parents", "-n", "1", m).trim().split(" ");
		if (cha2 && !laTo(goc, MOC_VONG, cha1)) {
			return { nen: git(goc, "merge-base", cha1, cha2).trim(), dinh: cha2, daGop: true };
		}
	}
	return {
		nen: git(goc, "merge-base", dau, NHANH_CHINH).trim(),
		dinh: git(goc, "rev-parse", dau).trim(),
		daGop: false,
	};
}

export function tepCuaVong(cap = capVong(), goc = GOC) {
	return git(goc, "diff", "--name-only", `${cap.nen}...${cap.dinh}`).split("\n").filter(Boolean);
}

export function danhSachChep(vanBan = docKit(`${LOI}/commands/acceptance-init.md`)) {
	const m = /<<<INIT-CI-COPY-LIST[^\n]*\n([\s\S]*?)INIT-CI-COPY-LIST>>>/.exec(vanBan);
	if (!m) throw new Error("không thấy khối INIT-CI-COPY-LIST trong acceptance-init.md");
	const ra = [];
	for (const dong of m[1].split("\n")) {
		const k = /`\$\{CLAUDE_PLUGIN_ROOT\}\/([^`]+)` → `([^`]+)`/.exec(dong);
		if (!k) continue;
		const ten = k[1].split("/").pop();
		ra.push({ nguon: k[1], dich: `${k[2].replace(/\/$/, "")}/${ten}` });
	}
	return ra;
}
