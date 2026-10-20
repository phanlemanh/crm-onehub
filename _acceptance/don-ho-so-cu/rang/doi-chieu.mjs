import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { docJson, GOC, HO_SO, kiemKe } from "./chung.mjs";
import { docSoXuLy } from "./khuon-xu-ly.mjs";

function pinMoiNhat(slug) {
	const p = join(GOC, "_acceptance", slug, "run-log.jsonl");
	if (!existsSync(p)) return null;
	let sha = null;
	for (const l of readFileSync(p, "utf8").split("\n")) {
		try {
			const j = JSON.parse(l);
			if (j.kind === "repin" && j.sha) sha = j.sha;
		} catch {}
	}
	return sha;
}

function laHauDue(truoc, sau) {
	return !!sau && spawnSync("git", ["-C", GOC, "merge-base", "--is-ancestor", truoc, sau]).status === 0;
}

export function doiChieu(slugs, cu, dong, pin = pinMoiNhat) {
	const theo = new Map(dong.map((d) => [d.slug, d]));
	const loi = [];
	let tuoi = 0;
	let trongSo = 0;
	for (const s of slugs) {
		const d = theo.get(s);
		if (d?.cach === "sua-thuoc") {
			if (cu.has(s) || !laHauDue(d.commit_sua, pin(s))) loi.push(`sua-thuoc chua ghim: ${s}`);
			else tuoi++;
		} else if (d) trongSo++;
		else if (cu.has(s)) loi.push(`chua xu: ${s}`);
		else tuoi++;
	}
	return { loi, tuoi, trongSo };
}

const lo = docJson(join(HO_SO, "lo.json")).lo;
const slugs = lo.flatMap((l) => l.ho_so);
const so = docSoXuLy(docJson(join(HO_SO, "xu-ly.json")));
const cu = new Set(kiemKe({ slugs }).map((h) => h.slug));
const kq = doiChieu(slugs, cu, so.dong);
console.log(`doi-chieu: ${kq.tuoi} tuoi, ${kq.trongSo} trong so xu ly, ${kq.loi.length} chua xu`);
if (kq.loi.length) {
	console.log(kq.loi.join("\n"));
	console.log("KET LUAN: do");
	process.exit(1);
}
const khongDong = slugs.find((s) => !so.dong.some((d) => d.slug === s));
const tuoiMot = slugs.find((s) => !cu.has(s));
const ca = [
	["bo-dong", doiChieu(slugs, new Set([...cu, khongDong]), so.dong), "chua xu:"],
	[
		"sua-thuoc-chua-ghim",
		doiChieu(slugs, new Set([...cu, tuoiMot]), [...so.dong.filter((d) => d.slug !== tuoiMot), { slug: tuoiMot, cach: "sua-thuoc", commit_sua: "HEAD" }]),
		"sua-thuoc chua ghim:",
	],
];
let hong = false;
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
