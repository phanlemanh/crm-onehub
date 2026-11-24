import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { GOC, SLUG } from "./kit.mjs";

const lay = (co) => {
	const i = process.argv.indexOf(co);
	return i > 0 ? process.argv[i + 1] : null;
};
const doc = (t) => JSON.parse(readFileSync(t, "utf8"));
const tip = doc(lay("--tip"));
const chinh = doc(lay("--chinh"));
const gia = lay("--gop-gia") ? doc(lay("--gop-gia")) : null;

const lop = {};
for (const [e, x] of Object.entries(tip.ketQua)) {
	if (x.dat) continue;
	lop[e] = chinh.ketQua[e] && !chinh.ketQua[e].dat ? "do-ca-hai" : "do-vi-vong";
}
const ra = {
	sha_tip: tip.sha,
	sha_nhanh_chinh: chinh.sha,
	ung_vien: Object.keys(tip.ketQua).sort(),
	tip: tip.ketQua,
	nhanh_chinh: chinh.ketQua,
	lop,
};
if (gia) {
	ra.sha_gop_gia = gia.sha;
	ra.gop_gia = gia.ketQua;
}
writeFileSync(join(GOC, "_acceptance", SLUG, "evidence", "phan-loai.json"), `${JSON.stringify(ra, null, 1)}\n`);
const dem = Object.values(lop).reduce((a, l) => ({ ...a, [l]: (a[l] ?? 0) + 1 }), {});
console.log(`phan-loai: tip ${tip.sha.slice(0, 8)} · ${ra.ung_vien.length} ứng viên · ${JSON.stringify(dem)}`);
for (const [e, l] of Object.entries(lop)) if (l === "do-vi-vong") console.log(`do-vi-vong ${e}${gia?.ketQua[e] ? ` · gộp giả ${gia.ketQua[e].dat ? "xanh" : "đỏ"}` : ""}`);
