import { existsSync, readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { KIEM_CHEO } from "./cau-hinh.mjs";

const require = createRequire(import.meta.url);
const { evalPathsOf, pathGlobToRe } = require("../../lib/evidence-core.cjs");
const { parseEvals } = require("../../lib/eval-yaml.cjs");

export const khuon = pathGlobToRe;

export function duongCua(text) {
	return parseEvals(text, []).flatMap((e) => evalPathsOf(text, e.id) ?? []);
}

export function trangThai(goc, slug) {
	const tep = join(goc, "_acceptance", slug, "contract.md");
	if (!existsSync(tep)) return null;
	return readFileSync(tep, "utf8").match(/^status:\s*(\S+)/m)?.[1] ?? null;
}

export function laSanPham(tep) {
	return !KIEM_CHEO.boQuaTien.some((t) => tep.startsWith(t));
}

export function tapCham({ goc, tepDoi }) {
	const doi = tepDoi.filter(laSanPham);
	const thuMuc = join(goc, "_acceptance");
	if (!existsSync(thuMuc)) return [];
	const ra = [];
	for (const slug of readdirSync(thuMuc).sort()) {
		const evals = join(thuMuc, slug, "evals.yaml");
		if (!existsSync(evals)) continue;
		if (!KIEM_CHEO.daKy.includes(trangThai(goc, slug) ?? "")) continue;
		const khuonDs = duongCua(readFileSync(evals, "utf8")).map(khuon);
		const so = doi.filter((t) => khuonDs.some((k) => k.test(t))).length;
		if (so > 0) ra.push({ slug, so });
	}
	return ra;
}
