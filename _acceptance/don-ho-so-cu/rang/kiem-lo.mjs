import { existsSync } from "node:fs";
import { join } from "node:path";
import { docJson, HO_SO } from "./chung.mjs";
import { tapGhim } from "./lo.mjs";
import { tranLan } from "./uoc.mjs";

export function kiemLo(kk, lo, xuLy, tran) {
	const loi = [];
	const mong = new Set(tapGhim(kk, xuLy));
	const thieuPaths = new Set(kk.ho_so.filter((h) => h.nhom !== "loc-ap").map((h) => h.slug));
	const dem = new Map();
	for (const l of lo) {
		if (l.uoc_phut > tran) loi.push(`vuot-tran: lo ${l.so} uoc ${l.uoc_phut}′ > ${tran}′`);
		for (const s of l.ho_so) dem.set(s, (dem.get(s) ?? 0) + 1);
	}
	for (const [s, n] of dem) if (n > 1) loi.push(`trung: ${s} o ${n} lo`);
	for (const s of mong) if (!dem.has(s)) loi.push(`thieu: ${s}`);
	for (const s of dem.keys()) {
		if (!mong.has(s)) loi.push(thieuPaths.has(s) ? `thieu-paths: ${s} khong thuoc ca goi ten` : `thua: ${s}`);
	}
	return loi;
}

const kk = docJson(join(HO_SO, "kiem-ke-goc.json"));
const lo = docJson(join(HO_SO, "lo.json")).lo;
const pXuLy = join(HO_SO, "xu-ly.json");
const xuLy = existsSync(pXuLy) ? docJson(pXuLy).dong : [];
const tran = tranLan();
for (const l of lo) console.log(`lo ${l.so}: ${l.ho_so.length} ho so, uoc ${l.uoc_phut}′`);
const loi = kiemLo(kk, lo, xuLy, tran);
if (loi.length) {
	console.log(`KET LUAN: do — ${loi.join("; ")}`);
	process.exit(1);
}
const thieuPaths = kk.ho_so.find((h) => h.nhom !== "loc-ap" && !lo.some((l) => l.ho_so.includes(h.slug)));
const ca = [
	["trung", (x) => x[0].ho_so.push(x[0].ho_so[0]), "trung:"],
	["thieu", (x) => x[x.length - 1].ho_so.pop(), "thieu:"],
	["thieu-paths", (x) => x[0].ho_so.push(thieuPaths?.slug ?? "khong-co-that"), thieuPaths ? "thieu-paths:" : "thua:"],
	["vuot-tran", (x) => (x[0].uoc_phut = tran + 1), "vuot-tran:"],
];
let hong = false;
for (const [ten, pha1, dau] of ca) {
	const ban = structuredClone(lo);
	pha1(ban);
	const l = kiemLo(kk, ban, xuLy, tran);
	if (l.some((x) => x.startsWith(dau))) console.log(`BAT ${ten}`);
	else {
		console.log(`thuoc hong: ${ten}`);
		hong = true;
	}
}
if (hong) {
	console.log("KET LUAN: do — thuoc hong");
	process.exit(1);
}
console.log("KET LUAN: xanh");
