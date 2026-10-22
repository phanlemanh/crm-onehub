import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { docJson, HO_SO } from "./chung.mjs";
import { dongXuLy, docSoXuLy } from "./khuon-xu-ly.mjs";

const THU_MUC_LAN = join(HO_SO, "lan");

function docQuyet() {
	const m = new Map();
	for (const l of readFileSync(join(HO_SO, "decisions.jsonl"), "utf8").split("\n")) {
		try {
			const j = JSON.parse(l);
			m.set(j.id, j);
		} catch {}
	}
	return m;
}

function docLan(runId) {
	const p = join(THU_MUC_LAN, `${runId}.json`);
	if (!existsSync(p)) return null;
	const lan = docJson(p);
	return lan.run_id === runId ? lan : null;
}

export function kiemDong(d, i, layLan = docLan, quyet = docQuyet()) {
	const r = dongXuLy.safeParse(d);
	if (!r.success) return [`dong ${i} ${d?.slug ?? "?"}: ${r.error.issues.map((x) => `${x.path.join(".") || "cach"} ${x.message}`).join(", ")}`];
	if (d.cach === "ghim-luoi") {
		const q = quyet.get(d.quyet);
		if (!q) return [`dong ${i} ${d.slug}: quyet ${d.quyet} khong co trong decisions.jsonl`];
		if (q.type !== "descope" || !String(q.decision).includes(d.slug)) return [`dong ${i} ${d.slug}: quyet ${d.quyet} khong phai descope goi ten ho so`];
		return [];
	}
	const lan = layLan(d.run_id);
	if (!lan) return [`dong ${i} ${d.slug}: run_id khong co tep lan ${d.run_id}`];
	const hs = lan.slugs?.[d.slug];
	if (!hs) return [`dong ${i} ${d.slug}: tep lan ${d.run_id} khong co ho so nay`];
	const lech = new Set((hs.lech ?? []).map((e) => e.id));
	const loi = d.evals.filter((e) => !lech.has(e)).map((e) => `dong ${i} ${d.slug}: eval ${e} khong do trong lan ${d.run_id}`);
	const sot = [...lech].filter((e) => !d.evals.includes(e));
	if (sot.length) loi.push(`dong ${i} ${d.slug}: sot eval do ${sot.join(", ")} cua lan ${d.run_id}`);
	return loi;
}

const pSo = join(HO_SO, "xu-ly.json");
const dong = existsSync(pSo) ? docSoXuLy(docJson(pSo)).dong : [];
const loi = dong.flatMap((d, i) => kiemDong(d, i));
console.log(`so-xu-ly: ${dong.length} dong`);
if (loi.length) {
	console.log(loi.join("\n"));
	console.log("KET LUAN: do");
	process.exit(1);
}

const tepLan = existsSync(THU_MUC_LAN) ? readdirSync(THU_MUC_LAN).filter((f) => f.endsWith(".json")) : [];
let mau = dong.find((d) => d.cach !== "ghim-luoi");
let layLan = docLan;
if (!mau) {
	for (const f of tepLan) {
		const lan = docJson(join(THU_MUC_LAN, f));
		const slug = Object.keys(lan.slugs ?? {}).find((s) => (lan.slugs[s].lech ?? []).length);
		if (slug) {
			mau = { slug, evals: lan.slugs[slug].lech.map((e) => e.id), cach: "ngoai-pham-vi", run_id: lan.run_id, ly_do: "mau", lan_chu: "mau", viec_phu: "F1-1" };
			break;
		}
	}
}
if (!mau) {
	console.log("KET LUAN: khong do duoc — chua co lan nao co eval do de dung ca do");
	process.exit(2);
}
if (kiemDong(mau, 0, layLan).length) {
	console.log(`KET LUAN: do — dong mau khong dat: ${kiemDong(mau, 0, layLan).join("; ")}`);
	process.exit(1);
}
const lanMau = docLan(mau.run_id);
const ca = [
	["thieu-run-id", { ...mau, run_id: undefined }, docLan],
	["cach-la", { ...mau, cach: "khac" }, docLan],
	["run-id-ma", { ...mau, run_id: "repin-20000101T000000Z-1" }, docLan],
	["eval-khong-do", mau, (id) => (id === mau.run_id ? { ...lanMau, slugs: { [mau.slug]: { ...lanMau.slugs[mau.slug], lech: [] } } } : null)],
	["sot-eval-do", { ...mau, evals: mau.evals.slice(1) }, (id) => (id === mau.run_id ? { ...lanMau, slugs: { [mau.slug]: { ...lanMau.slugs[mau.slug], lech: [...mau.evals.map((e) => ({ id: e })), { id: "E999" }] } } } : null)],
	["luoi-quyet-ma", { slug: mau.slug, cach: "ghim-luoi", ly_do: "mau", quyet: "d-20000101T000000Z-1" }, docLan],
];
let hong = false;
for (const [ten, d, lay] of ca) {
	layLan = lay;
	if (kiemDong(d, 0, layLan).length) console.log(`BAT ${ten}`);
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
