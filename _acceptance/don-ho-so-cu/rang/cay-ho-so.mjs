import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { DA_KY, docJson, git, GOC, HO_SO, SLUG } from "./chung.mjs";
import { docSoXuLy } from "./khuon-xu-ly.mjs";

const TEP_SO = new Set(["run-log.jsonl", "evidence-report.md", "decisions.jsonl"]);

function trangThaiTai(sha, slug) {
	const r = spawnSync("git", ["-C", GOC, "show", `${sha}:_acceptance/${slug}/contract.md`], { encoding: "utf8" });
	if (r.status !== 0) return null;
	const m = r.stdout.match(/^status:[ \t]*([^\s#]+)/m);
	return m ? m[1] : null;
}

export function tepCuaVong(base) {
	const commits = git(GOC, "log", "--no-merges", "--format=%H", `--grep=${SLUG}`, `${base}..HEAD`).split("\n").filter(Boolean);
	const tep = new Set();
	for (const c of commits) for (const t of git(GOC, "show", "--name-only", "--format=", c).split("\n")) if (t.startsWith("_acceptance/")) tep.add(t);
	return [...tep].sort();
}

export function kiemCay(tep, base, dong, laDaKy = (s) => DA_KY.includes(trangThaiTai(base, s))) {
	const theoSlug = new Map();
	for (const d of dong) theoSlug.set(d.slug, [...(theoSlug.get(d.slug) ?? []), d]);
	const loi = [];
	const hoSo = new Set();
	let dem = 0;
	for (const t of tep) {
		const [, slug, ...duoi] = t.split("/");
		if (slug === SLUG || !laDaKy(slug)) continue;
		hoSo.add(slug);
		dem++;
		const ds = theoSlug.get(slug) ?? [];
		const sua = ds.find((d) => d.cach === "sua-thuoc");
		if (ds.length && !sua) {
			loi.push(`cham ho so do: ${t}`);
			continue;
		}
		if (duoi.length === 1 && TEP_SO.has(duoi[0])) continue;
		if (sua && sua.tep_thuoc.includes(t)) continue;
		loi.push(`cham ngoai so: ${t}`);
	}
	return { loi, hoSo: hoSo.size, dem };
}

const so = docSoXuLy(docJson(join(HO_SO, "xu-ly.json")));
const tep = tepCuaVong(so.base);
const kq = kiemCay(tep, so.base, so.dong);
console.log(`cay-ho-so: ${kq.hoSo} ho so cham, ${kq.dem} tep`);
if (kq.loi.length) {
	console.log(kq.loi.join("\n"));
	console.log("KET LUAN: do");
	process.exit(1);
}
const mau = git(GOC, "ls-files", "_acceptance/*/contract.md")
	.split("\n")
	.map((p) => p.split("/")[1])
	.find((s) => s !== SLUG && DA_KY.includes(trangThaiTai(so.base, s)));
const ca = [
	["cham-contract", [`_acceptance/${mau}/contract.md`], [], "cham ngoai so"],
	["cham-evidence", [`_acceptance/${mau}/evidence/x.png`], [], "cham ngoai so"],
	["cham-ho-so-do", [`_acceptance/${mau}/run-log.jsonl`], [{ slug: mau, cach: "ngoai-pham-vi" }], "cham ho so do"],
];
let hong = false;
for (const [ten, them, dongGia, dau] of ca) {
	const r = kiemCay([...tep, ...them], so.base, [...so.dong, ...dongGia]);
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
