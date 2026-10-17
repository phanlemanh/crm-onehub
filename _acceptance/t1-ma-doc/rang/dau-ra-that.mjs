import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const TEP_CHEP = ["docs/design.md", "packages/ui/test/status-tone.spec.ts", "packages/ui/src/lib/status-tone.ts"];
const DONG_LANH = "| hỏng, trễ, bị chặn | `error` |";
const DONG_LECH = "| hỏng, trễ, bị chặn | `warning` |";
const THONG_DIEP = "bang mau lech docs/design.md";
const EP_CHAY = "export TURBO_FORCE=true";

const loi = [];
const turbo = JSON.parse(readFileSync(join(GOC, "turbo.json"), "utf8"));
if (turbo.tasks?.test?.cache !== false) loi.push(`a turbo.json tasks.test.cache = ${JSON.stringify(turbo.tasks?.test?.cache)}`);
if (!readFileSync(join(GOC, ".githooks/pre-push"), "utf8").split("\n").includes(EP_CHAY)) loi.push(`a .githooks/pre-push thieu «${EP_CHAY}»`);

const tam = mkdtempSync(join(tmpdir(), "t1-ma-doc-dau-ra-"));
const chay = () =>
	spawnSync("bun", ["test", "./test/status-tone.spec.ts"], { cwd: join(tam, "packages/ui"), encoding: "utf8" });
try {
	for (const t of TEP_CHEP) {
		mkdirSync(dirname(join(tam, t)), { recursive: true });
		copyFileSync(join(GOC, t), join(tam, t));
	}
	const thietKe = join(tam, "docs/design.md");
	const chu = readFileSync(thietKe, "utf8");
	if (!chu.includes(DONG_LANH)) {
		console.log(`thuoc hong: docs/design.md khong con dong «${DONG_LANH}»`);
		process.exit(2);
	}
	const lanh = chay();
	if (lanh.status !== 0) loi.push(`b ban sao lanh do (ma ${lanh.status}): ${(lanh.stderr || "").trim().split("\n").slice(-3).join(" | ")}`);
	writeFileSync(thietKe, chu.replace(DONG_LANH, DONG_LECH));
	if (readFileSync(thietKe, "utf8") === chu) {
		console.log("thuoc hong: khong sua lech duoc docs/design.md");
		process.exit(2);
	}
	const lech = chay();
	const ra = `${lech.stdout}${lech.stderr}`;
	if (lech.status === 0) loi.push("c sua lech bang mau ma bai kiem van xanh");
	else if (!ra.includes(THONG_DIEP)) loi.push(`c bai kiem do nhung thieu «${THONG_DIEP}»`);
} finally {
	rmSync(tam, { recursive: true, force: true });
}

for (const l of loi) console.log(`DO ${l}`);
if (loi.length) process.exit(1);
console.log("dat dau-ra-that");
