import { spawnSync } from "node:child_process";
import { copyFileSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const RANG = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(RANG, "..", "..", "..");
const APP = join(GOC, "apps", "app");
const TEN = `bk1-${process.pid}-khung-ngan.dom.tsx`;
const DICH = join(APP, "test", TEN);
const ENV = Object.fromEntries(Object.entries(process.env).filter(([k]) => k !== "CLAUDECODE"));

copyFileSync(join(RANG, "khung-ngan.dom.tsx"), DICH);
let r;
try {
	r = spawnSync(
		"bun",
		["test", "--timeout", "30000", "--preload", "../../packages/ui/test/setup-dom.ts", `./test/${TEN}`],
		{ cwd: APP, encoding: "utf8", env: { ...ENV, TZ: "Asia/Ho_Chi_Minh" } },
	);
} finally {
	rmSync(DICH, { force: true });
}
const ra = `${r.stdout}${r.stderr}`;
console.log(ra.split("\n").filter((d) => /\((pass|fail)\)|^ \d+ (pass|fail)|error:/.test(d)).join("\n"));
const dat = r.status === 0 && /\b0 fail\b/.test(ra) && /bk1-proto ST-so-kr-du/.test(ra) && /bk1-doi-chung-am/.test(ra);
console.log(dat ? "DAT tat ca" : "TRUOT");
process.exit(dat ? 0 : 1);
