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
	utimesSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

const GOC_KHO = resolve(import.meta.dir, "..", "..", "..");
const NGUON = process.env.DA_CHUNG_NGUON ?? GOC_KHO;
const Z = "0".repeat(40);
const DONG_PHU = "Finished in 1ms on 10 files with 20 rules";
const NAM = ["check-types", "lint", "lint:slop", "test", "build"];
const BA = ["check-types", "lint", "lint:slop"];
const TEP_CHEP = [
	".githooks/pre-push",
	".githooks/gate-shape.json",
	".githooks/da-chung.json",
	"scripts/pre-push-t1.mjs",
	"scripts/pre-push-da-chung.mjs",
	"scripts/verify-gate-shape.mjs",
	"scripts/gate-shape-node-test.mjs",
	".github/scripts/phan-loai.mjs",
	".github/workflows/ci.yml",
	".github/workflows/acceptance.yml",
	"scripts/pre-merge-check.sh",
	"lib/workspace-record.cjs",
	"lib/evidence-core.cjs",
	"lib/eval-yaml.cjs",
	"_acceptance/config.yaml",
	"package.json",
];
const GOC_GOI = ["apps", "packages"];
const LENH_GHIM_LAI = [
	"bun run test -- --filter=api",
	"bun run test -- --filter=app --filter=@crm/ui",
	"bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db",
	"bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation",
	"bunx turbo run lint --force",
	"bun run lint:slop",
	"bunx turbo run build --force",
];
const MAU_CI = join(
	NGUON,
	"_acceptance/trang-ve-gop-va-dau-cay/rang/mau/check-runs-538.json",
);

const BUN_GIA = `#!/usr/bin/env node
const { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");
const { spawnSync } = require("node:child_process");
const [lenh, ...con] = process.argv.slice(2);
if (lenh === "--version") {
	console.log(process.env.BUN_PHIEN_BAN || "1.3.10");
	process.exit(0);
}
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
const GH_GIA = `#!/usr/bin/env node
const { appendFileSync, readFileSync } = require("node:fs");
appendFileSync(process.env.GH_SO, process.argv.slice(2).join(" ") + "\\n");
if (process.env.GH_NGU) {
	Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, Number(process.env.GH_NGU) * 1000);
}
if (process.env.GH_HONG) process.exit(1);
process.stdout.write(readFileSync(process.env.GH_MAU, "utf8"));
`;
const BIEN_MA_TRAN = ["$", "{{ matrix.o.ten }}"].join("");
const OXLINT_GIA = `#!/bin/sh\necho "${DONG_PHU}"\n`;

type Kho = { d: string; goc: string; bin: string; so: string; ghSo: string };
type Ket = { ma: number; ra: string; loi: string };

const TAC_GIA = {
	GIT_AUTHOR_NAME: "t",
	GIT_AUTHOR_EMAIL: "t@t",
	GIT_COMMITTER_NAME: "t",
	GIT_COMMITTER_EMAIL: "t@t",
};

const tam: string[] = [];
const CAU_HINH_RONG = join(
	realpathSync(mkdtempSync(join(tmpdir(), "da-chung-cau-hinh-"))),
	"gitconfig",
);
writeFileSync(CAU_HINH_RONG, "");
tam.push(dirname(CAU_HINH_RONG));
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
	Object.assign(
		env,
		TAC_GIA,
		{ GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: CAU_HINH_RONG },
		them,
	);
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
	const d = realpathSync(mkdtempSync(join(tmpdir(), "da-chung-mau-")));
	tam.push(d);
	const goc = join(d, "kho");
	for (const t of [...TEP_CHEP, ...manifest()]) {
		mkdirSync(dirname(join(goc, t)), { recursive: true });
		copyFileSync(join(NGUON, t), join(goc, t));
	}
	chmodSync(join(goc, ".githooks/pre-push"), 0o755);
	ghi(goc, "apps/api/a.ts", "export const a = 1;\n");
	ghi(goc, "docs/x.md", "x\n");
	ghi(goc, ".env", "A=1\n");
	ghi(goc, ".gitignore", ".turbo\nnode_modules\n.env\n");
	mkdirSync(join(goc, "node_modules/.bin"), { recursive: true });
	writeFileSync(join(goc, "node_modules/.bin/oxlint"), OXLINT_GIA);
	chmodSync(join(goc, "node_modules/.bin/oxlint"), 0o755);
	mkdirSync(join(d, "bin"));
	writeFileSync(join(d, "bin", "bun"), BUN_GIA);
	writeFileSync(join(d, "bin", "gh"), GH_GIA);
	chmodSync(join(d, "bin", "bun"), 0o755);
	chmodSync(join(d, "bin", "gh"), 0o755);
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

