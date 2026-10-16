import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { GIAI_DOAN_GOC } from "../../../packages/db/src/giai-doan.ts";
import { chay, dung, duoi, giaiLenh, LUAT, voiCayTam } from "./chung.mjs";

const BANG = [
	[
		"apps/api/src/__krtt__/a.ts",
		'export const a = "DEMO_BOOKED";\n',
		["DEMO_BOOKED"],
	],
	[
		"apps/agent/agent/__krtt__/a.ts",
		'export const a = "QUALIFIED_TO_BUY";\n',
		["QUALIFIED_TO_BUY"],
	],
	[
		"apps/app/app/__krtt__/a.tsx",
		'export const a = "DECISION_MAKER_BOUGHT_IN";\n',
		["DECISION_MAKER_BOUGHT_IN"],
	],
	[
		"apps/app/components/__krtt__/a.tsx",
		'export const a = "CONTRACT_SENT";\n',
		["CONTRACT_SENT"],
	],
	[
		"apps/app/lib/__krtt__/a.ts",
		'export const a = "CLOSED_WON";\n',
		["CLOSED_WON"],
	],
	[
		"packages/db/src/__krtt__/a.ts",
		'export const a = "CLOSED_LOST";\n',
		["CLOSED_LOST"],
	],
	[
		"packages/telemetry/src/__krtt__/a.ts",
		'export const a = "UNQUALIFIED_TO_BUY";\n',
		["UNQUALIFIED_TO_BUY"],
	],
	[
		"apps/api/src/__krtt__/b.ts",
		'import { GIAI_DOAN_GOC } from "@crm/db/giai-doan";\nexport const b = GIAI_DOAN_GOC;\n',
		["GIAI_DOAN_GOC"],
	],
	[
		"apps/app/lib/__krtt__/c.ts",
		"export const c = 1; /* CLOSED_LOST */\n",
		["CLOSED_LOST"],
	],
	[
		"packages/telemetry/src/allowlist.ts",
		'export const krtt = "CLOSED_WON";\n',
		["CLOSED_WON"],
		"them",
	],
	["apps/app/app/proto/__krtt__/a.tsx", 'export const a = "CLOSED_WON";\n', []],
	[
		"apps/api/src/generated/__krtt__.ts",
		'export const a = "CLOSED_WON";\n',
		[],
	],
	[
		"packages/db/src/generated/__krtt__.ts",
		'export const a = "CLOSED_WON";\n',
		[],
	],
	[
		"apps/agent-okr/agent/__krtt__/a.ts",
		'export const a = "CLOSED_WON";\n',
		[],
	],
	["apps/api/src/__krtt__/d.ts", "export const CLOSED_WONDER = 1;\n", []],
	["packages/db/src/giai-doan.ts", null, []],
];

const duoiTu = new Set(BANG.flatMap((o) => o[2]));
for (const id of [...Object.values(GIAI_DOAN_GOC), "GIAI_DOAN_GOC"])
	if (!duoiTu.has(id)) dung(1, `HONG BANG THIEU ${id}`);

const kyVong = new Set(
	BANG.flatMap(([tep, , tu]) => tu.map((t) => `${tep}:${t}`)),
);
const lenhLint = giaiLenh("executors.script.lint_slop");

voiCayTam("ma-tran", (cay) => {
	const hong = [];
	const nen = chay(lenhLint, cay);
	if (nen.ma !== 0) hong.push(`HONG NEN ${nen.ma}\n    ${duoi(nen.ra)}`);
	for (const [tep, noiDung, , cach] of BANG) {
		if (noiDung === null) continue;
		const dich = join(cay, tep);
		mkdirSync(dirname(dich), { recursive: true });
		if (cach === "them") appendFileSync(dich, noiDung);
		else writeFileSync(dich, noiDung);
	}
	const lint = chay(lenhLint, cay);
	if (lint.ma === 0 || !LUAT.some((l) => lint.ra.includes(l)))
		hong.push(`HONG LINT XANH ma ${lint.ma}\n    ${duoi(lint.ra)}`);
	const json = chay(
		`${join(cay, "node_modules", ".bin", "oxlint")} --format=json`,
		cay,
	);
	const ketQua = JSON.parse(json.stdout);
	const thay = new Set(
		ketQua.diagnostics
			.filter((d) => LUAT.includes(d.code))
			.map((d) => `${d.filename}:${d.message.match(/«([^»]+)»/)?.[1]}`),
	);
	const thieu = [...kyVong].filter((k) => !thay.has(k));
	const thua = [...thay].filter((k) => !kyVong.has(k));
	for (const k of thieu) hong.push(`HONG THIEU ${k}`);
	for (const k of thua) hong.push(`HONG THUA ${k}`);
	for (const h of hong) console.log(h);
	if (hong.length > 0) process.exit(1);
	console.log(`ma-tran-luat: ${BANG.length}/${BANG.length} o dung`);
});
