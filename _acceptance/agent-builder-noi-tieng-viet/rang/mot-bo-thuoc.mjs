import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { GOC } from "../../man-cai-dat-noi-tieng-viet/rang/lat.mjs";
import { giuViet } from "../../man-cai-dat-noi-tieng-viet/rang/khoa-cay.mjs";

await giuViet();

const HERE = dirname(fileURLToPath(import.meta.url));
const NGUONG = 12;
const RANG = [
	join(GOC, "_acceptance/man-cai-dat-noi-tieng-viet/rang"),
	join(GOC, "_acceptance/cai-dat-con-lai-noi-tieng-viet/rang"),
];

function dongThuc(duong) {
	return readFileSync(duong, "utf8")
		.split("\n")
		.map((d, i) => ({ so: i + 1, chuan: d.replace(/\s+/g, " ").trim() }))
		.filter((d) => d.chuan !== "" && !d.chuan.startsWith("//") && !d.chuan.startsWith("#"));
}

function tep(thuMuc) {
	return readdirSync(thuMuc)
		.filter((t) => /\.(mjs|sh)$/.test(t))
		.map((t) => join(thuMuc, t));
}

function chotTienDe() {
	const y = readFileSync(join(GOC, "_acceptance/config.yaml"), "utf8");
	const thieu = [];
	for (const d of y.split("\n")) {
		if (!/^\s+ab_[a-z0-9_]+:/.test(d)) continue;
		for (const m of d.matchAll(/_acceptance\/[A-Za-z0-9._/-]+\.(?:mjs|sh)/g))
			if (!existsSync(join(GOC, m[0]))) thieu.push(m[0]);
	}
	if (thieu.length > 0) {
		console.log(
			`KHONG DO DUOC: o cam ab_* tro toi ${thieu.length} script khong co mat: ${[...new Set(thieu)].join(" · ")}.`,
		);
		process.exit(2);
	}
	console.log(`chot tien de: moi script ma o cam ab_* tro toi deu co mat.`);
}

chotTienDe();

const cuaLat = tep(HERE);
const cuaTruoc = RANG.flatMap(tep);
if (cuaLat.length === 0) {
	console.log("KHONG DO DUOC: rang/ cua lat nay khong co script nao. Tap quan sat rong khong bao gio la dat.");
	process.exit(2);
}

const trung = [];
for (const a of cuaLat) {
	const da = dongThuc(a);
	for (const b of cuaTruoc) {
		const db = dongThuc(b);
		const co = new Map();
		for (const d of db) co.set(d.chuan, d.so);
		let dai = 0;
		let dauA = 0;
		let dauB = 0;
		for (let i = 0; i < da.length; i += 1) {
			const j = co.get(da[i].chuan);
			if (j === undefined) {
				dai = 0;
				continue;
			}
			if (dai === 0) {
				dauA = da[i].so;
				dauB = j;
			}
			dai += 1;
			if (dai >= NGUONG)
				trung.push(
					`${a.replace(`${GOC}/`, "")}:${dauA} trung ${b.replace(`${GOC}/`, "")}:${dauB} — ${dai} dong lien tiep`,
				);
		}
	}
}

const nang = new Map();
for (const d of trung) {
	const khoa = d.split(" — ")[0];
	if (!nang.has(khoa)) nang.set(khoa, d);
}

console.log(
	`so ${cuaLat.length} script cua lat nay voi ${cuaTruoc.length} script cua ba lat truoc — nguong ${NGUONG} dong lien tiep.`,
);
for (const d of nang.values()) console.log(`   CHEP: ${d}`);

if (nang.size > 0) process.exit(1);
console.log(`XANH: mot bo thuoc, khong ban chep nao troi.`);
