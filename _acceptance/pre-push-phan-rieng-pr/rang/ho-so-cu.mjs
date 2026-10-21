import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const HOOK = ".githooks/pre-push";
const HINH = ".githooks/gate-shape.json";
const PHAN_LOAI = "scripts/pre-push-t1.mjs";
const DOT_BIEN_CU = "_acceptance/pre-push-t1/rang/dot-bien.mjs";
const NEO_THEM = ["const SHA_RONG"];
const CA6 = 'ten: "6 remote co san, gop onehub mang ma"';
const KY_VONG_CA6 = 'loi: dongRong(1, "test, build")';
const LENH = [
	[
		"packages/ui",
		"bun",
		["test", "--timeout", "120000", "./test/pre-push-t1.spec.ts"],
	],
	[
		"packages/ui",
		"bun",
		["test", "--timeout", "120000", "./test/t1-ma-doc.spec.ts"],
	],
	[
		"packages/ui",
		"bun",
		["test", "--timeout", "120000", "./test/push-ghim-lai-t1.spec.ts"],
	],
	[".", "node", ["_acceptance/pre-push-t1/rang/mot-nguon.mjs"]],
	[".", "node", ["_acceptance/pre-push-t1/rang/rang-cu.mjs"]],
	[".", "node", [DOT_BIEN_CU]],
];

const doc = (t) => readFileSync(join(GOC, t), "utf8");

function gitShow(sha, duong) {
	const r = spawnSync("git", ["show", `${sha}:${duong}`], {
		cwd: GOC,
		encoding: "utf8",
		maxBuffer: 1 << 26,
	});
	if (r.status !== 0) throw new Error(`khong doc duoc ${duong} o ${sha}`);
	return r.stdout;
}

function gocVong() {
	const r = spawnSync(
		"git",
		["merge-base", "HEAD", "refs/remotes/origin/onehub"],
		{ cwd: GOC, encoding: "utf8" },
	);
	if (r.status !== 0) {
		console.log("khong co goc vong: thieu refs/remotes/origin/onehub");
		process.exit(2);
	}
	return r.stdout.trim();
}

function neoDotBien(chuDotBien) {
	const ds = [];
	const re =
		/tep: "scripts\/pre-push-t1\.mjs",\s*\n\s*tu: ("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'),/g;
	for (const m of chuDotBien.matchAll(re)) {
		const nguyen = m[1];
		ds.push(
			nguyen.startsWith('"')
				? JSON.parse(nguyen)
				: nguyen.slice(1, -1).replace(/\\'/g, "'"),
		);
	}
	return ds;
}

function ghimHook(chuHook, goc) {
	return chuHook === goc ? [] : ["(1) hook khac goc vong"];
}

function ghimNeo(chuPhanLoai, neo) {
	return [...neo, ...NEO_THEM]
		.map((n) => [n, chuPhanLoai.split(n).length - 1])
		.filter(([, so]) => so !== 1)
		.map(([n, so]) => `(2) neo «${n}» xuat hien ${so} lan`);
}

function ghimLoiHua() {
	const loi = [];
	const spec = doc("packages/ui/test/pre-push-t1.spec.ts");
	const i = spec.indexOf(CA6);
	const khoi = i < 0 ? "" : spec.slice(i, spec.indexOf("\t{\n\t\tten:", i));
	if (!khoi.includes(KY_VONG_CA6) || !khoi.includes("ra: BO"))
		loi.push("(3) ca 6 cua spec khong mang loi hua moi");
	const dong6 = doc("_acceptance/pre-push-t1/evals.yaml")
		.split("\n")
		.find((d) => d.trimStart().startsWith("6 remote co san"));
	if (!dong6 || dong6.trimEnd().endsWith("-> rong"))
		loi.push("(3) dong 6 expected E1 cu van ghi -> rong");
	const sau =
		doc("_acceptance/pre-push-t1/evals.yaml").split(dong6 ?? "\u0000")[1] ?? "";
	if (
		!sau.split("\n").slice(0, 2).join("\n").includes("pre-push-phan-rieng-pr")
	)
		loi.push("(3) dong 6 khong nhac pre-push-phan-rieng-pr");
	const notes =
		doc("_acceptance/pre-push-t1/contract.md").split("## Notes")[1] ?? "";
	if (!notes.includes("pre-push-phan-rieng-pr") || !notes.includes("Ca 6"))
		loi.push("(3) Notes cua hop dong cu khong ghi ca 6 doi");
	return loi;
}

function ghimHinh(chuHinh, chuGoc) {
	const a = JSON.parse(chuHinh);
	const b = JSON.parse(chuGoc);
	delete a.t1Only?.vi_sao;
	delete b.t1Only?.vi_sao;
	return isDeepStrictEqual(a, b)
		? []
		: ["(4) gate-shape.json doi ngoai t1Only.vi_sao"];
}

const goc = gocVong();
const neo = neoDotBien(doc(DOT_BIEN_CU));
if (neo.length < 5) {
	console.log(`thuoc hong: chi rut duoc ${neo.length} neo tu ${DOT_BIEN_CU}`);
	process.exit(1);
}
const hookGoc = gitShow(goc, HOOK);
const hinhGoc = gitShow(goc, HINH);
const loi = [
	...ghimHook(doc(HOOK), hookGoc),
	...ghimNeo(doc(PHAN_LOAI), neo),
	...ghimLoiHua(),
	...ghimHinh(doc(HINH), hinhGoc),
];

const chieuDo = [
	["(1)", ghimHook(`${doc(HOOK)}#`, hookGoc)],
	[
		"(2)",
		ghimNeo(
			doc(PHAN_LOAI).replace(
				'"--no-renames", ',
				'"--no-renames", "--no-renames", ',
			),
			neo,
		),
	],
	[
		"(4)",
		ghimHinh(
			doc(HINH).replace('"skip": ["test", "build"]', '"skip": ["test"]'),
			hinhGoc,
		),
	],
];
for (const [ghim, ra] of chieuDo) {
	if (ra.length === 0)
		loi.push(`thuoc hong: ghim ${ghim} khong do tren ban sao pha`);
	else console.log(`BAT ${ghim}: ${ra[0]}`);
}

if (loi.length === 0)
	for (const g of ["(1) hook", "(2) neo", "(3) loi hua", "(4) hinh"])
		console.log(`dat ${g}`);

for (const [cwd, lenh, args] of LENH) {
	const r = spawnSync(lenh, args, {
		cwd: join(GOC, cwd),
		encoding: "utf8",
		maxBuffer: 1 << 28,
	});
	const ten = `${lenh} ${args.at(-1)}`;
	if (r.status !== 0) {
		loi.push(`lenh do: ${ten} ma ${r.status}`);
		console.log(
			`${r.stdout}${r.stderr}`
				.split("\n")
				.filter((d) => /^\(fail\)|thuoc hong|DO |VIOLATION|^error/.test(d))
				.slice(0, 20)
				.join("\n"),
		);
	} else console.log(`dat ${ten}`);
}

if (loi.length) {
	for (const l of loi) console.log(l);
	process.exit(1);
}
console.log("dat ho-so-cu");
