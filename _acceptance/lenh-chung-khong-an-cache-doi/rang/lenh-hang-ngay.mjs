import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const GOC = join(import.meta.dirname, "..", "..", "..");
const GOI = join(GOC, "package.json");

export function epChayLai(script) {
	return /--force\b/.test(script ?? "");
}

const goc = readFileSync(GOI, "utf8");
const nguyen = JSON.parse(goc).scripts?.test;
if (nguyen === undefined) {
	console.error("KHONG DO DUOC: package.json goc khong co script `test`.");
	process.exit(2);
}

console.log(`chieu xanh — scripts.test = "${nguyen}"`);
if (epChayLai(nguyen)) {
	console.error(
		`DO: lenh hang ngay cua nguoi viet code da bi ep chay lai — "${nguyen}" chua --force. O Never cua ho so cam dung dieu nay: vong lap nhanh la thu ho can, cong moi la cho can su that.`,
	);
	process.exit(1);
}

const ban = JSON.parse(goc);
ban.scripts.test = `${nguyen} --force`;
if (!epChayLai(ban.scripts.test)) {
	console.error(
		"KHONG DO DUOC: cay --force vao ban sao ma phep thu van khong nhan ra — thuoc nay khong bao gio do duoc.",
	);
	process.exit(2);
}
console.log(`chieu do — cay vao ban sao: "${ban.scripts.test}" -> phep thu nhan ra`);

console.log(
	"XANH: lenh hang ngay giu nguyen cache; phep thu co ca hai chieu tren cung mot vat.",
);
