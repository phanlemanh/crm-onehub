import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SPEC_B = "./test/trang-ve-gop.spec.ts";
const SPEC_E = "./test/pre-push-da-chung.spec.ts";
const BIEN = { [SPEC_B]: "TRANG_VE_NGUON", [SPEC_E]: "DA_CHUNG_NGUON" };

const DOT_BIEN = [
	{
		ca: "(a) bo LO-TRINH khoi .gitattributes",
		sua: [[".gitattributes", "LO-TRINH.html merge=union\n", ""]],
		spec: SPEC_B,
		test: "khai: trang mang merge=union dung bang tep bo ve dung lai",
	},
	{
		ca: "(b) post-merge khong viet lai dinh",
		sua: [["scripts/trang-ve-gop.mjs", "\tconst moi = vietLaiDinh(goc, doi);", '\tconst moi = "000000000";']],
		spec: SPEC_B,
		test: "gop-tu-dong (a): hai nhanh them hai ho so",
	},
	{
		ca: "(c) pre-commit luon thoat som",
		sua: [[".githooks/pre-commit", '[ -f "$(git rev-parse --git-dir)/MERGE_HEAD" ] || exit 0', "exit 0"]],
		spec: SPEC_B,
		test: "gop-xung-dot (a): chi tep that xung dot, commit mang trang dung",
	},
	{
		ca: "(d) ve trong cay lam viec",
		sua: [
			["scripts/trang-ve-gop.mjs", "import { existsSync, mkdtempSync,", "import { cpSync, existsSync, mkdtempSync,"],
			[
				"scripts/trang-ve-gop.mjs",
				'gitPhai(goc, ["worktree", "add", "-q", "--detach", cay, commit], env);',
				'cpSync(goc, cay, { recursive: true, filter: (s) => !s.endsWith("/.git") });',
			],
		],
		spec: SPEC_B,
		test: "an-toan (a): ho so chua commit khong lot vao trang",
	},
	{
		ca: "(e) bo nhanh .github",
		sua: [["scripts/pre-push-da-chung.mjs", "\t\tif (ds.some((t) => t.startsWith(THU_MUC_GITHUB))) continue;\n", ""]],
		spec: SPEC_E,
		test: "cay-ma: ci.yml -> khac",
	},
	{
		ca: "(f) bo van tay moi truong",
		sua: [
			[
				"scripts/pre-push-da-chung.mjs",
				"if (d.van_tay !== vt || !Array.isArray(d.buoc) || !coCommit(goc, d.sha)) continue;",
				"if (!Array.isArray(d.buoc) || !coCommit(goc, d.sha)) continue;",
			],
		],
		spec: SPEC_E,
		test: "dau-hook (f): .env doi thi khong dung dau",
	},
	{
		ca: "(g) bo dieu kien phu goi test",
		sua: [
			[
				"scripts/pre-push-da-chung.mjs",
				'if (ca || (phu.size > 0 && goiCanTest(goc).every((g) => phu.has(g)))) buoc.add("test");',
				'if (ca || phu.size > 0) buoc.add("test");',
			],
		],
		spec: SPEC_E,
		test: "so-chay (c): thieu goi test thi test chay",
	},
	{
		ca: "(h) coi skipped la xanh",
		sua: [
			[
				"scripts/pre-push-da-chung.mjs",
				'.filter(([, v]) => v.ket === "success")',
				'.filter(([, v]) => v.ket === "success" || v.ket === "skipped")',
			],
		],
		spec: SPEC_E,
		test: "nguon-ci (b): o test bi bo qua",
	},
	{
		ca: "(i) ghi dau ca buoc da chung",
		sua: [["scripts/verify-gate-shape.mjs", ".filter((id) => !boQuaTong.has(id));", ".filter((id) => !boQua.has(id));"]],
		spec: SPEC_E,
		test: "dau-hook (a)(b): day du nam roi day cung cay bo het",
	},
];

const envSach = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith("GIT_") && k !== "CRM_SKIP_HOOKS"));
const git = (cwd, ...a) => spawnSync("git", a, { cwd, env: envSach, encoding: "utf8", maxBuffer: 1 << 26 });

const loi = [];

for (const d of DOT_BIEN)
	for (const [tep, tu] of d.sua) {
		const n = readFileSync(join(GOC, tep), "utf8").split(tu).length - 1;
		if (n !== 1) loi.push(`thuoc hong: neo ${d.ca} xuat hien ${n} lan o ${tep}`);
	}
if (loi.length) {
	for (const l of loi) console.log(l);
	process.exit(1);
}

const tam = mkdtempSync(join(tmpdir(), "tvg-doi-chieu-"));
let so = 0;

function banSao() {
	so += 1;
	const d = join(tam, `sao-${so}`);
	const r = git(GOC, "worktree", "add", "-q", "--detach", d, "HEAD");
	if (r.status !== 0) throw new Error(`khong dung duoc ban sao: ${r.stderr}`);
	for (const dong of git(GOC, "status", "--porcelain", "--untracked-files=all").stdout.split("\n").filter(Boolean)) {
		const t = dong.slice(3);
		if (dong.startsWith(" D") || !existsSync(join(GOC, t))) continue;
		mkdirSync(dirname(join(d, t)), { recursive: true });
		copyFileSync(join(GOC, t), join(d, t));
	}
	return d;
}

function chaySpec(d, spec, loc) {
	const args = ["test", "--timeout", "300000", spec];
	if (loc) args.push("-t", loc.replace(/[()[\].*+?^$|\\]/g, "\\$&"));
	const r = spawnSync("bun", args, {
		cwd: join(GOC, "packages", "ui"),
		env: { ...envSach, [BIEN[spec]]: d },
		encoding: "utf8",
		maxBuffer: 1 << 28,
	});
	return { ma: r.status, ra: `${r.stdout}${r.stderr}` };
}

try {
	const lanh = banSao();
	const b = chaySpec(lanh, SPEC_B);
	const e = chaySpec(lanh, SPEC_E);
	if (b.ma === 0 && e.ma === 0) console.log("dat doi-chung");
	else loi.push(`doi chung duong do: ${SPEC_B} ma ${b.ma}, ${SPEC_E} ma ${e.ma}`);

	for (const d of DOT_BIEN) {
		const sao = banSao();
		for (const [tep, tu, thanh] of d.sua) {
			const p = join(sao, tep);
			writeFileSync(p, readFileSync(p, "utf8").replace(tu, thanh));
		}
		const r = chaySpec(sao, d.spec, d.test);
		if (r.ma !== 0 && r.ra.includes(`(fail)`) && r.ra.includes(d.test)) console.log(`BAT ${d.ca}: ${d.test}`);
		else loi.push(`SONG ${d.ca}: ${d.test} khong do (ma ${r.ma})`);
	}
} finally {
	for (let i = 1; i <= so; i += 1) git(GOC, "worktree", "remove", "--force", join(tam, `sao-${i}`));
	git(GOC, "worktree", "prune");
	rmSync(tam, { recursive: true, force: true });
}

if (loi.length) {
	for (const l of loi) console.log(l);
	process.exit(1);
}
console.log(`dat doi-chieu: ${DOT_BIEN.length}/${DOT_BIEN.length}`);
