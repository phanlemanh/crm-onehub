import { readFileSync } from "node:fs";
import { join } from "node:path";
import { chayBoVe, docMoNguyenBan } from "./mo-nguyen-ban.mjs";

const GOC = join(import.meta.dirname, "..", "..", "..");
const BAN_KHAI = join(
	GOC,
	"_acceptance/chu-mac-dinh-thu-vien-ngoai/rang/gioi-han-bam-moi-hien.json",
);

chayBoVe();
const may = docMoNguyenBan();
if (may === null) {
	console.error(
		"KHONG DO DUOC: khong co tao pham mo-nguyen-ban.json — doi chieu voi mot tao pham khong ton tai thi khong duoc xanh.",
	);
	process.exit(2);
}

const khai = JSON.parse(readFileSync(BAN_KHAI, "utf8"));
if (khai.da_do === undefined) {
	console.error(
		"DO: ban khai vong truoc chua co khoi da_do — no van tu nhan la chua do duoc trong khi phep do da co.",
	);
	process.exit(1);
}
if (khai.ghi_chu.includes("KHONG voi toi")) {
	console.error(
		"DO: ghi chu cua ban khai van tu nhan la phep do KHONG voi toi.",
	);
	process.exit(1);
}
if (khai.da_do.ho_so !== "chan-lai-component-ra-man") {
	console.error(
		`DO: khoi da_do tro ho so "${khai.da_do.ho_so}" chu khong tro ho so da do that.`,
	);
	process.exit(1);
}

const tenMay = Object.keys(may).sort();
const tenKhai = Object.keys(khai.da_do.ket_qua).sort();
const lech = [];
if (tenMay.join("|") !== tenKhai.join("|"))
	lech.push(
		`tap dong lech — may do ${tenMay.length} dong, ban khai ke ${tenKhai.length} dong`,
	);
for (const t of tenMay) {
	const thatSu = may[t].chu.length === 0 ? "rong" : `co ${may[t].chu.length} chuoi`;
	const daKhai = khai.da_do.ket_qua[t];
	if (daKhai === undefined) lech.push(`dong ${t}: may do "${thatSu}" ma ban khai khong ke`);
	else if (daKhai !== thatSu)
		lech.push(`dong ${t}: ban khai ghi "${daKhai}" ma may do "${thatSu}"`);
}

console.log(`may do ${tenMay.length} dong · ban khai ke ${tenKhai.length} dong`);
if (lech.length > 0) {
	for (const l of lech) console.error(`DO: ${l}`);
	process.exit(1);
}
for (const t of tenMay) console.log(`  ${t}  ${khai.da_do.ket_qua[t]}`);
console.log(
	`XANH: tung dong cua ban khai vong truoc khop DUNG dau ra cua may — khong dong nao go tay.`,
);
