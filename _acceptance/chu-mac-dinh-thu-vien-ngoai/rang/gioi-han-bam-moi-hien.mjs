import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { GOC } from "../../man-cai-dat-noi-tieng-viet/rang/lat.mjs";
import { docComponent } from "./khai-sinh.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const BANG = JSON.parse(readFileSync(join(HERE, "gioi-han-bam-moi-hien.json"), "utf8"));
const MO_DONG = /\b(Trigger|Content|Portal|Overlay|open|onOpenChange)\b/;

const dia = docComponent();
const theoTen = new Map(dia.map((c) => [c.ten, c]));

const GOC_UI = join(GOC, "packages/ui/src/components");

const canKhai = dia
	.filter((c) => c.boc && !c.docKho)
	.filter((c) => MO_DONG.test(readFileSync(join(GOC_UI, c.ten), "utf8")))
	.map((c) => c.ten);

const hong = [];
for (const d of BANG.dong) {
	const c = theoTen.get(d.component);
	if (c === undefined) {
		hong.push(`${d.component} khai trong bang ma khong con file do`);
		continue;
	}
	if (!c.boc)
		hong.push(`${d.component} khai la boc thu vien ma tren dia no khong ve ra nguyen ban nao`);
	else if (!MO_DONG.test(readFileSync(join(GOC_UI, c.ten), "utf8")))
		hong.push(`${d.component} khai la chi-hien-sau-khi-bam ma trong ma khong co dau hieu mo/dong nao`);
}

const khaiRa = new Set(BANG.dong.map((d) => d.component));
const thua = [...khaiRa].filter((t) => !canKhai.includes(t));
const thieu = canKhai.filter((t) => !khaiRa.has(t));

console.log(
	`bang gioi han: ${BANG.dong.length} dong · chan dem tu dia: ${canKhai.length} component boc-ma-khong-doc thuoc loai chi-hien-sau-khi-bam`,
);
for (const d of hong) console.log(`   HONG: ${d}`);
for (const t of thua) console.log(`   THUA: ${t}`);
for (const t of thieu) console.log(`   THIEU: ${t}`);

if (BANG.dong.length === 0) {
	console.log("KHONG DO DUOC: bang rong — gioi han phai duoc KHAI, khong duoc bien mat.");
	process.exit(2);
}
if (hong.length > 0) process.exit(1);
if (thua.length > 0 || thieu.length > 0) {
	console.log("KHONG DO DUOC: bang lech voi dia — mot bang khai mot dong khong duoc di qua nhu mot bang da ke het.");
	process.exit(2);
}
console.log(`XANH: ca ${BANG.dong.length} dong deu tro mot component that, con boc thu vien, va co dau hieu mo/dong doc duoc tu ma.`);
process.exit(0);
