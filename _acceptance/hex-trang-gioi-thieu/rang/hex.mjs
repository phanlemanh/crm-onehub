import { execFileSync } from "node:child_process";
import {
	copyFileSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const THU_MUC = "apps/app/components/landing";

function khongDo(dong) {
	console.log(`KHONG DO DUOC: ${dong}`);
	process.exit(2);
}

function napReHex() {
	let ag;
	try {
		ag = execFileSync(
			"node",
			[
				join(GOC, "scripts", "resolve-plugin.mjs"),
				"--plugin",
				"acceptance-gate",
				"--require",
				"scripts/design-floor-s4.mjs",
			],
			{ cwd: GOC, encoding: "utf8" },
		).trim();
	} catch (e) {
		khongDo(`khong giai duoc goi acceptance-gate — ${e.message}`);
	}
	return import(pathToFileURL(join(ag, "scripts", "design-floor-s4.mjs")).href)
		.then((m) => {
			if (!(m.RE_HEX instanceof RegExp))
				khongDo("design-floor-s4.mjs khong xuat RE_HEX");
			return m.RE_HEX;
		})
		.catch((e) => khongDo(`khong nap duoc design-floor-s4.mjs — ${e.message}`));
}

function quet(reHex, goc, tep) {
	const gap = [];
	for (const t of tep) {
		readFileSync(join(goc, t), "utf8")
			.split("\n")
			.forEach((dong, i) => {
				for (const m of dong.matchAll(new RegExp(reHex.source, "g")))
					gap.push(`${t}:${i + 1} ${m[0]}`);
			});
	}
	return gap;
}

const reHex = await napReHex();

const tam = mkdtempSync(join(tmpdir(), "htg-hex-"));
try {
	copyFileSync(join(GOC, THU_MUC, "ask-card.tsx"), join(tam, "ask-card.tsx"));
	const goc = readFileSync(join(tam, "ask-card.tsx"), "utf8");
	writeFileSync(
		join(tam, "ask-card.tsx"),
		`const TIEM = "text-[#123456]";\n${goc}`,
	);
	const tiem = quet(reHex, tam, readdirSync(tam)).filter((d) =>
		d.startsWith("ask-card.tsx:1 "),
	);
	if (tiem.length !== 1)
		khongDo("doi chung duong khong bat ma tiem (ask-card.tsx:1)");
	console.log(`doi chung duong: bat ${tiem[0]}`);
} finally {
	rmSync(tam, { recursive: true, force: true });
}

const tep = execFileSync("git", ["ls-files", THU_MUC], {
	cwd: GOC,
	encoding: "utf8",
})
	.split("\n")
	.filter(Boolean);
if (tep.length === 0) khongDo(`git ls-files ${THU_MUC} rong`);

const gap = quet(reHex, GOC, tep);
if (gap.length === 0) {
	console.log(`HEX 0 CHO (${tep.length} tep)`);
	process.exit(0);
}
for (const d of gap) console.log(d);
console.log(`HEX ${gap.length} CHO`);
process.exit(1);
