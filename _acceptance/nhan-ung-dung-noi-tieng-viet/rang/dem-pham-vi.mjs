import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const ROOT = process.argv[2] ?? "apps/app";

const files = execFileSync("git", ["ls-files", ROOT], { encoding: "utf8" })
	.trim()
	.split("\n")
	.filter((f) => /\.(tsx|ts)$/.test(f))
	.filter((f) => !/\.(spec|test)\.(tsx|ts)$/.test(f))
	.filter((f) => !/\/(generated|__fixtures__)\//.test(f));

const BO_QUA_THUOC = new Set([
	"className", "class", "id", "key", "href", "src", "type", "name", "value",
	"data-slot", "data-icon", "variant", "size", "side", "align", "role",
	"htmlFor", "as", "to", "path", "method", "entity", "kind", "tone",
]);

const CHU_NGUOI_DOC = (s) => {
	if (s.length < 2 || s.length > 200) return false;
	if (!/[A-Za-z]/.test(s)) return false;
	if (/^[a-z0-9_-]+$/.test(s)) return false;
	if (/^[A-Z0-9_]+$/.test(s)) return false;
	if (/^https?:\/\//.test(s)) return false;
	if (/^[\w.-]+\/[\w./-]+$/.test(s)) return false;
	if (/^@?[\w-]+\/[\w-]+$/.test(s)) return false;
	if (/^\.?\/?[\w-]+\.[a-z]{2,4}$/.test(s)) return false;
	if (/^[a-z]+([A-Z][a-z]*)+$/.test(s)) return false;
	return /\s/.test(s) || /^[A-Z]/.test(s);
};

const theo = new Map();
let tong = 0;

for (const file of files) {
	const src = readFileSync(file, "utf8");
	const lines = src.split("\n");
	const hit = [];
	lines.forEach((line, i) => {
		if (/^\s*(import|export)\s/.test(line)) return;
		if (/^\s*\/\//.test(line)) return;
		const thuoc = line.match(/(\w[\w-]*)=\{?["'`]/);
		if (thuoc && BO_QUA_THUOC.has(thuoc[1])) return;
		for (const m of line.matchAll(/(["'`])((?:\\.|(?!\1)[^\\])*)\1/g)) {
			const s = m[2];
			if (!CHU_NGUOI_DOC(s)) continue;
			hit.push({ dong: i + 1, chuoi: s });
		}
	});
	if (hit.length) {
		theo.set(file, hit);
		tong += hit.length;
	}
}

const kieu = process.argv[3] ?? "tom-tat";
if (kieu === "day-du") {
	for (const [file, hit] of [...theo].sort((a, b) => b[1].length - a[1].length)) {
		console.log(`\n${file}  (${hit.length})`);
		for (const h of hit) console.log(`   ${String(h.dong).padStart(4)}  ${JSON.stringify(h.chuoi)}`);
	}
}
console.log(`
-- pham vi ${ROOT}
   file ma nguon quet:        ${files.length}
   file mang chu nguoi doc:   ${theo.size}
   chuoi tong:                ${tong}
-- 15 file dac nhat`);
for (const [file, hit] of [...theo].sort((a, b) => b[1].length - a[1].length).slice(0, 15)) {
	console.log(`   ${String(hit.length).padStart(4)}  ${file}`);
}
