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
