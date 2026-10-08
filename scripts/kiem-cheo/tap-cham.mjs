import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { KIEM_CHEO } from "./cau-hinh.mjs";

export function khuon(glob) {
	const tho = glob.replace(/[.+^${}()|[\]\\]/g, "\\$&");
	const re = tho
		.replace(/\*\*\//g, "\u0000")
		.replace(/\*\*/g, "\u0001")
		.replace(/\*/g, "[^/]*")
		.replace(/\u0000/g, "(?:.*/)?")
		.replace(/\u0001/g, ".*");
	return new RegExp(`^${re}$`);
}

export function duongCua(text) {
	const ra = [];
	let thut = -1;
	for (const dong of text.split("\n")) {
		const mo = dong.match(/^(\s*)paths:\s*$/);
		if (mo) {
			thut = mo[1].length;
			continue;
		}
		if (thut < 0) continue;
		const muc = dong.match(/^(\s*)-\s+"?([^"#]+?)"?\s*$/);
		if (muc && muc[1].length >= thut) ra.push(muc[2]);
		else thut = -1;
	}
	return ra;
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