function dungKho(): Kho {
	const d = realpathSync(mkdtempSync(join(tmpdir(), "da-chung-")));
	tam.push(d);
	cpSync(khoMau(), d, { recursive: true });
	const goc = join(d, "kho");
	git(goc, "config", "core.hooksPath", ".githooks");
	git(goc, "checkout", "-q", "-b", "x");
	return {
		d,
		goc,
		bin: join(d, "bin"),
		so: join(d, "so-bun"),
		ghSo: join(d, "so-gh"),
	};
}

function day(
	k: Kho,
	them: Record<string, string> = {},
	refs = ["HEAD:refs/heads/x"],
): Ket {
	rmSync(k.so, { force: true });
	const r = spawnSync("git", ["push", "origin", ...refs], {
		cwd: k.goc,
		env: envSach({
			PATH: `${them.PATH_TRUOC ?? ""}${k.bin}:${process.env.PATH ?? ""}`,
			SO_BUN: k.so,
			BUN_HONG: "",
			GH_SO: k.ghSo,
			GH_MAU: MAU_CI,
			...them,
		}),
		encoding: "utf8",
	});
	return { ma: r.status ?? -1, ra: `${r.stdout}${r.stderr}`, loi: r.stderr };
}

function phanLoai(k: Kho, scripts: string, ...dong: string[]): Ket {
	const r = spawnSync(
		"node",
		[`${scripts}/pre-push-t1.mjs`, "--remote", "origin"],
		{
			cwd: k.goc,
			env: envSach({ PATH: `${k.bin}:${process.env.PATH ?? ""}` }),
			encoding: "utf8",
			input: dong.map((x) => `${x}\n`).join(""),
		},
	);
	return { ma: r.status ?? -1, ra: r.stdout.trim(), loi: r.stderr.trim() };
}

function soBun(k: Kho): string[] {
	return existsSync(k.so)
		? readFileSync(k.so, "utf8").trim().split("\n").filter(Boolean)
		: [];
}

function thuMucChung(k: Kho): string {
	return resolve(k.goc, git(k.goc, "rev-parse", "--git-common-dir"));
}

function tepDau(k: Kho, sha: string): string {
	return join(thuMucChung(k), "crm-pre-push", "da-chung", `${sha}.json`);
}

function dauRa(k: Kho, sha: string): { buoc: string[]; luc: string } | null {
	const t = tepDau(k, sha);
	return existsSync(t) ? JSON.parse(readFileSync(t, "utf8")) : null;
}

function head(k: Kho): string {
	return git(k.goc, "rev-parse", "HEAD");
}

function dongDaChung(loi: string): string[] {
	return loi.split("\n").filter((d) => d.includes("đã xanh ở"));
}

async function moDun(k: Kho) {
	return import(join(k.goc, "scripts/pre-push-da-chung.mjs"));
}

type DongSoChay = {
	cmd?: string;
	sha?: string;
	exit_code?: number | string;
	kind?: string;
	tong_ket?: { ket_cuc?: string };
	suites_exit?: number[];
};

function docSoChay(): DongSoChay[] {
	const ra: DongSoChay[] = [];
	for (const ten of readdirSync(join(NGUON, "_acceptance"))) {
		const tep = join(NGUON, "_acceptance", ten, "run-log.jsonl");
		if (!existsSync(tep)) continue;
		for (const dong of readFileSync(tep, "utf8").split("\n")) {
			if (!dong.startsWith("{")) continue;
			try {
				ra.push(JSON.parse(dong));
			} catch {}
		}
	}
	return ra;
}

