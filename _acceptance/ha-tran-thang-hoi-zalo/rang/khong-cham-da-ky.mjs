import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "../../..");
const NHANH_CHINH = "origin/onehub";
const HO_SO = "ha-tran-thang-hoi-zalo";
const DA_KY = ["_acceptance/hoi-crm-qua-zalo/", "apps/agent/test/hoi-crm-qua-zalo.integration.spec.ts"];

function chay(lenh, doiSo) {
	return spawnSync(lenh, doiSo, { cwd: GOC, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

function dongGit(doiSo) {
	const ra = chay("git", doiSo);
	if (ra.status !== 0) {
		console.log(`hong: git ${doiSo.join(" ")} thoat ${ra.status}`);
		process.exit(1);
	}
	return ra.stdout.split("\n").filter(Boolean);
}

const doi = [
	...dongGit(["diff", "--name-only", NHANH_CHINH]),
	...dongGit(["ls-files", "--others", "--exclude-standard"]),
];
const cham = doi.filter((duong) => DA_KY.some((g) => duong.startsWith(g)));
if (cham.length) {
	console.log(`hong: cham ho so da ky ${cham.join(", ")}`);
	process.exit(1);
}
console.log("ok: khong cham ho so da ky");

const truocGop = chay("bash", ["scripts/pre-merge-check.sh", ".", "--base", NHANH_CHINH]);
if (truocGop.status === null) {
	console.log("hong: pre-merge-check khong chay duoc");
	process.exit(1);
}
const viPham = `${truocGop.stdout}\n${truocGop.stderr}`
	.split("\n")
	.filter((d) => d.includes("VIOLATION") && !d.includes(`[${HO_SO}]`));
if (viPham.length) {
	for (const d of viPham) console.log(d);
	console.log(`hong: truoc-gop vi pham ${viPham.length} dong cua ho so khac`);
	process.exit(1);
}
console.log("ok: truoc-gop khong vi pham ho so khac");
