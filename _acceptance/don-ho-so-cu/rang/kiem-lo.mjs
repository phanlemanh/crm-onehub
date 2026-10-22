import { join } from "node:path";
import { hoSoChan } from "./chan-pr.mjs";
import { docJson, HO_SO, KHONG_DUNG } from "./chung.mjs";
import { tapGhim } from "./lo.mjs";
import { tranLan } from "./uoc.mjs";

export function kiemLo({ kk, loGoc, chanPr, lo, tran }) {
	const loi = [];
	const cu = new Set(kk.ho_so.map((h) => h.slug));
	const chanTinhLai = hoSoChan(chanPr.pr_mo, cu);
	if (JSON.stringify(chanTinhLai) !== JSON.stringify(chanPr.chan)) loi.push("chan-pr: danh sach chan khong khop pr_mo da chup");
	const mong = new Set(tapGhim(loGoc, chanTinhLai));
	const dem = new Map();
	for (const l of lo) {
		if (l.uoc_phut > tran) loi.push(`vuot-tran: lo ${l.so} uoc ${l.uoc_phut}′ > ${tran}′`);
		for (const s of l.ho_so) dem.set(s, (dem.get(s) ?? 0) + 1);
	}
	for (const [s, n] of dem) if (n > 1) loi.push(`trung: ${s} o ${n} lo`);
	for (const s of mong) if (!dem.has(s)) loi.push(`thieu: ${s}`);
	for (const s of dem.keys()) if (!mong.has(s)) loi.push(KHONG_DUNG.includes(s) ? `khong-dung: ${s}` : `thua: ${s}`);
	return loi;
}

const dl = {
	kk: docJson(join(HO_SO, "kiem-ke-goc.json")),
	loGoc: docJson(join(HO_SO, "lo-goc.json")).lo,
	chanPr: docJson(join(HO_SO, "chan-pr.json")),
	lo: docJson(join(HO_SO, "lo.json")).lo,
	tran: tranLan(),
};
for (const l of dl.lo) console.log(`lo ${l.so}: ${l.ho_so.length} ho so, uoc ${l.uoc_phut}′`);
const loi = kiemLo(dl);
if (loi.length) {
	console.log(`KET LUAN: do — ${loi.join("; ")}`);
	process.exit(1);
}
const pr0 = dl.chanPr.chan[0];
const ca = [
	["trung", (x) => x.lo[0].ho_so.push(x.lo[0].ho_so[0]), "trung:"],
	["thieu", (x) => x.lo[x.lo.length - 1].ho_so.pop(), "thieu:"],
	["khong-dung", (x) => x.lo[0].ho_so.push(KHONG_DUNG[0]), "khong-dung:"],
	["vuot-tran", (x) => (x.lo[0].uoc_phut = dl.tran + 1), "vuot-tran:"],
	["bo-pr-chan", (x) => (x.chanPr.pr_mo = x.chanPr.pr_mo.filter((p) => p.number !== pr0.number)), "chan-pr:"],
];
let hong = false;
for (const [ten, pha, dau] of ca) {
	const ban = structuredClone(dl);
	pha(ban);
	if (kiemLo(ban).some((x) => x.startsWith(dau))) console.log(`BAT ${ten}`);
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
