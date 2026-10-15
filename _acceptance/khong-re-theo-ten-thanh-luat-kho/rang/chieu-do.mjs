import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	apThay,
	chay,
	commitGia,
	duoi,
	giaiLenh,
	SLUG,
	voiCayTam,
} from "./chung.mjs";

const MA_TRAN = `bun _acceptance/${SLUG}/rang/ma-tran-luat.mjs`;

export const DOT_BIEN = [
	{
		ten: "luat-rong",
		tep: "tools/oxlint/onehub/rules/khong-re-theo-ten-giai-doan.ts",
		thay: [
			[
				'quetChu(Object.values(GIAI_DOAN_GOC), "nhacIdCu")',
				'quetChu(["KRTT_KHONG_CO"], "nhacIdCu")',
			],
		],
		lenh: MA_TRAN,
		ghim: ["HONG THIEU apps/api/src/__krtt__/a.ts:DEMO_BOOKED"],
		maDung: 1,
	},
	{
		ten: "tat-thu-muc",
		tep: ".oxlintrc.json",
		thay: [
			[
				'\t\t\t\t"apps/app/lib/**",\n\t\t\t\t"packages/db/src/**"',
				'\t\t\t\t"packages/db/src/**"',
			],
		],
		lenh: giaiLenh("executors.script.gdtt_khong_re_theo_ten"),
		ghim: ["KHONG DO DUOC", "apps/app/lib"],
		maDung: 2,
	},
	{
		ten: "bo-mien-allowlist",
		tep: ".oxlintrc.json",
		thay: [
			[
				'\t\t\t\t"packages/telemetry/src/allowlist.ts"\n\t\t\t],\n\t\t\t"rules": {\n\t\t\t\t"onehub/khong-dung-giai-doan-goc": "off"',
				'\t\t\t\t"packages/telemetry/src/allowlist.ts"\n\t\t\t],\n\t\t\t"rules": {\n\t\t\t\t"onehub/khong-dung-giai-doan-goc": "error"',
			],
		],
		lenh: MA_TRAN,
		ghim: ["HONG THUA packages/telemetry/src/allowlist.ts:GIAI_DOAN_GOC"],
		maDung: 1,
	},
	{
		ten: "override-thu-muc-con",
		tep: ".oxlintrc.json",
		thay: [
			[
				'\t\t{\n\t\t\t"files": [\n\t\t\t\t"packages/telemetry/src/allowlist.ts"',
				'\t\t{\n\t\t\t"files": ["apps/api/src/dashboard/**"],\n\t\t\t"rules": { "onehub/khong-re-theo-ten-giai-doan": "off" }\n\t\t},\n\t\t{\n\t\t\t"files": [\n\t\t\t\t"packages/telemetry/src/allowlist.ts"',
			],
		],
		lenh: giaiLenh("executors.script.gdtt_khong_re_theo_ten"),
		ghim: ["KHONG DO DUOC", "apps/api/src/dashboard/**"],
		maDung: 2,
	},
	{
		ten: "chi-thi-tat",
		tep: "apps/api/src/dashboard/dashboard.service.ts",
		thay: [
			[
				"import ",
				'// oxlint-disable-next-line onehub/khong-re-theo-ten-giai-doan\nexport const krtt = "CLOSED_WON";\nimport ',
			],
		],
		lenh: giaiLenh("executors.script.gdtt_khong_re_theo_ten"),
		ghim: [
			"KHONG DO DUOC",
			"chi thi tat apps/api/src/dashboard/dashboard.service.ts",
		],
		maDung: 2,
	},
];

const TRUONG = ["ten", "tep", "thay", "lenh", "ghim", "maDung"];

const batDung = (d, kq) =>
	kq.ma === d.maDung && d.ghim.every((g) => kq.ra.includes(g));

const hong = [];
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
for (const d of hop)
	voiCayTam(`chieu-do-${d.ten}`, (cay) => {
		const tep = join(cay, d.tep);
		const ban = apThay(readFileSync(tep, "utf8"), d.thay);
		if (ban === null) {
			hong.push(`HONG KHONG AP ${d.ten}: phep thay khong khop ${d.tep}`);
			return;
		}
		writeFileSync(tep, ban);
		commitGia(cay, `dot bien ${d.ten}`, [d.tep]);
		const kq = chay(d.lenh, cay);
		if (batDung(d, kq)) {
			bat++;
			console.log(`bat ${d.ten}: ma ${kq.ma}, «${d.ghim.join("», «")}»`);
		} else
			hong.push(
				`HONG LOT ${d.ten}: ma ${kq.ma}, khong thay «${d.ghim.join("», «")}»\n    ${duoi(kq.ra, 8)}`,
			);
	});

for (const h of hong) console.log(h);
console.log(`chieu-do: ${bat}/${DOT_BIEN.length} bi bat`);
process.exit(hong.length === 0 && bat === DOT_BIEN.length ? 0 : 1);
