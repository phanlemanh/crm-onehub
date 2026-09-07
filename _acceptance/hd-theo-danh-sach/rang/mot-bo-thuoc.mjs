import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const GOC = join(import.meta.dirname, "..", "..", "..");
const XUONG = join(GOC, "_acceptance");
const LAT = "hd-theo-danh-sach";
const CUA_SO = 12;

function chuan(nguon) {
	return nguon
		.split("\n")
		.map((d, i) => [i + 1, d.replace(/\s+/g, " ").trim()])
		.filter(([, c]) => c.length > 4 && !/^[)}\];]+;?$/.test(c));
}

function dauVan(duong) {
	const dong = chuan(readFileSync(duong, "utf8"));
	const ra = [];
	for (let i = 0; i + CUA_SO <= dong.length; i += 1) {
		const cua = dong.slice(i, i + CUA_SO);
		ra.push([
			createHash("md5").update(cua.map(([, c]) => c).join("")).digest("base64"),
			cua[0][0],
		]);
	}
	return ra;
}

function chanCua(slug) {
	const thu = join(XUONG, slug, "rang");
	try {
		if (!statSync(thu).isDirectory()) return [];
	} catch {
		return [];
	}
	return readdirSync(thu)
		.filter((t) => /\.(mjs|js|sh)$/.test(t))
		.map((t) => ({ nhan: `${slug}/rang/${t}`, van: dauVan(join(thu, t)) }));
}

const cua = chanCua(LAT);
if (cua.length === 0) {
	console.error(`KHONG DO DUOC: lat ${LAT} chua co chan nao.`);
	process.exit(2);
}
const khac = readdirSync(XUONG).filter((t) => t !== LAT).flatMap(chanCua);
if (khac.length === 0) {
	console.error("KHONG DO DUOC: khong lat nao khac de doi chieu.");
	process.exit(2);
}

const soTay = new Map();
for (const f of khac)
	for (const [bam, dong] of f.van) if (!soTay.has(bam)) soTay.set(bam, `${f.nhan}:${dong}`);

console.log(
	`chan cua lat: ${cua.length} · chan doi chieu: ${khac.length} · dau van ${CUA_SO} dong: ${soTay.size}`,
);

const va = [];
for (const f of cua)
	for (const [bam, dong] of f.van) {
		const noi = soTay.get(bam);
		if (noi !== undefined) va.push(`${f.nhan}:${dong} co dau van trung voi ${noi}`);
	}

if (va.length > 0) {
	for (const v of va) console.error(`DO: ${v}`);
	process.exit(1);
}
console.log(`XANH: khong cua so ${CUA_SO} dong nao cua lat nay trung dau van voi mot chan da co.`);
