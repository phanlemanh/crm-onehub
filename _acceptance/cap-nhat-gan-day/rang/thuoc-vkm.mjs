import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC_KHO = resolve(HERE, "..", "..", "..");
const LIB =
	process.env.CNG_THUOC_LIB ??
	join(GOC_KHO, "_acceptance/vo-khu-muc-tieu/rang/do-man-lib.mjs");
const TAB = join(GOC_KHO, "apps/app/app/(app)/[slug]/okr/tab-okr.ts");
const SO = join(GOC_KHO, "_acceptance/vo-khu-muc-tieu/decisions.jsonl");
const CAU_HINH = join(GOC_KHO, "_acceptance/config.yaml");

const { DO } = await import(LIB);
const { NHOM_THANH_BEN } = await import(TAB);
const soNhom = NHOM_THANH_BEN.reduce((n, g) => n + g.muc.length, 0);
const dong = readFileSync(SO, "utf8")
	.split("\n")
	.filter((l) => l.trim() !== "")
	.flatMap((l) => {
		try {
			return [JSON.parse(l)];
		} catch {
			return [];
		}
	})
	.filter(
		(d) =>
			d.type === "fix" &&
			String(d.decision).includes("cap-nhat-gan-day") &&
			`${d.decision} ${d.why}`.includes("D7"),
	);
const lech = [];
if (DO.soMuc !== soNhom) lech.push(`soMuc ${DO.soMuc} != NHOM ${soNhom}`);
if (dong.length === 0) lech.push("thieu dong so fix D7");
const lenh = readFileSync(CAU_HINH, "utf8")
	.split("\n")
	.find((l) => l.trimStart().startsWith("vkm_thanh_ben:"));
const cmd = lenh
	?.slice(lenh.indexOf(":") + 1)
	.trim()
	.replace(/^"|"$/g, "");
if (!cmd) lech.push("khong thay lenh vkm_thanh_ben");
else if (process.env.CNG_BO_VKM !== "1") {
	const r = spawnSync("bash", ["-c", cmd], { cwd: GOC_KHO, stdio: "ignore" });
	if (r.status !== 0) lech.push(`vkm_thanh_ben ma ${r.status}`);
}
if (lech.length > 0) {
	console.log(`SAI thuoc vkm: ${lech.join("; ")}`);
	process.exit(1);
}
console.log(
	`DUNG thuoc vkm: soMuc=${DO.soMuc}, NHOM=${soNhom}, dong so=${dong.length}`,
);
