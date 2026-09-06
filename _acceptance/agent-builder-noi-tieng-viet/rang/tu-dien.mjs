import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { GOC } from "../../man-cai-dat-noi-tieng-viet/rang/lat.mjs";
import { giuDoc } from "../../man-cai-dat-noi-tieng-viet/rang/khoa-cay.mjs";

await giuDoc();

const HERE = dirname(fileURLToPath(import.meta.url));
const KHAI = JSON.parse(readFileSync(join(HERE, "tu-dien-cua-lat.json"), "utf8"));
const TU_DIEN = readFileSync(join(GOC, "CONTEXT.md"), "utf8");

const KHO = KHAI.kho.map((t) => readFileSync(join(GOC, t), "utf8"));

function banVi(nguon) {
	const i = nguon.indexOf("const vi = {");
	return i === -1 ? "" : nguon.slice(i);
}

const vi = KHO.map(banVi).join("\n");
const thieuMuc = [];
const chet = [];

for (const m of KHAI.muc) {
	const co = new RegExp(`^\\*\\*${m.tu}\\*\\*:`, "m").test(TU_DIEN);
	if (!co) {
		thieuMuc.push(m.tu);
		continue;
	}
	const dung = new RegExp(m.tu.toLowerCase(), "i").test(vi);
	if (!dung) chet.push(m.tu);
}

console.log(
	`doi chieu ${KHAI.muc.length} muc tu dien voi ban vi cua ${KHO.length} kho chuoi cua lat`,
);
for (const t of thieuMuc)
	console.log(`   THIEU MUC: CONTEXT.md khong co muc **${t}** — lat nay dung tu do lam danh tu trung tam`);
for (const t of chet)
	console.log(`   MUC CHET: **${t}** khai trong tu dien ma khong kho chuoi nao cua lat dung — muc tu dien chet`);

if (thieuMuc.length > 0 || chet.length > 0) process.exit(1);
if (KHAI.muc.length === 0) {
	console.log("KHONG DO DUOC: ban khai khong co muc nao. Tap quan sat rong khong bao gio la dat.");
	process.exit(2);
}
console.log(
	`XANH: ca ${KHAI.muc.length} muc deu co trong CONTEXT.md va deu duoc ban vi cua lat dung.`,
);
