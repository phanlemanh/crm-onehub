import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { docBoVe, sinhMau, TEP_MAU } from "./sinh-mau.mjs";

let boVe;
try {
	boVe = docBoVe(process.argv.slice(2));
} catch (loi) {
	console.log(`kiem-mau: ${loi.message}`);
	process.exit(2);
}

const loTrinh = path.join(path.dirname(boVe), "lo-trinh.mjs");
const maLoTrinh = existsSync(loTrinh) ? readFileSync(loTrinh, "utf8") : "";
if (!maLoTrinh.includes("export function docDuLieu")) {
	console.log("chưa có bộ vẽ mang khối — cần kit ≥ 2.26");
	process.exit(2);
}

let moi;
try {
	moi = sinhMau(boVe);
} catch (loi) {
	console.log(`kiem-mau: ${loi.message}`);
	process.exit(2);
}

const daGhi = existsSync(TEP_MAU) ? readFileSync(TEP_MAU) : null;
if (daGhi?.equals(moi)) {
	console.log(`DUNG tệp mẫu khớp bộ vẽ ${boVe}`);
	process.exit(0);
}
console.log("SAI tệp mẫu lệch bộ vẽ");
process.exit(1);
