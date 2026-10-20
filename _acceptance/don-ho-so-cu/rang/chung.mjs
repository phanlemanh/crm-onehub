import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

export const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
export const SLUG = "don-ho-so-cu";
export const LOI = createRequire(import.meta.url)(join(GOC, "lib", "evidence-core.cjs"));
export const HO_SO = join(GOC, "_acceptance", SLUG);
export const TAM = join(GOC, ".acceptance-runs", SLUG);
export const DA_KY = ["signed-off", "machine-cleared"];
export const NGUONG_TOAN_KHO = 40;

export const K6A = ["khung-khong-con-dung-chu", "lich-su-va-luu-tru-trang"];
export const LO_GOC_CHON = 8;
export const KHONG_DUNG = ["okr-soat-anh-luot-3"];

const DONG_CU = /^VIOLATION \[([^\]]+)\]: evidence is stale/;
const DONG_LOC = /^NOTE \[([^\]]+)\]: bộ lọc paths không áp \(([^)]*)\)/;

export function git(root, ...args) {
	const r = spawnSync("git", ["-C", root, ...args], { encoding: "utf8", maxBuffer: 1 << 28 });
	if (r.status !== 0) throw new Error(`git ${args.join(" ")}: ${(r.stderr || "").trim().split("\n")[0]}`);
	return r.stdout.trim();
}

export function docJson(p) {
	return JSON.parse(readFileSync(p, "utf8"));
}

export function trangThai(root, slug) {
	const p = join(root, "_acceptance", slug, "contract.md");
	if (!existsSync(p)) return null;
	const m = readFileSync(p, "utf8").match(/^status:[ \t]*([^\s#]+)/m);
	return m ? m[1] : null;
}

export function chayLuoi(root, slug) {
	const args = [join(root, "scripts", "pre-merge-check.sh"), root];
	if (slug) args.push("--slug", slug);
	const r = spawnSync("bash", args, { cwd: root, encoding: "utf8", maxBuffer: 1 << 28 });
	if (r.error) throw new Error(`luoi khong chay duoc: ${r.error.message}`);
	const text = `${r.stdout}\n${r.stderr}`;
	if (!/pre-merge-check: (clean|\d+ violation)/.test(text)) {
		throw new Error(`luoi khong in dong ket (ma ${r.status}): ${text.trim().split("\n").slice(-2).join(" | ")}`);
	}
	return text;
}

export function docDauRaLuoi(text) {
	const cu = new Set();
	const loc = new Map();
	for (const dong of text.split("\n")) {
		const v = dong.match(DONG_CU);
		if (v) cu.add(v[1]);
		const n = dong.match(DONG_LOC);
		if (n) loc.set(n[1], n[2]);
	}
	return [...cu].sort().map((slug) => ({ slug, nhom: loc.has(slug) ? `thieu-paths:${loc.get(slug)}` : "loc-ap" }));
}

export function kiemKe({ root = GOC, slugs } = {}) {
	if (!slugs || slugs.length > NGUONG_TOAN_KHO) {
		const hoSo = docDauRaLuoi(chayLuoi(root));
		return slugs ? hoSo.filter((h) => slugs.includes(h.slug)) : hoSo;
	}
	return slugs.flatMap((s) => docDauRaLuoi(chayLuoi(root, s)).filter((h) => h.slug === s));
}

export function cayTach(sha, ten) {
	mkdirSync(TAM, { recursive: true });
	const dich = join(TAM, ten);
	if (existsSync(dich)) {
		spawnSync("git", ["-C", GOC, "worktree", "remove", "--force", dich]);
		rmSync(dich, { recursive: true, force: true });
	}
	git(GOC, "worktree", "add", "--detach", dich, sha);
	return {
		goc: dich,
		don() {
			spawnSync("git", ["-C", GOC, "worktree", "remove", "--force", dich]);
			rmSync(dich, { recursive: true, force: true });
		},
	};
}

export function evalsMay(root, slug) {
	const p = join(root, "_acceptance", slug, "evals.yaml");
	if (!existsSync(p)) return [];
	const text = readFileSync(p, "utf8");
	const may = new Set(LOI.machineEvalIds(text));
	return [...may].map((id) => ({ id, paths: LOI.evalPathsOf(text, id) ?? [] }));
}
