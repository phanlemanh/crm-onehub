import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "../../..");

const TEP = [
	"apps/api/test/okr-toan-canh-thuan.spec.ts",
	"apps/api/test/okr-toan-canh.spec.ts",
	"apps/api/test/okr-toan-canh-hieu-nang.spec.ts",
	"apps/api/test/okr-mau.spec.ts",
	"apps/api/test/vai-chi-okr.spec.ts",
];

const git = (...args) =>
	execFileSync("git", args, { cwd: GOC, encoding: "utf8", maxBuffer: 1 << 26 });

const boImport = (ma) =>
	ma.replace(/^import\b[^;]*?\bfrom\s+["'][^"']+["'];?[ \t]*\n/gm, "");

export const chiThem = (cu, nay) => {
	const dongNay = boImport(nay).split("\n");
	let vi = 0;
	for (const dong of boImport(cu).split("\n")) {
		while (vi < dongNay.length && dongNay[vi] !== dong) vi += 1;
		if (vi === dongNay.length) return false;
		vi += 1;
	}
	return true;
};

const tuKiem = () => {
	const goc = `import { a } from "./a";\n\nit("x", () => {\n\texpect(1).toBe(1);\n});\n`;
	const ca = [
		[
			"chi them ca moi -> xanh",
			goc + `\nit("y", () => {\n\texpect(2).toBe(2);\n});\n`,
			true,
		],
		[
			"them dong giua ca cu -> xanh",
			goc.replace("\texpect", "\tconst z = 1;\n\texpect"),
			true,
		],
		["doi import -> xanh", goc.replace(`{ a }`, `{ a, b }`), true],
		["doi mot dong expect -> do", goc.replace("toBe(1)", "toBe(2)"), false],
		[
			"xoa mot dong expect -> do",
			goc.replace("\texpect(1).toBe(1);\n", ""),
			false,
		],
	];
	let loi = 0;
	for (const [ten, nay, mong] of ca) {
		const thuc = chiThem(goc, nay);
		const dau = thuc === mong ? "ok" : "SAI";
		if (thuc !== mong) loi += 1;
		console.log(`${dau}: ${ten}`);
	}
	if (loi > 0) process.exit(1);
};

if (process.argv.includes("--tu-kiem")) {
	tuKiem();
} else {
	const goc = git("merge-base", "HEAD", "origin/onehub").trim();
	let sua = 0;
	for (const tep of TEP) {
		const cu = git("show", `${goc}:${tep}`);
		const nay = readFileSync(join(GOC, tep), "utf8");
		if (!chiThem(cu, nay)) {
			console.log(`ky vong bi sua: ${tep}`);
			sua += 1;
		}
	}
	if (sua > 0) process.exit(1);
	console.log(
		`ky vong khong doi: ${TEP.length} tep chi them dong hoac doi import`,
	);
}
