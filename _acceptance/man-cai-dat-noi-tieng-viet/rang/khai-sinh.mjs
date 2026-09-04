import { execFileSync } from "node:child_process";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { GOC, lat } from "./lat.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const NGOAI = `${HERE}/chu-ngoai-jsx.mjs`;
const BOC = `${HERE}/chu-cung-lat.mjs`;

function chay(lenh) {
	try {
		return execFileSync("node", lenh, {
			cwd: GOC,
			encoding: "utf8",
			stdio: ["ignore", "pipe", "pipe"],
		});
	} catch (e) {
		return `${e.stdout ?? ""}${e.stderr ?? ""}`;
	}
}

const L = lat();

if (L.soTuDia === 0) {
	console.log("KHONG DO DUOC: lat sinh ra 0 file — tap rong khong bao gio la dat");
	process.exit(2);
}

const raBoc = chay([BOC]);
const soJsx = Number(/lat sinh ra \d+ file nhung bo quet doc (\d+)/.exec(raBoc)?.[1] ?? NaN);
const soJsxDoc = Number.isNaN(soJsx) ? L.file.length : soJsx;

let ngoai;
try {
	ngoai = JSON.parse(chay([NGOAI, "--chan", "doi-chieu"]).trim());
} catch {
	console.log("KHONG DO DUOC: chan ngoai-JSX khong tra ve so dem doc duoc");
	process.exit(2);
}

const hangFile = {
	latSinh: L.file.length,
	chanJsx: soJsxDoc,
	chanNgoai: ngoai.latSinh,
};
const hangVat = {
	toastNhanRa: ngoai.toastNhanRa,
	toastKhai: ngoai.toastKhai,
	tieuDeNhanRa: ngoai.tieuDeNhanRa,
	tieuDeKhai: ngoai.tieuDeKhai,
};

const lechFile = new Set(Object.values(hangFile)).size !== 1;
const lechVat =
	hangVat.toastNhanRa !== hangVat.toastKhai ||
	hangVat.tieuDeNhanRa !== hangVat.tieuDeKhai;
const rong = hangFile.latSinh === 0 || hangVat.toastNhanRa === 0;

console.log(`hang FILE: ${JSON.stringify(hangFile)}`);
console.log(`hang VAT:  ${JSON.stringify(hangVat)}`);

if (rong) {
	console.log(
		"KHONG DO DUOC: tap quan sat rong — 0 file hoac 0 vat. Tap rong khong bao gio la dat.",
	);
	process.exit(2);
}

if (lechFile) {
	console.log(
		`KHONG DO DUOC: hang FILE lech — lat sinh ${hangFile.latSinh}, chan JSX doc ${hangFile.chanJsx}, chan ngoai-JSX doc ${hangFile.chanNgoai}.`,
	);
	process.exit(2);
}

if (lechVat) {
	console.log(
		`KHONG DO DUOC: hang VAT lech — toast nhan ra ${hangVat.toastNhanRa}/${hangVat.toastKhai}, tieu de nhan ra ${hangVat.tieuDeNhanRa}/${hangVat.tieuDeKhai}. ` +
			"Hang FILE khong bat duoc lop nay: mot chan mo du file ma nhan ra 0 vat van cho ba con so file bang nhau.",
	);
	process.exit(2);
}

console.log(
	`XANH: ${hangFile.latSinh} file, ba chan doc bang nhau; ${hangVat.toastNhanRa} loi goi toast va ${hangVat.tieuDeNhanRa} o tieu de, khop bang khai.`,
);
