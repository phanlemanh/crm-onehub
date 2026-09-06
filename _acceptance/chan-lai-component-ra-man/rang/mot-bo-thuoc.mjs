import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const GOC = join(import.meta.dirname, "..", "..", "..");
const XUONG = join(GOC, "_acceptance");
const LAT = "chan-lai-component-ra-man";
const DAI = 12;

function chanCua(slug) {
	const thu = join(XUONG, slug, "rang");
	try {
		if (!statSync(thu).isDirectory()) return [];
	} catch {
		return [];
	}
	return readdirSync(thu)
		.filter((t) => /\.(mjs|js|sh)$/.test(t))
		.map((t) => ({ slug, ten: t, duong: join(thu, t) }));
}

function donDong(nguon) {
	return nguon
		.split("\n")
		.map((d, i) => ({ so: i + 1, chu: d.trim() }))
		.filter((d) => d.chu.length > 3 && d.chu !== "});" && d.chu !== "}");
}

function manh(dong) {
	const ra = new Map();
	for (let i = 0; i + DAI <= dong.length; i += 1) {
		const khoi = dong.slice(i, i + DAI).map((d) => d.chu).join("\n");
		const bam = createHash("sha1").update(khoi).digest("hex");
		if (!ra.has(bam)) ra.set(bam, dong[i].so);
	}
	return ra;
}

const cuaLat = chanCua(LAT);
if (cuaLat.length === 0) {
	console.error(`KHONG DO DUOC: lat ${LAT} khong co chan nao de so.`);
	process.exit(2);
}

const khac = readdirSync(XUONG)
	.filter((t) => t !== LAT)
	.flatMap(chanCua);
if (khac.length === 0) {
	console.error("KHONG DO DUOC: khong co chan nao cua lat khac de so.");
	process.exit(2);
}

const bangKhac = new Map();
for (const c of khac) {
	for (const [bam, so] of manh(donDong(readFileSync(c.duong, "utf8")))) {
		if (!bangKhac.has(bam)) bangKhac.set(bam, `${c.slug}/rang/${c.ten}:${so}`);
	}
}

console.log(
	`chan cua lat: ${cuaLat.length} · chan cua lat khac: ${khac.length} · khoi ${DAI} dong da lap chi muc: ${bangKhac.size}`,
);

const trung = [];
for (const c of cuaLat) {
	for (const [bam, so] of manh(donDong(readFileSync(c.duong, "utf8")))) {
		const nguon = bangKhac.get(bam);
		if (nguon !== undefined)
			trung.push(`${LAT}/rang/${c.ten}:${so} trung ${DAI} dong voi ${nguon}`);
	}
}

if (trung.length > 0) {
	for (const t of trung) console.error(`DO: ${t}`);
	process.exit(1);
}
console.log(
	`XANH: khong khoi ${DAI} dong nao cua lat nay trung voi mot chan da co — dung lai thuoc qua o cam, khong chep.`,
);
