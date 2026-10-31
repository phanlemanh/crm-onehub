import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { BANG, DE_XUAT, GOC, goiKit, napNguong } from "./chung.mjs";

const TIEU_DE = "## Ngưỡng chết / ngưỡng UAT";

export function apMot(text, dong, nhanDs, n, vietLai, chot) {
	const gia = new Map(
		dong.filter((r) => r.nhan).map((r) => [r.nhan, r.gia_tri]),
	);
	const ghi = (lb) => `- ${lb}: ${chot ? "" : `${DE_XUAT} `}${gia.get(lb)}`;
	const L = text.split("\n");
	let i = L.findIndex((l) => l.startsWith("## Ngưỡng"));
	if (i < 0) {
		while (L.length && L.at(-1) === "") L.pop();
		L.push("", TIEU_DE, "", ...nhanDs.filter((lb) => gia.has(lb)).map(ghi), "");
		return L.join("\n");
	}
	let j = L.findIndex((l, k) => k > i && l.startsWith("## "));
	if (j < 0) j = L.length;
	const muc = L.slice(i + 1, j);
	const ra = [];
	const daGhi = new Set();
	const nhanCua = (l) => {
		const b = n.bulletOf(l.replace(/^- \[đề xuất\] /, "- "));
		if (b && nhanDs.includes(b.label)) return b.label;
		const m = /^- (SỐNG|CHẾT):/.exec(l);
		if (m)
			return m[1] === "SỐNG" ? "Kết quả nào là SỐNG" : "Kết quả nào là CHẾT";
		return null;
	};
	for (let k = 0; k < muc.length; k += 1) {
		const l = muc[k];
		const lb = /^- /.test(l) ? nhanCua(l) : null;
		const thay = lb && gia.has(lb) && (vietLai || !daGhi.has(lb));
		if (!thay) {
			ra.push(l);
			continue;
		}
		ra.push(ghi(lb));
		daGhi.add(lb);
		while (k + 1 < muc.length && /^\s+\S/.test(muc[k + 1])) k += 1;
	}
	const thieu = nhanDs.filter((lb) => gia.has(lb) && !daGhi.has(lb));
	if (thieu.length) {
		let cuoi = ra.length;
		while (cuoi > 0 && ra[cuoi - 1].trim() === "") cuoi -= 1;
		ra.splice(cuoi, 0, ...thieu.map(ghi));
	}
	return [...L.slice(0, i + 1), ...ra, ...L.slice(j)].join("\n");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const { n, nhan } = napNguong(goiKit());
	const chot = process.argv.includes("--chot");
	for (const hs of [...new Set(BANG.de_xuat.map((r) => r.ho_so))].sort()) {
		const dong = BANG.de_xuat.filter((r) => r.ho_so === hs && r.nhan);
		if (!dong.length) continue;
		const tep = join(GOC, "_acceptance", hs, "opportunity.md");
		const cu = readFileSync(tep, "utf8");
		const moi = apMot(
			cu,
			dong,
			nhan,
			n,
			BANG.viet_lai_khuon.includes(hs),
			chot,
		);
		if (moi !== cu) writeFileSync(tep, moi);
		console.log(`${hs}: ${dong.length} o`);
	}
}
