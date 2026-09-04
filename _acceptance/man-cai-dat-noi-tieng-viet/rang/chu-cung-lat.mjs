import { execFileSync } from "node:child_process";
import { GOC, lat } from "./lat.mjs";

const QUET = `${GOC}/_acceptance/nhan-ung-dung-noi-tieng-viet/rang/chu-cung-jsx.mjs`;
const DONG = /^(\S+):(\d+)\s+\[([^\]]+)\]\s+"(.*)"$/;

const L = lat();

if (L.thieu.length > 0) {
	console.log(
		`KHONG DO DUOC: ban khai lat tro toi ${L.thieu.length} duong khong co tren dia: ${L.thieu.join(" · ")}`,
	);
	process.exit(2);
}

if (L.soTuDia === 0) {
	console.log(
		"KHONG DO DUOC: quet thu muc cua lat ra 0 file .tsx — tap quan sat rong khong bao gio la dat",
	);
	process.exit(2);
}

function chay() {
	try {
		return execFileSync("node", [QUET, ...L.file], {
			cwd: GOC,
			encoding: "utf8",
			stdio: ["ignore", "pipe", "pipe"],
		});
	} catch (e) {
		return `${e.stdout ?? ""}${e.stderr ?? ""}`;
	}
}

const ra = chay();
const soQuet = Number(/quet (\d+) file trong lat/.exec(ra)?.[1] ?? -1);

if (soQuet !== L.file.length) {
	console.log(
		`KHONG DO DUOC: lat sinh ra ${L.file.length} file nhung bo quet doc ${soQuet}. ` +
			"Danh sach va thu bo quet thuc su doc da lech.",
	);
	process.exit(2);
}

const truoc = ra.slice(
	0,
	ra.indexOf("da tru") >= 0 ? ra.indexOf("da tru") : ra.length,
);
const cho = truoc
	.split("\n")
	.map((d) => DONG.exec(d.trim()))
	.filter((m) => m !== null)
	.map((m) => ({ file: m[1], dong: m[2], loai: m[3], chuoi: m[4] }));

const dungToi = new Set();
const conLai = [];

for (const c of cho) {
	const mt = L.mienTru.find((m) => m.chuoi === c.chuoi);
	if (mt) dungToi.add(mt.chuoi);
	else conLai.push(c);
}

const chet = L.mienTru.filter((m) => !dungToi.has(m.chuoi));

for (const c of conLai)
	console.log(
		`CHU CUNG: ${c.file}:${c.dong} [${c.loai}] ${JSON.stringify(c.chuoi)} — le ra phai doc tu kho chuoi`,
	);

for (const m of chet)
	console.log(
		`MIEN TRU CHET: dong "${m.chuoi}" (${m.vi_sao}) khong con doi tuong that — go no khoi ban khai`,
	);

for (const k of L.treo)
	console.log(
		`LOAI TRU TREO: "${k.duong}" (${k.vi_sao}) khong con nam duoi thu muc lat quet — go no khoi ban khai`,
	);

if (conLai.length > 0 || chet.length > 0 || L.treo.length > 0) process.exit(1);

console.log(
	`ket qua: ${L.soTuDia} file .tsx tren dia, tru ${L.khongQuet.length} loai tru co ten, cong ${L.file.length - L.soTuDia + L.khongQuet.length} khai them = ${L.file.length} file quet. ` +
		`0 chuoi khoa cung ngoai ${L.mienTru.length} dong mien tru, va ca ${L.mienTru.length} dong deu con doi tuong that.`,
);
