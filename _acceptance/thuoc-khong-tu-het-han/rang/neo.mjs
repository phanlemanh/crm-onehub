import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";

export const GOC = resolve(import.meta.dirname, "..", "..", "..");
export const HO_SO = "thuoc-khong-tu-het-han";
export const MOC_GOC = "a9e8bc75a";
export const NHANH = "onehub";

const require = createRequire(import.meta.url);
export const ey = require(join(GOC, "lib/eval-yaml.cjs"));

export class LoiNeo extends Error {}

export function git(...thamSo) {
	try {
		return execFileSync("git", ["-C", GOC, ...thamSo], {
			encoding: "utf8",
			maxBuffer: 256 * 1024 * 1024,
			stdio: ["ignore", "pipe", "pipe"],
		});
	} catch (e) {
		throw new LoiNeo(`git ${thamSo.join(" ")}: ${String(e.stderr ?? e.message).trim().split("\n")[0]}`);
	}
}

export function lsTree(sha) {
	return git("ls-tree", "-r", "--name-only", sha).split("\n").filter(Boolean);
}

export function docTai(sha, tep) {
	return git("show", `${sha}:${tep}`);
}

export function coTai(sha, tep) {
	try {
		git("cat-file", "-e", `${sha}:${tep}`);
		return true;
	} catch {
		return false;
	}
}

export function mocNeo() {
	const gop = git("log", "--first-parent", "--format=%H", `origin/${NHANH}`, "--", `_acceptance/${HO_SO}/contract.md`)
		.split("\n")
		.filter(Boolean)
		.at(-1);
	if (gop && git("rev-list", "--parents", "-n", "1", gop).trim().split(" ").length > 2) return { sha: gop, loai: "commit gop tren onehub" };
	return { sha: git("rev-parse", "HEAD").trim(), loai: "HEAD (vong chua gop)" };
}

export function hoSoDaKy(sha) {
	const ra = [];
	for (const tep of lsTree(sha)) {
		const m = /^_acceptance\/([^/]+)\/contract\.md$/.exec(tep);
		if (!m) continue;
		const st = /^status:\s*(\S+)/m.exec(docTai(sha, tep))?.[1];
		if ((st === "signed-off" || st === "machine-cleared") && coTai(sha, `_acceptance/${m[1]}/evals.yaml`)) ra.push(m[1]);
	}
	return ra;
}

export function pathsCua(evalsText) {
	const ra = new Map();
	for (const ev of ey.parseEvals(evalsText, ["executor", "status", "paths"])) {
		const loai = String(ev.executor ?? "").trim();
		if (!/^(script|test)$/.test(loai) || /not-run/.test(String(ev.status ?? ""))) continue;
		const khoi = evalsText.split(/\n  - id: /).find((b) => b.startsWith(`${ev.id}\n`)) ?? "";
		const dong = /\n    paths:\n((?:      - .*\n?)+)/.exec(khoi);
		const phang = /\n    paths:\s*\[(.*)\]/.exec(khoi);
		const globs = dong
			? dong[1].split("\n").map((l) => l.replace(/^\s*- /, "").trim().replace(/^["']|["']$/g, "")).filter(Boolean)
			: phang
				? phang[1].split(",").map((x) => x.trim().replace(/^["']|["']$/g, "")).filter(Boolean)
				: [];
		ra.set(ev.id, globs);
	}
	return ra;
}
