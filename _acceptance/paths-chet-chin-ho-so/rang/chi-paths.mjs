import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CHIN, napKit } from "./chet.mjs";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const BANG = JSON.parse(
	readFileSync(
		join(GOC, "_acceptance/paths-chet-chin-ho-so/rang/bang-sua.json"),
		"utf8",
	),
);

export function dongDoi(base, tep, cwd = GOC) {
	return execFileSync("git", ["diff", "-U0", base, "--", tep], {
		cwd,
		encoding: "utf8",
	})
		.split("\n")
		.filter((l) => /^[-+]/.test(l) && !/^(---|\+\+\+) /.test(l));
}

export function dongNgoaiPaths(dong) {
	return dong.filter((l) => !/^[-+] {4}paths: \[/.test(l));
}

export function lechTap(core, cuText, moiText, dong) {
	const cu = core.evalListsOf(cuText, ["paths"]).byId;
	const moi = core.evalListsOf(moiText, ["paths"]).byId;
	const loi = [];
	const ids = new Set([...cu.keys(), ...moi.keys()]);
	for (const id of ids) {
		const a = new Set(cu.get(id)?.paths ?? []);
		const b = new Set(moi.get(id)?.paths ?? []);
		const d = dong.filter((r) => r.eval === id);
		const boMong = new Set(d.map((r) => r.cu).filter((x) => x !== null));
		const themMong = new Set(
			d
				.flatMap((r) => (r.moi === null ? [] : [r.moi].flat()))
				.filter((x) => !a.has(x)),
		);
		for (const x of a)
			if (!b.has(x) && !boMong.has(x)) loi.push(`${id} go ngoai bang: ${x}`);
		for (const x of boMong)
			if (b.has(x)) loi.push(`${id} con muc phai go: ${x}`);
		for (const x of b)
			if (!a.has(x) && !themMong.has(x))
				loi.push(`${id} them ngoai bang: ${x}`);
		for (const x of themMong)
			if (!b.has(x)) loi.push(`${id} thieu muc phai them: ${x}`);
	}
	return loi;
}

const core = napKit();
let dung = 0;
let sai = 0;
const bao = (ok, dong) => {
	if (ok) dung += 1;
	else sai += 1;
	console.log(`${ok ? "DUNG" : "SAI"} ${dong}`);
};

const gia = dongNgoaiPaths([
	"+    paths: [a]",
	"-    paths: [b]",
	"+    cmd: x",
]);
if (gia.length !== 1 || gia[0] !== "+    cmd: x") {
	console.log("KHONG DO DUOC: doi chung duong khong bat dong cmd doi");
	process.exit(2);
}
console.log("doi chung duong: bat dong «+    cmd: x»");
const mau =
	"evals:\n  - id: X1\n    executor: script\n    paths: [a/song.ts, a/chet.ts]\n";
const dc2 = lechTap(
	core,
	mau,
	mau.replace("a/song.ts, a/chet.ts", "b/khac.ts"),
	[{ eval: "X1", cu: "a/chet.ts", moi: null }],
);
if (
	dc2.join("|") !== "X1 go ngoai bang: a/song.ts|X1 them ngoai bang: b/khac.ts"
) {
	console.log(`KHONG DO DUOC: doi chung duong tap paths (${dc2.join("; ")})`);
	process.exit(2);
}
console.log(
	"doi chung duong: bat go muc song a/song.ts va them b/khac.ts ngoai bang",
);

for (const hs of CHIN) {
	const tep = `_acceptance/${hs}/evals.yaml`;
	const dong = dongDoi(BANG.goc, tep);
	const ngoai = dongNgoaiPaths(dong);
	bao(
		ngoai.length === 0,
		`${hs} chi-paths: ${dong.length} dong doi, ${ngoai.length} dong ngoai paths${ngoai.length ? ` — ${ngoai[0]}` : ""}`,
	);
	const cuText = execFileSync("git", ["show", `${BANG.goc}:${tep}`], {
		cwd: GOC,
		encoding: "utf8",
	});
	const loi = lechTap(
		core,
		cuText,
		readFileSync(join(GOC, tep), "utf8"),
		BANG.sua.filter((r) => r.ho_so === hs),
	);
	bao(
		loi.length === 0,
		`${hs} tap-paths: ${loi.length === 0 ? "dung bang sua" : loi.join("; ")}`,
	);
}
console.log(`KET LUAN F38 chi-paths: ${dung} DUNG, ${sai} SAI`);
process.exit(sai === 0 ? 0 : 1);
