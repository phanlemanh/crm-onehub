import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
export const CHIN = [
	"cay-can-chinh-co-ly-do",
	"cho-tac-nhan-lau",
	"goi-y-mo-ke-hoach",
	"hoi-dap-okr",
	"kara-gop-y-luot-2",
	"ngan-kr-mot-cho",
	"quyet-gop-y-noi-dung-ly-do",
	"toan-canh-okr",
	"tro-ly-okr-nen",
];

function khongDo(dong) {
	console.log(`KHONG DO DUOC: ${dong}`);
	process.exit(2);
}

export function napKit() {
	let ag;
	try {
		ag = execFileSync(
			"node",
			[
				join(GOC, "scripts", "resolve-plugin.mjs"),
				"--plugin",
				"acceptance-gate",
				"--require",
				"lib/evidence-core.cjs",
			],
			{ cwd: GOC, encoding: "utf8" },
		).trim();
	} catch (e) {
		khongDo(`khong giai duoc goi acceptance-gate — ${e.message}`);
	}
	const core = createRequire(import.meta.url)(
		join(ag, "lib", "evidence-core.cjs"),
	);
	for (const k of ["phanLoaiMucPaths", "dungCayPaths", "evalListsOf"])
		if (!(k in core)) khongDo(`evidence-core thieu ${k}`);
	return core;
}

export function cayGit() {
	return execFileSync("git", ["ls-files", "-z"], {
		cwd: GOC,
		encoding: "utf8",
		maxBuffer: 256 * 1024 * 1024,
	})
		.split("\0")
		.filter(Boolean);
}

export function mucChet(core, cay, evalsText) {
	const chet = [];
	const ds = core.evalListsOf(evalsText, ["paths"]).byId;
	for (const [id, f] of ds) {
		for (const muc of f.paths ?? []) {
			const k = core.phanLoaiMucPaths(muc, cay);
			if (!k.nhan) chet.push({ id, muc, ma: k.ma });
		}
	}
	return chet;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const core = napKit();
	const cay = core.dungCayPaths(cayGit());
	const dc = mucChet(
		core,
		core.dungCayPaths(["a/co.ts"]),
		'evals:\n  - id: X1\n    executor: script\n    paths:\n      - "a/co.ts"\n      - "a/khong-co.ts"\n',
	);
	if (dc.length !== 1 || dc[0].muc !== "a/khong-co.ts")
		khongDo("doi chung duong khong bat muc a/khong-co.ts");
	console.log("doi chung duong: bat X1 a/khong-co.ts");
	let tong = 0;
	for (const hs of CHIN) {
		const tep = join(GOC, "_acceptance", hs, "evals.yaml");
		let text;
		try {
			text = readFileSync(tep, "utf8");
		} catch {
			khongDo(`khong doc duoc ${tep}`);
		}
		const chet = mucChet(core, cay, text);
		tong += chet.length;
		for (const c of chet) console.log(`CHET ${hs} ${c.id} ${c.muc} (${c.ma})`);
		if (chet.length === 0) console.log(`SONG ${hs}`);
	}
	console.log(`MUC CHET: ${tong}`);
	process.exit(tong === 0 ? 0 : 1);
}
