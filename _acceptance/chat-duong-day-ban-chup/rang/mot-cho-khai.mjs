import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const i = process.argv.indexOf("--root");
const GOC =
	i > 0
		? resolve(process.argv[i + 1])
		: resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const CHUOI = "/lo-trinh/ban-chup";
const NOI_KHAI = "packages/validation/src/ban-chup-lo-trinh.ts";
const CAU_REST = "apps/api/src/create-app.ts";
const BO_THU_MUC = new Set([
	"node_modules",
	"generated",
	"test",
	"tests",
	"__tests__",
	"dist",
]);
const DUOI = /\.(ts|tsx|js|mjs|cjs)$/;
const BO_TEP = /\.(spec|test|dom)\.[^.]+$/;

function* duyet(d) {
	for (const ten of readdirSync(d)) {
		if (BO_THU_MUC.has(ten) || ten.startsWith(".")) continue;
		const p = join(d, ten);
		if (statSync(p).isDirectory()) yield* duyet(p);
		else if (DUOI.test(ten) && !BO_TEP.test(ten)) yield p;
	}
}

const viPham = [];
for (const goc of ["apps", "packages", "scripts"])
	for (const p of duyet(join(GOC, goc))) {
		const rel = relative(GOC, p);
		if (rel === NOI_KHAI) continue;
		readFileSync(p, "utf8")
			.split("\n")
			.forEach((dong, n) => {
				if (dong.includes(CHUOI))
					viPham.push(`${rel}:${n + 1}: ${dong.trim()}`);
			});
	}
readFileSync(join(GOC, CAU_REST), "utf8")
	.split("\n")
	.forEach((dong, n) => {
		if (/maxBodySize:\s*[\d(]/.test(dong))
			viPham.push(`${CAU_REST}:${n + 1}: maxBodySize la so — ${dong.trim()}`);
	});
for (const v of viPham) console.log(v);
console.log(`KET LUAN mot-cho-khai: ${viPham.length} vi pham`);
process.exit(viPham.length === 0 ? 0 : 1);
