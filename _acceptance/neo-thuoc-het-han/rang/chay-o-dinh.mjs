import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
	CAP_LMCV,
	CAP_SOT,
	chay,
	duoi,
	GOC,
	giaiLenh,
	RANG_SUA,
} from "./chung.mjs";

const DONG_NEO = [
	{
		khoa: "executors.script.sot_san_thiet_ke",
		nhan: "E23",
		mau: `dai so sanh: ${CAP_SOT.goc}...${CAP_SOT.dinh}`,
	},
	{
		khoa: "executors.script.sot_migration_chi_them",
		nhan: "E25",
		mau: `goc so sanh: ${CAP_SOT.goc}..${CAP_SOT.dinh}`,
	},
	{
		khoa: "executors.script.lmcv_khong_hoi_quy",
		nhan: "E5",
		mau: `${CAP_LMCV.goc}..${CAP_LMCV.dinh}`,
	},
];

export const coNeo = (ra, mau) =>
	ra.split("\n").some((dong) => dong.includes(mau));

export function soiTroi(chu) {
	const loi = [];
	if (chu.includes("origin/onehub")) loi.push("origin/onehub");
	if (/["'`]merge-base["'`]/.test(chu)) loi.push("merge-base");
	return loi;
}

const hong = [];

if (coNeo("dai so sanh: origin/onehub...HEAD (--no-renames)", DONG_NEO[0].mau))
	hong.push("HONG TU KIEM neo: dau ra gia mang origin/onehub van qua");
else console.log("OK tu kiem neo");
if (
	soiTroi('const x = git("merge-base", "HEAD", "origin/onehub");').length !== 2
)
	hong.push("HONG TU KIEM troi: bo soi tinh khong bat chuoi gia");
else console.log("OK tu kiem troi");

for (const { khoa, nhan, mau } of DONG_NEO) {
	const kq = chay(giaiLenh(khoa));
	if (kq.ma !== 0) {
		hong.push(`HONG ${khoa} ma ${kq.ma}\n    ${duoi(kq.ra)}`);
		continue;
	}
	if (!coNeo(kq.ra, mau)) {
		hong.push(`HONG NEO ${nhan}: dau ra khong co «${mau}»`);
		continue;
	}
	console.log(`${nhan} ma 0, neo «${mau}»`);
}

for (const tep of RANG_SUA) {
	const chu = readFileSync(join(GOC, tep), "utf8");
	for (const t of soiTroi(chu)) hong.push(`HONG TROI ${tep}: con ${t}`);
	if (tep.endsWith("khong-hoi-quy.mjs") && chu.includes("Bun.YAML"))
		hong.push(`HONG BO DOC ${tep}: con Bun.YAML`);
}
console.log(`soi tinh ${RANG_SUA.length} tep rang`);

for (const h of hong) console.log(h);
console.log(
	`chay-o-dinh: ${hong.length === 0 ? "dat" : `${hong.length} hong`}`,
);
process.exit(hong.length === 0 ? 0 : 1);
