import { execFileSync, spawnSync } from "node:child_process";
import { join } from "node:path";
import { CONG_CU_SHA, GOC, git, kitGit, mergeBase, thuMucTam } from "./kit.mjs";

const kho = kitGit();
try {
	git(kho, "cat-file", "-e", `${CONG_CU_SHA}^{commit}`);
} catch {
	git(kho, "fetch", "-q", "origin", "chuyen-nha");
}
const tam = thuMucTam("cong-cu");
const tar = execFileSync("git", ["-C", kho, "archive", CONG_CU_SHA, "migration/chuyen-kho", "migration/chay-thu-phien/bang-ten.json"], {
	maxBuffer: 64 * 1024 * 1024,
});
execFileSync("tar", ["-x", "-C", tam], { input: tar });
const congCu = join(tam, "migration", "chuyen-kho", "chuyen-kho.mjs");

const loi = [];
const chay = (...a) => spawnSync("node", [congCu, "--kho", GOC, ...a], { encoding: "utf8" });
const cay = chay();
process.stdout.write(cay.stdout);
const dong = cay.stdout.split("\n");
if (!dong.some((d) => d.startsWith("KẾT: "))) loi.push(`công cụ không in dòng KẾT (mã ${cay.status}, stderr: ${cay.stderr.trim().slice(0, 200)})`);
for (const k of ["K1", "K2", "K3", "K4", "K5"]) {
	if (!dong.some((d) => d.startsWith(`${k}: ĐẠT`))) loi.push(`${k} chưa ĐẠT trên cây`);
}
if (!dong.includes("KẾT: ĐẠT") || cay.status !== 0) loi.push(`cây: KẾT không ĐẠT (mã ${cay.status})`);

const mb = mergeBase();
const nen = chay("--ref", mb);
const dongNen = nen.stdout.split("\n");
const chuaNen = ["K1", "K2", "K3", "K4", "K5"].filter((k) => dongNen.some((d) => d.startsWith(`${k}: CHƯA`)));
if (nen.status !== 1 || chuaNen.length !== 5) loi.push(`đối chứng merge-base phải CHƯA đủ K1–K5 (mã ${nen.status}, CHƯA ${chuaNen.join(",")})`);
else console.log(`chuyen-kho: đối chứng — merge-base ${mb.slice(0, 8)} CHƯA ${chuaNen.join(", ")} (mã 1)`);

if (loi.length) {
	for (const l of loi) console.log(`DO chuyen-kho: ${l}`);
	process.exit(1);
}
console.log(`chuyen-kho: công cụ ${CONG_CU_SHA.slice(0, 8)} — cây làm việc K1–K5 ĐẠT, KẾT: ĐẠT`);