function dongSoChayThat() {
	const s4 = new Map<string, DongSoChay>();
	let repin: DongSoChay | null = null;
	for (const d of docSoChay()) {
		if (
			d.cmd !== undefined &&
			LENH_GHIM_LAI.includes(d.cmd) &&
			Number(d.exit_code) === 0 &&
			!s4.has(d.cmd)
		)
			s4.set(d.cmd, d);
		if (
			!repin &&
			d.kind === "repin" &&
			d.tong_ket?.ket_cuc === "xanh" &&
			Array.isArray(d.suites_exit) &&
			d.suites_exit.length === LENH_GHIM_LAI.length
		)
			repin = d;
	}
	if (s4.size !== LENH_GHIM_LAI.length || !repin)
		throw new Error("so chay that thieu dong mau");
	return { s4, repin };
}

function soChay(dongs: DongSoChay[]): string {
	return `${dongs.map((d) => JSON.stringify(d)).join("\n")}\n`;
}

const that = () => dongSoChayThat();
const s4Du = (sha: string) =>
	LENH_GHIM_LAI.map((c) => ({ ...that().s4.get(c), sha }));

describe("cay-ma", () => {
	const CA: [string, (k: Kho) => void, boolean][] = [
		["docs/x.md", (k) => commit(k.goc, ["docs/x.md", "y\n"]), true],
		[
			"run-log.jsonl",
			(k) => commit(k.goc, ["_acceptance/h/run-log.jsonl", "{}\n"]),
			true,
		],
		[
			"LO-TRINH.html",
			(k) => commit(k.goc, ["LO-TRINH.html", "<p></p>\n"]),
			false,
		],
		[
			"apps/api/a.ts",
			(k) => commit(k.goc, ["apps/api/a.ts", "export const a = 3;\n"]),
			false,
		],
		[
			"ci.yml",
			(k) => commit(k.goc, [".github/workflows/ci.yml", "name: CI\n"]),
			false,
		],
		[
			"config.yaml",
			(k) =>
				commit(k.goc, [
					"_acceptance/config.yaml",
					`${readFileSync(join(k.goc, "_acceptance/config.yaml"), "utf8")}\n`,
				]),
			false,
		],
		[
			"301 tep docs",
			(k) =>
				commit(
					k.goc,
					...Array.from(
						{ length: 301 },
						(_, i) => [`docs/n${i}.md`, "n\n"] as [string, string],
					),
				),
			false,
		],
		["khong khac", () => {}, true],
	];

	test("cay-ma: ma tran viet truoc co 8 ca", () => {
		expect(CA.length).toBe(8);
	});

	for (const [ten, sua, cung] of CA) {
		test(`cay-ma: ${ten} -> ${cung ? "cung" : "khac"}`, async () => {
			const k = dungKho();
			const a = head(k);
			sua(k);
			const b = head(k);
			const m = await moDun(k);
			const ra = m.cungCayMa(k.goc, m.docKhai(k.goc), b, [a]);
			expect({ ten, cung: ra.has(a) }).toEqual({ ten, cung });
		});
	}
});

