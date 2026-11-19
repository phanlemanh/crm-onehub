import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { GOC, SLUG, git } from "./kit.mjs";

const lay = (co) => {
	const i = process.argv.indexOf(co);
	return i > 0 ? process.argv[i + 1] : null;
};
const doc = (t) => JSON.parse(readFileSync(t, "utf8"));
const tip = doc(lay("--tip"));
const chinh = doc(lay("--chinh"));
const gia = doc(lay("--gop-gia"));
const ghim = (lay("--ghim") ?? "").split(",").filter(Boolean);
const truocSua = lay("--truoc-sua") ? doc(lay("--truoc-sua")) : null;

const lop = {};
for (const [e, x] of Object.entries(tip.ketQua)) {
	if (x.dat) continue;
	if (chinh.ketQua[e] && !chinh.ketQua[e].dat) lop[e] = "do-ca-hai";
	else if (gia.ketQua[e]?.dat) lop[e] = "doi-nhanh";
	else lop[e] = "do-vi-vong";
}
const ra = {
	sha_tip: tip.sha,
	sha_nhanh_chinh: chinh.sha,
	sha_gop_gia: gia.sha,
	ung_vien: Object.keys(tip.ketQua).sort(),
	tip: tip.ketQua,
	nhanh_chinh: chinh.ketQua,
	gop_gia: gia.ketQua,
	lop,
	ghim,
	do_truoc_sua: truocSua ? Object.entries(truocSua.ketQua).filter(([e, x]) => !x.dat && ghim.includes(e.split("/")[0])).map(([e]) => e) : [],
};
const dich = join(GOC, "_acceptance", SLUG, "evidence", "phan-loai-ghim.json");
writeFileSync(dich, `${JSON.stringify(ra, null, 1)}\n`);
const dem = Object.values(lop).reduce((a, l) => ({ ...a, [l]: (a[l] ?? 0) + 1 }), {});
console.log(`phan-loai: tip ${tip.sha.slice(0, 8)} · ${ra.ung_vien.length} ứng viên · ${JSON.stringify(dem)} · ghim ${ghim.join(",") || "0"}`);
if (git(GOC, "rev-parse", "HEAD").trim() !== tip.sha) console.log("chú ý: HEAD khác sha tip của lượt chạy");
