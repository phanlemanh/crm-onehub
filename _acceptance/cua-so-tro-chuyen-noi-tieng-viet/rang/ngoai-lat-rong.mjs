import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { GOC } from "../../man-cai-dat-noi-tieng-viet/rang/lat.mjs";

const KHAI = join(GOC, "_acceptance/agent-builder-noi-tieng-viet/rang/khong-dich-cua-lat.json");

let b;
try {
	b = JSON.parse(readFileSync(KHAI, "utf8"));
} catch {
	console.log(`KHONG DO DUOC: khong doc duoc ban khai khong-dich cua ho so dot mot tai ${KHAI}.`);
	process.exit(2);
}

if (b.ngoai_lat === undefined) {
	console.log(
		"DO: khoi ngoai_lat VANG MAT khoi ban khai dot mot — day la duong sach-gia re nhat.",
		"\n   Khoi phai HIEN DIEN va rong, de nguoi doc thay dot hai da dong no chu khong phai ai do xoa di.",
	);
	process.exit(1);
}

const con = (b.ngoai_lat.khoi ?? []).flatMap((k) => k.chuoi ?? []);
console.log(`khoi ngoai_lat cua dot mot: hien dien · ${con.length} chuoi con lai`);
for (const c of con) console.log(`   CON: ${JSON.stringify(c)}`);
if (con.length > 0) {
	console.log(
		"DO: dot hai da dich sau file do, nen khong chuoi nao duoc con o day.",
	);
	process.exit(1);
}

const ra = execFileSync(
	"node",
	[join(GOC, "_acceptance/agent-builder-noi-tieng-viet/rang/man-that.mjs"), "hai-tieng"],
	{ cwd: GOC, encoding: "utf8", env: process.env },
);
const so = ra.match(/ngoai lat=(\d+)/);
if (so === null) {
	console.log("KHONG DO DUOC: chan man cua dot mot khong in ra so 'ngoai lat' — khong doc duoc ket qua.");
	process.exit(2);
}
const soPhanCach = (b.ngoai_lat.mien_dau ?? []).length;
if (Number(so[1]) !== soPhanCach) {
	console.log(
		`DO: chan man cua dot mot thay ${so[1]} muc ngoai lat, dang le chi con ${soPhanCach} dau phan cach — man /chat con lan hai thu tieng.`,
	);
	process.exit(1);
}
console.log(
	`XANH: khoi hien dien va rong; chan man cua dot mot chi con ${soPhanCach} dau phan cach, khong chuoi tieng Anh nao — man /chat da thuan tieng Viet.`,
);
process.exit(0);
