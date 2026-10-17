import { spawnSync } from "node:child_process";
import {
	existsSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = fileURLToPath(new URL("../../../", import.meta.url));
const THU_MUC = [
	"apps/app/app/(app)/[slug]/viec",
	"apps/app/components/du-an",
	"apps/app/app/(app)/[slug]/settings/lich-lam-viec",
];
const TEP = ["packages/ui/src/components/gantt-du-an.tsx"];

const LUAT = [
	{
		ten: "gia-tri-tu-dat",
		mau: /\b(?:rounded(?:-[trblse]{1,2})?|bg|text|border(?:-[trblxy])?|ring|outline|fill|stroke|shadow|p[trblxy]?|m[trblxy]?|gap(?:-[xy])?|space-[xy]|w|h|size|min-w|max-w|min-h|max-h|top|left|right|bottom|inset(?:-[xy])?|leading|tracking)-\[[^\]\s]+\]/g,
	},
	{ ten: "ma-mau-tho", mau: /#[0-9a-fA-F]{3,8}\b/g },
	{
		ten: "mau-tailwind-tho",
		mau: /\b(?:bg|text|border|ring|fill|stroke)-(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-\d{2,3}\b/g,
	},
	{ ten: "style-tai-cho", mau: /style=\{\{/g },
];

function cong() {
	const goc =
		process.env.CLAUDE_PLUGIN_ROOT ||
		spawnSync(
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
		console.error("dg san: khong tim thay acceptance-gate");
		process.exit(2);
	}
	return join(goc, "scripts", "design-gate.mjs");
}

function tsxDuoi(thuMuc) {
	const goc = resolve(GOC, thuMuc);
	if (!existsSync(goc)) return [];
	return readdirSync(goc).flatMap((ten) => {
		const duong = join(goc, ten);
		if (statSync(duong).isDirectory()) return tsxDuoi(relative(GOC, duong));
		return ten.endsWith(".tsx") ? [duong] : [];
	});
}

function quetLuat(tep) {
	const loi = [];
	readFileSync(tep, "utf8")
		.split("\n")
		.forEach((dong, i) => {
			for (const luat of LUAT) {
				for (const thay of dong.match(luat.mau) ?? []) {
					loi.push(`${luat.ten}:${i + 1} ${thay}`);
				}
			}
		});
	return loi;
}

function quetCong(tep, gate) {
	const g = spawnSync(
		"node",
		[gate, "--target", tep, "--mode", "static", "--json"],
		{ encoding: "utf8" },
	);
	const json = (g.stdout ?? "").slice((g.stdout ?? "").indexOf("{"));
	let ket = null;
	try {
		ket = JSON.parse(json);
	} catch {
		return [`design-gate-khong-doc-duoc thoat ${g.status}`];
	}
	return (ket.blocking ?? []).map(
		(b) => `design-gate-${b.rule ?? b.id ?? "p0"}`,
	);
}

const tep = [...THU_MUC.flatMap(tsxDuoi), ...TEP.map((t) => resolve(GOC, t))]
	.filter((t) => existsSync(t))
	.sort();
if (tep.length === 0) {
	console.error("dg san: khong tep nao");
	process.exit(1);
}
const gate = cong();

const thu = mkdtempSync(join(tmpdir(), "dg-san-"));
try {
	const hong = join(thu, "hong.tsx");
	writeFileSync(
		hong,
		'export const T = () => <div className="bg-red-500 rounded-[7px]" />;\n',
	);
	if (quetLuat(hong).length < 2) {
		console.error("dg san: thuoc khong bat duoc vi pham");
		process.exit(2);
	}
} finally {
	rmSync(thu, { recursive: true, force: true });
}

const loi = tep.flatMap((t) =>
	[...quetLuat(t), ...quetCong(t, gate)].map(
		(luat) => `dg san: ${relative(GOC, t)} ${luat}`,
	),
);
for (const l of loi) console.error(l);
console.log(`dg san: ${tep.length} tep, ${loi.length} vi pham P0`);
process.exit(loi.length === 0 ? 0 : 1);
