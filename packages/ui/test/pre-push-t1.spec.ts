import { afterAll, describe, expect, test } from "bun:test";
import { execFileSync, spawnSync } from "node:child_process";
import {
	chmodSync,
	copyFileSync,
	cpSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	realpathSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

const GOC_KHO = resolve(import.meta.dir, "..", "..", "..");
const NGUON = process.env.PRE_PUSH_T1_NGUON ?? GOC_KHO;
const Z = "0".repeat(40);
const DUOI = "CI phân loại PR theo cùng luật.";
const DONG_PHU = "Finished in 1ms on 10 files with 20 rules";
const TEP_CHEP = [
	".githooks/pre-push",
	".githooks/gate-shape.json",
	"scripts/pre-push-t1.mjs",
	"scripts/verify-gate-shape.mjs",
	"scripts/gate-shape-node-test.mjs",
	".github/scripts/phan-loai.mjs",
	"scripts/pre-merge-check.sh",
	"lib/workspace-record.cjs",
	"lib/evidence-core.cjs",
	"lib/eval-yaml.cjs",
	"_acceptance/config.yaml",
	"package.json",
];
const GOC_GOI = ["apps", "packages"];

const BUN_GIA = `#!/usr/bin/env node
const { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");
const { spawnSync } = require("node:child_process");
const [lenh, ...con] = process.argv.slice(2);
if (lenh !== "run") {
	const r = spawnSync("node", [lenh, ...con], { stdio: "inherit" });
	process.exit(r.status ?? 1);
}
const tv = con[0];
appendFileSync(process.env.SO_BUN, tv + "\\n");
if (tv === "lint:slop") console.log(${JSON.stringify(DONG_PHU)});
else {
	const tasks = [];
	for (const g of ${JSON.stringify(GOC_GOI)}) {
		if (!existsSync(g)) continue;
		for (const d of readdirSync(g)) {
			const m = join(g, d, "package.json");
			if (!existsSync(m)) continue;
			const p = JSON.parse(readFileSync(m, "utf8"));
			if (p.scripts && p.scripts[tv]) tasks.push({ task: tv, package: p.name, cache: { status: "MISS" }, execution: { exitCode: 0 } });
		}
	}
	mkdirSync(".turbo/runs", { recursive: true });
	writeFileSync(join(".turbo/runs", Date.now() + "-" + Math.random().toString(36).slice(2) + ".json"), JSON.stringify({ execution: { command: "turbo run " + tv }, tasks }));
}
process.exit(tv === process.env.BUN_HONG ? 1 : 0);
`;
const OXLINT_GIA = `#!/bin/sh\necho "${DONG_PHU}"\n`;

type Kho = { goc: string; bin: string; so: string };
type Ket = { ma: number; ra: string; loi: string };
type Sua = Record<string, (chu: string) => string>;

const TAC_GIA = {
	GIT_AUTHOR_NAME: "t",
	GIT_AUTHOR_EMAIL: "t@t",
	GIT_COMMITTER_NAME: "t",
	GIT_COMMITTER_EMAIL: "t@t",
};

const tam: string[] = [];
afterAll(() => {
	for (const d of tam) rmSync(d, { recursive: true, force: true });
});

function envSach(them: Record<string, string>): NodeJS.ProcessEnv {
	const env: NodeJS.ProcessEnv = {};
	for (const [k, v] of Object.entries(process.env)) {
		if (v === undefined || k.startsWith("GIT_") || k === "CRM_SKIP_HOOKS")
			continue;
		env[k] = v;
	}
	Object.assign(env, TAC_GIA, them);
	return env;
}

function git(goc: string, ...a: string[]): string {
	const r = spawnSync("git", a, {
		cwd: goc,
		env: envSach({}),
		encoding: "utf8",
	});
	if (r.status !== 0)
		throw new Error(`git ${a.join(" ")} ma ${r.status}: ${r.stderr}`);
	return r.stdout.trim();
}

function ghi(goc: string, duong: string, chu: string): void {
	mkdirSync(dirname(join(goc, duong)), { recursive: true });
	writeFileSync(join(goc, duong), chu);
}

function commit(goc: string, ...tep: [string, string][]): string {
	for (const [d, c] of tep) ghi(goc, d, c);
	git(goc, "add", "--", ...tep.map(([d]) => d));
	git(goc, "commit", "-q", "-m", "c");
	return git(goc, "rev-parse", "HEAD");
}

function manifest(): string[] {
	const ds: string[] = [];
	for (const g of GOC_GOI) {
		for (const d of readdirSync(join(NGUON, g))) {
			const m = join(g, d, "package.json");
			if (existsSync(join(NGUON, m))) ds.push(m);
		}
	}
	return ds;
}

let mau = "";

function khoMau(): string {
	if (mau) return mau;
	const d = realpathSync(mkdtempSync(join(tmpdir(), "pre-push-t1-mau-")));
	tam.push(d);
	const goc = join(d, "kho");
	for (const t of [...TEP_CHEP, ...manifest()]) {
		mkdirSync(dirname(join(goc, t)), { recursive: true });
		copyFileSync(join(NGUON, t), join(goc, t));
	}
	chmodSync(join(goc, ".githooks/pre-push"), 0o755);
	ghi(goc, "apps/api/a.ts", "export const a = 1;\n");
	ghi(goc, "docs/x.md", "x\n");
	ghi(goc, ".gitignore", ".turbo\nnode_modules\n_acceptance/config.yaml\n");
	mkdirSync(join(goc, "node_modules/.bin"), { recursive: true });
	writeFileSync(join(goc, "node_modules/.bin/oxlint"), OXLINT_GIA);
	chmodSync(join(goc, "node_modules/.bin/oxlint"), 0o755);
	mkdirSync(join(d, "bin"));
	writeFileSync(join(d, "bin", "bun"), BUN_GIA);
	chmodSync(join(d, "bin", "bun"), 0o755);
	execFileSync(
		"git",
		["init", "-q", "--template=", "--bare", join(d, "remote.git")],
		{ env: envSach({}) },
	);
	git(d, "init", "-q", "--template=", "-b", "onehub", goc);
	git(goc, "add", "-A");
	git(goc, "commit", "-q", "-m", "goc");
	git(goc, "remote", "add", "origin", "../remote.git");
	git(goc, "push", "-q", "origin", "onehub");
	mau = d;
	return d;
}

function dungKho(bo: string[], sua: Sua): Kho {
	const d = realpathSync(mkdtempSync(join(tmpdir(), "pre-push-t1-")));
	tam.push(d);
	cpSync(khoMau(), d, { recursive: true });
	const goc = join(d, "kho");
	for (const t of bo) rmSync(join(goc, t), { force: true });
	for (const [t, f] of Object.entries(sua))
		writeFileSync(join(goc, t), f(readFileSync(join(goc, t), "utf8")));
	return { goc, bin: join(d, "bin"), so: join(d, "so-bun") };
}

function phanLoai(kho: Kho, ...dong: string[]): Ket {
	const r = spawnSync(
		"node",
		["scripts/pre-push-t1.mjs", "--remote", "origin"],
		{
			cwd: kho.goc,
			env: envSach({}),
			encoding: "utf8",
			input: dong.map((x) => `${x}\n`).join(""),
		},
	);
	return { ma: r.status ?? -1, ra: r.stdout.trim(), loi: r.stderr.trim() };
}

function day(kho: Kho, nhanh: string, hong: string): Ket {
	git(kho.goc, "config", "core.hooksPath", ".githooks");
	rmSync(kho.so, { force: true });
	const r = spawnSync("git", ["push", "origin", `HEAD:refs/heads/${nhanh}`], {
		cwd: kho.goc,
		env: envSach({
			PATH: `${kho.bin}:${process.env.PATH ?? ""}`,
			SO_BUN: kho.so,
			BUN_HONG: hong,
		}),
		encoding: "utf8",
	});
	return { ma: r.status ?? -1, ra: `${r.stdout}${r.stderr}`, loi: r.stderr };
}

function hookTrucTiep(kho: Kho, dong: string): Ket {
	rmSync(kho.so, { force: true });
	const r = spawnSync("bash", [".githooks/pre-push", "origin", "x"], {
		cwd: kho.goc,
		env: envSach({
			PATH: `${kho.bin}:${process.env.PATH ?? ""}`,
			SO_BUN: kho.so,
			BUN_HONG: "",
		}),
		encoding: "utf8",
		input: `${dong}\n`,
	});
	return { ma: r.status ?? -1, ra: `${r.stdout}${r.stderr}`, loi: r.stderr };
}

function soBun(kho: Kho): string[] {
	return existsSync(kho.so)
		? readFileSync(kho.so, "utf8").trim().split("\n").filter(Boolean)
		: [];
}

function dongBo(n: number, ds: string): string {
	return `pre-push: chỉ tệp T1 (${n} tệp) — bỏ ${ds}; ${DUOI}`;
}

function dongMoi(kho: Kho, nhanh: string): string {
	return `refs/heads/${nhanh} ${git(kho.goc, "rev-parse", "HEAD")} refs/heads/${nhanh} ${Z}`;
}

function boKhoiT1(chu: string): string {
	const hinh = JSON.parse(chu);
	delete hinh.t1Only;
	return JSON.stringify(hinh, null, "\t");
}

function themGlob(chu: string): string {
	return chu.replace(
		"  t1_skip_globs:\n",
		'  t1_skip_globs:\n    - "apps/x/**"\n',
	);
}

function chiBoBuild(chu: string): string {
	const hinh = JSON.parse(chu);
	hinh.t1Only.skip = ["build"];
	return JSON.stringify(hinh, null, "\t");
}

const BO = "test build";
const LOI_DAU = "pre-push: không phân loại được lần đẩy (";
const NAM = ["check-types", "lint", "lint:slop", "test", "build"];
const BA = ["check-types", "lint", "lint:slop"];

type Ca = { ten: string; chay: () => void };

const CA: Ca[] = [
	{
		ten: "1 ref moi chi docs",
		chay: () => {
			const k = dungKho([], {});
			git(k.goc, "checkout", "-q", "-b", "x");
			commit(k.goc, ["docs/a.md", "a\n"]);
			expect(git(k.goc, "diff", "--name-only", "onehub", "HEAD")).toBe(
				"docs/a.md",
			);
			expect(phanLoai(k, dongMoi(k, "x"))).toEqual({
				ma: 0,
				ra: BO,
				loi: dongBo(1, "test, build"),
			});
		},
	},
	{
		ten: "2 ref moi docs va ma",
		chay: () => {
			const k = dungKho([], {});
			git(k.goc, "checkout", "-q", "-b", "x");
			commit(
				k.goc,
				["docs/a.md", "a\n"],
				["apps/api/a.ts", "export const a = 2;\n"],
			);
			expect(phanLoai(k, dongMoi(k, "x"))).toEqual({ ma: 0, ra: "", loi: "" });
		},
	},
	{
		ten: "3 ref moi chi ci.yml",
		chay: () => {
			const k = dungKho([], {});
			git(k.goc, "checkout", "-q", "-b", "x");
			commit(k.goc, [".github/workflows/ci.yml", "name: CI\n"]);
			expect(phanLoai(k, dongMoi(k, "x"))).toEqual({ ma: 0, ra: "", loi: "" });
		},
	},
	{
		ten: "4 doi ten ma thanh md",
		chay: () => {
			const k = dungKho([], {});
			git(k.goc, "checkout", "-q", "-b", "x");
			git(k.goc, "mv", "apps/api/a.ts", "docs/a2.md");
			git(k.goc, "commit", "-q", "-m", "mv");
			expect(phanLoai(k, dongMoi(k, "x"))).toEqual({ ma: 0, ra: "", loi: "" });
		},
	},
	{
		ten: "5 remote co san, them commit docs",
		chay: () => {
			const k = dungKho([], {});
			git(k.goc, "checkout", "-q", "-b", "x");
			const cu = commit(k.goc, ["apps/api/a.ts", "export const a = 2;\n"]);
			git(k.goc, "push", "-q", "origin", "x");
			const moi = commit(k.goc, ["docs/a.md", "a\n"]);
			expect(phanLoai(k, `refs/heads/x ${moi} refs/heads/x ${cu}`)).toEqual({
				ma: 0,
				ra: BO,
				loi: dongBo(1, "test, build"),
			});
		},
	},
	{
		ten: "6 remote co san, gop onehub mang ma",
		chay: () => {
			const k = dungKho([], {});
			git(k.goc, "checkout", "-q", "-b", "x");
			const cu = commit(k.goc, ["docs/a.md", "a\n"]);
			git(k.goc, "push", "-q", "origin", "x");
			git(k.goc, "checkout", "-q", "onehub");
			commit(k.goc, ["apps/api/b.ts", "export const b = 1;\n"]);
			git(k.goc, "push", "-q", "origin", "onehub");
			git(k.goc, "checkout", "-q", "x");
			git(k.goc, "merge", "-q", "--no-edit", "onehub");
			expect(
				phanLoai(
					k,
					`refs/heads/x ${git(k.goc, "rev-parse", "HEAD")} refs/heads/x ${cu}`,
				),
			).toEqual({ ma: 0, ra: "", loi: "" });
		},
	},
	{
		ten: "7 ref moi, ma roi docs",
		chay: () => {
			const k = dungKho([], {});
			git(k.goc, "checkout", "-q", "-b", "x");
			commit(k.goc, ["apps/api/a.ts", "export const a = 2;\n"]);
			commit(k.goc, ["docs/a.md", "a\n"]);
			expect(phanLoai(k, dongMoi(k, "x"))).toEqual({ ma: 0, ra: "", loi: "" });
		},
	},
	{
		ten: "8 sha remote bang sha local",
		chay: () => {
			const k = dungKho([], {});
			const h = git(k.goc, "rev-parse", "HEAD");
			expect(
				phanLoai(k, `refs/heads/onehub ${h} refs/heads/onehub ${h}`),
			).toEqual({ ma: 0, ra: "", loi: "" });
		},
	},
	{
		ten: "9 chi dong xoa",
		chay: () => {
			const k = dungKho([], {});
			const h = git(k.goc, "rev-parse", "HEAD");
			expect(phanLoai(k, `(delete) ${Z} refs/heads/x ${h}`)).toEqual({
				ma: 0,
				ra: "",
				loi: "",
			});
		},
	},
	{
		ten: "10 hai ref, docs truoc ma",
		chay: () => {
			const k = dungKho([], {});
			git(k.goc, "checkout", "-q", "-b", "d");
			commit(k.goc, ["docs/a.md", "a\n"]);
			const docs = dongMoi(k, "d");
			git(k.goc, "checkout", "-q", "-b", "m", "onehub");
			commit(k.goc, ["apps/api/a.ts", "export const a = 2;\n"]);
			expect(phanLoai(k, docs, dongMoi(k, "m"))).toEqual({
				ma: 0,
				ra: "",
				loi: "",
			});
		},
	},
	{
		ten: "11 thieu origin/onehub",
		chay: () => {
			const k = dungKho([], {});
			git(k.goc, "checkout", "-q", "-b", "x");
			commit(k.goc, ["docs/a.md", "a\n"]);
			git(k.goc, "update-ref", "-d", "refs/remotes/origin/onehub");
			const r = phanLoai(k, dongMoi(k, "x"));
			expect([r.ma, r.ra]).toEqual([0, ""]);
			expect(r.loi.startsWith(LOI_DAU)).toBe(true);
			expect(r.loi.endsWith(") — chạy đủ năm bước.")).toBe(true);
		},
	},
	{
		ten: "12 gate-shape khong co khoi t1Only",
		chay: () => {
			const k = dungKho([], { ".githooks/gate-shape.json": boKhoiT1 });
			git(k.goc, "checkout", "-q", "-b", "x");
			commit(k.goc, ["docs/a.md", "a\n"]);
			const r = phanLoai(k, dongMoi(k, "x"));
			expect([r.ma, r.ra]).toEqual([0, ""]);
			expect(r.loi.startsWith(LOI_DAU)).toBe(true);
		},
	},
	{
		ten: "13 config.yaml vang",
		chay: () => {
			const k = dungKho(["_acceptance/config.yaml"], {});
			git(k.goc, "checkout", "-q", "-b", "x");
			commit(k.goc, ["docs/a.md", "a\n"]);
			const r = phanLoai(k, dongMoi(k, "x"));
			expect([r.ma, r.ra]).toEqual([0, ""]);
			expect(r.loi.startsWith(LOI_DAU)).toBe(true);
		},
	},
	{
		ten: "14 sha remote khong co trong kho",
		chay: () => {
			const k = dungKho([], {});
			git(k.goc, "checkout", "-q", "-b", "x");
			const h = commit(k.goc, ["docs/a.md", "a\n"]);
			expect(
				phanLoai(k, `refs/heads/x ${h} refs/heads/x ${"1".repeat(40)}`),
			).toEqual({ ma: 0, ra: BO, loi: dongBo(1, "test, build") });
		},
	},
	{
		ten: "15 AGENTS.md o goc kho",
		chay: () => {
			const k = dungKho([], {});
			git(k.goc, "checkout", "-q", "-b", "x");
			commit(k.goc, ["AGENTS.md", "a\n"]);
			expect(phanLoai(k, dongMoi(k, "x")).ra).toBe(BO);
		},
	},
	{
		ten: "16 ba tep T1",
		chay: () => {
			const k = dungKho([], {});
			git(k.goc, "checkout", "-q", "-b", "x");
			commit(
				k.goc,
				["docs/a.md", "a\n"],
				["docs/b.md", "b\n"],
				["CLAUDE.md", "c\n"],
			);
			expect(phanLoai(k, dongMoi(k, "x"))).toEqual({
				ma: 0,
				ra: BO,
				loi: dongBo(3, "test, build"),
			});
		},
	},
	{
		ten: "17 hai ref, ma truoc docs",
		chay: () => {
			const k = dungKho([], {});
			git(k.goc, "checkout", "-q", "-b", "d");
			commit(k.goc, ["docs/a.md", "a\n"]);
			const docs = dongMoi(k, "d");
			git(k.goc, "checkout", "-q", "-b", "m", "onehub");
			commit(k.goc, ["apps/api/a.ts", "export const a = 2;\n"]);
			expect(phanLoai(k, dongMoi(k, "m"), docs)).toEqual({
				ma: 0,
				ra: "",
				loi: "",
			});
		},
	},
	{
		ten: "18 hai ref deu docs",
		chay: () => {
			const k = dungKho([], {});
			git(k.goc, "checkout", "-q", "-b", "d");
			commit(k.goc, ["docs/a.md", "a\n"], ["docs/b.md", "b\n"]);
			const mot = dongMoi(k, "d");
			git(k.goc, "checkout", "-q", "-b", "e", "onehub");
			commit(k.goc, ["docs/c.md", "c\n"]);
			expect(phanLoai(k, mot, dongMoi(k, "e"))).toEqual({
				ma: 0,
				ra: BO,
				loi: dongBo(3, "test, build"),
			});
		},
	},
];

describe("pre-push-t1", () => {
	test("phan-loai: ma tran viet truoc co 18 ca", () => {
		expect(CA.length).toBe(18);
	});

	for (const ca of CA) test(`phan-loai: ${ca.ten}`, ca.chay, 60_000);

	test("khai: khoi t1Only cua gate-shape.json", () => {
		const hinh = JSON.parse(
			readFileSync(join(GOC_KHO, ".githooks/gate-shape.json"), "utf8"),
		);
		expect(hinh.t1Only.skip).toEqual(["test", "build"]);
		expect(hinh.t1Only.classifier).toBe("scripts/pre-push-t1.mjs");
		expect(hinh.t1Only.sameRuleAs).toBe(".github/scripts/phan-loai.mjs");
		expect(existsSync(join(GOC_KHO, hinh.t1Only.classifier))).toBe(true);
		expect(existsSync(join(GOC_KHO, hinh.t1Only.sameRuleAs))).toBe(true);
		expect(String(hinh.t1Only.vi_sao).trim().length).toBeGreaterThan(0);
	});

	test("mot-nguon (a): them mot glob vao config doi ket qua", () => {
		const that = dungKho([], {});
		git(that.goc, "checkout", "-q", "-b", "x");
		commit(that.goc, ["apps/x/a.ts", "export const x = 1;\n"]);
		expect(phanLoai(that, dongMoi(that, "x")).ra).toBe("");
		const them = dungKho([], { "_acceptance/config.yaml": themGlob });
		git(them.goc, "checkout", "-q", "-b", "x");
		commit(them.goc, ["apps/x/a.ts", "export const x = 1;\n"]);
		expect(phanLoai(them, dongMoi(them, "x")).ra).toBe(BO);
	}, 60_000);
});

const N_GOI = manifest().length;

function dayChiDocs(kho: Kho, hong: string): Ket {
	git(kho.goc, "checkout", "-q", "-b", "x");
	commit(kho.goc, ["docs/a.md", "a\n"]);
	return day(kho, "x", hong);
}

describe("pre-push-t1 hook", () => {
	test("day-t1 (a): nhanh chi docs bo test va build", () => {
		const k = dungKho([], {});
		const r = dayChiDocs(k, "");
		expect(r.ma).toBe(0);
		expect(r.ra).toContain(dongBo(1, "test, build"));
		expect(soBun(k)).toEqual(BA);
		expect(r.ra).not.toContain("pre-push: bun run test");
		expect(r.ra).not.toContain("pre-push: bun run build");
		expect(r.ra).toContain(
			`pre-push: gate matches its shape across ${N_GOI} packages`,
		);
		expect(
			r.ra.split("\n").some((d) => d.startsWith("  skipped: test, build")),
		).toBe(true);
	}, 60_000);

	test("day-t1 (b): test gia do khong doi ket qua", () => {
		const k = dungKho([], {});
		expect(dayChiDocs(k, "test").ma).toBe(0);
		expect(soBun(k)).toEqual(BA);
	}, 60_000);

	test("day-t1 (c): lint gia do thi chan", () => {
		const k = dungKho([], {});
		const r = dayChiDocs(k, "lint");
		expect(r.ma).not.toBe(0);
		expect(r.ra).toContain("`bun run lint` failed");
	}, 60_000);

	test("day-nang (a): docs va ma chay du nam", () => {
		const k = dungKho([], {});
		git(k.goc, "checkout", "-q", "-b", "x");
		commit(
			k.goc,
			["docs/a.md", "a\n"],
			["apps/api/a.ts", "export const a = 2;\n"],
		);
		const r = day(k, "x", "");
		expect(r.ma).toBe(0);
		expect(soBun(k)).toEqual(NAM);
		expect(r.ra).not.toContain("chỉ tệp T1");
		expect(r.ra).toContain("pre-push: gate matches its shape");
	}, 60_000);

	test("day-nang (b): ma va test gia do thi chan", () => {
		const k = dungKho([], {});
		git(k.goc, "checkout", "-q", "-b", "x");
		commit(k.goc, ["apps/api/a.ts", "export const a = 2;\n"]);
		const r = day(k, "x", "test");
		expect(r.ma).not.toBe(0);
		expect(r.ra).toContain("`bun run test` failed");
	}, 60_000);

	test("day-nang (c): chi ci.yml chay du nam", () => {
		const k = dungKho([], {});
		git(k.goc, "checkout", "-q", "-b", "x");
		commit(k.goc, [".github/workflows/ci.yml", "name: CI\n"]);
		const r = day(k, "x", "");
		expect(r.ma).toBe(0);
		expect(soBun(k)).toEqual(NAM);
	}, 60_000);

	test("day-nang (d): sha remote bang sha local chay du nam", () => {
		const k = dungKho([], {});
		const h = git(k.goc, "rev-parse", "HEAD");
		const r = hookTrucTiep(k, `refs/heads/x ${h} refs/heads/x ${h}`);
		expect(r.ma).toBe(0);
		expect(soBun(k)).toEqual(NAM);
		expect(r.ra).toContain("pre-push: gate matches its shape");
	}, 60_000);

	test("day-nang (e): cay khong co bo phan loai chay du nam", () => {
		const k = dungKho(["scripts/pre-push-t1.mjs"], {});
		const r = dayChiDocs(k, "");
		expect(r.ma).toBe(0);
		expect(soBun(k)).toEqual(NAM);
		expect(r.ra).toContain(
			"pre-push: không phân loại được lần đẩy (thiếu scripts/pre-push-t1.mjs) — chạy đủ năm bước.",
		);
		expect(r.ra).not.toContain("Cannot find module");
		expect(r.ra.split("\n").some((d) => d.startsWith("    at "))).toBe(false);
	}, 60_000);

	test("mot-nguon (c): khai chi bo build thi hook chay test", () => {
		const k = dungKho([], { ".githooks/gate-shape.json": chiBoBuild });
		const r = dayChiDocs(k, "");
		expect(r.ma).toBe(0);
		expect(soBun(k)).toEqual(["check-types", "lint", "lint:slop", "test"]);
		expect(r.ra).toContain("bỏ build;");
		expect(r.ra.split("\n").some((d) => d.startsWith("  skipped: build"))).toBe(
			true,
		);
	}, 60_000);
});

function khoVerify(sua: Sua, chay: string[]): Kho {
	const k = dungKho([], sua);
	for (const tv of chay) {
		const r = spawnSync(join(k.bin, "bun"), ["run", tv], {
			cwd: k.goc,
			env: envSach({ SO_BUN: k.so, BUN_HONG: "" }),
			encoding: "utf8",
		});
		expect(r.status).toBe(0);
	}
	writeFileSync(
		join(k.goc, "log"),
		`pre-push: bun run lint:slop\n${DONG_PHU}\n`,
	);
	writeFileSync(join(k.goc, "truoc"), "");
	return k;
}

function verify(k: Kho, ...them: string[]): Ket {
	const r = spawnSync(
		"node",
		[
			"scripts/verify-gate-shape.mjs",
			"--log",
			"log",
			"--runs-before",
			"truoc",
			...them,
		],
		{ cwd: k.goc, env: envSach({}), encoding: "utf8" },
	);
	return { ma: r.status ?? -1, ra: `${r.stdout}${r.stderr}`, loi: r.stderr };
}

function suaKhoi(
	f: (khoi: Record<string, string | string[]>) => void,
): (chu: string) => string {
	return (chu: string) => {
		const hinh = JSON.parse(chu);
		f(hinh.t1Only);
		return JSON.stringify(hinh, null, "\t");
	};
}

describe("pre-push-t1 verify", () => {
	test("verify (a): co khai, bo test va build", () => {
		const r = verify(khoVerify({}, ["check-types", "lint"]), "--bo-qua", BO);
		expect(r.ma).toBe(0);
		expect(
			r.ra.split("\n").some((d) => d.startsWith("  skipped: test, build")),
		).toBe(true);
	}, 60_000);

	test("verify (b): khong co khoi t1Only", () => {
		const r = verify(
			khoVerify({ ".githooks/gate-shape.json": boKhoiT1 }, [
				"check-types",
				"lint",
			]),
			"--bo-qua",
			BO,
		);
		expect(r.ma).toBe(1);
		expect(r.ra).toContain("declares no t1Only block");
	}, 60_000);

	test("verify (c): tap bo lech khai", () => {
		const r = verify(
			khoVerify({}, ["check-types", "lint", "build"]),
			"--bo-qua",
			"test",
		);
		expect(r.ma).toBe(1);
		expect(r.ra).toContain("t1Only declares");
	}, 60_000);

	test("verify (d): checker khai bo van chay", () => {
		const r = verify(
			khoVerify({}, ["check-types", "lint", "test"]),
			"--bo-qua",
			BO,
		);
		expect(r.ma).toBe(1);
		expect(r.ra).toContain(
			"is declared skipped for a T1-only push, but it ran",
		);
	}, 60_000);

	test("verify (e): khong co --bo-qua ma thieu test", () => {
		const r = verify(khoVerify({}, ["check-types", "lint", "build"]));
		expect(r.ma).toBe(1);
		expect(r.ra).toContain("checker 'test' left no run summary");
	}, 60_000);

	test("verify (f): khai bo mot checker la", () => {
		const k = khoVerify(
			{
				".githooks/gate-shape.json": suaKhoi((khoi) => {
					khoi.skip = ["test", "build", "deploy"];
				}),
			},
			["check-types", "lint"],
		);
		const r = verify(k, "--bo-qua", "test build deploy");
		expect(r.ma).toBe(1);
		expect(r.ra).toContain("deploy");
	}, 60_000);

	test("verify (g): vi_sao rong", () => {
		const k = khoVerify(
			{
				".githooks/gate-shape.json": suaKhoi((khoi) => {
					khoi.vi_sao = "";
				}),
			},
			["check-types", "lint"],
		);
		const r = verify(k, "--bo-qua", BO);
		expect(r.ma).toBe(1);
		expect(r.ra).toContain("vi_sao");
	}, 60_000);
});
