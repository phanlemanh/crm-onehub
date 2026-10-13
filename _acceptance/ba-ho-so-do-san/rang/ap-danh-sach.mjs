import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { docDanhSach, GOC, hong, khoaDong } from "./chung.mjs";

const THU = process.argv.includes("--thu");
const iBo = process.argv.indexOf("--bo-qua");
const BO_QUA = new Set(iBo >= 0 ? process.argv[iBo + 1].split(",") : []);
const iChi = process.argv.indexOf("--chi");
const CHI = iChi >= 0 ? new Set(process.argv[iChi + 1].split(",")) : null;

function khoiEval(dong, id) {
	const dau = dong.findIndex((l) => l.trim() === `- id: ${id}`);
	if (dau < 0) return null;
	let cuoi = dau + 1;
	while (cuoi < dong.length && !/^\s{2}- id: /.test(dong[cuoi]) && !/^\S/.test(dong[cuoi])) cuoi++;
	return { dau, cuoi };
}

function viTriPaths(dong, k) {
	for (let j = k.dau + 1; j < k.cuoi; j++) {
		if (/^\s+paths:\s*\[.*\]\s*$/.test(dong[j])) return { dau: j, cuoi: j + 1, kieu: "mot" };
		if (/^\s+paths:\s*$/.test(dong[j])) {
			let e = j + 1;
			while (e < k.cuoi && /^\s+- /.test(dong[e])) e++;
			return { dau: j, cuoi: e, kieu: "nhieu" };
		}
	}
	return null;
}

function tachMot(l) {
	const m = /^(\s+paths:\s*\[)(.*)\]\s*$/.exec(l);
	const muc = [];
	let cur = "";
	let trong = null;
	for (const ch of m[2]) {
		if (trong) {
			if (ch === trong) trong = null;
			cur += ch;
		} else if (ch === '"' || ch === "'") {
			trong = ch;
			cur += ch;
		} else if (ch === ",") {
			muc.push(cur.trim());
			cur = "";
		} else cur += ch;
	}
	if (cur.trim()) muc.push(cur.trim());
	return { dau: m[1], muc };
}

const boNhay = (s) => s.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");

function doiMuc(dong, k, muc, moi) {
	const p = viTriPaths(dong, k);
	if (!p) return 0;
	if (p.kieu === "mot") {
		const { dau, muc: ds } = tachMot(dong[p.dau]);
		const i = ds.findIndex((x) => boNhay(x) === muc);
		if (i < 0) return 0;
		if (moi === null) ds.splice(i, 1);
		else ds[i] = JSON.stringify(moi);
		dong[p.dau] = `${dau}${ds.join(", ")}]`;
		return 1;
	}
	for (let j = p.dau + 1; j < p.cuoi; j++) {
		const m = /^(\s+- )(.*)$/.exec(dong[j]);
		if (m && boNhay(m[2].trim()) === muc) {
			if (moi === null) dong.splice(j, 1);
			else dong[j] = `${m[1]}${JSON.stringify(moi)}`;
			return 1;
		}
	}
	return 0;
}

function xoaPaths(dong, k) {
	const p = viTriPaths(dong, k);
	if (!p) return 0;
	dong.splice(p.dau, p.cuoi - p.dau);
	return 1;
}

function datNotRun(dong, k) {
	for (let j = k.dau + 1; j < k.cuoi; j++) if (/^\s+status:\s*not-run\s*$/.test(dong[j])) return 0;
	dong.splice(k.dau + 1, 0, "    status: not-run");
	return 1;
}

const d = docDanhSach();
const theoTep = new Map();
for (const x of d.dong) {
	if (!["tro-duong-moi", "bo-paths", "khai-not-run"].includes(x.xu_ly)) continue;
	if (BO_QUA.has(`${x.ho_so}:${x.eval}`)) continue;
	if (CHI && !CHI.has(`${x.ho_so}:${x.eval}`)) continue;
	if (x.muc === null) continue;
	if (!theoTep.has(x.ho_so)) theoTep.set(x.ho_so, []);
	theoTep.get(x.ho_so).push(x);
}

let tong = 0;
let canDoi = 0;
const loi = [];
for (const [slug, dongs] of theoTep) {
	const tep = join(GOC, "_acceptance", slug, "evals.yaml");
	const goc = readFileSync(tep, "utf8");
	const dong = goc.split("\n");
	const theoEval = new Map();
	for (const x of dongs) {
		if (!theoEval.has(x.eval)) theoEval.set(x.eval, []);
		theoEval.get(x.eval).push(x);
	}
	for (const [id, ds] of theoEval) {
		canDoi += ds.length;
		const k = () => khoiEval(dong, id);
		if (!k()) {
			loi.push(`KHONG_THAY_EVAL ${slug}:${id}`);
			continue;
		}
		const toanO = ds.filter((x) => x.xu_ly !== "tro-duong-moi");
		if (toanO.length) {
			if (ds.some((x) => x.xu_ly === "tro-duong-moi")) loi.push(`TRON_XU_LY ${slug}:${id}`);
			const nr = ds.some((x) => x.xu_ly === "khai-not-run") ? datNotRun(dong, k()) : 0;
			const xp = xoaPaths(dong, k());
			if (!xp) loi.push(`KHONG_THAY_PATHS ${slug}:${id}`);
			else tong += ds.length;
			if (nr) console.log(`  ${slug}:${id} status: not-run`);
			continue;
		}
		for (const x of ds) {
			const n = doiMuc(dong, k(), x.muc, x.moi ?? null);
			if (n) tong++;
			else loi.push(`KHONG_THAY_MUC ${khoaDong(x)}`);
		}
	}
	const moi = dong.join("\n");
	if (moi !== goc) {
		console.log(`${slug}: ${dongs.length} dong`);
		if (!THU) writeFileSync(tep, moi);
	}
}
for (const l of loi) console.log(`HONG ${l}`);
console.log(`ap-danh-sach: ${tong}/${canDoi} dong da ap${THU ? " (thu, khong ghi)" : ""}`);
if (loi.length || tong !== canDoi) hong(1, "ap-danh-sach: lech so dong — xem HONG o tren");
