import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const APP = "apps/app";
const BO_QUA = new Set(["node_modules", ".next", ".turbo", "test"]);
const NGAN = "apps/app/components/crm/record-sheet";
const O = `${NGAN}/o-duong-dan-bang-chung.tsx`;
const KHOI = `${NGAN}/khoi-cap-nhat-kr.tsx`;
const DONG = `${NGAN}/dong-dinh-bang-chung.tsx`;
const DAT_DAU = /data-o-duong-dan-bang-chung\s*=/;
const NHAP_O = /import\s*\{[^}]*\bODuongDanBangChung\b[^}]*\}\s*from\s*["']\.\/o-duong-dan-bang-chung["']/;
const URL_THO = /type\s*=\s*["']url["']/;

function dung(ma, cau) {
	console.log(cau);
	process.exit(ma);
}

function quetTsx(goc, thuMuc, ra = []) {
	for (const ten of readdirSync(join(goc, thuMuc))) {
		if (BO_QUA.has(ten)) continue;
		const duong = join(thuMuc, ten);
		if (statSync(join(goc, duong)).isDirectory()) quetTsx(goc, duong, ra);
		else if (ten.endsWith(".tsx")) ra.push(duong);
	}
	return ra;
}

function doc(goc, tep) {
	try {
		return readFileSync(join(goc, tep), "utf8");
	} catch {
		dung(2, `KHONG DO DUOC: khong doc duoc ${tep}`);
	}
}

function cham(goc) {
	const dat = quetTsx(goc, APP).filter((t) => DAT_DAU.test(readFileSync(join(goc, t), "utf8")));
	const khoi = doc(goc, KHOI);
	return [
		{ o: 1, dat: dat.length === 1 && dat[0] === O, tep: dat.filter((t) => t !== O).join(", ") || (dat.length ? "" : `${O} vang dau`) },
		{ o: 2, dat: NHAP_O.test(khoi) && !URL_THO.test(khoi), tep: KHOI },
		{ o: 3, dat: NHAP_O.test(doc(goc, DONG)), tep: DONG },
	];
}

const cay = cham(GOC);
for (const c of cay) console.log(`o ${c.o}: ${c.dat ? "dat" : `do — ${c.tep}`}`);
console.log(`so o: ${cay.length}`);

const tam = mkdtempSync(join(tmpdir(), "sv10-mot-o-"));
let sao;
try {
	cpSync(join(GOC, APP), join(tam, APP), {
		recursive: true,
		filter: (nguon) => !/[\\/](node_modules|\.next|\.turbo)([\\/]|$)/.test(relative(GOC, nguon)),
	});
	const d = join(tam, KHOI);
	const nguon = readFileSync(d, "utf8");
	writeFileSync(
		d,
		`${nguon}\nexport function OTho() {\n\treturn <input data-o-duong-dan-bang-chung="" type="url" />;\n}\n`,
	);
	sao = cham(tam);
} finally {
	rmSync(tam, { recursive: true, force: true });
}
const doSao = sao.filter((c) => !c.dat).map((c) => c.o);
for (const c of sao.filter((x) => !x.dat)) console.log(`ban sao: o ${c.o}: do — ${c.tep}`);

const cayDat = cay.every((c) => c.dat);
const saoDung = doSao.length === 2 && doSao.includes(1) && doSao.includes(2);
console.log(`cay: ${cayDat ? "dat 3/3" : "thieu"} · ban sao: do o ${doSao.join(",") || "khong"}`);
if (!cayDat) dung(1, "cay chua dat du ba o");
if (!saoDung) dung(1, "ban sao khong do dung hai o 1 va 2");
process.exit(0);