describe("dau-hook", () => {
	test("dau-hook (a)(b): day du nam roi day cung cay bo het", () => {
		const k = dungKho();
		const s1 = commit(k.goc, ["apps/api/a.ts", "export const a = 2;\n"]);
		const r1 = day(k);
		expect(r1.ma).toBe(0);
		expect(soBun(k)).toEqual(NAM);
		expect(dauRa(k, s1)?.buoc).toEqual(NAM);
		const s2 = commit(k.goc, ["docs/x.md", "y\n"]);
		const r2 = day(k);
		expect(r2.ma).toBe(0);
		expect(soBun(k)).toEqual([]);
		const dong = dongDaChung(r2.loi);
		expect(dong.length).toBe(1);
		expect(dong[0]).toMatch(
			new RegExp(
				`^pre-push: cây mã của ${s2.slice(0, 9)} đã xanh ở hook \\(${s1.slice(0, 9)}, [0-9T:Z-]+\\) — bỏ check-types, lint, lint:slop, test, build\\.$`,
			),
		);
		expect(r2.ra).toContain("gate matches its shape");
		expect(existsSync(tepDau(k, s2))).toBe(false);
	});

	test("dau-hook (c): day do khong ghi dau", () => {
		const k = dungKho();
		const s1 = commit(k.goc, ["apps/api/a.ts", "export const a = 2;\n"]);
		expect(day(k, { BUN_HONG: "test" }).ma).not.toBe(0);
		expect(existsSync(tepDau(k, s1))).toBe(false);
		commit(k.goc, ["docs/x.md", "y\n"]);
		expect(day(k).ma).toBe(0);
		expect(soBun(k)).toEqual(NAM);
	});

	test("dau-hook (d): day chi-T1 ghi dung ba buoc da chay", () => {
		const k = dungKho();
		const s1 = commit(k.goc, ["docs/x.md", "y\n"]);
		expect(day(k).ma).toBe(0);
		expect(soBun(k)).toEqual(["check-types", "lint", "lint:slop"]);
		expect(dauRa(k, s1)?.buoc).toEqual(["check-types", "lint", "lint:slop"]);
	});

	test("dau-hook (e): chuoi ngay 13 roi 15", () => {
		const k = dungKho();
		const s1 = commit(k.goc, ["apps/api/a.ts", "export const a = 2;\n"]);
		day(k);
		const sua = (ngay: number) => {
			const d = JSON.parse(readFileSync(tepDau(k, s1), "utf8"));
			d.luc = new Date(Date.now() - ngay * 86400000)
				.toISOString()
				.replace(/\.\d{3}Z$/, "Z");
			writeFileSync(tepDau(k, s1), JSON.stringify(d));
		};
		sua(13);
		const s2 = commit(k.goc, ["docs/x.md", "y\n"]);
		expect(day(k).ma).toBe(0);
		expect(soBun(k)).toEqual([]);
		expect(existsSync(tepDau(k, s2))).toBe(false);
		sua(15);
		commit(k.goc, ["docs/x.md", "z\n"]);
		expect(day(k).ma).toBe(0);
		expect(soBun(k)).toEqual(BA);
	});

	test("dau-hook (f): .env doi thi khong dung dau", () => {
		const k = dungKho();
		commit(k.goc, ["apps/api/a.ts", "export const a = 2;\n"]);
		day(k);
		writeFileSync(join(k.goc, ".env"), "A=2\n");
		commit(k.goc, ["docs/x.md", "y\n"]);
		expect(day(k).ma).toBe(0);
		expect(soBun(k)).toEqual(BA);
	});

	test("dau-hook (g): bun va node khac thi khong dung dau", () => {
		const k = dungKho();
		commit(k.goc, ["apps/api/a.ts", "export const a = 2;\n"]);
		day(k);
		commit(k.goc, ["docs/x.md", "y\n"]);
		expect(day(k, { BUN_PHIEN_BAN: "9.9.9" }).ma).toBe(0);
		expect(soBun(k)).toEqual(BA);
		const nodeGia = join(k.d, "node-gia");
		mkdirSync(nodeGia);
		const that = spawnSync("which", ["node"], {
			encoding: "utf8",
		}).stdout.trim();
		writeFileSync(
			join(nodeGia, "node"),
			`#!/bin/sh\nif [ "$1" = "--version" ]; then echo v0.0.1-gia; exit 0; fi\nexec "${that}" "$@"\n`,
		);
		chmodSync(join(nodeGia, "node"), 0o755);
		commit(k.goc, ["docs/x.md", "z\n"]);
		expect(day(k, { PATH_TRUOC: `${nodeGia}:` }).ma).toBe(0);
		expect(soBun(k)).toEqual(BA);
	});

	test("dau-hook (h): tep dau hong", () => {
		const k = dungKho();
		const s1 = commit(k.goc, ["apps/api/a.ts", "export const a = 2;\n"]);
		day(k);
		writeFileSync(tepDau(k, s1), "{");
		commit(k.goc, ["docs/x.md", "y\n"]);
		const r = day(k);
		expect(r.ma).toBe(0);
		expect(soBun(k)).toEqual(BA);
		expect(r.loi).not.toContain("không đọc được dấu cây");
	});

	test("dau-hook (i): hai ref", () => {
		const k = dungKho();
		commit(k.goc, ["apps/api/a.ts", "export const a = 2;\n"]);
		day(k);
		commit(k.goc, ["docs/x.md", "y\n"]);
		git(k.goc, "branch", "-f", "y", "HEAD");
		expect(day(k, {}, ["HEAD:refs/heads/x", "y:refs/heads/y"]).ma).toBe(0);
		expect(soBun(k)).toEqual([]);
		const k2 = dungKho();
		commit(k2.goc, ["apps/api/a.ts", "export const a = 2;\n"]);
		day(k2);
		commit(k2.goc, ["docs/x.md", "y\n"]);
		git(k2.goc, "checkout", "-q", "-b", "y", "onehub");
		const sy = commit(k2.goc, ["apps/api/a.ts", "export const a = 9;\n"]);
		commit(k2.goc, [
			"_acceptance/h/run-log.jsonl",
			soChay(s4Du(sy).filter((d) => d.cmd !== LENH_GHIM_LAI[4])),
		]);
		expect(day(k2, {}, ["x:refs/heads/x", "y:refs/heads/y"]).ma).toBe(0);
		expect(soBun(k2)).toEqual(["check-types", "lint"]);
	});

	test("dau-hook (j): chung cua CI khong thanh dau hook", () => {
		const k = dungKho();
		git(k.goc, "remote", "set-url", "origin", "https://github.com/x/y.git");
		git(k.goc, "remote", "set-url", "--push", "origin", "../remote.git");
		commit(k.goc, ["apps/api/a.ts", "export const a = 2;\n"]);
		const r1 = day(k);
		expect(r1.ma).toBe(0);
		expect(dongDaChung(r1.loi)[0]).toContain("đã xanh ở CI");
		commit(k.goc, ["docs/x.md", "y\n"]);
		const r2 = day(k, { GH_HONG: "1" });
		expect(r2.loi).not.toContain("đã xanh ở hook");
		expect(soBun(k)).toEqual(BA);
	});
});

