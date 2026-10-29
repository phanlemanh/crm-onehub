import fs from "node:fs";
import path from "node:path";
import { ROOT, bam, chayVo, ghiRa, lenhCauHinh } from "./chung.mjs";

const CHAN = [
	"k3_nhieu_kr",
];

const thay = (a, b) => (s) => {
	const lan = s.split(a).length - 1;
	if (lan !== 1) throw new Error(`vet khong cam duoc: «${a}» xuat hien ${lan} lan`);
	return s.replace(a, b);
};

const VET = [
	{ ten: "(f) assertSuaDich luat cu", tep: "apps/api/src/okr/tro-ly.service.ts", cam: thay("await this.coKrSuaDuoc(userId, dich.objectiveId)", "false"), doi: [["k3_nhieu_kr", "nguoi phu trach hai kr bi tu choi"]] },
];

const chay = (khoa) => {
	const r = chayVo(lenhCauHinh(khoa));
	return { ma: r.status, ra: `${r.stdout}${r.stderr}` };
};

const nen = CHAN.map((k) => ({ k, ...chay(k) }));
const chuaXanh = nen.filter((x) => x.ma !== 0);
if (chuaXanh.length) {
	console.log(`KHONG DO DUOC: chua pha gi ma ${chuaXanh.map((x) => `${x.k}(${x.ma})`).join(" · ")} da khong xanh`);
	process.exit(2);
}
console.log(`chieu xanh: ${CHAN.length}/${CHAN.length} chan xanh tren cay lanh`);

let bat = 0;
for (const v of VET) {
	const duong = path.join(ROOT, v.tep);
	const truoc = fs.readFileSync(duong, "utf8");
	const bamTruoc = bam(v.tep);
	const ket = [];
	try {
		fs.writeFileSync(duong, v.cam(truoc));
		for (const [k, thongDiep] of v.doi) {
			const r = chay(k);
			ghiRa(`dot-bien-${v.ten.slice(1, 2)}-${k}.txt`, r.ra);
			ket.push({ k, do: r.ma !== 0, ghim: r.ra.includes(thongDiep), thongDiep });
		}
	} finally {
		fs.writeFileSync(duong, truoc);
	}
	if (bam(v.tep) !== bamTruoc) {
		console.log(`TEP KHONG TRA LAI: ${v.tep}`);
		process.exit(3);
	}
	const duBat = ket.every((x) => x.do && x.ghim);
	if (duBat) bat++;
	console.log(`${duBat ? "bat" : "MU"} ${v.ten}: ${ket.map((x) => `${x.k} ${x.do ? "do" : "XANH"}${x.ghim ? "" : ` (thieu «${x.thongDiep}»)`}`).join(" · ")}`);
}
console.log(`dot-bien: ${bat}/${VET.length} vet bi bat, tep tra lai nguyen`);
process.exit(bat === VET.length ? 0 : 1);
