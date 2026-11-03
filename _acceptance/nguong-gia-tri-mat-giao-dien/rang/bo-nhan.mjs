import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
	BANG,
	GOC,
	goiKit,
	HS,
	mucNguong,
	napNguong,
	nhanCuaDong,
} from "./chung.mjs";
import { daChot, dongChot } from "./mien.mjs";

export function boNhanMot(text, nhanDs) {
	const m = mucNguong(text);
	if (!m) return text;
	const L = text.split("\n");
	const muc = m.muc.map((l) => {
		const o = /^- /.test(l) ? nhanCuaDong(l, nhanDs) : null;
		return o?.tienTo ? `- ${o.nhan}: ${o.dau}` : l;
	});
	return [...L.slice(0, m.i + 1), ...muc, ...L.slice(m.j)].join("\n");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const { nhan } = napNguong(goiKit());
	const chot = dongChot(readFileSync(join(GOC, HS, "decisions.jsonl"), "utf8"));
	let dem = 0;
	for (const hs of [...new Set(BANG.de_xuat.map((r) => r.ho_so))].sort()) {
		if (!daChot(chot, hs)) continue;
		const tep = join(GOC, "_acceptance", hs, "opportunity.md");
		const cu = readFileSync(tep, "utf8");
		const moi = boNhanMot(cu, nhan);
		if (moi !== cu) {
			writeFileSync(tep, moi);
			dem += 1;
		}
	}
	console.log(`bo-nhan: ${dem} ho so`);
}