describe("so-chay", () => {
	function khoSoChay(dongs: (sha: string) => DongSoChay[]): Kho {
		const k = dungKho();
		const s1 = commit(k.goc, ["apps/api/a.ts", "export const a = 2;\n"]);
		commit(k.goc, ["_acceptance/h/run-log.jsonl", soChay(dongs(s1))]);
		return k;
	}

	test("so-chay (a): dong S4 that du bay lenh", () => {
		const k = khoSoChay(s4Du);
		const r = day(k);
		expect(r.ma).toBe(0);
		expect(soBun(k)).toEqual(["check-types"]);
		expect(dongDaChung(r.loi)[0]).toContain("đã xanh ở sổ chạy S4");
	});

	test("so-chay (b): dong repin that", () => {
		const k = khoSoChay((sha) => [{ ...that().repin, sha }]);
		const r = day(k);
		expect(r.ma).toBe(0);
		expect(soBun(k)).toEqual(["check-types"]);
		expect(dongDaChung(r.loi)[0]).toContain("đã xanh ở sổ chạy ghim lại");
	});

	test("so-chay (c): thieu goi test thi test chay", () => {
		const k = khoSoChay((sha) =>
			s4Du(sha).filter((d) => d.cmd !== LENH_GHIM_LAI[3]),
		);
		expect(day(k).ma).toBe(0);
		expect(soBun(k)).toEqual(["check-types", "test"]);
	});

	test("so-chay (d): lint ma khac 0", () => {
		const k = khoSoChay((sha) =>
			s4Du(sha).map((d) =>
				d.cmd === LENH_GHIM_LAI[4] ? { ...d, exit_code: 1 } : d,
			),
		);
		expect(day(k).ma).toBe(0);
		expect(soBun(k)).toEqual(["check-types", "lint"]);
	});

	test("so-chay (e): repin do khong chung gi", () => {
		const k = khoSoChay((sha) => [
			{ ...that().repin, sha, tong_ket: { ket_cuc: "do" } },
		]);
		expect(day(k).ma).toBe(0);
		expect(soBun(k)).toEqual(NAM);
	});

	test("so-chay (f): sha khac cay ma", () => {
		const k = dungKho();
		const s0 = head(k);
		commit(k.goc, ["apps/api/a.ts", "export const a = 2;\n"]);
		commit(k.goc, ["_acceptance/h/run-log.jsonl", soChay(s4Du(s0))]);
		expect(day(k).ma).toBe(0);
		expect(soBun(k)).toEqual(NAM);
	});

	test("so-chay (g): moi dong lenh xanh cua so chay that duoc bo doc nhan", async () => {
		const m = await import(join(NGUON, "scripts/pre-push-da-chung.mjs"));
		let doc = 0;
		let loc = 0;
		for (const d of docSoChay()) {
			if (!d || Array.isArray(d)) continue;
			if (
				d.cmd !== undefined &&
				d.cmd !== null &&
				/^[0-9a-f]{40}$/.test(String(d.sha)) &&
				(d.exit_code === 0 || d.exit_code === "0") &&
				d.kind !== "repin-do"
			)
				loc += 1;
			if (m.lenhXanhCuaDong(d)) doc += 1;
		}
		expect(loc).toBeGreaterThan(0);
		expect(doc).toBe(loc);
	});
});

