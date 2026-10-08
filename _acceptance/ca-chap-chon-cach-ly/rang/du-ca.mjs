import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const SPEC = ["apps/api/test/tai-lieu-khong-ro.spec.ts", "apps/api/test/tai-lieu-thay-trang.spec.ts"];
const TRAN_MS = 600_000;

function git(args) {
	const r = spawnSync("git", args, { cwd: GOC, encoding: "utf8" });
	if (r.status !== 0) {
		console.error(`git ${args.join(" ")}: ${r.stderr.trim()}`);
		process.exit(2);
	}
	return r.stdout;
}

const base = git(["merge-base", "HEAD", "origin/onehub"]).trim();
const caGoc = SPEC.reduce((n, s) => n + (git(["show", `${base}:${s}`]).match(/^\s*test\(/gm) ?? []).length, 0);
if (caGoc === 0) {
	console.error(`khong dem duoc ca nao o merge-base ${base}`);
	process.exit(2);
}
const lenh = `cd apps/api && bun test ${SPEC.map((s) => s.replace("apps/api/", "")).join(" ")}`;
const r = spawnSync("bun", ["run", "test", "--", lenh], {
	cwd: GOC,
	encoding: "utf8",
	timeout: TRAN_MS,
	maxBuffer: 64 * 1024 * 1024,
});
const log = `${r.stdout}\n${r.stderr}`;
const pass = Number(log.match(/^\s*(\d+) pass\b/m)?.[1] ?? -1);
const fail = Number(log.match(/^\s*(\d+) fail\b/m)?.[1] ?? -1);
console.log(`CA MERGE-BASE: ${caGoc} · PASS: ${pass} · FAIL: ${fail}`);
if (r.status !== 0 || fail !== 0) {
	console.error(`spec do (ma ${r.status}, fail ${fail})\n${log.slice(-2000)}`);
	process.exit(1);
}
if (pass < caGoc) {
	console.error(`it ca hon merge-base: ${pass} < ${caGoc}`);
	process.exit(1);
}
