import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { configList } from "../../../lib/workspace-record.cjs";
import { docGlobT1, quyetDinh, tachT1, tepT1 } from "../phan-loai.mjs";

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

function dungKho({ sua, motCha = false, coConfig = true, suaConfig = (c) => c }) {
	const goc = mkdtempSync(join(tmpdir(), "phan-loai-"));
	git(goc, "init", "-q", "-b", "goc");
	mkdirSync(join(goc, "apps", "api"), { recursive: true });
	mkdirSync(join(goc, "docs"), { recursive: true });
	writeFileSync(join(goc, "apps", "api", "a.ts"), "export const a = 1;\n");
	writeFileSync(join(goc, "docs", "x.md"), "x\n");
	writeFileSync(join(goc, "docs", "design.md"), "d\n");
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
	if (coConfig) {
		mkdirSync(join(goc, "_acceptance"));
		writeFileSync(join(goc, "_acceptance", "config.yaml"), suaConfig(readFileSync(join(KHO, "_acceptance", "config.yaml"), "utf8")));
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

const CFG = readFileSync(join(KHO, "_acceptance", "config.yaml"), "utf8");
const boKhoaMaDoc = (c) => c.replace(/^  t1_ma_doc:\r?\n(?:(?:    .*|\s*)\r?\n)*/m, "");
const laMaDocGia = (t) => t === "docs/design.md";

const MA_TRAN_MA_DOC = [
	["pull_request", "false", ["docs/design.md"], laMaDocGia, true, "t1-ma-doc"],
	["pull_request", "false", ["docs/design.md", "docs/a.md"], laMaDocGia, true, "t1-ma-doc"],
	["pull_request", "false", ["docs/design.md", "apps/api/x.ts"], laMaDocGia, true, "co-tep-nang"],
	["pull_request", "false", ["docs/design.md"], undefined, true, "co-tep-nang"],
	["pull_request", "true", ["docs/design.md"], laMaDocGia, false, "nhap"],
];

for (const [suKien, nhap, tep, laMaDoc, nang, lyDo] of MA_TRAN_MA_DOC) {
	test(`quyetDinh laMaDoc=${laMaDoc ? "co" : "vang"} nhap=${nhap} ${JSON.stringify(tep)} -> ${lyDo}`, () => {
		const laT1 = (t) => laT1Gia(t) && !laMaDocGia(t);
		assert.deepEqual(quyetDinh({ suKien, nhap, tep, laT1, laMaDoc }), { nang, lyDo });
	});
}

test("docGlobT1 (a): t1_skip_globs theo thu tu roi t1_ma_doc mang tien to !", () => {
	const duong = configList(CFG, "t1_skip_globs");
	const am = configList(CFG, "t1_ma_doc");
	assert.ok(am.length > 0, "config that phai co t1_ma_doc");
	assert.deepEqual(docGlobT1(KHO), [...duong, ...am.map((g) => `!${g}`)]);
});

for (const [ten, sua] of [
	["vang", boKhoaMaDoc],
	["rong", (c) => boKhoaMaDoc(c).replace(/^  t1_skip_globs:/m, "  t1_ma_doc: []\n  t1_skip_globs:")],
]) {
	test(`docGlobT1 (b): khoa t1_ma_doc ${ten} -> nem t1_ma_doc rong`, () => {
		const goc = mkdtempSync(join(tmpdir(), "phan-loai-cfg-"));
		try {
			mkdirSync(join(goc, "_acceptance"));
			writeFileSync(join(goc, "_acceptance", "config.yaml"), sua(CFG));
			assert.equal(configList(sua(CFG), "t1_skip_globs").length, configList(CFG, "t1_skip_globs").length);
			assert.throws(() => docGlobT1(goc), /t1_ma_doc rong/);
			writeFileSync(join(goc, "_acceptance", "config.yaml"), CFG);
			assert.doesNotThrow(() => docGlobT1(goc));
		} finally {
			rmSync(goc, { recursive: true, force: true });
		}
	});
}

const MA_TRAN_TACH = [
	["docs/api.md", "t1"],
	["docs/design.md", "maDoc"],
	["docs/telemetry.md", "maDoc"],
	["CONTEXT.md", "maDoc"],
	["AGENTS.md", "t1"],
	["LO-TRINH.html", "maDoc"],
	["apps/agent/agent/subagents/x/instructions.md", "maDoc"],
	["packages/ui/README.md", "maDoc"],
	["docs/plan/lo-trinh-okr.json", "t1"],
	["apps/api/src/a.ts", "khong"],
	["scripts/pre-merge-check.sh", "maDoc"],
	["_acceptance/soan-okr-cung-tro-ly/rang/ma-tran-quyen.md", "maDoc"],
];

test("tachT1 so ca", () => assert.equal(MA_TRAN_TACH.length, 12, "so ca lech"));

let tach;
const tachThat = () => (tach ??= tachT1(docGlobT1(KHO), MA_TRAN_TACH.map(([t]) => t)));
MA_TRAN_TACH.forEach(([tep, tap], i) => {
	test(`tachT1 ${i + 1} ${tep} -> ${tap}`, () => {
		assert.equal(tachThat().t1.has(tep), tap === "t1", `${tep} trong t1`);
		assert.equal(tachThat().maDoc.has(tep), tap === "maDoc", `${tep} trong maDoc`);
	});
});

test("tepT1 bang tachT1().t1", () => {
	const g = docGlobT1(KHO);
	const tep = MA_TRAN_TACH.map(([t]) => t);
	assert.deepEqual([...tepT1(g, tep)].sort(), [...tachT1(g, tep).t1].sort());
});

test("CLI: PR chi docs/design.md ra nang t1-ma-doc", () => {
	const goc = dungKho({ sua: (g) => writeFileSync(join(g, "docs", "design.md"), "e\n") });
	try {
		const { ma, ra } = chayCli(goc);
		assert.equal(ma, 0);
		assert.match(ra, /^nang=true$/m);
		assert.match(ra, /^ly_do=t1-ma-doc$/m);
	} finally {
		rmSync(goc, { recursive: true, force: true });
	}
});

test("CLI: PR xoa docs/design.md ra nang t1-ma-doc", () => {
	const goc = dungKho({ sua: (g) => git(g, "rm", "-q", "docs/design.md") });
	try {
		const { ra } = chayCli(goc);
		assert.match(ra, /^nang=true$/m);
		assert.match(ra, /^ly_do=t1-ma-doc$/m);
	} finally {
		rmSync(goc, { recursive: true, force: true });
	}
});

test("CLI: PR chi docs/api.md van nhe chi-t1", () => {
	const goc = dungKho({ sua: (g) => writeFileSync(join(g, "docs", "api.md"), "a\n") });
	try {
		const { ma, ra } = chayCli(goc);
		assert.equal(ma, 0);
		assert.match(ra, /^nang=false$/m);
		assert.match(ra, /^ly_do=chi-t1$/m);
	} finally {
		rmSync(goc, { recursive: true, force: true });
	}
});

test("CLI: config thieu t1_ma_doc ra nang kem loi", () => {
	const goc = dungKho({ sua: (g) => writeFileSync(join(g, "docs", "api.md"), "a\n"), suaConfig: boKhoaMaDoc });
	try {
		const { ma, ra } = chayCli(goc);
		assert.equal(ma, 0);
		assert.match(ra, /^nang=true$/m);
		assert.match(ra, /^ly_do=loi: .*t1_ma_doc/m);
	} finally {
		rmSync(goc, { recursive: true, force: true });
	}
});
