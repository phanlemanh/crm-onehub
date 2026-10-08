import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const TEP = "_acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts";
const MONG = { dungTrang: 0.8, tuChoiDung: 0.8, chuyenQuyDinh: 0.9, chuyenNhamToiDa: 0.1, traLoiKhongQuaKiem: 0 };
const DUOC_PHEP = /^_acceptance\//;
const MAY_VE = new Set(["PRODUCT-MAP.md", "LO-TRINH.html"]);

function git(args) {
	const r = spawnSync("git", args, { cwd: GOC, encoding: "utf8" });
	if (r.status !== 0) {
		console.error(`git ${args.join(" ")}: ${r.stderr.trim()}`);
		process.exit(2);
	}
	return r.stdout;
}

function docNguong(src) {
	const khoi = src.match(/const NGUONG = \{([^}]*)\}/)?.[1];
	if (!khoi) return null;
	return Object.fromEntries(
		[...khoi.matchAll(/(\w+):\s*([0-9.]+)/g)].map((m) => [m[1], Number(m[2])]),
	);
}

function soNguong(a, b) {
	return Object.keys(b)
		.filter((k) => a?.[k] !== b[k])
		.map((k) => `${k} ${b[k]} -> ${a?.[k]}`);
}

function ngoaiPhamVi(ds) {
	return ds.filter((t) => !DUOC_PHEP.test(t) && !MAY_VE.has(t));
}

const doiChung = soNguong({ ...MONG, dungTrang: 0.75 }, MONG);
if (doiChung.length === 0) {
	console.error("doi chung am khong do: so nguong khong bat duoc 0.8 -> 0.75");
	process.exit(2);
}
console.log(`doi chung am: nguong doi: ${doiChung.join(", ")}`);
if (ngoaiPhamVi(["PRODUCT-MAP.md"]).length !== 0) {
	console.error("doi chung duong khong xanh: PRODUCT-MAP.md bi coi la ngoai pham vi");
	process.exit(2);
}
const doiChungAm = ngoaiPhamVi(["apps/agent/agent/agent.ts"]);
if (doiChungAm.length !== 1) {
	console.error("doi chung am khong do: apps/agent/agent/agent.ts khong bi bat");
	process.exit(2);
}
console.log(`doi chung am: ngoai pham vi: ${doiChungAm[0]}`);

const base = git(["merge-base", "HEAD", "origin/onehub"]).trim();
const truoc = docNguong(git(["show", `${base}:${TEP}`]));
const sau = docNguong(git(["show", `HEAD:${TEP}`]));
const lech = [...soNguong(truoc, MONG), ...soNguong(sau, MONG)];
let loi = 0;
if (lech.length > 0) {
	console.error(`nguong doi: ${lech.join(", ")}`);
	loi = 1;
} else console.log("NGUONG giu nguyen");
const ds = git(["diff", "--name-only", base, "HEAD"]).split("\n").filter(Boolean);
const ngoai = ngoaiPhamVi(ds);
if (ngoai.length > 0) {
	console.error(`ngoai pham vi: ${ngoai.join(", ")}`);
	loi = 1;
} else console.log(`PHAM VI: ${ds.length} tep, 0 ngoai pham vi`);
process.exit(loi);
