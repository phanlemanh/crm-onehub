import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC =
	process.argv[2] ??
	join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const BANG = JSON.parse(
	readFileSync(
		join(GOC, "_acceptance/paths-chet-chin-ho-so/rang/bang-sua.json"),
		"utf8",
	),
);

const NHAY = /[()[\]*?,:{}#&!|>'"%@`]|^\s|\s$/;
const viet = (m) => (NHAY.test(m) ? JSON.stringify(m) : m);

function tachMuc(trong) {
	const ra = [];
	let cur = "";
	let nhay = false;
	for (const c of trong) {
		if (c === '"') nhay = !nhay;
		if (c === "," && !nhay) {
			ra.push(cur.trim());
			cur = "";
		} else cur += c;
	}
	if (cur.trim()) ra.push(cur.trim());
	return ra.map((m) => (m.startsWith('"') ? JSON.parse(m) : m));
}

export function apMot(text, id, cu, moi) {
	const dong = text.split("\n");
	const dau = dong.findIndex((l) => l === `  - id: ${id}`);
	if (dau < 0) throw new Error(`khong thay eval ${id}`);
	let cuoi = dong.findIndex((l, i) => i > dau && /^ {2}- id: /.test(l));
	if (cuoi < 0) cuoi = dong.length;
	const i = dong.findIndex(
		(l, k) => k > dau && k < cuoi && /^ {4}paths: \[/.test(l),
	);
	const moiDs = moi === null ? [] : Array.isArray(moi) ? moi : [moi];
	if (i < 0) {
		if (cu !== null) throw new Error(`${id}: khong thay dong paths dang luong`);
		const sau = dong.findIndex(
			(l, k) => k > dau && k < cuoi && /^ {4}executor: /.test(l),
		);
		dong.splice(sau + 1, 0, `    paths: [${moiDs.map(viet).join(", ")}]`);
		return dong.join("\n");
	}
	const muc = tachMuc(
		dong[i].replace(/^ {4}paths: \[/, "").replace(/\]\s*$/, ""),
	);
	if (cu !== null && !muc.includes(cu))
		throw new Error(`${id}: khong co muc ${cu}`);
	const ds = [];
	for (const m of muc) {
		if (m === cu) {
			for (const n of moiDs)
				if (!ds.includes(n) && !muc.includes(n)) ds.push(n);
			continue;
		}
		ds.push(m);
	}
	if (cu === null) for (const n of moiDs) if (!ds.includes(n)) ds.push(n);
	if (ds.length === 0) dong.splice(i, 1);
	else dong[i] = `    paths: [${ds.map(viet).join(", ")}]`;
	return dong.join("\n");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const theoHs = new Map();
	for (const s of BANG.sua)
		theoHs.set(s.ho_so, [...(theoHs.get(s.ho_so) ?? []), s]);
	for (const [hs, ds] of theoHs) {
		const tep = join(GOC, "_acceptance", hs, "evals.yaml");
		let text = readFileSync(tep, "utf8");
		for (const s of ds) text = apMot(text, s.eval, s.cu, s.moi);
		writeFileSync(tep, text);
		console.log(`${hs}: ap ${ds.length} dong`);
	}
}