describe("nguon-ci", () => {
	function khoCi(): Kho {
		const k = dungKho();
		git(k.goc, "remote", "set-url", "origin", "https://github.com/x/y.git");
		git(k.goc, "remote", "set-url", "--push", "origin", "../remote.git");
		commit(k.goc, ["apps/api/a.ts", "export const a = 2;\n"]);
		return k;
	}
	function mauSua(
		k: Kho,
		sua: (c: { name: string; conclusion: string }) => void,
	): string {
		const d = JSON.parse(readFileSync(MAU_CI, "utf8"));
		for (const c of d.check_runs) sua(c);
		const tep = join(k.d, "mau.json");
		writeFileSync(tep, JSON.stringify(d));
		return tep;
	}

	test("nguon-ci (a): mau nguyen ven", () => {
		const k = khoCi();
		const r = day(k);
		expect(r.ma).toBe(0);
		expect(soBun(k)).toEqual([]);
		expect(dongDaChung(r.loi)[0]).toContain("đã xanh ở CI");
	});

	test("nguon-ci (b): o test bi bo qua", () => {
		const k = khoCi();
		const mau = mauSua(k, (c) => {
			if (c.name === "test (con-lai)") c.conclusion = "skipped";
		});
		expect(day(k, { GH_MAU: mau }).ma).toBe(0);
		expect(soBun(k)).toEqual(["test"]);
	});

	test("nguon-ci (c): gh hong", () => {
		const k = khoCi();
		expect(day(k, { GH_HONG: "1" }).ma).toBe(0);
		expect(soBun(k)).toEqual(NAM);
	});

	test("nguon-ci (d): gh qua han", () => {
		const k = khoCi();
		const khai = JSON.parse(
			readFileSync(join(k.goc, ".githooks/da-chung.json"), "utf8"),
		);
		khai.gioi_han.giay_gh = 2;
		commit(k.goc, [
			".githooks/da-chung.json",
			JSON.stringify(khai, null, "\t"),
		]);
		const t0 = Date.now();
		expect(day(k, { GH_NGU: "30" }).ma).toBe(0);
		expect(Date.now() - t0).toBeLessThan(20000);
		expect(soBun(k)).toEqual(NAM);
	});

	test("nguon-ci (e): remote khong phai github", () => {
		const k = dungKho();
		commit(k.goc, ["apps/api/a.ts", "export const a = 2;\n"]);
		expect(day(k).ma).toBe(0);
		expect(existsSync(k.ghSo)).toBe(false);
		expect(soBun(k)).toEqual(NAM);
	});

	test("nguon-ci (f): ten job khop ci.yml, acceptance.yml va mau", () => {
		const khai = JSON.parse(
			readFileSync(join(NGUON, ".githooks/da-chung.json"), "utf8"),
		);
		const tenKhai = [
			...new Set(Object.values(khai.ci as Record<string, string[]>).flat()),
		].sort();
		const ci = readFileSync(join(NGUON, ".github/workflows/ci.yml"), "utf8");
		const acc = readFileSync(
			join(NGUON, ".github/workflows/acceptance.yml"),
			"utf8",
		);
		const tenJob = (chu: string) =>
			[...chu.matchAll(/^ {4}name: (.+)$/gm)].map((m) => m[1].trim());
		const oMaTran = [...ci.matchAll(/^ {10}- ten: (\S+)$/gm)].map((m) => m[1]);
		const dung = new Set<string>();
		for (const t of [...tenJob(ci), ...tenJob(acc)]) {
			if (t.includes(BIEN_MA_TRAN))
				for (const o of oMaTran) dung.add(t.replace(BIEN_MA_TRAN, o));
			else dung.add(t);
		}
		expect(tenKhai.filter((t) => !dung.has(t))).toEqual([]);
		const tenMau = new Set(
			JSON.parse(readFileSync(MAU_CI, "utf8")).check_runs.map(
				(c: { name: string }) => c.name,
			),
		);
		expect(tenKhai.filter((t) => !tenMau.has(t))).toEqual([]);
		expect(tenKhai.length).toBe(5);
	});
});

