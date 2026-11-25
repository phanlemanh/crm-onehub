import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { GOC, SLUG, capVong, git } from "./kit.mjs";
import { xetLuoiPr } from "./luat.mjs";

const mb = capVong().nen;
const dau = git(GOC, "rev-parse", "HEAD").trim();
const r = spawnSync("bash", [join(GOC, "scripts", "pre-merge-check.sh"), ".", "--base", mb], {
	cwd: GOC,
	encoding: "utf8",
	maxBuffer: 256 * 1024 * 1024,
});
const van = `${r.stdout ?? ""}${r.stderr ?? ""}`;
const nhat = join(GOC, ".acceptance-runs", SLUG);
mkdirSync(nhat, { recursive: true });
writeFileSync(join(nhat, "luoi-pr.log"), van);
const kq = xetLuoiPr(van);
for (const l of kq.loi) console.log(`DO luoi-pr: ${l}`);
console.log(`luoi-pr: HEAD ${dau.slice(0, 8)} base ${mb.slice(0, 8)} — mã ${r.status}, VIOLATION khác vòng ${kq.loi.length}, của vòng ${kq.cuaVong}`);
process.exit(kq.loi.length ? 1 : 0);
