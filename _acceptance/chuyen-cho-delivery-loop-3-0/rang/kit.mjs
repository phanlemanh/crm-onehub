import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync } from "node:fs";
import os from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const SLUG = "chuyen-cho-delivery-loop-3-0";
export const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
export const THE = "v3.0.0";
export const THE_SHA = "c16d25dbe224ec0b122b6d578118731750b6a4e3";
export const CONG_CU_SHA = "469e5ba40f1de75ca091511d2fb0005eb97e9f70";
export const KHO_KIT_URL = "https://github.com/phanlemanh/delivery-loop";
export const LOI = "plugins/acceptance-gate";

export const BANG_TEN = {
	plugin: { "dieu-phoi": "dispatch", "road-map": "roadmap", "tri-thuc": "knowledge" },
	lenh: {
		"dieu-phoi:mo-dot": "dispatch:open",
		"dieu-phoi:dong-dot": "dispatch:close",
		"dieu-phoi:tiep-tuc": "dispatch:resume",
		"dieu-phoi:ban-giao": "dispatch:handoff",
		"dieu-phoi:xem": "dispatch:status",
		"road-map:xem": "roadmap:status",
		"road-map:ghim": "roadmap:pin",
		"road-map:bo-ghim": "roadmap:unpin",
		"road-map:tra-lai": "roadmap:undo",
		"road-map:gui": "roadmap:suggest",
		"tri-thuc:ghi": "knowledge:ingest",
		"tri-thuc:kiem": "knowledge:health",
		"acceptance-gate:cat-luot": "acceptance-gate:scope-slice",
		"acceptance-gate:gom-tin-hieu": "acceptance-gate:signal-intake",
	},
};

export const SAU_PLUGIN_MOI = ["acceptance-gate", "feature-loop", "diagram-design", "dispatch", "roadmap", "knowledge"];
export const SAU_PLUGIN_CU = ["acceptance-gate", "feature-loop", "diagram-design", "dieu-phoi", "road-map", "tri-thuc"];

export function git(cwd, ...a) {
	return execFileSync("git", ["-C", cwd, ...a], { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
}

function khoKitCucBo() {
	const ung = [process.env.KHO_DELIVERY_LOOP, join(os.homedir(), "dev", "delivery-loop")].filter(Boolean);
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

export function coKit(duong) {
	try {
		git(kitGit(), "cat-file", "-e", `${THE_SHA}:${duong}`);
		return true;
	} catch {
		return false;
	}
}

export function giaiNenKit(duong, dich) {
	mkdirSync(dich, { recursive: true });
	const tar = execFileSync("git", ["-C", kitGit(), "archive", THE_SHA, duong], { maxBuffer: 512 * 1024 * 1024 });
	execFileSync("tar", ["-x", "-C", dich], { input: tar });
	return join(dich, duong);
}

export function thuMucTam(ten) {
	return realpathSync(mkdtempSync(join(os.tmpdir(), `cc30-${ten}-`)));
}

export function docKho(duong) {
	return readFileSync(join(GOC, duong), "utf8");
}

export function mergeBase() {
	return git(GOC, "merge-base", "HEAD", "origin/onehub").trim();
}

export function docTai(sha, duong) {
	return git(GOC, "show", `${sha}:${duong}`);
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
