import { spawnSync } from "node:child_process";
import {
	copyFileSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const PHAN_LOAI = ".github/scripts/phan-loai.mjs";
const CAU_HINH = "_acceptance/config.yaml";
const CONG = ".github/workflows/acceptance.yml";
const SPEC = "./test/push-ghim-lai-t1.spec.ts";
const DONG_JOB = "    name: acceptance gate\n";
const DONG_PR =
	"    types: [opened, synchronize, reopened, ready_for_review]\n";

const lenh = (t) => ({
	ten: `push-ghim-lai-t1.spec -t ${t}`,
	cmd: "bun",
	args: ["test", "--timeout", "120000", SPEC, "-t", t],
	cwd: "packages/ui",
});
const LANH = {
	ten: "push-ghim-lai-t1.spec",
	cmd: "bun",
	args: ["test", "--timeout", "120000", SPEC],
	cwd: "packages/ui",
};

const CA = [
	{
		ten: "go-glob-run-log",
		tep: CAU_HINH,
		doi: (c) => c.replace('\n    - "_acceptance/*/run-log.jsonl"\n', "\n"),
		bat: [
			[lenh("pglt-tach"), "(fail) pglt-tach > pglt-tach 1 "],
			[lenh("pglt-ci"), "(fail) pglt-ci > pglt-ci 1 "],
		],
	},
	{
		ten: "glob-rong-ho-so",
		tep: CAU_HINH,
		doi: (c) =>
			c.replace(
				'    - "_acceptance/*/decisions.jsonl"\n',
				'    - "_acceptance/**"\n',
			),
		bat: [[lenh("pglt-tach"), "(fail) pglt-tach > pglt-tach 6 "]],
	},
	{
		ten: "bo-luat-so-doan",
		tep: PHAN_LOAI,
		doi: (c) =>
			c
				.replace(
					"const khopDuong = khopDungDoan(duong, tep);",
					"const khopDuong = khop(duong, tep);",
				)
				.replace(
					"const khopAm = khopDungDoan(am, [...khopDuong]);",
					"const khopAm = khop(am, [...khopDuong]);",
				),
		bat: [
			[lenh("pglt-sau"), "(fail) pglt-sau > pglt-sau 1 "],
			[lenh("pglt-ci"), "(fail) pglt-ci > pglt-ci 8 "],
		],
	},
	{
		ten: "cong-phu-thuoc",
		tep: CONG,
		doi: (c) => c.replace(DONG_JOB, `${DONG_JOB}    needs: phan-loai\n`),
		bat: [[lenh("pglt-job"), "(fail) pglt-job > pglt-job 1 "]],
	},
	{
		ten: "cong-loc-duong",
		tep: CONG,
		doi: (c) =>
			c.replace(
				DONG_PR,
				`${DONG_PR}    paths-ignore: ['_acceptance/*/run-log.jsonl']\n`,
			),
		bat: [[lenh("pglt-job"), "(fail) pglt-job > pglt-job 1 "]],
	},
];

function git(cwd, args, env = {}) {
	const r = spawnSync("git", args, {
		cwd,
		encoding: "utf8",
		env: { ...process.env, ...env },
		maxBuffer: 1 << 28,
	});
	if (r.status !== 0)
		throw new Error(
			`git ${args.join(" ")}: ${(r.stderr || "").trim().split("\n")[0]}`,
		);
	return r.stdout;
}

function dungCayChep() {
	const tam = mkdtempSync(join(tmpdir(), "pglt-dot-bien-"));
	const chiMuc = join(tam, "index");
	const gitDir = git(GOC, ["rev-parse", "--git-dir"]).trim();
	copyFileSync(resolve(GOC, gitDir, "index"), chiMuc);
	const env = { GIT_INDEX_FILE: chiMuc };
	git(GOC, ["add", "-A"], env);
	const cay = git(GOC, ["write-tree"], env).trim();
	const chep = join(tam, "kho");
	mkdirSync(chep);
	const tar = spawnSync(
		"bash",
		["-c", `git -C "$1" archive "$2" | tar -x -C "$3"`, "x", GOC, cay, chep],
		{ encoding: "utf8" },
	);
	if (tar.status !== 0) throw new Error(`archive hong: ${tar.stderr}`);
	git(chep, ["init", "-q", "--template="]);
	git(chep, ["add", "-A"]);
	return { tam, chep };
}

function chay(chep, l) {
	const r = spawnSync(l.cmd, l.args, {
		cwd: join(chep, l.cwd),
		encoding: "utf8",
		maxBuffer: 1 << 26,
	});
	return { ma: r.status ?? -1, ra: `${r.stdout}${r.stderr}` };
}

const { tam, chep } = dungCayChep();
let ma = 0;
try {
	const lanh = chay(chep, LANH);
	if (lanh.ma !== 0) {
		console.log(`thuoc hong: luot lanh do (ma ${lanh.ma})`);
		console.log(
			lanh.ra
				.split("\n")
				.filter((d) => /\(fail\)|error:/.test(d))
				.slice(0, 8)
				.join("\n"),
		);
		process.exit(2);
	}
	for (const ca of CA) {
		const duong = join(chep, ca.tep);
		const goc = readFileSync(duong, "utf8");
		const sua = ca.doi(goc);
		if (sua === goc) {
			console.log(`thuoc hong: ${ca.ten} khong cay duoc`);
			process.exit(2);
		}
		writeFileSync(duong, sua);
		const loi = [];
		for (const [l, ghim] of ca.bat) {
			const r = chay(chep, l);
			if (r.ma === 0) loi.push(`${l.ten} van xanh`);
			else if (!r.ra.includes(ghim))
				loi.push(`${l.ten} do nhung thieu «${ghim.trim()}»`);
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
