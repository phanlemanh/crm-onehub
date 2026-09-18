import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { docTep } from "../../man-cai-dat-noi-tieng-viet/rang/tep-thay.mjs";
import { docComponent } from "./khai-sinh.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const BANG = JSON.parse(docTep(join(HERE, "boc-ma-khong-doc.json")));

const dia = docComponent();
const theoTen = new Map(dia.map((c) => [c.ten, c]));
const canKhai = dia.filter((c) => c.boc && !c.docKho).map((c) => c.ten);

const hong = [];
for (const d of BANG.dong) {
	const c = theoTen.get(d.component);
	if (c === undefined) {
		hong.push(`${d.component} khai trong bang ma khong con file do trong packages/ui`);
		continue;
	}
	if (!c.boc) {
		hong.push(`${d.component} khai boc ${JSON.stringify(d.nguyen_ban)} ma tren dia no KHONG ve ra nguyen ban nao cua thu vien ngoai`);
		continue;
	}
	const thieu = d.nguyen_ban.filter((x) => !c.nguyenBan.includes(x));
	if (thieu.length > 0)
		hong.push(`${d.component} khai boc ${thieu.join(" · ")} ma tren dia khong thay — dia thay ${c.nguyenBan.join(" · ") || "(khong)"}`);
}

const khaiRa = new Set(BANG.dong.map((d) => d.component));
const thua = [...khaiRa].filter((t) => !canKhai.includes(t));
const thieuDong = canKhai.filter((t) => !khaiRa.has(t));

console.log(`bang: ${BANG.dong.length} dong · chan dem tu dia: ${canKhai.length} component boc-ma-khong-doc`);
for (const d of hong) console.log(`   HONG: ${d}`);
for (const t of thua) console.log(`   THUA: ${t} khai trong bang ma khong phai boc-ma-khong-doc`);
for (const t of thieuDong) console.log(`   THIEU: ${t} la boc-ma-khong-doc ma bang khong khai`);

if (BANG.dong.length === 0) {
	console.log("KHONG DO DUOC: bang rong. Tap quan sat rong khong bao gio la dat.");
	process.exit(2);
}
if (hong.length > 0) process.exit(1);
if (thua.length > 0 || thieuDong.length > 0) {
	console.log("KHONG DO DUOC: bang lech voi dia — in ca hai danh sach o tren.");
	process.exit(2);
}
console.log(`XANH: ca ${BANG.dong.length} dong tro dung mot component con ve ra dung nguyen ban da khai, va bang du.`);
process.exit(0);
