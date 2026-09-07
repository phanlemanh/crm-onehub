import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const CANH_BAO_GHIM = 3;

const LENH = [
	["test", ["bun", ["run", "test"]]],
	["check-types", ["bunx", ["turbo", "run", "check-types", "--force"]]],
	["lint", ["bunx", ["turbo", "run", "lint", "--force"]]],
	["lint:slop", ["bun", ["run", "lint:slop"]]],
];

let hong = 0;
for (const [ten, [lenh, doi]] of LENH) {
	const ra = spawnSync(lenh, doi, { cwd: GOC, encoding: "utf8" });
	if (ra.error) {
		console.error(`MA 2: khong chay duoc \`${ten}\` — ${ra.error.message}`);
		process.exit(2);
	}
	console.log(`${ten}: ma ${ra.status}`);
	if (ra.status !== 0) hong += 1;
}

const lint = spawnSync("bun", ["run", "lint"], {
	cwd: join(GOC, "apps", "app"),
	encoding: "utf8",
});
const khop = `${lint.stdout}${lint.stderr}`.match(/Found (\d+) warning/);
if (!khop) {
	console.error("MA 2: khong doc duoc so canh bao lint cua apps/app");
	process.exit(2);
}
const soCanhBao = Number(khop[1]);
console.log(`apps/app canh bao lint: ${soCanhBao} · ghim: ${CANH_BAO_GHIM}`);

if (hong > 0) {
	console.error(`DO: ${hong} lenh chung cu khong ma 0.`);
	process.exit(1);
}
if (soCanhBao !== CANH_BAO_GHIM) {
	console.error(
		`DO: apps/app ra ${soCanhBao} canh bao lint, ghim la ${CANH_BAO_GHIM} — lech len hay xuong deu la do.`,
	);
	process.exit(1);
}
console.log("XANH: bon lenh chung cu deu ma 0, canh bao lint dung ghim.");
