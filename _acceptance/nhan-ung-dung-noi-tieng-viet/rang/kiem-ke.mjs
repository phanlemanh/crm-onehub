import { readFileSync } from "node:fs";
import { lat } from "./lat.mjs";

const BO_QUA_THUOC = new Set([
	"className", "class", "id", "key", "href", "src", "type", "name", "value",
	"data-slot", "data-icon", "variant", "size", "side", "align", "role",
	"htmlFor", "as", "to", "path", "method", "entity", "kind", "tone",
]);

const CHI_THI = new Set(["use client", "use server", "use strict"]);

const PHIM = new Set([
	"Enter", "Escape", "Tab", "Backspace", "Delete", "ArrowUp", "ArrowDown",
	"ArrowLeft", "ArrowRight", "Home", "End", "PageUp", "PageDown",
]);

const LOP_CSS =
	/(^|\s)(min-w-|max-w-|w-\[|h-\[|text-|bg-|border-|flex|grid|gap-|px-|py-|pt-|pb-|pl-|pr-|mt-|mb-|ml-|mr-|rounded-|truncate|font-|wrap-|whitespace-|tabular-|leading-|tracking-|opacity-|z-|top-|left-|right-|bottom-|shrink-|items-|justify-|absolute|relative|hidden|inline-|overflow-|hover:|focus:|sm:|md:|lg:)/

const CHU_NGUOI_DOC = (s) => {
	if (CHI_THI.has(s)) return false;
	if (PHIM.has(s)) return false;
	if (s.length < 2 || s.length > 200) return false;
	if (!/[A-Za-z]/.test(s)) return false;
	if (/^[a-z0-9_-]+$/.test(s)) return false;
	if (/^[A-Z0-9_]+$/.test(s)) return false;
	if (/^https?:\/\//.test(s)) return false;
	if (/^[\w.-]+\/[\w./-]+$/.test(s)) return false;
	if (/^@?[\w-]+\/[\w-]+$/.test(s)) return false;
	if (/^\.?\/?[\w-]+\.[a-z]{2,4}$/.test(s)) return false;
	if (/^[a-z]+([A-Z][a-z]*)+$/.test(s)) return false;
	if (/^(noreferrer|noopener|nofollow)(\s+(noreferrer|noopener|nofollow))*$/.test(s)) return false;
	if (LOP_CSS.test(s)) return false;
	return /\s/.test(s) || /^[A-Z]/.test(s);
};

function moduleDich(file) {
	if (/\/\[slug\]\/contacts\//.test(file)) return "contacts";
	if (/\/\[slug\]\/deals\//.test(file)) return "deals";
	if (/\/\[slug\]\/companies\//.test(file)) return "companies";
	if (/\/record-sheet\//.test(file)) return "record-sheet";
	return "crm";
}

const theo = new Map();
for (const file of lat().tham) {
	if (/\/lib\/messages\//.test(file)) continue;
	const src = readFileSync(file, "utf8");
	const mod = moduleDich(file);
	src.split("\n").forEach((line, i) => {
		if (/^\s*(import|export)\s/.test(line)) return;
		if (/^\s*\/\//.test(line)) return;
		const thuoc = line.match(/(\w[\w-]*)=\{?["'`]/);
		if (thuoc && BO_QUA_THUOC.has(thuoc[1])) return;
		for (const m of line.matchAll(/(["'`])((?:\\.|(?!\1)[^\\])*)\1/g)) {
			const s = m[2];
			if (!CHU_NGUOI_DOC(s)) continue;
			if (!theo.has(mod)) theo.set(mod, new Map());
			const bang = theo.get(mod);
			if (!bang.has(s)) bang.set(s, []);
			bang.get(s).push(`${file}:${i + 1}`);
		}
	});
}

let tong = 0;
for (const [mod, bang] of [...theo].sort()) {
	console.log(`\n## ${mod} — ${bang.size} chuỗi khác nhau`);
	for (const [s, o] of [...bang].sort((a, b) => b[1].length - a[1].length)) {
		tong += o.length;
		console.log(`| ${JSON.stringify(s)} | ${o.length} chỗ | ${o[0]} |`);
	}
}
console.log(`\n-- tong: ${tong} lan xuat hien`);
