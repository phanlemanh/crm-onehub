import { readFileSync } from "node:fs";
import { lat } from "./lat.mjs";

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

const dem = {
	tong: 0,
	ghep_bien: 0,
	chi_trinh_doc: 0,
	trong_ts_khong_react: 0,
	file_may_chu: 0,
	file_trinh_duyet: 0,
};
const theoFile = new Map();
const mau = { ghep_bien: [], chi_trinh_doc: [], trong_ts_khong_react: [] };

for (const file of lat().tham) {
	const src = readFileSync(file, "utf8");
	const laClient = /^["']use client["']/m.test(src);
	const laTs = file.endsWith(".ts");
	const lines = src.split("\n");
	let n = 0;
	lines.forEach((line, i) => {
		if (/^\s*(import|export)\s/.test(line)) return;
		if (/^\s*\/\//.test(line)) return;
		const thuoc = line.match(/(\w[\w-]*)=\{?["'`]/);
		if (thuoc && BO_QUA_THUOC.has(thuoc[1])) return;
		for (const m of line.matchAll(/(["'`])((?:\\.|(?!\1)[^\\])*)\1/g)) {
			const s = m[2];
			if (!CHU_NGUOI_DOC(s)) continue;
			n += 1;
			dem.tong += 1;
			const ghep = m[1] === "`" && /\$\{/.test(line);
			const srLabel = /\b(aria-label|aria-description|aria-roledescription|title|alt|srLabel)\b/.test(line);
			if (ghep) { dem.ghep_bien += 1; if (mau.ghep_bien.length < 6) mau.ghep_bien.push(`${file}:${i + 1}  ${s}`); }
			if (srLabel) { dem.chi_trinh_doc += 1; if (mau.chi_trinh_doc.length < 6) mau.chi_trinh_doc.push(`${file}:${i + 1}  ${s}`); }
			if (laTs) { dem.trong_ts_khong_react += 1; if (mau.trong_ts_khong_react.length < 6) mau.trong_ts_khong_react.push(`${file}:${i + 1}  ${s}`); }
		}
	});
	if (n) {
		theoFile.set(file, n);
		if (laClient) dem.file_trinh_duyet += 1; else dem.file_may_chu += 1;
	}
}

console.log(`-- lat "ba luong cua nguong"
   file mang chu nguoi doc:      ${theoFile.size}
   chuoi tong:                   ${dem.tong}
   trong do ghep bien:           ${dem.ghep_bien}
   trong do chi trinh doc nghe:  ${dem.chi_trinh_doc}
   trong do nam trong file .ts:  ${dem.trong_ts_khong_react}  (khong dung duoc hook)
   file khai "use client":       ${dem.file_trinh_duyet}
   file KHONG khai (may chu ve): ${dem.file_may_chu}`);
for (const [k, v] of Object.entries(mau)) {
	if (!v.length) continue;
	console.log(`-- mau ${k}`);
	for (const x of v) console.log(`   ${x}`);
}
