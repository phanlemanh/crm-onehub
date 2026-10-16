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
const lenh = giaiLenh("executors.script.gdtt_khong_re_theo_ten");
const hong = [];

const dinh = chay(lenh);
const soTep = Number(/^so tep da quet: (\d+)$/m.exec(dinh.stdout)?.[1] ?? 0);
if (dinh.ma !== 0 || soTep < 50)
	hong.push(`HONG E17 ma ${dinh.ma} so tep ${soTep}\n    ${duoi(dinh.ra)}`);
else console.log(`E17 o dinh: ma 0, so tep da quet ${soTep}`);

const banRang = readFileSync(join(GOC, RANG_E17), "utf8");
if (/import[^;]*giai-doan/.test(banRang))
	hong.push("HONG BAN SAO import giai-doan");
for (const chuoi of ["RegExp", "matchAll"])
	if (banRang.includes(chuoi)) hong.push(`HONG BAN SAO ${chuoi}`);
if (!LUAT.every((l) => banRang.includes(l))) hong.push("HONG KHONG DOC LUAT");

const CA_CHEN = [
	["CLOSED_WON", '\nif (stage === "CLOSED_WON") {}\n'],
	["GIAI_DOAN_GOC", '\nexport { GIAI_DOAN_GOC } from "@crm/db/giai-doan";\n'],
];
for (const [tu, chen] of CA_CHEN)
	voiCayTam("e17-chen", (cay) => {
		appendFileSync(join(cay, CHEN), chen);
		const ra = chay(lenh, cay);
		const dong = ra.stdout
			.split("\n")
			.some((d) => d.startsWith(`HONG ${CHEN}:`) && d.endsWith(`: ${tu}`));
		if (ra.ma !== 1 || !dong)
			hong.push(`HONG LOT CHEN ${tu} ma ${ra.ma}\n    ${duoi(ra.ra)}`);
		else console.log(`E17 tren ban sao chen ${tu}: ma 1, dong HONG dung cho`);
	});

for (const h of hong) console.log(h);
if (hong.length > 0) process.exit(1);
console.log("e17-qua-luat: dat");
