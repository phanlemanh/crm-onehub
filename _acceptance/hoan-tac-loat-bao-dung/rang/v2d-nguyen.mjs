import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const BAI_APP = "apps/app/test/hoan-tac-loat-dung-id.dom.tsx";
const BAI_API = "apps/api/test/hoan-tac-loat-dung-id.spec.ts";
const TEP = [BAI_APP, BAI_API];
const BO_QUA = [".skip(", ".only(", ".todo("];
const CHIEU_DO = process.argv.includes("--chieu-do");

function git(...args) {
	return spawnSync("git", args, { cwd: GOC, encoding: "utf8" });
}

function dem(chu) {
	return BO_QUA.reduce((tong, d) => tong + chu.split(d).length - 1, 0);
}

function do_(loi) {
	console.log(
		`hoan-tac-loat-bao-dung v2d-nguyen: do — bai V2d bi sua: ${loi.join("; ")}`,
	);
	process.exit(1);
}

const moc = git("merge-base", "HEAD", "origin/onehub").stdout.trim();
if (!moc) do_(["khong tinh duoc merge-base voi origin/onehub"]);

const loi = [];
let soPhep = 0;
for (const t of TEP) {
	if (!existsSync(join(GOC, t))) {
		loi.push(`${t} khong ton tai`);
		continue;
	}
	soPhep++;
	if (git("diff", "--quiet", moc, "--", t).status !== 0)
		loi.push(`${t} doi so voi ${moc.slice(0, 9)}`);
}
if (soPhep !== TEP.length) loi.push(`chi xet ${soPhep}/${TEP.length} tep`);

for (const t of TEP) {
	if (!existsSync(join(GOC, t))) continue;
	const cu = git("show", `${moc}:${t}`).stdout;
	const nay = readFileSync(join(GOC, t), "utf8");
	const kiem =
		CHIEU_DO && t === BAI_APP
			? `${nay}\ntest.skip("chieu-do", () => {});\n`
			: nay;
	if (dem(kiem) !== dem(cu))
		loi.push(`${t} (.skip/.only/.todo ${dem(cu)} -> ${dem(kiem)})`);
}

if (loi.length > 0) do_(loi);
console.log(
	`hoan-tac-loat-bao-dung v2d-nguyen: dat (${soPhep} tep, moc ${moc.slice(0, 9)})`,
);