describe("nhu-cu", () => {
	const CU = ["pre-push-t1.mjs", "verify-gate-shape.mjs"];

	function docCu(t: string): string {
		const r = spawnSync(
			"git",
			["show", `refs/remotes/origin/onehub:scripts/${t}`],
			{
				cwd: NGUON,
				encoding: "utf8",
				maxBuffer: 1 << 26,
			},
		);
		if (r.status !== 0) throw new Error(`khong doc duoc ${t} o origin/onehub`);
		return r.stdout;
	}

	function doiBan(k: Kho, ban: "cu" | "moi"): void {
		for (const t of CU) {
			const dich = join(k.goc, "scripts", t);
			if (ban === "cu") {
				copyFileSync(dich, `${dich}.moi`);
				writeFileSync(dich, docCu(t));
			} else copyFileSync(`${dich}.moi`, dich);
		}
	}

	const MAU: [string, [string, string][]][] = [
		["docs", [["docs/a.md", "a\n"]]],
		["ma", [["apps/api/a.ts", "export const a = 2;\n"]]],
		[
			"docs va ma",
			[
				["docs/a.md", "a\n"],
				["apps/api/a.ts", "export const a = 3;\n"],
			],
		],
	];

	for (const [ten, tep] of MAU) {
		test(`nhu-cu (a): ${ten} khong dau thi nhu origin/onehub`, () => {
			const k = dungKho();
			commit(k.goc, ...tep);
			const dong = `refs/heads/x ${head(k)} refs/heads/x ${Z}`;
			const moi = phanLoai(k, "scripts", dong);
			doiBan(k, "cu");
			const cu = phanLoai(k, "scripts", dong);
			const dayCu = day(k, {}, ["HEAD:refs/heads/cu"]);
			const soCu = soBun(k);
			doiBan(k, "moi");
			const dayMoi = day(k, {}, ["HEAD:refs/heads/moi"]);
			expect(moi).toEqual(cu);
			expect({ ma: dayMoi.ma, so: soBun(k) }).toEqual({
				ma: dayCu.ma,
				so: soCu,
			});
			expect(soCu.length).toBeGreaterThan(0);
		});
	}

	test("nhu-cu (b): xoa tep khai thi chay du du co dau", () => {
		const k = dungKho();
		commit(k.goc, ["apps/api/a.ts", "export const a = 2;\n"]);
		day(k);
		commit(k.goc, ["docs/x.md", "y\n"]);
		rmSync(join(k.goc, ".githooks/da-chung.json"));
		const r = day(k);
		expect(r.ma).toBe(0);
		expect(soBun(k)).toEqual(["check-types", "lint", "lint:slop"]);
		expect(dongDaChung(r.loi)).toEqual([]);
	});
});

