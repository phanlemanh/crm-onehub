import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const GOC =
	process.env.GOC_KHO ??
	join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const CU = "apps/api/src/okr/tien-do.ts";
const MOI = "packages/db/src/okr-tien-do.ts";
const HAM = ["chonChuKyHienTai", "kyVongTheoNgay", "tienDoMucTieu"];
const NEN = process.env.NEO_NEN ?? "c1e37b730548a6faa9c2dbac1e0a652a32934753";
const DUONG_CU = [
	/from\s+["']\.\/tien-do["']/,
	/from\s+["'][^"']*okr\/tien-do["']/,
];
const QUET = [
	"apps/api/src",
	"apps/api/test",
	"apps/agent/agent",
	"apps/agent/test",
	"apps/app",
	"packages",
];
const BO_QUA = new Set(["node_modules", ".next", "dist", "generated"]);

const loi = [];
const git = (...d) =>
	execFileSync("git", ["-C", GOC, ...d], { encoding: "utf8" }).trim();

if (existsSync(join(GOC, CU))) loi.push(`tep cu con: ${CU}`);
if (!existsSync(join(GOC, MOI))) loi.push("tep moi chua co");

const goi = JSON.parse(
	readFileSync(join(GOC, "packages/db/package.json"), "utf8"),
);
if (goi.exports?.["./okr-tien-do"] !== "./src/okr-tien-do.ts")
	loi.push("thieu export ./okr-tien-do");
const goiV = JSON.parse(
	readFileSync(join(GOC, "packages/validation/package.json"), "utf8"),
);
if (goiV.exports?.["./okr-can-chinh"] !== "./src/okr-can-chinh.ts")
	loi.push("thieu export ./okr-can-chinh");

function duyet(thuMuc, ra) {
	if (!existsSync(thuMuc)) return;
	for (const ten of readdirSync(thuMuc)) {
		if (BO_QUA.has(ten)) continue;
		const d = join(thuMuc, ten);
		if (statSync(d).isDirectory()) duyet(d, ra);
		else if (/\.(ts|tsx|mjs|js)$/.test(ten)) ra.push(d);
	}
}
const tep = [];
for (const q of QUET) duyet(join(GOC, q), tep);
for (const t of tep) {
	const noiDung = readFileSync(t, "utf8");
	if (DUONG_CU.some((m) => m.test(noiDung)))
		loi.push(`con nhap duong cu: ${relative(GOC, t)}`);
}

const than = (nguon, ten) => {
	const m = nguon.match(new RegExp(`export function ${ten}[\\s\\S]*?\\n}\\n`));
	return m ? m[0].replace(/\s+/g, "") : null;
};
if (existsSync(join(GOC, MOI))) {
	const nen = NEN;
	try {
		git("cat-file", "-e", `${nen}^{commit}`);
	} catch {
		console.error(`KHONG DO DUOC: sha neo ${nen} khong co trong kho`);
		process.exit(2);
	}
	const cu = `${git("show", `${nen}:${CU}`)}\n`;
	const moi = readFileSync(join(GOC, MOI), "utf8");
	for (const h of HAM) {
		const a = than(cu, h);
		const b = than(moi, h);
		if (!a || !b || a !== b) loi.push(`than ham doi: ${h}`);
	}
}

if (loi.length) {
	for (const l of loi) console.error(l);
	process.exit(1);
}
console.log(
	`tien-do da doi: ${HAM.length} ham giu nguyen than, ${tep.length} tep khong nhap duong cu`,
);
