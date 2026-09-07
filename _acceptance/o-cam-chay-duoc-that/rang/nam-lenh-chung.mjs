import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { bam, docConfig, GOC, ketThuc } from "./chung.mjs";

const CANH_BAO_GHIM = 3;
const LENH = [
	["test", "bun", ["run", "test"]],
	["check-types", "bunx", ["turbo", "run", "check-types", "--force"]],
	["lint", "bunx", ["turbo", "run", "lint", "--force"]],
	["lint:slop", "bun", ["run", "lint:slop"]],
	["build", "bunx", ["turbo", "run", "build", "--force"]],
];

const bamDau = bam(docConfig());
let hong = 0;
for (const [ten, lenh, doi] of LENH) {
	const r = spawnSync(lenh, doi, { cwd: GOC, encoding: "utf8" });
	if (r.error) {
		console.error(`MA 2: khong chay duoc \`${ten}\` — ${r.error.message}`);
		ketThuc(bamDau, 2);
	}
	console.log(`${ten}: ma ${r.status}`);
	if (r.status !== 0) hong += 1;
}

const lint = spawnSync("bun", ["run", "lint"], {
	cwd: join(GOC, "apps", "app"),
	encoding: "utf8",
});
const khop = `${lint.stdout}${lint.stderr}`.match(/Found (\d+) warning/);
if (!khop) {
	console.error("MA 2: khong doc duoc so canh bao lint cua apps/app");
	ketThuc(bamDau, 2);
}
const soCanhBao = Number(khop[1]);
console.log(`apps/app canh bao lint: ${soCanhBao} · ghim: ${CANH_BAO_GHIM}`);

if (hong > 0) {
	console.error(`DO: ${hong} trong nam lenh chung khong ma 0.`);
	ketThuc(bamDau, 1);
}
if (soCanhBao !== CANH_BAO_GHIM) {
	console.error(
		`DO: apps/app ra ${soCanhBao} canh bao lint, ghim la ${CANH_BAO_GHIM}.`,
	);
	ketThuc(bamDau, 1);
}
console.log("XANH: ca nam lenh chung ma 0, canh bao lint dung ghim.");
ketThuc(bamDau, 0);
