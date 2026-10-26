import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const PHAN_LOAI = join(GOC, "scripts", "pre-push-t1.mjs");
const HOOK = join(GOC, ".githooks", "pre-push");
const NGUON_CI = "../.github/scripts/phan-loai.mjs";
const TEN_CAN = ["docGlobT1", "quyetDinh", "tepT1"];
const DONG_VONG = "for task in check-types lint lint:slop test build; do";
const { configList } = createRequire(import.meta.url)(join(GOC, "lib", "workspace-record.cjs"));
const GLOBS = configList(readFileSync(join(GOC, "_acceptance", "config.yaml"), "utf8"), "t1_skip_globs");

function docImport(chu) {
	const ra = [];
	for (const m of chu.matchAll(/^import\s*\{([^}]*)\}\s*from\s*["']([^"']+)["'];?\s*$/gm)) {
		ra.push({ ten: m[2], ds: m[1].split(",").map((x) => x.trim()).filter(Boolean) });
	}
	return ra;
}

function chuoiKyTu(chu) {
	const ra = [];
	for (const m of chu.matchAll(/"((?:[^"\\\n]|\\.)*)"|'((?:[^'\\\n]|\\.)*)'|`((?:[^`\\]|\\.)*)`/g)) {
		ra.push(m[1] ?? m[2] ?? m[3]);
	}
	return ra;
}

export function kiem(phanLoai, hook) {
	const loi = [];
	const tuCi = docImport(phanLoai).find((x) => x.ten === NGUON_CI);
	const thieu = TEN_CAN.filter((t) => !tuCi?.ds.includes(t));
	if (thieu.length) loi.push(`bo phan loai khong import ${thieu.join(", ")} tu ${NGUON_CI}`);
	const chuoi = chuoiKyTu(phanLoai);
	for (const g of GLOBS) {
		if (chuoi.some((c) => c.includes(g))) loi.push(`glob-lan-hai: bo phan loai chua glob ${g}`);
		if (hook.includes(g)) loi.push(`glob-lan-hai: hook chua glob ${g}`);
	}
	if (chuoi.some((c) => c === "test" || c === "build")) loi.push("bo-qua-viet-tay: bo phan loai chua chu test/build");
	const dongHook = hook.split("\n").filter((d) => d !== DONG_VONG);
	if (dongHook.some((d) => /\b(test|build)\b/.test(d))) loi.push("bo-qua-viet-tay: hook chua chu test/build ngoai dong vong");
	return loi;
}

const PHAN_LOAI_CHU = readFileSync(PHAN_LOAI, "utf8");
const HOOK_CHU = readFileSync(HOOK, "utf8");
let ma = 0;

const that = kiem(PHAN_LOAI_CHU, HOOK_CHU);
if (that.length) {
	for (const l of that) console.log(`DO ${l}`);
	ma = 1;
} else console.log("dat mot-nguon");

if (GLOBS.length === 0 || !HOOK_CHU.includes(DONG_VONG)) {
	console.log("thuoc hong: khong doc duoc glob T1 hay dong vong cua hook");
	process.exit(2);
}

const DOT = [
	["glob-lan-hai", PHAN_LOAI_CHU.replace("const SHA_RONG", 'const G = ["docs/**"];\nconst SHA_RONG'), HOOK_CHU],
	["bo-qua-viet-tay", PHAN_LOAI_CHU.replace("const SHA_RONG", 'const B = ["test"];\nconst SHA_RONG'), HOOK_CHU],
];
for (const [ca, pl, hk] of DOT) {
	if (pl === PHAN_LOAI_CHU) {
		console.log(`thuoc hong: ${ca} khong cay duoc`);
		ma = 1;
		continue;
	}
	const bat = kiem(pl, hk).some((l) => l.startsWith(ca));
	console.log(bat ? `BAT ${ca}` : `thuoc hong: ${ca}`);
	if (!bat) ma = 1;
}
process.exit(ma);