describe("verify-da-chung", () => {
	function verify(k: Kho, boQua: string, truoc: string): Ket {
		const log = join(k.d, "log");
		if (!existsSync(log)) writeFileSync(log, "");
		const r = spawnSync(
			"node",
			[
				"scripts/verify-gate-shape.mjs",
				"--log",
				log,
				"--runs-before",
				truoc,
				"--bo-qua",
				boQua,
			],
			{
				cwd: k.goc,
				env: envSach({ PATH: `${k.bin}:${process.env.PATH ?? ""}` }),
				encoding: "utf8",
			},
		);
		return { ma: r.status ?? -1, ra: r.stdout, loi: r.stderr };
	}
	function truocPhieu(k: Kho): string {
		const t = join(k.d, "truoc");
		writeFileSync(t, "");
		const cu = new Date(Date.now() - 60_000);
		utimesSync(t, cu, cu);
		return t;
	}

	test("verify-da-chung (a): khong phieu thi luat cu", () => {
		const k = dungKho();
		const r = verify(k, NAM.join(" "), truocPhieu(k));
		expect(r.ma).toBe(1);
		expect(r.loi).toContain("t1Only declares");
	});

	test("verify-da-chung (b): tep khai thieu vi_sao", async () => {
		const k = dungKho();
		const khai = JSON.parse(
			readFileSync(join(k.goc, ".githooks/da-chung.json"), "utf8"),
		);
		khai.vi_sao = "";
		writeFileSync(join(k.goc, ".githooks/da-chung.json"), JSON.stringify(khai));
		const truoc = truocPhieu(k);
		(await moDun(k)).ghiPhieu(k.goc, { refs: [head(k)], t1: [], daChung: NAM });
		const r = verify(k, NAM.join(" "), truoc);
		expect(r.ma).toBe(1);
		expect(r.loi).toContain("vi_sao");
	});

	test("verify-da-chung (c): khai da chung ma van chay", async () => {
		const k = dungKho();
		spawnSync("bun", ["run", "lint"], {
			cwd: k.goc,
			env: envSach({
				PATH: `${k.bin}:${process.env.PATH ?? ""}`,
				SO_BUN: k.so,
			}),
		});
		const truoc = truocPhieu(k);
		(await moDun(k)).ghiPhieu(k.goc, {
			refs: [head(k)],
			t1: [],
			daChung: ["lint"],
		});
		const r = verify(k, "lint", truoc);
		expect(r.ma).toBe(1);
		expect(r.loi).toContain(
			"checker 'lint' is declared proven for this tree, but it ran",
		);
	});

	test("verify-da-chung (d): khai buoc la", async () => {
		const k = dungKho();
		const truoc = truocPhieu(k);
		(await moDun(k)).ghiPhieu(k.goc, {
			refs: [head(k)],
			t1: [],
			daChung: ["format"],
		});
		const r = verify(k, "format", truoc);
		expect(r.ma).toBe(1);
		expect(r.loi).toContain(
			"'format' as already proven, which is not a declared checker",
		);
	});

	test("verify-da-chung (e): phieu cu hon --runs-before bi bo qua", async () => {
		const k = dungKho();
		(await moDun(k)).ghiPhieu(k.goc, { refs: [head(k)], t1: [], daChung: NAM });
		const tepPhieu = readdirSync(
			join(thuMucChung(k), "crm-pre-push", "phieu"),
		)[0];
		const cu = new Date(Date.now() - 120_000);
		utimesSync(join(thuMucChung(k), "crm-pre-push", "phieu", tepPhieu), cu, cu);
		const r = verify(k, NAM.join(" "), truocPhieu(k));
		expect(r.ma).toBe(1);
		expect(r.loi).toContain("t1Only declares");
	});
});
