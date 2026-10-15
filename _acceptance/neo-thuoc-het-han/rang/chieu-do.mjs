import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { apThay, chay, duoi, giaiLenh, LMCV, voiCayTam } from "./chung.mjs";

const DIALOG =
	"apps/app/app/(app)/[slug]/settings/members/chuyen-viec-dialog.tsx";

export const DOT_BIEN = [
	{
		ten: "bun-yaml",
		tep: `_acceptance/${LMCV}/rang/khong-hoi-quy.mjs`,
		thay: [
			[
				"function docEvals(tep) {\n\tconst chu = docTep(tep);",
				'function docEvals(tep) {\n\ttry {\n\t\tBun.YAML.parse(readFileSync(tep, "utf8"));\n\t} catch (loi) {\n\t\tdung(2, `KHONG DO DUOC: khong doc duoc ${tep} — ${loi.message}`);\n\t}\n\tconst chu = docTep(tep);',
			],
		],
		khoa: "executors.script.lmcv_khong_hoi_quy",
		ghim: "khong doc duoc",
	},
	{
		ten: "lam-moi-khong-khoa",
		tep: DIALOG,
		thay: [
			[
				'import { useMutation, useQuery } from "@tanstack/react-query";',
				'import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";',
			],
			[
				"const cache = useCrmCache();",
				"const cache = useCrmCache();\n\tconst qcDot = useQueryClient();",
			],
			[
				"onError: (error) => setLoi(error.message),",
				"onError: (error) => {\n\t\t\t\tvoid qcDot.invalidateQueries();\n\t\t\t\tsetLoi(error.message);\n\t\t\t},",
			],
		],
		khoa: "executors.test.lmcv_loi_khong_lam_moi",
		ghim: "khong lam moi khi loi",
	},
	{
		ten: "ref-thieu",
		tep: `_acceptance/${LMCV}/rang/khong-hoi-quy.mjs`,
		thay: [
			[
				'goc: "b79513410ffef268b6a45655972f5847cdbd0bda",',
				'goc: "0000000000000000000000000000000000000001",',
			],
		],
		khoa: "executors.script.lmcv_khong_hoi_quy",
		ghim: "KHONG DO DUOC",
		maDung: 2,
		khongStack: true,
	},
];

const TRUONG = ["ten", "tep", "thay", "khoa", "ghim"];

export function batDung(d, kq) {
	if (d.maDung !== undefined && kq.ma !== d.maDung) return false;
	if (kq.ma === 0) return false;
	if (!kq.ra.includes(d.ghim)) return false;
	if (d.khongStack && /^\s+at /m.test(kq.stderr)) return false;
	return true;
}

const hong = [];
if (
	batDung(
		{ ghim: "x", maDung: 2, khongStack: true },
		{ ma: 2, ra: "x", stderr: "    at f (a.js:1)" },
	)
)
	hong.push("HONG TU KIEM stack: ban do stack trace van qua");
else console.log("OK tu kiem stack");

const hop = DOT_BIEN.filter((d) => {
	const thieu = TRUONG.filter(
		(t) =>
			d[t] === undefined ||
			d[t] === "" ||
			(Array.isArray(d[t]) && d[t].length === 0),
	);
	if (thieu.length > 0)
		hong.push(`HONG THIEU ${d.ten ?? "?"}: ${thieu.join(", ")}`);
	return thieu.length === 0;
});

let bat = 0;
voiCayTam("chieu-do", (cay) => {
	for (const d of hop) {
		const tep = join(cay, d.tep);
		const goc = readFileSync(tep, "utf8");
		const ban = apThay(goc, d.thay);
		if (ban === null) {
			hong.push(`HONG KHONG AP ${d.ten}: phep thay khong khop ${d.tep}`);
			continue;
		}
		writeFileSync(tep, ban);
		try {
			const kq = chay(giaiLenh(d.khoa), cay);
			if (batDung(d, kq)) {
				bat++;
				console.log(`bat ${d.ten}: ma ${kq.ma}, «${d.ghim}»`);
			} else
				hong.push(
					`HONG LOT ${d.ten}: ma ${kq.ma}, khong thay «${d.ghim}»\n    ${duoi(kq.ra, 8)}`,
				);
		} finally {
			writeFileSync(tep, goc);
		}
	}
});

for (const h of hong) console.log(h);
console.log(`chieu-do: ${bat}/${DOT_BIEN.length} bi bat`);
process.exit(hong.length === 0 && bat === DOT_BIEN.length ? 0 : 1);
