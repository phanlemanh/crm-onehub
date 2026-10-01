import { readFileSync } from "node:fs";
import { join } from "node:path";
import { CHOT_DAT, chay, dongCo, dongCua, GOC, TEP_NAP } from "./chung.mjs";

const nap = readFileSync(join(GOC, TEP_NAP), "utf8");
const d1 = dongCua(nap, "okrSoChup.createMany");
const d2 = dongCua(nap, "okrSoChup.deleteMany");
if (d1 === null || d2 === null) {
	console.log(
		`KHONG DO DUOC: ${TEP_NAP} phai co dung mot okrSoChup.createMany va mot okrSoChup.deleteMany`,
	);
	process.exit(2);
}

const { ma, ra } = chay();
const mien = dongCo(ra, "mien ");
const tao = dongCo(ra, "tao ");
const kyMien = [
	`mien ${TEP_NAP}:${d1} createMany trong napTrong`,
	`mien ${TEP_NAP}:${d2} deleteMany trong xoaTrong`,
];
const kyTao = [
	["apps/agent/agent/lib/okr-chup.ts", "ghiBangTinh"],
	["apps/api/src/okr/okr-so.service.ts", "ghiSoKr"],
	["packages/db/src/okr-chi-so.ts", "chupKrCrm"],
];
const khop = (dong, [tep, ham]) =>
	new RegExp(
		`^tao  ${tep.replaceAll(".", "\\.")}:\\d+ \\S+ trong ${ham}$`,
	).test(dong);

const dieu = [
	[`ma thoat 0 (nhan ${ma})`, ma === 0],
	[
		`dong chot === «${CHOT_DAT}»`,
		dongCo(ra, "chot mien bo mau:").join("|") === CHOT_DAT,
	],
	[`dung 2 dong mien (nhan ${mien.length})`, mien.length === 2],
	...kyMien.map((k) => [`co «${k}»`, mien.includes(k)]),
	[`dung 3 dong tao (nhan ${tao.length})`, tao.length === 3],
	...kyTao.map((k) => [
		`tao ${k[0]} trong ${k[1]}`,
		tao.some((d) => khop(d, k)),
	]),
	["co «vi pham: 0»", ra.split("\n").includes("vi pham: 0")],
	["khong dong HONG", dongCo(ra, "HONG").length === 0],
];
for (const [ten, dat] of dieu) console.log(`${dat ? "dat " : "HONG"} ${ten}`);
const hong = dieu.filter(([, d]) => !d).length;
console.log(`xanh: ${dieu.length - hong}/${dieu.length} dieu dat`);
if (hong) console.log(ra);
process.exit(hong ? 1 : 0);
