import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = fileURLToPath(new URL("../../../", import.meta.url));

// goi-y-mo-ke-hoach: mọi .tsx mới hay sửa dưới record-sheet và onboarding, tính từ mốc cắt nhánh 7ebcb0242
// (merge-base với origin/onehub lúc mở vòng, ghim trong tệp để lượt ghim lại sau gộp vẫn có tệp để đo).
const MOC = "7ebcb0242";
const VUNG = [
	"apps/app/components/crm/record-sheet/",
	"apps/app/app/(app)/[slug]/onboarding/",
];
const LOP_TU_DAT =
	/\b(?:rounded(?:-[trblse]{1,2})?|bg|text|border(?:-[trblxy])?|ring|outline|fill|stroke|shadow|p[trblxy]?|m[trblxy]?|gap(?:-[xy])?|space-[xy]|w|h|size|min-w|max-w|min-h|max-h|top|left|right|bottom|inset(?:-[xy])?|leading|tracking)-\[[^\]\s]+\]/g;
const MA_MAU = /#[0-9a-fA-F]{3,8}\b/g;
const KIEU_TAI_CHO = /style=\{\{/g;

function goc() {
	if (process.env.CLAUDE_PLUGIN_ROOT) return process.env.CLAUDE_PLUGIN_ROOT;
	const r = spawnSync(
		"node",
		[
			"scripts/resolve-plugin.mjs",
			"--plugin",
			"acceptance-gate",
			"--require",
			"scripts/design-gate.mjs",
			"--require",
			"scripts/design-scan.js",
		],
		{ encoding: "utf8", cwd: GOC },
	);
	if (r.status !== 0) {
		console.error(`gy san: khong tim thay acceptance-gate\n${r.stderr}`);
		process.exit(2);
	}
	return r.stdout.trim();
}

function dongThem(t) {
	const r = spawnSync("git", ["diff", "-U0", MOC, "HEAD", "--", t], {
		encoding: "utf8",
		cwd: GOC,
	});
	if (r.status !== 0 || r.stdout === "") return null;
	const them = new Set();
	for (const m of r.stdout.matchAll(/^@@ -\S+ \+(\d+)(?:,(\d+))? @@/gm)) {
		const dau = Number(m[1]);
		const so = m[2] === undefined ? 1 : Number(m[2]);
		for (let i = 0; i < so; i += 1) them.add(dau + i);
	}
	return them;
}

function quet(dsTep, cong) {
	const loi = [];
	for (const t of dsTep) {
		const them = dongThem(t);
		const g = spawnSync("node", [cong, "--target", t, "--mode", "static"], {
			encoding: "utf8",
		});
		if (g.status !== 0)
			loi.push(`${t}: design-gate thoat ${g.status}\n${g.stdout}`);
		const dong = readFileSync(t, "utf8").split("\n");
		dong.forEach((d, i) => {
			if (them !== null && !them.has(i + 1)) return;
			const thay = [
				...(d.match(LOP_TU_DAT) ?? []),
				...(d.match(MA_MAU) ?? []),
				...(d.match(KIEU_TAI_CHO) ?? []),
			];
			if (thay.length > 0)
				loi.push(`${t}:${i + 1}: gia tri tu dat ${thay.join(" ")}`);
		});
	}
	return loi;
}

const doi = spawnSync(
	"git",
	["diff", "--name-only", "--diff-filter=AM", MOC, "HEAD"],
	{ encoding: "utf8", cwd: GOC },
);
if (doi.status !== 0) {
	console.error(`gy san: git diff hong\n${doi.stderr}`);
	process.exit(2);
}
const tep = [
	...doi.stdout
		.split("\n")
		.filter((t) => t.endsWith(".tsx") && VUNG.some((v) => t.startsWith(v)))
		.map((t) => resolve(GOC, t)),
	...process.argv.slice(2).map((t) => resolve(t)),
];
if (tep.length === 0) {
	console.error("gy: san thiet ke khong co tep");
	process.exit(1);
}

const cong = `${goc()}/scripts/design-gate.mjs`;

const thu = mkdtempSync(join(tmpdir(), "gy-san-"));
try {
	const tepThu = join(thu, "vi-pham.tsx");
	writeFileSync(
		tepThu,
		'export const Thu = () => <div className="rounded-[7px]" />;\n',
	);
	if (quet([tepThu], cong).length === 0) {
		console.error("gy san: thuoc khong bat duoc vi pham");
		process.exit(2);
	}
} finally {
	rmSync(thu, { recursive: true, force: true });
}

const loi = quet(tep, cong);
for (const l of loi) console.error(l);
console.log(`gy san: ${tep.length} tep, ${loi.length} vi pham`);
process.exit(loi.length === 0 ? 0 : 1);
