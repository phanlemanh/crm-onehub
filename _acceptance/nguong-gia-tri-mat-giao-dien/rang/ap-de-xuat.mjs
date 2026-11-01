import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
	BANG,
	DE_XUAT,
	GOC,
	goiKit,
	mucNguong,
	napNguong,
	nhanCuaDong,
} from "./chung.mjs";

const TIEU_DE = "## Ngưỡng chết / ngưỡng UAT";

export function viet(r, chot) {
	return `- ${r.nhan}: ${r.de_xuat && !chot ? `${DE_XUAT} ` : ""}${r.gia_tri}`;
}

export function apMot(text, dong, nhanDs, chot) {
	const theo = new Map(dong.filter((r) => r.nhan).map((r) => [r.nhan, r]));
	const L = text.split("\n");
	const m = mucNguong(text);
	if (!m) {
		while (L.length && L.at(-1) === "") L.pop();
		const moi = nhanDs
			.filter((lb) => theo.has(lb))
			.map((lb) => viet(theo.get(lb), chot));
		L.push("", TIEU_DE, "", ...moi, "");
		return L.join("\n");
	}
	const ra = [];
	const daGhi = new Set();
	for (let k = 0; k < m.muc.length; k += 1) {
		const l = m.muc[k];
		const o = /^- /.test(l) ? nhanCuaDong(l, nhanDs) : null;
		if (!o || !theo.has(o.nhan) || daGhi.has(o.nhan)) {
			ra.push(l);
			continue;
		}
		ra.push(viet(theo.get(o.nhan), chot));
		daGhi.add(o.nhan);
		while (k + 1 < m.muc.length && /^\s+\S/.test(m.muc[k + 1])) k += 1;
	}
	const thieu = nhanDs.filter((lb) => theo.has(lb) && !daGhi.has(lb));
	if (thieu.length) {
		let cuoi = ra.length;
		while (cuoi > 0 && ra[cuoi - 1].trim() === "") cuoi -= 1;
		ra.splice(cuoi, 0, ...thieu.map((lb) => viet(theo.get(lb), chot)));
	}
	return [...L.slice(0, m.i + 1), ...ra, ...L.slice(m.j)].join("\n");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const { nhan } = napNguong(goiKit());
	const chot = process.argv.includes("--chot");
	for (const hs of [...new Set(BANG.de_xuat.map((r) => r.ho_so))].sort()) {
		const dong = BANG.de_xuat.filter((r) => r.ho_so === hs && r.nhan);
		if (!dong.length) continue;
		const tep = join(GOC, "_acceptance", hs, "opportunity.md");
		const cu = readFileSync(tep, "utf8");
		const moi = apMot(cu, dong, nhan, chot);
		if (moi !== cu) writeFileSync(tep, moi);
		console.log(`${hs}: ${dong.length} o`);
	}
}
