import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { docGlobT1, quyetDinh, tepT1 } from "../phan-loai.mjs";

const KHO = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const CLI = join(KHO, ".github", "scripts", "phan-loai.mjs");
const laT1Gia = (t) => t.startsWith("docs/") || t.endsWith(".md") || t === ".github/workflows/ci.yml";

const MA_TRAN = [
	["push", "", ["apps/api/x.ts"], true, "khong-phai-pr"],
	["schedule", "", [], true, "khong-phai-pr"],
	["workflow_dispatch", "true", ["docs/a.md"], true, "khong-phai-pr"],
	["pull_request", "true", ["docs/a.md"], false, "nhap"],
	["pull_request", "true", ["apps/api/x.ts"], false, "nhap"],
	["pull_request", "true", [".github/workflows/ci.yml"], false, "nhap"],
	["pull_request", "true", [], false, "nhap"],
	["pull_request", "false", ["docs/a.md", "AGENTS.md"], false, "chi-t1"],
	["pull_request", "false", [".github/workflows/ci.yml"], true, "cham-github"],
	["pull_request", "false", ["docs/a.md", ".github/scripts/x.sh"], true, "cham-github"],
	["pull_request", "false", ["docs/a.md", "apps/api/x.ts"], true, "co-tep-nang"],
	["pull_request", "false", [], true, "khong-co-tep"],
	["pull_request", "", ["docs/a.md"], false, "chi-t1"],
	["pull_request", "", ["apps/api/x.ts"], true, "co-tep-nang"],
];

for (const [suKien, nhap, tep, nang, lyDo] of MA_TRAN) {
	test(`quyetDinh ${suKien} nhap=${JSON.stringify(nhap)} ${JSON.stringify(tep)} -> ${lyDo}`, () => {
		assert.deepEqual(quyetDinh({ suKien, nhap, tep, laT1: laT1Gia }), { nang, lyDo });
	});
}

test("tepT1 dung danh sach glob that cua kho", () => {
	const globs = docGlobT1(KHO);
	const tep = ["AGENTS.md", "CLAUDE.md", "docs/sau/x.md", "apps/api/package.json", "apps/app/x.tsx", ".github/workflows/ci.yml"];
	const t1 = tepT1(globs, tep);
	assert.deepEqual([...t1].sort(), [".github/workflows/ci.yml", "AGENTS.md", "CLAUDE.md", "docs/sau/x.md"]);
});

function git(cwd, ...args) {
	return execFileSync("git", args, { cwd, encoding: "utf8", env: { ...process.env, GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@t", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@t" } }).trim();
}

function dungKho({ sua, motCha = false, coConfig = true }) {
	const goc = mkdtempSync(join(tmpdir(), "phan-loai-"));
	git(goc, "init", "-q", "-b", "goc");
	if (coConfig) {
		mkdirSync(join(goc, "_acceptance"));
		writeFileSync(join(goc, "_acceptance", "config.yaml"), readFileSync(join(KHO, "_acceptance", "config.yaml"), "utf8"));
	}
	mkdirSync(join(goc, "apps", "api"), { recursive: true });
	mkdirSync(join(goc, "docs"), { recursive: true });
	writeFileSync(join(goc, "apps", "api", "a.ts"), "export const a = 1;\n");
	writeFileSync(join(goc, "docs", "x.md"), "x\n");
	git(goc, "add", "-A");
	git(goc, "commit", "-q", "-m", "goc");
	git(goc, "checkout", "-q", "-b", "nhanh");
	sua(goc);
	git(goc, "add", "-A");
	git(goc, "commit", "-q", "-m", "nhanh");
	if (!motCha) {
		git(goc, "checkout", "-q", "goc");
		git(goc, "merge", "-q", "--no-ff", "-m", "hop", "nhanh");
	}
	return goc;
}

function chayCli(goc, env = {}) {
	const ra = join(goc, "github-output");
	writeFileSync(ra, "");
	const r = spawnSync(process.execPath, [CLI, "--goc", goc], { encoding: "utf8", env: { ...process.env, SU_KIEN: "pull_request", NHAP: "false", GITHUB_OUTPUT: ra, GITHUB_STEP_SUMMARY: "", ...env } });
	return { ma: r.status, ra: readFileSync(ra, "utf8") };
}

test("CLI: PR chi sua docs ra nhe chi-t1", () => {
	const goc = dungKho({ sua: (g) => writeFileSync(join(g, "docs", "x.md"), "y\n") });
	try {
		assert.equal(git(goc, "rev-list", "--parents", "-n", "1", "HEAD").split(" ").length, 3);
		const { ma, ra } = chayCli(goc);
		assert.equal(ma, 0);
		assert.match(ra, /^nang=false$/m);
		assert.match(ra, /^ly_do=chi-t1$/m);
	} finally {
		rmSync(goc, { recursive: true, force: true });
	}
});

test("CLI: doi ten ma thanh .md ra nang", () => {
	const goc = dungKho({ sua: (g) => git(g, "mv", "apps/api/a.ts", "docs/a.md") });
	try {
		const { ma, ra } = chayCli(goc);
		assert.equal(ma, 0);
		assert.match(ra, /^nang=true$/m);
		assert.match(ra, /^ly_do=co-tep-nang$/m);
	} finally {
		rmSync(goc, { recursive: true, force: true });
	}
});

test("CLI: HEAD mot cha ra nang kem loi", () => {
	const goc = dungKho({ sua: (g) => writeFileSync(join(g, "docs", "x.md"), "y\n"), motCha: true });
	try {
		const { ma, ra } = chayCli(goc);
		assert.equal(ma, 0);
		assert.match(ra, /^nang=true$/m);
		assert.match(ra, /^ly_do=loi: /m);
	} finally {
		rmSync(goc, { recursive: true, force: true });
	}
});

test("CLI: config vang ra nang kem loi", () => {
	const goc = dungKho({ sua: (g) => writeFileSync(join(g, "docs", "x.md"), "y\n"), coConfig: false });
	try {
		const { ma, ra } = chayCli(goc);
		assert.equal(ma, 0);
		assert.match(ra, /^nang=true$/m);
		assert.match(ra, /^ly_do=loi: /m);
	} finally {
		rmSync(goc, { recursive: true, force: true });
	}
});

test("CLI: PR nhap ra nhe khong can doc tep", () => {
	const goc = dungKho({ sua: (g) => writeFileSync(join(g, "apps", "api", "a.ts"), "export const a = 2;\n"), motCha: true });
	try {
		const { ma, ra } = chayCli(goc, { NHAP: "true" });
		assert.equal(ma, 0);
		assert.match(ra, /^nang=false$/m);
		assert.match(ra, /^ly_do=nhap$/m);
	} finally {
		rmSync(goc, { recursive: true, force: true });
	}
});
