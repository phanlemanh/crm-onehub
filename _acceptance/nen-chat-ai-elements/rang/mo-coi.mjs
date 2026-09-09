import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "..", "..", "..");
const THU_MUC = join(GOC, "packages", "ui", "src", "components", "ai-elements");
const UNG_DUNG = join(GOC, "apps");
const DUOI_QUET = [".tsx", ".ts", ".jsx", ".js", ".mjs", ".cjs"];
const BO_QUA = new Set([
	"node_modules",
	".next",
	".turbo",
	".git",
	"dist",
	"build",
	"coverage",
]);

function boCuoc(loi) {
	console.log(`KHONG DO DUOC: ${loi}`);
	process.exit(2);
}

function liet(thuMuc) {
	try {
		return readdirSync(thuMuc, { withFileTypes: true });
	} catch {
		return null;
	}
}

function ten(tep) {
	return tep.replace(/\.tsx$/, "");
}

function ghim(chuoi) {
	return chuoi.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const mucAiElements = liet(THU_MUC);
if (mucAiElements === null) {
	boCuoc(
		`khong doc duoc thu muc ${relative(GOC, THU_MUC)} — khong co tap quan sat`,
	);
}

const tep = mucAiElements
	.filter((d) => d.isFile() && d.name.endsWith(".tsx"))
	.map((d) => d.name)
	.sort();

if (tep.length === 0) {
	boCuoc(
		`${relative(GOC, THU_MUC)} khong co tep .tsx nao — tap rong khong phai la sach`,
	);
}

const coTep = new Set(tep);

function gom(thuMuc, kho) {
	const muc = liet(thuMuc);
	if (muc === null) return false;
	for (const d of muc) {
		if (BO_QUA.has(d.name)) continue;
		const duong = join(thuMuc, d.name);
		if (d.isDirectory()) {
			if (!gom(duong, kho)) return false;
			continue;
		}
		if (!d.isFile()) continue;
		if (!DUOI_QUET.some((x) => d.name.endsWith(x))) continue;
		kho.push(readFileSync(duong, "utf8"));
	}
	return true;
}

const khoUngDung = [];
if (!gom(UNG_DUNG, khoUngDung)) {
	boCuoc(
		`khong doc duoc thu muc ${relative(GOC, UNG_DUNG)} — khong gieo duoc hat`,
	);
}
const chuUngDung = khoUngDung.join("\n");

const hat = tep.filter((t) =>
	new RegExp(`@crm/ui/components/ai-elements/${ghim(ten(t))}(?![\\w-])`).test(
		chuUngDung,
	),
);

function giai(tuTep, khai) {
	const dich = resolve(dirname(join(THU_MUC, tuTep)), khai);
	for (const duoi of ["", ".tsx", "/index.tsx"]) {
		const day = `${dich}${duoi}`;
		if (dirname(day) !== THU_MUC) continue;
		const la = day.slice(THU_MUC.length + 1);
		if (coTep.has(la)) return la;
	}
	return null;
}

const canh = new Map();
for (const t of tep) {
	const nguon = readFileSync(join(THU_MUC, t), "utf8");
	const den = new Set();
	const khais = [
		...nguon.matchAll(/from\s+["'](\.[^"']*)["']/g),
		...nguon.matchAll(/import\s*\(\s*["'](\.[^"']*)["']\s*\)/g),
		...nguon.matchAll(/^\s*import\s+["'](\.[^"']*)["']/gm),
	];
	for (const m of khais) {
		const dich = giai(t, m[1]);
		if (dich && dich !== t) den.add(dich);
	}
	canh.set(t, den);
}

const song = new Set(hat);
const hangDoi = [...hat];
while (hangDoi.length > 0) {
	const t = hangDoi.shift();
	for (const d of canh.get(t) ?? []) {
		if (song.has(d)) continue;
		song.add(d);
		hangDoi.push(d);
	}
}

const chet = tep.filter((t) => !song.has(t));
const songSap = [...song].sort();

console.log(
	`do thi nhap ${relative(GOC, THU_MUC)}: ${tep.length} tep .tsx, gieo tu ${hat.length} tep duoc apps/** nhap`,
);
console.log(`SONG (${songSap.length}):`);
for (const t of songSap) {
	const nhapBoi = tep.filter((x) => song.has(x) && canh.get(x)?.has(t));
	const boi = hat.includes(t)
		? "apps/** nhap thang"
		: `${nhapBoi.join(", ")} nhap qua duong tuong doi`;
	console.log(`   ${t} — ${boi}`);
}
console.log(`CHET (${chet.length}):`);
for (const t of chet) {
	console.log(
		`   MO COI: ${t} — không khả đạt tu apps/**, khong tep song nao nhap no`,
	);
}

if (chet.length > 0) {
	console.log(
		`DO: ${chet.length}/${tep.length} tep khong kha dat trong ${relative(GOC, THU_MUC)} — xoa chung, hoac noi chung vao cay nhap`,
	);
	process.exit(1);
}

console.log(
	`XANH: ca ${tep.length} tep trong ${relative(GOC, THU_MUC)} deu kha dat tu apps/**, khong co mo coi.`,
);
