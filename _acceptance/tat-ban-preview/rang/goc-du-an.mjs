import { join } from "node:path";
import { duAnCuaKho, GOC, LoiApi } from "./vercel-doc.mjs";

const BANG = join(GOC, "apps/agent-okr/test/vercel-du-an.ts");
const TEP_SAI = "apps/api/vercel.json";

const tepThat = (p) => (p.root ? `${p.root}/vercel.json` : "vercel.json");

function soBang(duAnVercel, bang) {
	const dong = [];
	const theoTen = new Map(bang.map((d) => [d.ten, d.tep]));
	for (const p of duAnVercel) {
		if (!theoTen.has(p.ten)) dong.push(`thieu trong bang: ${p.ten}`);
		else if (theoTen.get(p.ten) !== tepThat(p))
			dong.push(
				`lech: ${p.ten}: Vercel doc ${tepThat(p)}, bang ghi ${theoTen.get(p.ten)}`,
			);
	}
	for (const d of bang)
		if (!duAnVercel.some((p) => p.ten === d.ten))
			dong.push(`thua trong bang: ${d.ten}`);
	return dong;
}

const cheDo = process.argv[2];
if (cheDo !== "xanh" && cheDo !== "do") {
	console.log("dung: goc-du-an.mjs xanh|do");
	process.exit(2);
}
const bang = (await import(BANG)).DU_AN.map(({ ten, tep }) => ({ ten, tep }));
let duAn;
try {
	duAn = duAnCuaKho();
} catch (loi) {
	console.log(`LOI-API: ${loi instanceof LoiApi ? loi.message : String(loi)}`);
	process.exit(2);
}
if (cheDo === "xanh") {
	const lech = soBang(duAn, bang);
	if (lech.length === 0) {
		for (const p of duAn)
			console.log(
				`khop: ${p.ten} -> ${tepThat(p)} (root ${p.root ?? "trong"})`,
			);
		process.exit(0);
	}
	for (const d of lech) console.log(d);
	process.exit(1);
}
const api = bang.find((d) => d.ten === "crm-onehub-api");
if (!api || api.tep === TEP_SAI) {
	console.log(
		"DOT-BIEN-KHONG-AN: bang khong co crm-onehub-api, hoac tep cua no da la apps/api/vercel.json",
	);
	process.exit(2);
}
const dotBien = bang.map((d) =>
	d.ten === "crm-onehub-api" ? { ...d, tep: TEP_SAI } : d,
);
const lech = soBang(duAn, dotBien);
for (const d of lech) console.log(d);
const mong = `lech: crm-onehub-api: Vercel doc vercel.json, bang ghi ${TEP_SAI}`;
process.exit(lech.length === 1 && lech[0] === mong ? 0 : 1);
