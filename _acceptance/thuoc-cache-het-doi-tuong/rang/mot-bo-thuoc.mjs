import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const GOC = join(import.meta.dirname, "..", "..", "..");
const XUONG = join(GOC, "_acceptance");
const LAT = "thuoc-cache-het-doi-tuong";
const NGUONG = 12;

function doan(nguon) {
	const ra = [];
	let dem = [];
	let bat = 1;
	nguon.split("\n").forEach((d, i) => {
		if (d.trim() === "") {
			if (dem.length > 0) ra.push({ tu: bat, dong: dem });
			dem = [];
			bat = i + 2;
			return;
		}
		if (dem.length === 0) bat = i + 1;
		dem.push(d.trim());
	});
	if (dem.length > 0) ra.push({ tu: bat, dong: dem });
	return ra.filter((k) => k.dong.length >= NGUONG);
}

function chan(slug) {
	const thu = join(XUONG, slug, "rang");
	try {
		if (!statSync(thu).isDirectory()) return [];
	} catch {
		return [];
	}
	return readdirSync(thu)
		.filter((t) => /\.(mjs|js|sh)$/.test(t))
		.map((t) => ({
			ten: `${slug}/rang/${t}`,
			khoi: doan(readFileSync(join(thu, t), "utf8")),
		}));
}

const cua = chan(LAT);
if (cua.length === 0) {
	console.error(`KHONG DO DUOC: lat ${LAT} khong co chan nao.`);
	process.exit(2);
}
const khac = readdirSync(XUONG)
	.filter((t) => t !== LAT)
	.flatMap(chan);
if (khac.length === 0) {
	console.error("KHONG DO DUOC: khong co chan cua lat khac de so.");
	process.exit(2);
}

const bang = new Map();
for (const f of khac)
	for (const k of f.khoi) {
		const khoa = k.dong.join("\n");
		if (!bang.has(khoa)) bang.set(khoa, `${f.ten}:${k.tu}`);
	}

console.log(
	`chan cua lat: ${cua.length} · chan cua lat khac: ${khac.length} · khoi >= ${NGUONG} dong da lap chi muc: ${bang.size}`,
);

const trung = [];
for (const f of cua)
	for (const k of f.khoi) {
		const nguon = bang.get(k.dong.join("\n"));
		if (nguon !== undefined)
			trung.push(`${f.ten}:${k.tu} trung tron mot khoi ${k.dong.length} dong voi ${nguon}`);
	}

if (trung.length > 0) {
	for (const t of trung) console.error(`DO: ${t}`);
	process.exit(1);
}
console.log(
	`XANH: khong khoi liem mach nao tu ${NGUONG} dong tro len cua lat nay trung tron voi mot chan da co.`,
);
