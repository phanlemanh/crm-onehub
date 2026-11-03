import { readFileSync } from "node:fs";
import { join } from "node:path";
import { BANG, GOC, goiKit, HS, khongDo, napNguong } from "./chung.mjs";
import { dongMien } from "./mien.mjs";

const { n } = napNguong(goiKit());
const homNay = Date.UTC(
	new Date().getUTCFullYear(),
	new Date().getUTCMonth(),
	new Date().getUTCDate(),
);
const ngay = (t) => n.timeboxDate(t);
const mau = (v) => `## Ngưỡng chết / ngưỡng UAT\n\n- Timebox: ${v}\n`;
if (ngay(mau("2026-11-14")) == null || ngay(mau("trong ngày 08–09/10")) != null)
	khongDo("doi chung duong: timeboxDate cua kit khong doc dung hai mau");
console.log(
	"doi chung duong: doc ra 2026-11-14, khong doc ra «trong ngày 08–09/10»",
);

const mien = dongMien(
	readFileSync(join(GOC, HS, "decisions.jsonl"), "utf8"),
	"mien_timebox",
);
let sai = 0;
const ds = [...new Set(BANG.de_xuat.map((r) => r.ho_so))].sort();
for (const hs of ds) {
	const d = ngay(
		readFileSync(join(GOC, "_acceptance", hs, "opportunity.md"), "utf8"),
	);
	if (d != null && d >= homNay) continue;
	if (mien.has(hs)) {
		console.log(`MIEN ${hs}`);
		continue;
	}
	sai += 1;
	console.log(
		`SAI ${hs}: timebox ${d == null ? "khong ra ngay" : `da qua (${new Date(d).toISOString().slice(0, 10)})`}`,
	);
}
console.log(`KET LUAN F39 timebox: ${ds.length - sai} DUNG, ${sai} SAI`);
process.exit(sai === 0 ? 0 : 1);
