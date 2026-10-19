import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const SLUG = "gieo-nguoi-chiu-song-song";
const DUOC = [
	"apps/api/test/dieu-phoi-gieo.ts",
	"apps/api/test/gieo-nguoi-song-song.spec.ts",
	"_acceptance/config.yaml",
	"PRODUCT-MAP.md",
	"LO-TRINH.html",
	`docs/superpowers/specs/2026-10-14-${SLUG}-design.md`,
	`docs/superpowers/plans/2026-10-14-${SLUG}.md`,
];
const TIEN_TO_DUOC = ["_acceptance/"];

function git(args) {
	const r = spawnSync("git", args, { cwd: GOC, encoding: "utf8" });
	if (r.status !== 0) {
		console.log(`KHONG DO DUOC: git ${args.join(" ")}: ${r.stderr.trim()}`);
		process.exit(2);
	}
	return r.stdout.trim();
}

function ngoaiPhamVi(tep) {
	return tep.filter(
		(t) => !DUOC.includes(t) && !TIEN_TO_DUOC.some((p) => t.startsWith(p)),
	);
}

const mau = ngoaiPhamVi([
	"apps/api/test/dieu-phoi-gieo.ts",
	"apps/api/test/dieu-phoi-va.spec.ts",
]);
if (mau.length !== 1 || mau[0] !== "apps/api/test/dieu-phoi-va.spec.ts") {
	console.log(`thuoc hong: mau cho cho goi phai bi bat, nhan ${JSON.stringify(mau)}`);
	process.exit(1);
}
console.log("mau cho goi: bi bat apps/api/test/dieu-phoi-va.spec.ts");

const nen = git(["merge-base", "origin/onehub", "HEAD"]);
const tep = git(["diff", "--name-only", nen, "HEAD"]).split("\n").filter(Boolean);
const lech = ngoaiPhamVi(tep);
if (lech.length > 0) {
	console.log(`pham-vi: tep ngoai pham vi: ${lech.join(", ")}`);
	process.exit(1);
}
console.log(`pham-vi: ${tep.length} tep, 0 ngoai pham vi`);
