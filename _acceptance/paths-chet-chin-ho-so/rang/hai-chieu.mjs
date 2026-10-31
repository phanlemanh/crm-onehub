import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CHIN, cayGit, napKit } from "./chet.mjs";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

function khongDo(dong) {
	console.log(`KHONG DO DUOC: ${dong}`);
	process.exit(2);
}

const core = napKit();
if (!("staleByPaths" in core)) khongDo("evidence-core thieu staleByPaths");
const ds = cayGit();
const cay = core.dungCayPaths(ds);

const chet = core.staleByPaths(
	["a/co.ts"],
	'evals:\n  - id: X1\n    executor: script\n    cmd: "true"\n    paths: [a/co.ts, a/khong-co.ts]\n',
	{ cay: core.dungCayPaths(["a/co.ts"]) },
);
if (
	chet.apply !== false ||
	!String(chet.reason).startsWith("paths-khong-tro-toi-tep")
)
	khongDo(
		`doi chung duong: muc chet khong tat bo loc (${JSON.stringify(chet)})`,
	);
console.log(`doi chung duong: muc chet tat bo loc (${chet.reason})`);

let dung = 0;
let sai = 0;
const bao = (ok, dong) => {
	if (ok) dung += 1;
	else sai += 1;
	console.log(`${ok ? "DUNG" : "SAI"} ${dong}`);
};

for (const hs of CHIN) {
	const text = readFileSync(join(GOC, "_acceptance", hs, "evals.yaml"), "utf8");
	const globs = [];
	for (const [, f] of core.evalListsOf(text, ["paths"]).byId)
		for (const muc of f.paths ?? []) {
			const k = core.phanLoaiMucPaths(muc, cay);
			globs.push({ muc, glob: k.nhan ? k.glob : null });
		}
	const res = globs.filter((g) => g.glob).map((g) => core.pathGlobToRe(g.glob));
	const ngoai = ds.find((f) => !res.some((r) => r.test(f)));
	if (!ngoai) khongDo(`${hs}: khong tim duoc tep ngoai moi muc paths`);
	const im = core.staleByPaths([ngoai], text, { cay });
	bao(
		im.apply === true && im.kept.length === 0,
		`${hs} chieu-im: ${ngoai} -> ${im.apply ? `giu ${im.kept.length}` : `bo loc tat (${im.reason})`}`,
	);
	const daDo = new Set();
	for (const g of globs) {
		if (daDo.has(g.muc)) continue;
		daDo.add(g.muc);
		if (!g.glob) {
			bao(false, `${hs} chieu-cu: ${g.muc} khong tro toi tep nao`);
			continue;
		}
		const re = core.pathGlobToRe(g.glob);
		const tep = ds.find((f) => re.test(f));
		const cu = core.staleByPaths([tep, ngoai], text, { cay });
		bao(
			cu.apply === true && cu.kept.includes(tep) && !cu.kept.includes(ngoai),
			`${hs} chieu-cu: ${g.muc} <- ${tep} -> ${cu.apply ? `giu [${cu.kept.join(", ")}]` : `bo loc tat (${cu.reason})`}`,
		);
	}
}
console.log(`KET LUAN F38: ${dung} DUNG, ${sai} SAI`);
process.exit(sai === 0 ? 0 : 1);
