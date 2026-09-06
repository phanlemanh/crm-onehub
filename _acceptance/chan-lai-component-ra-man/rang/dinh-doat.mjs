import { readFileSync } from "node:fs";
import { join } from "node:path";

const GOC = join(import.meta.dirname, "..", "..", "..");
const BANG = JSON.parse(
	readFileSync(join(import.meta.dirname, "da-tim-thay.json"), "utf8"),
);
const KHO = join(GOC, "packages/ui/src/lib/messages.ts");

function coKhoa(nguon, khoa) {
	const [nhom, ten] = khoa.split(".");
	const khoi = nguon.split(`\t${nhom}: {`)[1];
	return khoi === undefined ? false : khoi.split("\t},")[0].includes(`${ten}:`);
}

if (BANG.dong.length === 0) {
	console.error(
		"KHONG DO DUOC: bang rong — khong co dong nao de doi chieu dinh doat.",
	);
	process.exit(2);
}

const nguonKho = readFileSync(KHO, "utf8");
const loi = [];
let daVa = 0;
let daKhai = 0;
for (const d of BANG.dong) {
	if (d.dinh_doat === "da va") {
		daVa += 1;
		const nguon = readFileSync(join(GOC, d.file), "utf8");
		if (nguon.includes(`${d.tham_so} = ${JSON.stringify(d.gia_tri_cu)}`))
			loi.push(
				`${d.file}: khai "da va" nhung van con gia tri mac dinh ${JSON.stringify(d.gia_tri_cu)}`,
			);
		if (!nguon.includes(`msg.${d.khoa}`))
			loi.push(`${d.file}: khai "da va" nhung khong doc msg.${d.khoa}`);
		if (!coKhoa(nguonKho, d.khoa))
			loi.push(`${d.file}: khoa ${d.khoa} KHONG co that trong kho chuoi`);
	} else if (d.dinh_doat === "da khai") {
		daKhai += 1;
		if (!d.ly_do)
			loi.push(`${d.file} ${d.tham_so}: khai "da khai" ma khong co ly do doc duoc`);
	} else {
		loi.push(
			`${d.file} ${d.tham_so}: dinh doat "${d.dinh_doat}" khong thuoc hai trang thai cho phep`,
		);
	}
}

console.log(`bang: ${BANG.dong.length} dong · da va ${daVa} · da khai ${daKhai}`);
if (loi.length > 0) {
	for (const l of loi) console.error(`DO: ${l}`);
	process.exit(1);
}
console.log(
	`XANH: ca ${BANG.dong.length} dong deu o dung mot trang thai, moi dong "da va" khong con gia tri mac dinh tieng Anh va tro mot khoa CO THAT.`,
);
