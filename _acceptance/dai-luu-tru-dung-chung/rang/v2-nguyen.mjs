import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const BAI_V2 = "apps/app/test/vong-doi-mot-cach-cat.dom.tsx";
const TEP = [
	BAI_V2,
	"_acceptance/vong-doi-mot-cach-cat/rang/man.mjs",
	"_acceptance/vong-doi-mot-cach-cat/evidence/vdc-ngan-da-cat-1440.png",
	"_acceptance/vong-doi-mot-cach-cat/evidence/vdc-ngan-da-cat-390.png",
];
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
		`dai-luu-tru-dung-chung v2-nguyen: do — bai V2 bi sua: ${loi.join("; ")}`,
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

const cu = git("show", `${moc}:${BAI_V2}`).stdout;
const nay = readFileSync(join(GOC, BAI_V2), "utf8");
const kiem = CHIEU_DO ? `${nay}\ntest.skip("chieu-do", () => {});\n` : nay;
if (dem(kiem) !== dem(cu))
	loi.push(`${BAI_V2} (.skip/.only/.todo ${dem(cu)} -> ${dem(kiem)})`);

if (loi.length > 0) do_(loi);
console.log(
	`dai-luu-tru-dung-chung v2-nguyen: dat (${soPhep} tep, moc ${moc.slice(0, 9)})`,
);
