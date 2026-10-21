import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { docJson, GOC, HO_SO, K6A, pinTrongVong } from "./chung.mjs";
import { docSoXuLy } from "./khuon-xu-ly.mjs";

function gh(...args) {
	const r = spawnSync("gh", args, { cwd: GOC, encoding: "utf8" });
	return r.status === 0 ? JSON.parse(r.stdout) : null;
}

export function kiemK6a(coPin, dong, pr411, soVong) {
	const loi = [];
	for (const s of K6A) {
		if (!coPin(s) && !dong.some((d) => d.slug === s && d.cach === "ghim-luoi")) loi.push(`k6a: ${s} khong co luot ghim xanh trong vong va khong co dong ghim-luoi`);
	}
	if (pr411.state !== "CLOSED") loi.push(`k6a: PR 411 dang ${pr411.state}`);
	else if (!pr411.comments.some((c) => c.body.includes(`#${soVong}`))) loi.push(`k6a: PR 411 dong ma khong tro #${soVong}`);
	return loi;
}

const so = docSoXuLy(docJson(join(HO_SO, "xu-ly.json")));
spawnSync("git", ["-C", GOC, "fetch", "-q", "origin", "onehub"]);
const coPin = (s) => pinTrongVong(s, so.base);
const pr411 = gh("pr", "view", "411", "--json", "state,comments");
const prVong = gh("pr", "view", "feat/don-ho-so-cu", "--json", "number");
if (!pr411 || !prVong) {
	console.log("KET LUAN: khong do duoc — khong doc duoc PR 411 hoac PR cua vong");
	process.exit(2);
}
const loi = kiemK6a(coPin, so.dong, pr411, prVong.number);
console.log(`k6a: ${K6A.map((s) => `${s}=${coPin(s) ? "ghim" : so.dong.find((d) => d.slug === s)?.cach ?? "khong"}`).join(", ")}; PR 411 ${pr411.state}`);
if (loi.length) {
	console.log(loi.join("\n"));
	console.log("KET LUAN: do");
	process.exit(1);
}
const ca = [
	["k6a-khong-ghim", kiemK6a(() => false, [], pr411, prVong.number), "k6a: khung"],
	["pr-411-mo", kiemK6a(coPin, so.dong, { ...pr411, state: "OPEN" }, prVong.number), "k6a: PR 411 dang"],
	["khong-tro", kiemK6a(coPin, so.dong, { state: "CLOSED", comments: [{ body: "dong" }] }, prVong.number), "k6a: PR 411 dong ma"],
];
let hong = false;
for (const [ten, l, dau] of ca) {
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
