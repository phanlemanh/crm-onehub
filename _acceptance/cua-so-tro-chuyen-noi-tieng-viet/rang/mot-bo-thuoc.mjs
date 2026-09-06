import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { GOC } from "../../man-cai-dat-noi-tieng-viet/rang/lat.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const NGUONG = 12;
const KHAC = [
	"_acceptance/man-cai-dat-noi-tieng-viet/rang",
	"_acceptance/cai-dat-con-lai-noi-tieng-viet/rang",
	"_acceptance/agent-builder-noi-tieng-viet/rang",
	"_acceptance/cua-vao-noi-tieng-viet/rang",
];

function thanMoDun(duong) {
	return readFileSync(duong, "utf8")
		.split("\n")
		.map((d) => d.trim())
		.filter(
			(d) =>
				d.length > 0 &&
				!d.startsWith("import ") &&
				!d.startsWith("//") &&
				!d.startsWith("#") &&
				!/^[)\]}",;]+$/.test(d),
		);
}

function scriptCua(thuMuc) {
	const day = join(GOC, thuMuc);
	try {
		return readdirSync(day)
			.filter((t) => /\.(mjs|sh)$/.test(t))
			.map((t) => ({ ten: `${thuMuc}/${t}`, dong: thanMoDun(join(day, t)) }));
	} catch {
		return [];
	}
}

const cuaLat = readdirSync(HERE)
	.filter((t) => /\.(mjs|sh)$/.test(t))
	.map((t) => ({ ten: t, dong: thanMoDun(join(HERE, t)) }));

const cuaKhac = KHAC.flatMap(scriptCua);
if (cuaLat.length === 0 || cuaKhac.length === 0) {
	console.log(
		`KHONG DO DUOC: khong doc duoc du script de so — lat nay ${cuaLat.length}, cac lat truoc ${cuaKhac.length}.`,
	);
	process.exit(2);
}

const trung = [];
for (const a of cuaLat)
	for (const b of cuaKhac) {
		const cua = new Set();
		for (let i = 0; i + NGUONG <= b.dong.length; i += 1)
			cua.add(b.dong.slice(i, i + NGUONG).join(""));
		for (let i = 0; i + NGUONG <= a.dong.length; i += 1)
			if (cua.has(a.dong.slice(i, i + NGUONG).join(""))) {
				trung.push(
					`${a.ten} trung ${NGUONG} dong lien tiep voi ${b.ten} (bat dau dong ${i + 1})`,
				);
				break;
			}
	}

console.log(
	`so ${cuaLat.length} script cua lat nay voi ${cuaKhac.length} script cua bon lat truoc — nguong ${NGUONG} dong lien tiep, bo qua dong import va dau dong.`,
);
for (const d of trung) console.log(`   TRUNG: ${d}`);
if (trung.length > 0) process.exit(1);
console.log("XANH: mot bo thuoc, khong ban chep nao troi.");
process.exit(0);
