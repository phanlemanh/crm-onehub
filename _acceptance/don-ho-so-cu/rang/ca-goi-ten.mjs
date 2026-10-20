import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { CA_GOI_TEN, docJson, GOC, HO_SO, kiemKe } from "./chung.mjs";
import { docSoXuLy } from "./khuon-xu-ly.mjs";

const K6A = ["khung-khong-con-dung-chu", "lich-su-va-luu-tru-trang"];

function gh(...args) {
	const r = spawnSync("gh", args, { cwd: GOC, encoding: "utf8" });
	if (r.status !== 0) return null;
	return JSON.parse(r.stdout);
}

export function kiemCa(ds, cu, dong, coThuMuc = (s) => existsSync(join(GOC, "_acceptance", s))) {
	const theo = new Map(dong.map((d) => [d.slug, d]));
	const loi = [];
	let dat = 0;
	for (const s of ds) {
		const d = theo.get(s);
		if (!coThuMuc(s)) loi.push(`ca-khong-co-that: ${s}`);
		else if (s === "tac-nhan-va" && cu.has(s) && d?.cach !== "loi-kit") loi.push("tac-nhan-va: con cu ma khong co dong loi-kit");
		else if (K6A.includes(s) && cu.has(s)) loi.push(`k6a: ${s} con cu`);
		else if (cu.has(s) && !d) loi.push(`chua xu: ${s}`);
		else dat++;
	}
	return { loi, dat };
}

const so = docSoXuLy(docJson(join(HO_SO, "xu-ly.json")));
const cu = new Set(kiemKe({ slugs: CA_GOI_TEN }).map((h) => h.slug));
const kq = kiemCa(CA_GOI_TEN, cu, so.dong);
const pr411 = gh("pr", "view", "411", "--json", "state,comments");
const prVong = gh("pr", "view", "feat/don-ho-so-cu", "--json", "number");
if (!pr411 || !prVong) {
	console.log("KET LUAN: khong do duoc — khong doc duoc PR 411 hoac PR cua vong");
	process.exit(2);
}
if (pr411.state !== "CLOSED") kq.loi.push(`k6a: PR 411 dang ${pr411.state}`);
else if (!pr411.comments.some((c) => c.body.includes(`#${prVong.number}`))) kq.loi.push(`k6a: PR 411 dong ma khong tro #${prVong.number}`);
console.log(`ca-goi-ten: ${kq.dat}/${CA_GOI_TEN.length} dat`);
if (kq.loi.length || kq.dat !== CA_GOI_TEN.length) {
	console.log(kq.loi.join("\n"));
	console.log("KET LUAN: do");
	process.exit(1);
}
const ca = [
	["ca-khong-co-that", kiemCa([...CA_GOI_TEN, "khong-co-that"], cu, so.dong), "ca-khong-co-that:"],
	["tac-nhan-va", kiemCa(CA_GOI_TEN, new Set([...cu, "tac-nhan-va"]), so.dong.filter((d) => d.slug !== "tac-nhan-va")), "tac-nhan-va:"],
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
