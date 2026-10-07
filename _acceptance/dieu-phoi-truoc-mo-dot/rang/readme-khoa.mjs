import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const README = join(GOC, "scripts", "dieu-phoi", "README.md");
const MO_DAU = "Khoá hợp lệ của tệp trả lời:";
const ghi = (s) => process.stdout.write(`${s}\n`);

const { KHOA_TRA_LOI } = await import(pathToFileURL(join(GOC, "scripts", "dieu-phoi", "hinh-dang.mjs")).href);

function tapKhoa(text) {
	const dong = text.split("\n").filter((d) => d.replace(/^\s*-\s*/, "").startsWith(MO_DAU));
	if (dong.length !== 1) return { loi: `can dung mot dong '${MO_DAU}', thay ${dong.length}` };
	return { tap: [...dong[0].matchAll(/`([^`]+)`/g)].map((m) => m[1]) };
}

function so(text) {
	const { tap, loi } = tapKhoa(text);
	if (loi) return { loi };
	const thieu = KHOA_TRA_LOI.filter((k) => !tap.includes(k));
	const thua = tap.filter((k) => !KHOA_TRA_LOI.includes(k));
	return { thieu, thua, n: tap.length };
}

let sai = 0;
const that = readFileSync(README, "utf8");
const r = so(that);
if (r.loi || r.thieu.length || r.thua.length) {
	sai++;
	ghi(`DO readme-khoa: ${JSON.stringify(r)}`);
} else ghi(`XANH readme-khoa: ${r.n} khoá khớp`);

const PHA = [
	["thieu uoc_phut", (t) => t.replace(", `uoc_phut`.", "."), (k) => k.thieu?.includes("uoc_phut")],
	["thua ghi_chu", (t) => t.replace(", `uoc_phut`.", ", `uoc_phut`, `ghi_chu`."), (k) => k.thua?.includes("ghi_chu")],
];
for (const [ten, pha, bat] of PHA) {
	const moi = pha(that);
	if (moi === that) {
		ghi(`MOC VANG ${ten}`);
		process.exit(2);
	}
	if (bat(so(moi))) ghi(`BAT ${ten}`);
	else {
		sai++;
		ghi(`SOT ${ten}`);
	}
}
ghi(`KET LUAN: ${sai === 0 ? "xanh" : `do ${sai}`}`);
process.exit(sai === 0 ? 0 : 1);
