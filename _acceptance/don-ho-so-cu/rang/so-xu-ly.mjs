import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { docJson, HO_SO } from "./chung.mjs";
import { dongXuLy, docSoXuLy } from "./khuon-xu-ly.mjs";

const THU_MUC_LAN = join(HO_SO, "lan");

function docLan(runId) {
	const p = join(THU_MUC_LAN, `${runId}.json`);
	if (!existsSync(p)) return null;
	const lan = docJson(p);
	return lan.run_id === runId ? lan : null;
}

export function kiemDong(d, i, layLan = docLan) {
	const r = dongXuLy.safeParse(d);
	if (!r.success) return [`dong ${i} ${d?.slug ?? "?"}: ${r.error.issues.map((x) => `${x.path.join(".") || "cach"} ${x.message}`).join(", ")}`];
	const lan = layLan(d.run_id);
	if (!lan) return [`dong ${i} ${d.slug}: run_id khong co tep lan ${d.run_id}`];
	const hs = lan.slugs?.[d.slug];
	if (!hs) return [`dong ${i} ${d.slug}: tep lan ${d.run_id} khong co ho so nay`];
	if (!(hs.lech ?? []).some((e) => e.id === d.eval)) return [`dong ${i} ${d.slug}: eval ${d.eval} khong do trong lan ${d.run_id}`];
	return [];
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
let mau = dong[0];
let layLan = docLan;
if (!mau) {
	for (const f of tepLan) {
		const lan = docJson(join(THU_MUC_LAN, f));
		const slug = Object.keys(lan.slugs ?? {}).find((s) => (lan.slugs[s].lech ?? []).length);
		if (slug) {
			mau = { slug, eval: lan.slugs[slug].lech[0].id, cach: "ngoai-pham-vi", run_id: lan.run_id, ly_do: "mau", lan_chu: "mau", viec_phu: "F1-1" };
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
