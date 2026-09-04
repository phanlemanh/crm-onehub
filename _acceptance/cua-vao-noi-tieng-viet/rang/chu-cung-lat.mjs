import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "../../..");
const LAT = JSON.parse(readFileSync(`${HERE}/lat-cua-vao.json`, "utf8"));
const QUET = `${GOC}/_acceptance/nhan-ung-dung-noi-tieng-viet/rang/chu-cung-jsx.mjs`;

const DONG = /^(\S+):(\d+)\s+\[([^\]]+)\]\s+"(.*)"$/;

function chay() {
	try {
		return execFileSync("node", [QUET, ...LAT.file], {
			cwd: GOC,
			encoding: "utf8",
			stdio: ["ignore", "pipe", "pipe"],
		});
	} catch (e) {
		return `${e.stdout ?? ""}${e.stderr ?? ""}`;
	}
}

const ra = chay();

if (!ra.includes("quet ")) {
	console.log(
		`KHONG DO DUOC: bo quet khong in dong tong ket. Dau ra:\n${ra.slice(0, 400)}`,
	);
	process.exit(2);
}

const soQuet = Number(/quet (\d+) file trong lat/.exec(ra)?.[1] ?? -1);
if (soQuet !== LAT.file.length) {
	console.log(
		`KHONG DO DUOC: lat khai ${LAT.file.length} file nhung bo quet doc ${soQuet}. ` +
			"Danh sach file va thu bo quet thuc su doc da lech.",
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

const mienTru = LAT.mien_tru ?? [];
const dungToi = new Set();
const conLai = [];

for (const c of cho) {
	const mt = mienTru.find((m) => m.chuoi === c.chuoi);
	if (mt) dungToi.add(mt.chuoi);
	else conLai.push(c);
}

const chet = mienTru.filter((m) => !dungToi.has(m.chuoi));

for (const c of conLai)
	console.log(
		`CHU CUNG: ${c.file}:${c.dong} [${c.loai}] ${JSON.stringify(c.chuoi)} — le ra phai doc tu kho chuoi`,
	);

for (const m of chet)
	console.log(
		`MIEN TRU CHET: dong "${m.chuoi}" (${m.vi_sao}) khong con doi tuong that trong lat — go no khoi ban khai`,
	);

if (conLai.length > 0 || chet.length > 0) process.exit(1);

console.log(
	`ket qua: ${soQuet} file, 0 chuoi nguoi-doc-thay khoa cung ngoai ${mienTru.length} dong mien tru, va ca ${mienTru.length} dong deu con doi tuong that`,
);
