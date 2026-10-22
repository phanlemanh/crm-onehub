import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const DUOI = "CI phân loại PR theo cùng luật.";
const BA = ["check-types", "lint", "lint:slop"];
const LUI = 5;
const envSach = Object.fromEntries(
	Object.entries(process.env).filter(
		([k]) => !k.startsWith("GIT_") && k !== "CRM_SKIP_HOOKS",
	),
);
const TAC_GIA = {
	GIT_AUTHOR_NAME: "t",
	GIT_AUTHOR_EMAIL: "t@t",
	GIT_COMMITTER_NAME: "t",
	GIT_COMMITTER_EMAIL: "t@t",
};

function git(env, input, ...a) {
	const r = spawnSync("git", a, {
		cwd: GOC,
		env: { ...envSach, ...env },
		encoding: "utf8",
		input,
		maxBuffer: 1 << 26,
	});
	if (r.status !== 0) throw new Error(`git ${a[0]}: ${r.stderr.trim()}`);
	return r.stdout.trim();
}

function commitTreo(cayGoc, cha, them) {
	const d = mkdtempSync(join(tmpdir(), "day-gop-that-"));
	try {
		const env = { GIT_INDEX_FILE: join(d, "index") };
		git(env, undefined, "read-tree", cayGoc);
		for (const [duong, noiDung] of them) {
			const blob = git({}, noiDung, "hash-object", "-w", "--stdin");
			git(
				env,
				undefined,
				"update-index",
				"--add",
				"--cacheinfo",
				`100644,${blob},${duong}`,
			);
		}
		const cay = git(env, undefined, "write-tree");
		return git(
			TAC_GIA,
			undefined,
			"commit-tree",
			cay,
			...cha.flatMap((c) => ["-p", c]),
			"-m",
			"pre-push-phan-rieng-pr day-gop-that",
		);
	} finally {
		rmSync(d, { recursive: true, force: true });
	}
}

const sai = [];
const kiem = (dung, ten) => {
	if (!dung) sai.push(ten);
};

const truoc = git({}, undefined, "status", "--porcelain");
const onehub = git({}, undefined, "rev-parse", "refs/remotes/origin/onehub");
const goc = git({}, undefined, "rev-parse", `${onehub}~${LUI}`);
const docs = [`docs/pre-push-gop-${process.pid}.md`, "day gop that\n"];
const ma = [
	`packages/env/src/pre-push-gop-${process.pid}.ts`,
	"export const x = 1;\n",
];
const x = commitTreo(goc, [goc], [docs]);
const m = commitTreo(onehub, [x, onehub], [docs]);
const m2 = commitTreo(onehub, [x, onehub], [docs, ma]);

const tang = git({}, undefined, "diff", "--name-only", "--no-renames", x, m)
	.split("\n")
	.filter(Boolean);
kiem(
	tang.some((t) => /^(apps|packages)\//.test(t)),
	"doi chung duong: phan tang khong co tep duoi apps/ hay packages/",
);
kiem(
	!tang.includes(docs[0]),
	"doi chung duong: tep docs cua X nam trong phan tang",
);
const k = tang.length;
const dongRong = `pre-push: lần đẩy chỉ mang phần của onehub (${k} tệp), PR không tự thêm tệp nào — bỏ test, build; ${DUOI}`;
const dongNang = `pre-push: phần PR tự thêm (1 tệp; ${k} tệp của onehub không tính) có tệp ngoài T1 (${ma[0]}) — chạy đủ năm bước.`;

const r = spawnSync("bash", [".githooks/pre-push", "origin", "day-gop-that"], {
	cwd: GOC,
	env: envSach,
	encoding: "utf8",
	input: `refs/heads/thu ${m} refs/heads/thu ${x}\n`,
	maxBuffer: 256 * 1024 * 1024,
});
const ra = `${r.stdout}${r.stderr}`;
const dong = ra.split("\n");
kiem(r.status === 0, `hook ma ${r.status}`);
kiem(dong.includes(dongRong), `thieu dong rong k=${k}`);
for (const t of BA)
	kiem(dong.includes(`pre-push: bun run ${t}`), `thieu pre-push: bun run ${t}`);
for (const t of ["test", "build"])
	kiem(!dong.includes(`pre-push: bun run ${t}`), `con pre-push: bun run ${t}`);
kiem(
	dong.some((d) => d.startsWith("pre-push: gate matches its shape")),
	"thieu gate matches its shape",
);
kiem(
	dong.some((d) => d.startsWith("  skipped: test, build")),
	"thieu dong skipped",
);

const pl = spawnSync(
	"node",
	["scripts/pre-push-t1.mjs", "--remote", "origin"],
	{
		cwd: GOC,
		env: envSach,
		encoding: "utf8",
		input: `refs/heads/thu ${m2} refs/heads/thu ${x}\n`,
	},
);
kiem(
	pl.status === 0 && pl.stdout.trim() === "",
	`doi chung am: M2 cho stdout «${pl.stdout.trim()}»`,
);
kiem(
	pl.stderr.trim() === dongNang,
	`doi chung am: M2 cho stderr «${pl.stderr.trim()}»`,
);
kiem(
	git({}, undefined, "status", "--porcelain") === truoc,
	"thu muc lam viec doi",
);

if (sai.length) {
	for (const s of sai) console.log(`DO ${s}`);
	console.log(
		dong
			.filter((d) => /^pre-push|^ {2}[a-z:-]+: |failed|problem|^ {2}- /.test(d))
			.slice(-40)
			.join("\n"),
	);
	process.exit(1);
}
console.log(dong.filter((d) => /^pre-push: |^ {2}skipped/.test(d)).join("\n"));
console.log(
	`phan tang ${k} tep, ${tang.filter((t) => /^(apps|packages)\//.test(t)).length} tep duoi apps/ hay packages/`,
);
console.log("dat day-gop-that");
