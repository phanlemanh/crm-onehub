import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { CA_GOI_TEN, docJson, evalsMay, GOC, HO_SO } from "./chung.mjs";
import { tranLan, UOC, uocHoSo } from "./uoc.mjs";

export function tapGhim(kiemKe, xuLy) {
	const choLanChu = new Set(xuLy.filter((d) => d.cach === "cho-lan-chu").map((d) => d.slug));
	const tap = new Set(kiemKe.ho_so.filter((h) => h.nhom === "loc-ap").map((h) => h.slug));
	for (const s of CA_GOI_TEN) tap.add(s);
	return [...tap].filter((s) => !choLanChu.has(s)).sort();
}

export function chiaLo(slugs, uoc, tran) {
	const conLai = tran - UOC.phutSuite;
	const xep = slugs.map((slug) => ({ slug, phut: uoc(slug) })).sort((a, b) => b.phut - a.phut);
	const lo = [];
	for (const h of xep) {
		const cho = lo.find((l) => l.phutEval + h.phut <= conLai);
		if (cho) {
			cho.ho_so.push(h.slug);
			cho.phutEval += h.phut;
		} else lo.push({ ho_so: [h.slug], phutEval: h.phut });
	}
	return lo.map((l, i) => ({ so: i + 1, ho_so: l.ho_so.sort(), uoc_phut: Math.round((UOC.phutSuite + l.phutEval) * 10) / 10 }));
}

if (import.meta.main) {
	const kk = docJson(join(HO_SO, "kiem-ke-goc.json"));
	const pXuLy = join(HO_SO, "xu-ly.json");
	const xuLy = existsSync(pXuLy) ? docJson(pXuLy).dong : [];
	const slugs = tapGhim(kk, xuLy);
	const lo = chiaLo(slugs, (s) => uocHoSo(s, evalsMay(GOC, s)), tranLan());
	writeFileSync(join(HO_SO, "lo.json"), `${JSON.stringify({ sha_goc: kk.sha, tran_phut: tranLan(), lo }, null, 2)}\n`);
	for (const l of lo) console.log(`lo ${l.so}: ${l.ho_so.length} ho so, uoc ${l.uoc_phut}′`);
}
