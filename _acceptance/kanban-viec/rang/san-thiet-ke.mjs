import { spawnSync } from "node:child_process";
import {
	existsSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = fileURLToPath(new URL("../../../", import.meta.url));
const BANG_CHUNG = resolve(
	GOC,
	process.env.BANG_CHUNG ?? "_acceptance/kanban-viec/evidence",
);
const HTML = [
	"kv-bang-1280",
	"kv-menu-1280",
	"kv-hoi-dong-cha-1280",
	"kv-bang-375",
	"kv-khung-cha-1280",
	"kv-khung-con-1280",
];
const TSX = [
	"apps/app/components/viec/bang-cot-viec.tsx",
	"apps/app/components/viec/the-viec-bang.tsx",
	"apps/app/components/viec/hoi-dong-cha.tsx",
	"apps/app/components/viec/muc-viec-con.tsx",
	"apps/app/components/viec/o-soan-viec-con.tsx",
	"apps/app/app/(app)/[slug]/viec/viec-cua-toi.tsx",
	"packages/ui/src/components/board.tsx",
];
const LOP_TU_DAT =
	/\b(?:rounded(?:-[trblse]{1,2})?|bg|text|border(?:-[trblxy])?|ring|outline|fill|stroke|shadow|p[trblxy]?|m[trblxy]?|gap(?:-[xy])?|space-[xy]|w|h|size|min-w|max-w|min-h|max-h|top|left|right|bottom|inset(?:-[xy])?|leading|tracking)-\[[^\]\s]+\]/g;
const MA_MAU = /#[0-9a-fA-F]{3,8}\b/g;
const KIEU_TAI_CHO = /style=\{\{/g;
const MAU_TRONG_STYLE = /style="[^"]*(?:#[0-9a-fA-F]{3,8}\b|rgba?\()[^"]*"/g;

function cong() {
	const goc = process.env.CLAUDE_PLUGIN_ROOT
		? process.env.CLAUDE_PLUGIN_ROOT
		: spawnSync(
				"node",
				[
					"scripts/resolve-plugin.mjs",
					"--plugin",
					"acceptance-gate",
					"--require",
					"scripts/design-gate.mjs",
				],
				{ encoding: "utf8", cwd: GOC },
			).stdout.trim();
	if (!goc) {
		console.error("kv san: khong tim thay acceptance-gate");
		process.exit(2);
	}
	return join(goc, "scripts", "design-gate.mjs");
}

function quetHtml(tep, gate) {
	const loi = [];
	const g = spawnSync("node", [gate, "--target", tep, "--mode", "static"], {
		encoding: "utf8",
	});
	if (g.status !== 0) loi.push(`kv san: ${tep} design-gate thoat ${g.status}`);
	const thay = readFileSync(tep, "utf8").match(MAU_TRONG_STYLE) ?? [];
	for (const t of thay)
		loi.push(`kv san: ${tep} mau cung trong style ${t.slice(0, 80)}`);
	return loi;
}

function quetTsx(tep) {
	const loi = [];
	readFileSync(tep, "utf8")
		.split("\n")
		.forEach((d, i) => {
			const thay = [
				...(d.match(LOP_TU_DAT) ?? []),
				...(d.match(MA_MAU) ?? []),
				...(d.match(KIEU_TAI_CHO) ?? []),
			];
			if (thay.length > 0)
				loi.push(`kv san: ${tep}:${i + 1} gia tri tu dat ${thay.join(" ")}`);
		});
	return loi;
}

const tepHtml = HTML.map((ten) => join(BANG_CHUNG, `${ten}.html`));
for (const t of tepHtml) {
	if (!existsSync(t)) {
		console.error(`kv san: thieu html ${t}`);
		process.exit(2);
	}
}
const gate = cong();

const thu = mkdtempSync(join(tmpdir(), "kv-san-"));
try {
	const hong = join(thu, "hong.html");
	writeFileSync(
		hong,
		readFileSync(tepHtml[0], "utf8").replace(
			"<body",
			'<body><div style="color:#eee">kv</div><i',
		),
	);
	const hongTsx = join(thu, "hong.tsx");
	writeFileSync(
		hongTsx,
		'export const T = () => <div className="rounded-[7px]" />;\n',
	);
	if (quetHtml(hong, gate).length === 0 || quetTsx(hongTsx).length === 0) {
		console.error("kv san: thuoc khong bat duoc vi pham");
		process.exit(2);
	}
} finally {
	rmSync(thu, { recursive: true, force: true });
}

const loi = [
	...tepHtml.flatMap((t) => quetHtml(t, gate)),
	...TSX.map((t) => resolve(GOC, t)).flatMap(quetTsx),
];
for (const l of loi) console.error(l);
console.log(
	`kv san: ${tepHtml.length + TSX.length} tep, ${loi.length} vi pham`,
);
process.exit(loi.length === 0 ? 0 : 1);
