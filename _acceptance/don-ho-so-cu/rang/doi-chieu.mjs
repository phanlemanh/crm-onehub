import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { docJson, GOC, HO_SO, laHauDue, pinTren } from "./chung.mjs";
import { docSoXuLy } from "./khuon-xu-ly.mjs";

export function doiChieu(slugs, base, dong, layPin = pinTren) {
	const theo = new Map();
	for (const d of dong) theo.set(d.slug, [...(theo.get(d.slug) ?? []), d]);
	const loi = [];
	let ghim = 0;
	let trongSo = 0;
	for (const s of slugs) {
		const ds = theo.get(s) ?? [];
		const pins = layPin(s);
		const sua = ds.filter((d) => d.cach === "sua-thuoc");
		if (sua.length) {
			if (sua.every((d) => pins.some((p) => laHauDue(d.commit_sua, p.sha)))) ghim++;
			else loi.push(`sua-thuoc chua ghim: ${s}`);
		} else if (pins.some((p) => laHauDue(base, p.sha))) ghim++;
		else if (ds.length) trongSo++;
		else loi.push(`chua xu: ${s}`);
	}
	return { loi, ghim, trongSo };
}

const lo = docJson(join(HO_SO, "lo.json")).lo;
const slugs = lo.flatMap((l) => l.ho_so);
const so = docSoXuLy(docJson(join(HO_SO, "xu-ly.json")));
spawnSync("git", ["-C", GOC, "fetch", "-q", "origin", "onehub"]);
const kq = doiChieu(slugs, so.base, so.dong);
console.log(`doi-chieu: ${kq.ghim} co luot ghim xanh tren onehub trong vong, ${kq.trongSo} trong so xu ly, ${kq.loi.length} chua xu`);
if (kq.loi.length) {
	console.log(kq.loi.join("\n"));
	console.log("KET LUAN: do");
	process.exit(1);
}
const coPin = slugs.find((s) => pinTren(s).some((p) => laHauDue(so.base, p.sha)) && !so.dong.some((d) => d.slug === s));
const ca = [
	["bo-pin", doiChieu(slugs, so.base, so.dong, (s) => (s === coPin ? [] : pinTren(s))), "chua xu:"],
	[
		"sua-thuoc-chua-ghim",
		doiChieu(slugs, so.base, [...so.dong.filter((d) => d.slug !== coPin), { slug: coPin, cach: "sua-thuoc", commit_sua: "HEAD" }]),
		"sua-thuoc chua ghim:",
	],
	[
		"sua-thuoc-sau-dong-khac",
		doiChieu(slugs, so.base, [...so.dong.filter((d) => d.slug !== coPin), { slug: coPin, cach: "sua-thuoc", commit_sua: "HEAD" }, { slug: coPin, cach: "ngoai-pham-vi" }]),
		"sua-thuoc chua ghim:",
	],
];
let hong = !coPin;
if (!coPin) console.log("thuoc hong: khong co ho so nao co pin de dung ca do");
for (const [ten, r, dau] of ca) {
	if (r.loi.some((x) => x.startsWith(dau))) console.log(`BAT ${ten}`);
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
