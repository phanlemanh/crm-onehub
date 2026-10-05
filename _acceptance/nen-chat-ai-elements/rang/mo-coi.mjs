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
	".eve",
	".output",
]);

const MIEN_TRU = [];
MIEN_TRU.push(
	{
		tep: "artifact.tsx",
		ly_do:
			"bộ xương Kara K1 (bo-xuong-kara) — KaraArtifact dựng trên nó, chưa màn nào trong apps/** nối tới trước 14/10",
		het_han: "K2 soan-okr-trang-rieng gộp — K2 nối màn Soạn OKR thì xoá mục này",
	},
	{
		tep: "task.tsx",
		ly_do:
			"bộ xương Kara K1 (bo-xuong-kara) — KaraSteps dựng trên nó, chưa màn nào trong apps/** nối tới trước 14/10",
		het_han: "K2 soan-okr-trang-rieng gộp — K2 nối màn Soạn OKR thì xoá mục này",
	},
);

const boMienTru = new Map(MIEN_TRU.map((m) => [m.tep, m]));

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
		if (BO_QUA.has(d.name) || d.name.startsWith(".next")) continue;
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

const nhapAiElements = (chu, t) =>
	new RegExp(`@crm/ui/components/ai-elements/${ghim(ten(t))}(?![\\w-])`).test(
		chu,
	);

const thang = tep.filter((t) => nhapAiElements(chuUngDung, t));

const THANH_PHAN = dirname(THU_MUC);
const cau = (liet(THANH_PHAN) ?? [])
	.filter((d) => d.isFile() && d.name.endsWith(".tsx"))
	.map((d) => d.name)
	.filter((c) =>
		new RegExp(`@crm/ui/components/${ghim(ten(c))}(?![\\w/-])`).test(
			chuUngDung,
		),
	);
const quaCau = new Map();
for (const c of cau) {
	const nguon = readFileSync(join(THANH_PHAN, c), "utf8");
	for (const t of tep) {
		if (!quaCau.has(t) && nhapAiElements(nguon, t)) quaCau.set(t, c);
	}
}

const hat = tep.filter((t) => thang.includes(t) || quaCau.has(t));

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

const moCoi = tep.filter((t) => !song.has(t));
const mienTru = moCoi.filter((t) => boMienTru.has(t));
const chet = moCoi.filter((t) => !boMienTru.has(t));
const mienTruThua = MIEN_TRU.filter((m) => !moCoi.includes(m.tep));
const songSap = [...song].sort();

console.log(
	`do thi nhap ${relative(GOC, THU_MUC)}: ${tep.length} tep .tsx, gieo tu ${hat.length} tep duoc apps/** nhap`,
);
console.log(`SONG (${songSap.length}):`);
for (const t of songSap) {
	const nhapBoi = tep.filter((x) => song.has(x) && canh.get(x)?.has(t));
	const boi = thang.includes(t)
		? "apps/** nhap thang"
		: quaCau.has(t)
			? `${quaCau.get(t)} (apps/** nhap) nhap qua @crm/ui`
			: `${nhapBoi.join(", ")} nhap qua duong tuong doi`;
	console.log(`   ${t} — ${boi}`);
}
console.log(`MIEN TRU (${mienTru.length}):`);
for (const t of mienTru) {
	const m = boMienTru.get(t);
	console.log(`   ${t} — miễn trừ: ${m.ly_do}`);
	console.log(`      het han: ${m.het_han}`);
}
for (const m of mienTruThua) {
	console.log(
		`   MIEN TRU THUA: ${m.tep} — khai trong MIEN_TRU nhung khong con mo coi (hoac khong con trong cay); xoa muc nay khoi script`,
	);
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
	`XANH: ${tep.length} tep trong ${relative(GOC, THU_MUC)} — ${song.size} kha dat tu apps/**, ${mienTru.length} mien tru co ten, khong mo coi nao ngoai danh sach mien tru.`,
);
