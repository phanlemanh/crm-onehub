import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const GOC = join(import.meta.dirname, "..", "..", "..");
const XUONG = join(GOC, "_acceptance");
const LAT = "lenh-chung-khong-an-cache-doi";
const NGUONG = 12;

function chan(slug) {
	const thu = join(XUONG, slug, "rang");
	try {
		if (!statSync(thu).isDirectory()) return [];
	} catch {
		return [];
	}
	return readdirSync(thu)
		.filter((t) => /\.(mjs|js|sh)$/.test(t))
		.map((t) => ({ ten: `${slug}/rang/${t}`, dong: locDong(readFileSync(join(thu, t), "utf8")) }));
}

function locDong(nguon) {
	return nguon
		.split("\n")
		.map((d, i) => ({ so: i + 1, chu: d.trim() }))
		.filter((d) => d.chu.length > 3 && !/^[})\];]+;?$/.test(d.chu));
}

function runDaiNhat(a, b) {
	const truoc = new Array(b.length + 1).fill(0);
	let dai = 0;
	let taiA = 0;
	let taiB = 0;
	for (let i = 1; i <= a.length; i += 1) {
		const nay = new Array(b.length + 1).fill(0);
		for (let j = 1; j <= b.length; j += 1) {
			if (a[i - 1].chu === b[j - 1].chu) {
				nay[j] = truoc[j - 1] + 1;
				if (nay[j] > dai) {
					dai = nay[j];
					taiA = a[i - 1].so - dai + 1;
					taiB = b[j - 1].so - dai + 1;
				}
			}
		}
		truoc.splice(0, truoc.length, ...nay);
	}
	return { dai, taiA, taiB };
}

const cuaLat = chan(LAT);
if (cuaLat.length === 0) {
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

console.log(
	`chan cua lat: ${cuaLat.length} · chan cua lat khac: ${khac.length} · nguong: ${NGUONG} dong lien tiep`,
);

const trung = [];
let daiNhat = 0;
for (const a of cuaLat) {
	for (const b of khac) {
		const r = runDaiNhat(a.dong, b.dong);
		if (r.dai > daiNhat) daiNhat = r.dai;
		if (r.dai >= NGUONG)
			trung.push(
				`${a.ten}:${r.taiA} trung ${r.dai} dong lien tiep voi ${b.ten}:${r.taiB}`,
			);
	}
}

console.log(`run dai nhat tim duoc: ${daiNhat} dong`);
if (trung.length > 0) {
	for (const t of trung) console.error(`DO: ${t}`);
	process.exit(1);
}
console.log(
	`XANH: run dai nhat ${daiNhat} dong, duoi nguong ${NGUONG} — dung lai thuoc qua o cam, khong chep.`,
);
