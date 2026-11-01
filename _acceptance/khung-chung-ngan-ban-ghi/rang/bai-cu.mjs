import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const APP = join(GOC, "apps", "app");
const NHOM = {
	kr: [
		"ngan-kr-mot-cho",
		"okr-canh-kr",
		"cap-nhat-trong-ngan-kr",
		"hop-tuan-tren-bang",
		"ve-khung-muc-tieu-dung-kr",
		"moi-kr-ca-cong-ty",
		"cap-nhat-gan-day",
		"hop-cap-nhat-lan-truoc",
		"lich-su-moi-lan-cap-nhat",
		"okr-sheet",
	],
	"so-kr": ["so-kr"],
	"loi-khung": [
		"khung-loi-ban-ghi-dung-ly-do",
		"khung-loi-ban-ghi-khong-con",
		"kara-ban-ghi",
		"thong-bao-mat-dich",
		"da-luu-tru-tai-loi",
		"ngan-ban-ghi-giu",
		"ngan-ban-ghi-nap-san",
	],
};
const chon = process.argv[2];
const ds = chon ? NHOM[chon] : Object.values(NHOM).flat();
if (!ds) {
	console.log(`TRUOT nhom la «${chon}»`);
	process.exit(2);
}
const ENV = { ...process.env, TZ: "Asia/Ho_Chi_Minh" };
const TRAN_PASS = 189;
let ok = true;
let tong = 0;
const goc = spawnSync("git", ["merge-base", "HEAD", "origin/onehub"], { cwd: GOC, encoding: "utf8" }).stdout.trim();
const dsTep = ds.map((ten) => `apps/app/test/${ten}.dom.tsx`);
const khac = spawnSync("git", ["diff", "--name-only", goc, "--", ...dsTep], { cwd: GOC, encoding: "utf8" });
const doi = khac.stdout.trim();
if (!goc || khac.status !== 0 || doi) {
	console.log(`TRUOT khong-sua-bai-da-ky — ${goc ? doi || "git diff loi" : "khong tim thay merge-base"}`);
	ok = false;
} else console.log(`DAT khong-sua-bai-da-ky — ${dsTep.length} tep khong doi so voi ${goc.slice(0, 9)}`);
for (const ten of ds) {
	const tep = `./test/${ten}.dom.tsx`;
	if (!existsSync(join(APP, tep))) {
		console.log(`TRUOT ${ten} — khong co tep`);
		ok = false;
		continue;
	}
	const r = spawnSync("bun", ["test", "--timeout", "30000", "--preload", "../../packages/ui/test/setup-dom.ts", tep], { cwd: APP, encoding: "utf8", env: ENV });
	const ra = `${r.stdout}${r.stderr}`;
	const pass = /\b(\d+) pass\b/.exec(ra)?.[1] ?? "0";
	const dat = r.status === 0 && /\b0 fail\b/.test(ra) && Number(pass) > 0;
	tong += Number(pass);
	console.log(`${dat ? "DAT" : "TRUOT"} ${ten} — ${pass} pass`);
	if (!dat) {
		console.log(ra.split("\n").filter((d) => d.includes("(fail)") || d.startsWith("error:")).slice(0, 10).join("\n"));
		ok = false;
	}
}
if (!chon) {
	const du = tong >= TRAN_PASS;
	console.log(`${du ? "DAT" : "TRUOT"} tong-pass — ${tong} (can >= ${TRAN_PASS})`);
	ok = ok && du;
}
if (!ok) process.exit(1);
console.log("DAT tat ca");
