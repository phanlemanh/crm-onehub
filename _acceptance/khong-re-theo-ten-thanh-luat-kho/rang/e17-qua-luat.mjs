import { appendFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
	chay,
	duoi,
	GOC,
	giaiLenh,
	LUAT,
	RANG_E17,
	voiCayTam,
} from "./chung.mjs";

const CHEN = "apps/api/src/dashboard/dashboard.service.ts";
const DONG_GHIM = new RegExp(
	`^HONG ${CHEN.replaceAll(".", "\\.")}:\\d+: CLOSED_WON$`,
	"m",
);
const lenh = giaiLenh("executors.script.gdtt_khong_re_theo_ten");
const hong = [];

const dinh = chay(lenh);
const soTep = Number(/^so tep da quet: (\d+)$/m.exec(dinh.stdout)?.[1] ?? 0);
if (dinh.ma !== 0 || soTep < 50)
	hong.push(`HONG E17 ma ${dinh.ma} so tep ${soTep}\n    ${duoi(dinh.ra)}`);
else console.log(`E17 o dinh: ma 0, so tep da quet ${soTep}`);

const banRang = readFileSync(join(GOC, RANG_E17), "utf8");
for (const chuoi of ["giai-doan.ts", "RegExp", "matchAll"])
	if (banRang.includes(chuoi)) hong.push(`HONG BAN SAO ${chuoi}`);
if (!LUAT.every((l) => banRang.includes(l))) hong.push("HONG KHONG DOC LUAT");

voiCayTam("e17-chen", (cay) => {
	appendFileSync(join(cay, CHEN), '\nif (stage === "CLOSED_WON") {}\n');
	const ra = chay(lenh, cay);
	if (ra.ma !== 1 || !DONG_GHIM.test(ra.stdout))
		hong.push(`HONG LOT CHEN ma ${ra.ma}\n    ${duoi(ra.ra)}`);
	else
		console.log("E17 tren ban sao chen CLOSED_WON: ma 1, dong HONG dung cho");
});

for (const h of hong) console.log(h);
if (hong.length > 0) process.exit(1);
console.log("e17-qua-luat: dat");
