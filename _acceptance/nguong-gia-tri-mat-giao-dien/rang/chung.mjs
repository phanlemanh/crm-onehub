import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const GOC = join(
	dirname(fileURLToPath(import.meta.url)),
	"..",
	"..",
	"..",
);
export const HS = "_acceptance/nguong-gia-tri-mat-giao-dien";
export const BANG = JSON.parse(
	readFileSync(join(GOC, HS, "rang/bang-de-xuat.json"), "utf8"),
);
export const DE_XUAT = "[đề xuất]";

export function khongDo(dong) {
	console.log(`KHONG DO DUOC: ${dong}`);
	process.exit(2);
}

export function goiKit() {
	try {
		return execFileSync(
			"node",
			[
				join(GOC, "scripts", "resolve-plugin.mjs"),
				"--plugin",
				"acceptance-gate",
				"--require",
				"lib/nguong-o-co-hoi.cjs",
				"--require",
				"scripts/start-scan.mjs",
			],
			{ cwd: GOC, encoding: "utf8" },
		).trim();
	} catch (e) {
		khongDo(`khong giai duoc goi acceptance-gate — ${e.message}`);
	}
}

export function napNguong(ag) {
	const n = createRequire(import.meta.url)(
		join(ag, "lib", "nguong-o-co-hoi.cjs"),
	);
	for (const k of [
		"thresholdState",
		"thresholdLabels",
		"bulletOf",
		"coNguoiDungCuoi",
	])
		if (!(k in n)) khongDo(`nguong-o-co-hoi thieu ${k}`);
	const tpl = readFileSync(
		join(ag, "skills", "acceptance", "references", "opportunity-template.md"),
		"utf8",
	);
	return { n, tpl, nhan: n.thresholdLabels(tpl) };
}

export function oNguong(n, text) {
	const got = new Map();
	for (const l of text.split("\n")) {
		const b = n.bulletOf(l);
		if (b) got.set(b.label, b.value);
	}
	return got;
}

export function tepGoc(tep) {
	return execFileSync("git", ["show", `${BANG.goc}:${tep}`], {
		cwd: GOC,
		encoding: "utf8",
	});
}

const BIET_DANH = {
	SỐNG: "Kết quả nào là SỐNG",
	CHẾT: "Kết quả nào là CHẾT",
};

export function mucNguong(text) {
	const L = text.split("\n");
	const i = L.findIndex((l) => l.startsWith("## Ngưỡng"));
	if (i < 0) return null;
	let j = L.findIndex((l, k) => k > i && l.startsWith("## "));
	if (j < 0) j = L.length;
	return { i, j, muc: L.slice(i + 1, j) };
}

export function nhanCuaDong(l, nhanDs) {
	const m = /^- (\[đề xuất\] )?([^:]+?):\s?(.*)$/.exec(l);
	if (!m) return null;
	const lb = nhanDs.includes(m[2]) ? m[2] : BIET_DANH[m[2]];
	if (!lb) return null;
	const tienTo = Boolean(m[1]) || m[3].startsWith(DE_XUAT);
	return { nhan: lb, tienTo, dau: m[3].replace(DE_XUAT, "").trim() };
}

export function docRong(text, nhanDs) {
	const ra = new Map();
	const m = mucNguong(text);
	if (!m) return ra;
	for (let k = 0; k < m.muc.length; k += 1) {
		const o = nhanCuaDong(m.muc[k], nhanDs);
		if (!o) continue;
		const phan = o.dau ? [o.dau] : [];
		while (k + 1 < m.muc.length && /^\s+\S/.test(m.muc[k + 1])) {
			k += 1;
			phan.push(m.muc[k].trim().replace(/^- /, ""));
		}
		const gia = phan.join(" ").trim();
		if (gia && !/^…$/.test(gia)) ra.set(o.nhan, { gia, tienTo: o.tienTo });
	}
	return ra;
}
