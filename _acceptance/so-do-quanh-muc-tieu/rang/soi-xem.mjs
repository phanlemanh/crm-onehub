import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SOI = join(GOC, "_acceptance/gioi-han-duyet-cay-okr/rang/soi-ma.mjs");
const THU_TUC = "quanhMucTieu";

const r = spawnSync("bun", [SOI, "--ca", "xem"], {
	cwd: GOC,
	encoding: "utf8",
	maxBuffer: 64 << 20,
});
const ra = `${r.stdout}${r.stderr}`;
const quet = Number(ra.match(/^\s*okrObjective: (\d+)$/m)?.[1] ?? 0);
if (!(quet > 0)) {
	console.error(
		`doi chung duong: soi-ma --ca xem khong quet loi goi okrObjective nao (ma ${r.status})`,
	);
	process.exit(2);
}
const hong = ra.split("\n").filter((d) => d.startsWith("HONG"));
const cuaVong = hong.filter((d) => d.includes(` ${THU_TUC} `));
console.log(
	`soi-ma --ca xem: quet ${quet} loi goi okrObjective · ${hong.length} dong HONG toan kho · ${cuaVong.length} dong cua ${THU_TUC}`,
);
for (const d of cuaVong) console.error(d);
if (cuaVong.length > 0) {
	console.error(`${THU_TUC} thieu dieu kien xem`);
	process.exit(1);
}
console.log(`DUNG ${THU_TUC} doc okrObjective qua dieu kien xem`);
