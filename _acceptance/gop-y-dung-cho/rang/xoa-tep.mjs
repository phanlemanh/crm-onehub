import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC_KHO = join(HERE, "..", "..", "..");
const TEP_DA_XOA = [
	"apps/app/app/(app)/[slug]/okr/cot-gop-y.tsx",
	"apps/app/app/(app)/[slug]/okr/the-gop-y.tsx",
];
const MIEN = ["apps/app/app/proto/_modules/**"];
const MAU = [
	{ ten: "cot-gop-y", chu: "cot-gop-y", khop: /(?<!data-)cot-gop-y/ },
	{ ten: 'the-gop-y"', chu: 'the-gop-y"', khop: /the-gop-y"/ },
	{ ten: "CotGopY", chu: "CotGopY", khop: /\bCotGopY\b/ },
	{ ten: "TheGopY", chu: "TheGopY", khop: /\bTheGopY\b/ },
	{ ten: "NutGopY", chu: "NutGopY", khop: /\bNutGopY\b/ },
	{ ten: "useGopY(", chu: "useGopY(", khop: /\buseGopY\(/ },
];

const iGoc = process.argv.indexOf("--goc");
const laSao = iGoc !== -1;
const goc = laSao ? resolve(process.argv[iGoc + 1] ?? ".") : GOC_KHO;

function tim(chu) {
	const kq = spawnSync(
		"git",
		[
			"grep",
			...(laSao ? ["--no-index"] : []),
			"-n",
			"-I",
			"-F",
			"-e",
			chu,
			"--",
			"apps",
			"packages",
			...MIEN.map((m) => `:!${m}`),
			":!**/node_modules/**",
		],
		{ cwd: goc, encoding: "utf8" },
	);
	if (kq.status === 1) return [];
	if (kq.status !== 0) throw new Error(`git grep loi: ${kq.stderr}`);
	return kq.stdout.split("\n").filter(Boolean);
}

const loi = [];
for (const tep of TEP_DA_XOA)
	if (existsSync(join(goc, tep))) loi.push(`con tep: ${tep}`);
let soDong = 0;
for (const m of MAU) {
	const dong = tim(m.chu).filter((d) => m.khop.test(d));
	soDong += dong.length;
	if (dong.length > 0)
		loi.push(`con dung: ${m.ten}`, ...dong.map((d) => `  ${d}`));
}
console.log(
	`xoa-tep: ${TEP_DA_XOA.length} tep da xoa, ${MAU.length} mau da tim, ${soDong} dong con dung (mien ${MIEN.join(", ")})`,
);
for (const l of loi) console.log(l);
process.exit(loi.length > 0 ? 1 : 0);
