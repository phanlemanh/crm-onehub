import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const PHAN_LOAI = ".github/scripts/phan-loai.mjs";
const BO_QUET = ".github/scripts/t1-ma-doc.mjs";
const CAU_HINH = "_acceptance/config.yaml";
const SPEC = "./test/t1-ma-doc.spec.ts";

const lenhPhanLoai = { ten: "phan-loai.test", cmd: "node", args: ["--test", ".github/scripts/test/phan-loai.test.mjs"], cwd: "" };
const lenhSpec = (t) => ({ ten: `t1-ma-doc.spec -t ${t}`, cmd: "bun", args: ["test", "--timeout", "120000", SPEC, "-t", t], cwd: "packages/ui" });

function boKhoiMaDoc(chu, dong) {
	const dau = chu.indexOf("\n  t1_ma_doc:\n");
	const het = chu.indexOf("\n  t3_paths:", dau);
	if (dau < 0 || het < 0) return chu;
	const khoi = chu.slice(dau, het);
	return chu.slice(0, dau) + khoi.replace(`\n${dong}`, "") + chu.slice(het);
}

const CA = [
	{
		ten: "tepT1-khong-tru",
		tep: PHAN_LOAI,
		doi: (c) => c.replace("t1: new Set([...khopDuong].filter((t) => !khopAm.has(t))),", "t1: new Set(khopDuong),"),
		bat: [
			[lenhPhanLoai, "✖ tachT1 2 docs/design.md -> maDoc"],
			[lenhSpec("day"), "(fail) day > day 1 chi docs/design.md"],
		],
	},
	{
		ten: "phan-loai-khong-ma-doc",
		tep: PHAN_LOAI,
		doi: (c) => c.replace(", laMaDoc: (t) => maDoc.has(t) }), tep };", " }), tep };"),
		bat: [[lenhPhanLoai, "✖ CLI: PR chi docs/design.md ra nang t1-ma-doc"]],
	},
	{
		ten: "go-design-md",
		tep: CAU_HINH,
		doi: (c) => boKhoiMaDoc(c, '    - "docs/design.md"'),
		bat: [[lenhSpec("quet-that"), "thieu-khai docs/design.md"]],
	},
	{
		ten: "bo-cau-gate-shape",
		tep: BO_QUET,
		doi: (c) => c.replace("const cau = new Set(scriptRang(goc).filter((s) => tapTep.has(s)));", "const cau = new Set();"),
		bat: [[lenhSpec("quet-do"), "(fail) quet-do > quet-do 10 script khai trong khoi rang"]],
	},
	{
		ten: "bo-loc-loi-goi-doc",
		tep: BO_QUET,
		doi: (c) => c.replaceAll("if (!LOI_GOI_DOC.test(chu)) continue;", ""),
		bat: [[lenhSpec("quet-do"), "(fail) quet-do > quet-do 1 chi nhac ten khong goi doc"]],
	},
];

function git(cwd, args, env = {}) {
	const r = spawnSync("git", args, { cwd, encoding: "utf8", env: { ...process.env, ...env }, maxBuffer: 1 << 28 });
	if (r.status !== 0) throw new Error(`git ${args.join(" ")}: ${(r.stderr || "").trim().split("\n")[0]}`);
	return r.stdout;
}

function dungBanSao() {
	const tam = mkdtempSync(join(tmpdir(), "t1-ma-doc-dot-bien-"));
	const chiMuc = join(tam, "index");
	const gitDir = git(GOC, ["rev-parse", "--git-dir"]).trim();
	copyFileSync(resolve(GOC, gitDir, "index"), chiMuc);
	const env = { GIT_INDEX_FILE: chiMuc };
	git(GOC, ["add", "-A"], env);
	const cay = git(GOC, ["write-tree"], env).trim();
	const banSao = join(tam, "kho");
	mkdirSync(banSao);
	const tar = spawnSync("bash", ["-c", `git -C "$1" archive "$2" | tar -x -C "$3"`, "x", GOC, cay, banSao], { encoding: "utf8" });
	if (tar.status !== 0) throw new Error(`archive hong: ${tar.stderr}`);
	git(banSao, ["init", "-q", "--template="]);
	git(banSao, ["add", "-A"]);
	return { tam, banSao };
}

function chay(banSao, l) {
	const r = spawnSync(l.cmd, l.args, { cwd: join(banSao, l.cwd), encoding: "utf8", maxBuffer: 1 << 26 });
	return { ma: r.status ?? -1, ra: `${r.stdout}${r.stderr}` };
}

const { tam, banSao } = dungBanSao();
let ma = 0;
try {
	const moiLenh = [lenhPhanLoai, lenhSpec("day"), lenhSpec("quet-that"), lenhSpec("quet-do")];
	for (const l of moiLenh) {
		const r = chay(banSao, l);
		if (r.ma !== 0) {
			console.log(`thuoc hong: luot lanh do o ${l.ten} (ma ${r.ma})`);
			console.log(r.ra.split("\n").filter((d) => /fail|✖|Error/.test(d)).slice(0, 8).join("\n"));
			process.exit(2);
		}
	}
	for (const ca of CA) {
		const duong = join(banSao, ca.tep);
		const goc = readFileSync(duong, "utf8");
		const sua = ca.doi(goc);
		if (sua === goc) {
			console.log(`thuoc hong: ${ca.ten} khong cay duoc`);
			ma = 1;
			continue;
		}
		writeFileSync(duong, sua);
		const loi = [];
		for (const [l, ghim] of ca.bat) {
			const r = chay(banSao, l);
			if (r.ma === 0) loi.push(`${l.ten} van xanh`);
			else if (!r.ra.includes(ghim)) loi.push(`${l.ten} do nhung thieu «${ghim}»`);
		}
		writeFileSync(duong, goc);
		if (readFileSync(duong, "utf8") !== goc) {
			console.log(`thuoc hong: ${ca.ten} khong tra lai duoc ${ca.tep}`);
			process.exit(2);
		}
		if (loi.length) {
			ma = 1;
			console.log(`KHONG BAT ${ca.ten}: ${loi.join("; ")}`);
		} else console.log(`BAT ${ca.ten}`);
	}
} finally {
	rmSync(tam, { recursive: true, force: true });
}
process.exit(ma);
