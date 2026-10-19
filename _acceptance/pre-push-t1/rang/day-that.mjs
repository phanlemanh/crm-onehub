import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const DONG_BO = "pre-push: chỉ tệp T1 (1 tệp) — bỏ test, build; CI phân loại PR theo cùng luật.";
const BA = ["check-types", "lint", "lint:slop"];
const envSach = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith("GIT_") && k !== "CRM_SKIP_HOOKS"));
const TAC_GIA = { GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@t", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@t" };

function git(env, input, ...a) {
	const r = spawnSync("git", a, { cwd: GOC, env: { ...envSach, ...env }, encoding: "utf8", input });
	if (r.status !== 0) throw new Error(`git ${a[0]}: ${r.stderr.trim()}`);
	return r.stdout.trim();
}

function commitTreo(duong, noiDung) {
	const d = mkdtempSync(join(tmpdir(), "day-that-"));
	try {
		const env = { GIT_INDEX_FILE: join(d, "index") };
		git(env, undefined, "read-tree", "HEAD");
		const blob = git({}, noiDung, "hash-object", "-w", "--stdin");
		git(env, undefined, "update-index", "--add", "--cacheinfo", `100644,${blob},${duong}`);
		const cay = git(env, undefined, "write-tree");
		return git(TAC_GIA, undefined, "commit-tree", cay, "-p", "HEAD", "-m", "pre-push-t1 day-that");
	} finally {
		rmSync(d, { recursive: true, force: true });
	}
}

const sai = [];
const kiem = (dung, ten) => {
	if (!dung) sai.push(ten);
};

const truoc = git({}, undefined, "status", "--porcelain");
const head = git({}, undefined, "rev-parse", "HEAD");
const docs = commitTreo(`docs/pre-push-t1-${process.pid}.md`, "day that\n");
const ma = commitTreo(`packages/env/src/pre-push-t1-${process.pid}.ts`, "export const x = 1;\n");

const r = spawnSync("bash", [".githooks/pre-push", "origin", "day-that"], {
	cwd: GOC,
	env: envSach,
	encoding: "utf8",
	input: `refs/heads/thu ${docs} refs/heads/thu ${head}\n`,
	maxBuffer: 256 * 1024 * 1024,
});
const ra = `${r.stdout}${r.stderr}`;
const dong = ra.split("\n");
kiem(r.status === 0, `hook ma ${r.status}`);
kiem(dong.includes(DONG_BO), "thieu dong bo (1 tep)");
for (const t of BA) kiem(dong.includes(`pre-push: bun run ${t}`), `thieu pre-push: bun run ${t}`);
for (const t of ["test", "build"]) kiem(!dong.includes(`pre-push: bun run ${t}`), `con pre-push: bun run ${t}`);
kiem(dong.some((d) => d.startsWith("pre-push: gate matches its shape")), "thieu gate matches its shape");
kiem(dong.some((d) => d.startsWith("  skipped: test, build")), "thieu dong skipped");

const pl = spawnSync("node", ["scripts/pre-push-t1.mjs", "--remote", "origin"], {
	cwd: GOC,
	env: envSach,
	encoding: "utf8",
	input: `refs/heads/thu ${ma} refs/heads/thu ${head}\n`,
});
kiem(pl.status === 0 && pl.stdout.trim() === "", `doi chung am: commit co .ts cho stdout «${pl.stdout.trim()}»`);
kiem(git({}, undefined, "status", "--porcelain") === truoc, "thu muc lam viec doi");

if (sai.length) {
	for (const s of sai) console.log(`DO ${s}`);
	console.log(dong.filter((d) => /^pre-push|^  [a-z:-]+: |failed|problem|^  - /.test(d)).slice(-40).join("\n"));
	process.exit(1);
}
console.log(dong.filter((d) => /^pre-push: |^  skipped/.test(d)).join("\n"));
console.log("dat day-that");
