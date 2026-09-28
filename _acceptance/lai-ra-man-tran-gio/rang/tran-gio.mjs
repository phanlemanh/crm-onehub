import { readFileSync } from "node:fs";
import { join } from "node:path";
import { CAU_HINH } from "./cau-hinh.mjs";
import { doiThamSoBa, soi } from "./cay.mjs";

const GOC = join(import.meta.dirname, "..", "..", "..");

function loiCoMat({ ca, tran }) {
	const loi = [];
	if (ca.length !== CAU_HINH.soCa)
		loi.push(`so ca ${ca.length}, neo ${CAU_HINH.soCa}`);
	for (const c of ca)
		if (c.thuBa !== "TRAN_LAI_MS")
			loi.push(`ca khong co tran tuong minh: ${c.ten}`);
	if (tran === null || !Number.isInteger(tran))
		loi.push("TRAN_LAI_MS khong khai o cap tep bang so nguyen");
	return loi;
}

function docBang() {
	const bang = JSON.parse(readFileSync(join(GOC, CAU_HINH.bangDo), "utf8"));
	const luot = Array.isArray(bang.luot) ? bang.luot : [];
	const hong = luot.filter(
		(l) =>
			!Number.isInteger(l.run_id) ||
			!Number.isInteger(l.attempt) ||
			!["pass", "fail"].includes(l.lai_tung?.ket_qua) ||
			!Number.isFinite(l.lai_tung?.ms),
	);
	return { luot, hong };
}

function mocCua(luot) {
	const lon = (ket) =>
		luot
			.filter((l) => l.lai_tung.ket_qua === ket)
			.reduce((a, l) => (a && a.lai_tung.ms >= l.lai_tung.ms ? a : l), null);
	const xanh = lon("pass");
	const do_ = lon("fail");
	const moc = do_ && do_.lai_tung.ms > xanh.lai_tung.ms ? do_ : xanh;
	return { xanh, do_, moc, laCanDo: moc === do_ };
}

function loiCanCu(tran, m) {
	if (tran === null) return "TRAN_LAI_MS vang — khong co tran de so";
	const nguong = CAU_HINH.heSo * m.moc.lai_tung.ms;
	if (tran >= nguong) return null;
	const nguon = m.laCanDo
		? ` (can duoi do ${m.moc.run_id}/${m.moc.attempt})`
		: ` (xanh ${m.moc.run_id}/${m.moc.attempt})`;
	return `tran ${tran} ms duoi ${CAU_HINH.heSo} lan moc ${m.moc.lai_tung.ms} ms${nguon}`;
}

function datTran(nguon, gt) {
	const moi = nguon.replace(
		/^const TRAN_LAI_MS = [0-9_]+;$/m,
		`const TRAN_LAI_MS = ${gt};`,
	);
	return moi === nguon ? null : moi;
}

function coMat(nguon) {
	const that = soi(nguon);
	if (that.ca.length === 0) return { ma: 2, dong: ["KHONG DO DUOC: 0 loi goi test(...) trong spec"] };
	const dong = [`da soi ${that.ca.length} ca:`, ...that.ca.map((c) => `  ${c.ten} — tham so thu ba: ${c.thuBa ?? "(vang)"}`)];
	const loi = loiCoMat(that);
	if (loi.length > 0) return { ma: 1, dong: [...dong, ...loi] };
	const pha = doiThamSoBa(nguon, CAU_HINH.tenCa.chuoi, null);
	if (pha === null)
		return { ma: 2, dong: [...dong, "KHONG DO DUOC: moc tran cua ca chuoi da va khong tim thay"] };
	const loiPha = loiCoMat(soi(pha));
	const bat = loiPha.some((l) => l === `ca khong co tran tuong minh: ${CAU_HINH.tenCa.chuoi}`);
	if (!bat)
		return { ma: 1, dong: [...dong, `chieu do KHONG bi bat: bo tran ca chuoi da va -> ${JSON.stringify(loiPha)}`] };
	return { ma: 0, dong: [...dong, `chieu do da bat: ${loiPha.join(" · ")}`] };
}

function canCu(nguon) {
	const { luot, hong } = docBang();
	if (luot.length < CAU_HINH.soLuotToiThieu || hong.length > 0)
		return {
			ma: 2,
			dong: [`KHONG DO DUOC: bang do ${luot.length} luot (can >= ${CAU_HINH.soLuotToiThieu}), ${hong.length} luot thieu run_id/attempt/ket qua`],
		};
	const m = mocCua(luot);
	const { tran } = soi(nguon);
	const dong = [
		`bang do: ${luot.length} luot · ${luot.filter((l) => l.lai_tung.ket_qua === "pass").length} xanh`,
		`xanh cham nhat: ${m.xanh.lai_tung.ms} ms (${m.xanh.run_id}/${m.xanh.attempt})`,
		`can duoi do lon nhat: ${m.do_ ? `${m.do_.lai_tung.ms} ms (${m.do_.run_id}/${m.do_.attempt})` : "(khong co luot do)"}`,
		`moc: ${m.moc.lai_tung.ms} ms · TRAN_LAI_MS: ${tran ?? "(vang)"} · he so thuc: ${tran === null ? "-" : (tran / m.moc.lai_tung.ms).toFixed(2)}`,
	];
	const loi = loiCanCu(tran, m);
	if (loi) return { ma: 1, dong: [...dong, loi] };
	const hong2 = [];
	for (const gt of [5000, 25000]) {
		const pha = datTran(nguon, gt);
		if (pha === null) return { ma: 2, dong: [...dong, "KHONG DO DUOC: moc `const TRAN_LAI_MS = …;` khong tim thay"] };
		const l = loiCanCu(soi(pha).tran, m);
		const mong = `tran ${gt} ms duoi ${CAU_HINH.heSo} lan moc ${m.moc.lai_tung.ms} ms`;
		if (l === null || !l.startsWith(mong)) hong2.push(`chieu do ${gt} KHONG bi bat: ${l}`);
		else dong.push(`chieu do da bat: ${l}`);
	}
	if (hong2.length > 0) return { ma: 1, dong: [...dong, ...hong2] };
	return { ma: 0, dong };
}

const LENH = { "co-mat": coMat, "can-cu": canCu };

const lenh = LENH[process.argv[2]];
if (!lenh) {
	console.error(`dung: node tran-gio.mjs <${Object.keys(LENH).join("|")}>`);
	process.exit(2);
}
let nguon;
try {
	nguon = readFileSync(join(GOC, CAU_HINH.spec), "utf8");
} catch (e) {
	console.error(`KHONG DO DUOC: khong doc duoc ${CAU_HINH.spec}: ${e.message}`);
	process.exit(2);
}
const kq = lenh(nguon);
for (const d of kq.dong) console.log(d);
process.exit(kq.ma);
