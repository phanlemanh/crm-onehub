import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { GOC } from "./chung.mjs";

const CANH_BAO_GHIM = 3;
const CAP_GOP = "147b47a339b2f5a37cbbd5feae536553d490cf5a";
const NHOM = ["apps", "packages", "tools"];
const BO_DEM_LINT = 64 * 1024 * 1024;
const LENH = [
	["test", "bun", ["run", "test"]],
	["check-types", "bunx", ["turbo", "run", "check-types", "--force"]],
	["lint", "bunx", ["turbo", "run", "lint", "--force"]],
	["lint:slop", "bun", ["run", "lint:slop"]],
	["build", "bunx", ["turbo", "run", "build", "--force"]],
];

let hong = 0;
for (const [ten, lenh, doi] of LENH) {
	const r = spawnSync(lenh, doi, { cwd: GOC, stdio: "inherit" });
	if (r.error) {
		console.error(`MA 2: khong chay duoc \`${ten}\` — ${r.error.message}`);
		process.exit(2);
	}
	console.log(`${ten}: ma ${r.status}`);
	if (r.status !== 0) hong += 1;
}

const git = (...d) => spawnSync("git", ["-C", GOC, ...d], { encoding: "utf8" });
if (git("cat-file", "-e", `${CAP_GOP}^2^{commit}`).status !== 0) {
	console.error(`KHONG DO DUOC: sha cap gop cron ${CAP_GOP} khong co trong kho`);
	process.exit(2);
}

const cay = join(mkdtempSync(join(tmpdir(), "cr-lint-")), "cay");
let lint;
try {
	const tao = git("worktree", "add", "--detach", cay, `${CAP_GOP}^2`);
	if (tao.status !== 0) {
		console.error(`KHONG DO DUOC: khong dung duoc cay tam o ${CAP_GOP}^2 — ${tao.stderr.trim()}`);
		process.exit(2);
	}
	symlinkSync(join(GOC, "node_modules"), join(cay, "node_modules"));
	for (const nhom of NHOM) {
		if (!existsSync(join(GOC, nhom))) continue;
		for (const goi of readdirSync(join(GOC, nhom))) {
			const nm = join(GOC, nhom, goi, "node_modules");
			if (existsSync(nm) && existsSync(join(cay, nhom, goi)) && !existsSync(join(cay, nhom, goi, "node_modules")))
				symlinkSync(nm, join(cay, nhom, goi, "node_modules"));
		}
	}
	lint = spawnSync("bun", ["run", "lint"], {
		cwd: join(cay, "apps", "app"),
		encoding: "utf8",
		maxBuffer: BO_DEM_LINT,
	});
} finally {
	git("worktree", "remove", "--force", cay);
	rmSync(join(cay, ".."), { recursive: true, force: true });
}
const khop = `${lint.stdout}${lint.stderr}`.match(/Found (\d+) warning/);
if (!khop) {
	console.error(
		`MA 2: khong doc duoc so canh bao lint cua apps/app o cay cap gop cron ${CAP_GOP.slice(0, 9)}^2${lint.error ? ` — ${lint.error.message}` : ""}`,
	);
	process.exit(2);
}
const soCanhBao = Number(khop[1]);
console.log(
	`apps/app canh bao lint o cay cap gop cron ${CAP_GOP.slice(0, 9)}^2: ${soCanhBao} · ghim: ${CANH_BAO_GHIM}`,
);

if (hong > 0) {
	console.error(`DO: ${hong} trong nam lenh chung khong ma 0.`);
	process.exit(1);
}
if (soCanhBao !== CANH_BAO_GHIM) {
	console.error(
		`DO: apps/app ra ${soCanhBao} canh bao lint, ghim la ${CANH_BAO_GHIM}.`,
	);
	process.exit(1);
}
console.log("XANH: ca nam lenh chung ma 0, canh bao lint dung ghim.");
