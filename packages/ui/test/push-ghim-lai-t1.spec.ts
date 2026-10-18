import { afterAll, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import {
	chmodSync,
	copyFileSync,
	cpSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	realpathSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

const GOC_KHO = resolve(import.meta.dir, "..", "..", "..");
const CAU_HINH = "_acceptance/config.yaml";
const PHAN_LOAI = join(GOC_KHO, ".github", "scripts", "phan-loai.mjs");
const GLOB_RUN_LOG = "_acceptance/*/run-log.jsonl";
const GLOB_DECISIONS = "_acceptance/*/decisions.jsonl";

type Tach = { t1: Set<string>; maDoc: Set<string> };
type BoPhanLoai = {
	docGlobT1: (goc: string) => string[];
	tachT1: (globs: string[], tep: string[]) => Tach;
};
const phanLoai = (): Promise<BoPhanLoai> => import(PHAN_LOAI);
const { configList } = createRequire(import.meta.url)(
	join(GOC_KHO, "lib", "workspace-record.cjs"),
) as { configList: (chu: string, khoa: string) => string[] };

const tam: string[] = [];
afterAll(() => {
	for (const d of tam) rmSync(d, { recursive: true, force: true });
});

function thuMucTam(tien: string): string {
	const d = realpathSync(mkdtempSync(join(tmpdir(), `pglt-${tien}-`)));
	tam.push(d);
	return d;
}

function ghi(goc: string, duong: string, chu: string): void {
	mkdirSync(dirname(join(goc, duong)), { recursive: true });
	writeFileSync(join(goc, duong), chu);
}

const cauHinhThat = () => readFileSync(join(GOC_KHO, CAU_HINH), "utf8");

function boDong(chu: string, dong: string): string {
	const sau = chu.replace(`\n    - "${dong}"\n`, "\n");
	if (sau === chu) throw new Error(`khong thay dong «${dong}» trong config`);
	return sau;
}

type Tap = "t1" | "maDoc" | "khong";
const tapCua = (k: Tach, tep: string): Tap[] => [
	...(k.t1.has(tep) ? (["t1"] as const) : []),
	...(k.maDoc.has(tep) ? (["maDoc"] as const) : []),
];
const mongDoi = (tap: Tap): Tap[] => (tap === "khong" ? [] : [tap]);

const MA_TRAN_TACH: [string, Tap][] = [
	["_acceptance/x/run-log.jsonl", "t1"],
	["_acceptance/x/decisions.jsonl", "t1"],
	["_acceptance/x/evidence-report.md", "t1"],
	["_acceptance/x/contract.md", "t1"],
	["_acceptance/x/review-findings.md", "t1"],
	["_acceptance/x/evals.yaml", "khong"],
	["_acceptance/config.yaml", "khong"],
	["_acceptance/x/evidence/a.json", "khong"],
	["_acceptance/x/rang/a.mjs", "khong"],
	["_acceptance/run-log.jsonl", "khong"],
	["_acceptance/dieu-huong-khu-muc-tieu/contract.md", "maDoc"],
];

describe("pglt-tach", () => {
	test("pglt-tach (a) t1_skip_globs co dung hai glob ho so", () => {
		const globs = configList(cauHinhThat(), "t1_skip_globs");
		expect(globs.filter((g) => g === GLOB_RUN_LOG).length).toBe(1);
		expect(globs.filter((g) => g === GLOB_DECISIONS).length).toBe(1);
		expect(globs.filter((g) => g.startsWith("_acceptance/")).sort()).toEqual(
			[GLOB_DECISIONS, GLOB_RUN_LOG].sort(),
		);
	});

	test("pglt-tach so ca", () => {
		if (MA_TRAN_TACH.length !== 11) throw new Error("so ca lech");
	});

	MA_TRAN_TACH.forEach(([tep, tap], i) => {
		test(`pglt-tach ${i + 1} ${tep} -> ${tap}`, async () => {
			const { docGlobT1, tachT1 } = await phanLoai();
			expect(tapCua(tachT1(docGlobT1(GOC_KHO), [tep]), tep)).toEqual(
				mongDoi(tap),
			);
		});
	});

	test("pglt-tach (c) config thieu glob run-log thi run-log khong T1", async () => {
		const { docGlobT1, tachT1 } = await phanLoai();
		const goc = thuMucTam("tach");
		ghi(goc, CAU_HINH, boDong(cauHinhThat(), GLOB_RUN_LOG));
		const tep = "_acceptance/x/run-log.jsonl";
		expect(tapCua(tachT1(docGlobT1(goc), [tep]), tep)).toEqual([]);
		expect(tapCua(tachT1(docGlobT1(GOC_KHO), [tep]), tep)).toEqual(["t1"]);
	});
});

const MA_TRAN_SAU: [string, string[] | "kho", Tap][] = [
	["_acceptance/x/rang/f/run-log.jsonl", "kho", "khong"],
	["_acceptance/x/evidence/decisions.jsonl", "kho", "khong"],
	["_acceptance/x/rang/f/a.md", "kho", "t1"],
	["_acceptance/x/run-log.jsonl", "kho", "t1"],
	["a/x/b.txt", ["a/*/b.txt"], "t1"],
	["a/x/y/b.txt", ["a/*/b.txt"], "khong"],
	["a/x/b.txt", ["a/*/b.txt", "!a/*/b.txt"], "maDoc"],
];

const coDaiDien = /[*?[]/;

describe("pglt-sau", () => {
	test("pglt-sau so ca", () => {
		if (MA_TRAN_SAU.length !== 7) throw new Error("so ca lech");
	});

	MA_TRAN_SAU.forEach(([tep, globs, tap], i) => {
		test(`pglt-sau ${i + 1} ${tep} -> ${tap}`, async () => {
			const { docGlobT1, tachT1 } = await phanLoai();
			const g = globs === "kho" ? docGlobT1(GOC_KHO) : globs;
			expect(tapCua(tachT1(g, [tep]), tep)).toEqual(mongDoi(tap));
		});
	});

	test("pglt-sau (b) glob co ky tu dai dien ma khong co ** chi la hai glob ho so", () => {
		const chu = cauHinhThat();
		const tat = [
			...configList(chu, "t1_skip_globs"),
			...configList(chu, "t1_ma_doc"),
		];
		const chat = tat.filter((g) => coDaiDien.test(g) && !g.includes("**"));
		const thua = chat.filter((g) => g !== GLOB_RUN_LOG && g !== GLOB_DECISIONS);
		if (thua.length) throw new Error(`glob thua: ${thua.join(", ")}`);
		expect(chat.sort()).toEqual([GLOB_DECISIONS, GLOB_RUN_LOG].sort());
	});
});

const TAC_GIA = {
	GIT_AUTHOR_NAME: "t",
	GIT_AUTHOR_EMAIL: "t@t",
	GIT_COMMITTER_NAME: "t",
	GIT_COMMITTER_EMAIL: "t@t",
};

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

const TEP_GHIM_LAI = [
	"_acceptance/dieu-huong-khu-muc-tieu/evidence-report.md",
	"_acceptance/dieu-huong-khu-muc-tieu/run-log.jsonl",
	"_acceptance/khung-okr-truoc-r1/evidence-report.md",
	"_acceptance/khung-okr-truoc-r1/run-log.jsonl",
	"_acceptance/khung-trang-cai-dat/evidence-report.md",
	"_acceptance/khung-trang-cai-dat/run-log.jsonl",
	"_acceptance/okr-to-chuc-va/evidence-report.md",
	"_acceptance/okr-to-chuc-va/run-log.jsonl",
	"_acceptance/soan-okr-trong-khung/evidence-report.md",
	"_acceptance/soan-okr-trong-khung/run-log.jsonl",
	"_acceptance/t1-ma-doc/evidence-report.md",
	"_acceptance/t1-ma-doc/run-log.jsonl",
	"_acceptance/toan-canh-okr/evidence-report.md",
	"_acceptance/toan-canh-okr/run-log.jsonl",
	"_acceptance/trang-don-vi-mot-bang/evidence-report.md",
	"_acceptance/trang-don-vi-mot-bang/run-log.jsonl",
];

type Pr = { ra: string; tep: string[] };

function chayPr(tep: string[]): Pr {
	const goc = thuMucTam("ci");
	for (const t of tep) ghi(goc, t, "a\n");
	git(goc, "init", "-q", "--template=", "-b", "onehub");
	git(goc, "add", "-A");
	git(goc, "commit", "-q", "-m", "goc");
	git(goc, "checkout", "-q", "-b", "pr");
	for (const t of tep) ghi(goc, t, "b\n");
	git(goc, "commit", "-q", "-am", "pr");
	git(goc, "checkout", "-q", "onehub");
	git(goc, "merge", "-q", "--no-ff", "--no-edit", "pr");
	ghi(goc, CAU_HINH, cauHinhThat());
	const r = spawnSync("node", [PHAN_LOAI, "--goc", goc], {
		env: envSach({ SU_KIEN: "pull_request", NHAP: "false" }),
		encoding: "utf8",
	});
	return {
		ra: r.stdout.trim(),
		tep: git(goc, "diff", "--name-only", "HEAD^1", "HEAD")
			.split("\n")
			.filter(Boolean),
	};
}

const NHE = "nang=false\nly_do=chi-t1";
const nang = (lyDo: string) => `nang=true\nly_do=${lyDo}`;

const MA_TRAN_CI: [string, string[], string][] = [
	["16 tep ghim lai", [], NHE],
	["+ evals.yaml", ["_acceptance/t1-ma-doc/evals.yaml"], nang("co-tep-nang")],
	["+ config.yaml", [CAU_HINH], nang("co-tep-nang")],
	["+ rang", ["_acceptance/x/rang/a.mjs"], nang("co-tep-nang")],
	["+ evidence", ["_acceptance/x/evidence/a.json"], nang("co-tep-nang")],
	[
		"+ contract ma doc",
		["_acceptance/dieu-huong-khu-muc-tieu/contract.md"],
		nang("t1-ma-doc"),
	],
	["+ ci.yml", [".github/workflows/ci.yml"], nang("cham-github")],
	["+ tep sau", ["_acceptance/x/rang/f/run-log.jsonl"], nang("co-tep-nang")],
];

describe("pglt-ci", () => {
	test("pglt-ci so ca", () => {
		if (MA_TRAN_CI.length !== 8) throw new Error("so ca lech");
		if (TEP_GHIM_LAI.length !== 16) throw new Error("so tep ghim lai lech");
	});

	MA_TRAN_CI.forEach(([ten, them, ra], i) => {
		test(`pglt-ci ${i + 1} ${ten}`, () => {
			const tep = [...TEP_GHIM_LAI, ...them];
			const kq = chayPr(tep);
			expect(kq.tep).toEqual([...tep].sort());
			expect(kq.ra).toBe(ra);
		}, 60000);
	});
});

const TEP_CHEP_DAY = [
	"scripts/pre-push-t1.mjs",
	".github/scripts/phan-loai.mjs",
	"scripts/pre-merge-check.sh",
	"lib/workspace-record.cjs",
	"lib/evidence-core.cjs",
	"lib/eval-yaml.cjs",
	".githooks/gate-shape.json",
];
const HOOK_TAM = `#!/bin/sh
node scripts/pre-push-t1.mjs "$1" >"$RA" 2>"$LOI"
exit 0
`;
const KHONG_PHAN_LOAI = "không phân loại được";
const DONG_BO_BA =
	"pre-push: chỉ tệp T1 (3 tệp) — bỏ test, build; CI phân loại PR theo cùng luật.";

let mauDay = "";

function khoMauDay(): string {
	if (mauDay) return mauDay;
	const d = thuMucTam("day-mau");
	const goc = join(d, "kho");
	for (const t of TEP_CHEP_DAY) {
		mkdirSync(dirname(join(goc, t)), { recursive: true });
		copyFileSync(join(GOC_KHO, t), join(goc, t));
	}
	ghi(goc, "apps/api/a.ts", "export const a = 1;\n");
	ghi(goc, ".gitignore", `${CAU_HINH}\n`);
	ghi(goc, "hook/pre-push", HOOK_TAM);
	chmodSync(join(goc, "hook/pre-push"), 0o755);
	spawnSync(
		"git",
		["init", "-q", "--template=", "--bare", join(d, "remote.git")],
		{
			env: envSach({}),
		},
	);
	git(d, "init", "-q", "--template=", "-b", "onehub", goc);
	git(goc, "add", "-A");
	git(goc, "commit", "-q", "-m", "goc");
	git(goc, "remote", "add", "origin", "../remote.git");
	git(goc, "push", "-q", "origin", "onehub");
	git(goc, "config", "core.hooksPath", "hook");
	ghi(goc, CAU_HINH, cauHinhThat());
	mauDay = d;
	return d;
}

type Day = { ma: number; ra: string; loi: string; tep: string[] };

function dayNhanh(tep: string[]): Day {
	const d = thuMucTam("day");
	cpSync(khoMauDay(), d, { recursive: true });
	const goc = join(d, "kho");
	git(goc, "checkout", "-q", "-b", "nhanh");
	for (const t of tep) ghi(goc, t, "c\n");
	git(goc, "add", "--", ...tep);
	git(goc, "commit", "-q", "-m", "c");
	const ra = join(d, "ra");
	const loi = join(d, "loi");
	const r = spawnSync("git", ["push", "-q", "origin", "nhanh"], {
		cwd: goc,
		env: envSach({ RA: ra, LOI: loi }),
		encoding: "utf8",
	});
	const doc = (p: string) =>
		existsSync(p) ? readFileSync(p, "utf8").trim() : "<vang>";
	return {
		ma: r.status ?? -1,
		ra: doc(ra),
		loi: doc(loi),
		tep: git(goc, "diff", "--name-only", "onehub", "nhanh")
			.split("\n")
			.filter(Boolean),
	};
}

const BA_TEP_GHIM = [
	"_acceptance/x/run-log.jsonl",
	"_acceptance/x/decisions.jsonl",
	"_acceptance/x/evidence-report.md",
];

const MA_TRAN_DAY: [string, string[], string, string][] = [
	["chi ba tep ghim lai", BA_TEP_GHIM, "test build", DONG_BO_BA],
	["+ evals.yaml", [...BA_TEP_GHIM, "_acceptance/x/evals.yaml"], "", ""],
	["+ tep sau", [...BA_TEP_GHIM, "_acceptance/x/rang/f/run-log.jsonl"], "", ""],
];

describe("pglt-day", () => {
	test("pglt-day so ca", () => {
		if (MA_TRAN_DAY.length !== 3) throw new Error("so ca lech");
	});

	MA_TRAN_DAY.forEach(([ten, tep, ra, loi], i) => {
		test(`pglt-day ${i + 1} ${ten}`, () => {
			const kq = dayNhanh(tep);
			expect(kq.ma).toBe(0);
			expect(kq.tep).toEqual([...tep].sort());
			expect(kq.loi).not.toContain(KHONG_PHAN_LOAI);
			expect(kq.ra).toBe(ra);
			expect(kq.loi).toBe(loi);
		}, 60000);
	});
});

type Quet = { baoCao: string[] };
type BoQuet = {
	quetDauVao: (
		goc?: string,
		tuy?: { mien?: Record<string, Record<string, string>> },
	) => Quet;
};
const BO_QUET = join(GOC_KHO, ".github", "scripts", "t1-ma-doc.mjs");
const quet = (): Promise<BoQuet> => import(BO_QUET);

function khoQuet(tep: Record<string, string>, cfg = cauHinhThat()): string {
	const goc = thuMucTam("quet");
	const gon = cfg
		.replace(/^ {2}t1_ma_doc:\r?\n(?:(?: {4}.*|\s*)\r?\n)*/m, "")
		.replace(
			/^ {2}t1_skip_globs:\r?\n/m,
			(m) => `  t1_ma_doc:\n    - "docs/neo.md"\n${m}`,
		);
	ghi(goc, CAU_HINH, gon);
	ghi(goc, "docs/neo.md", "n\n");
	for (const [t, c] of Object.entries(tep)) ghi(goc, t, c);
	git(goc, "init", "-q", "--template=");
	git(goc, "add", "-A");
	return goc;
}

const docTep = (duong: string) =>
	`import { readFileSync } from "node:fs";\nimport { join } from "node:path";\nexport const x = readFileSync(join(GOC, ${duong
		.split("/")
		.map((p) => JSON.stringify(p))
		.join(", ")}), "utf8");\n`;

const SO_HO_SO = {
	"_acceptance/s/run-log.jsonl": "{}\n",
	"_acceptance/s/decisions.jsonl": "{}\n",
};
const BEN_DOC = {
	"apps/x/a.ts": docTep("_acceptance/s/run-log.jsonl"),
	"apps/x/b.ts": `import { readFileSync } from "node:fs";\nexport const y = readFileSync("../../_acceptance/s/decisions.jsonl", "utf8");\n`,
};
const THIEU_A = "thieu-khai _acceptance/s/run-log.jsonl ← apps/x/a.ts";
const THIEU_B = "thieu-khai _acceptance/s/decisions.jsonl ← apps/x/b.ts";

function cliQuet(goc: string) {
	const r = spawnSync("node", [BO_QUET, "--goc", goc, "--mien-rong"], {
		encoding: "utf8",
	});
	return { ma: r.status ?? -1, ra: r.stdout.trim() };
}

describe("pglt-doc", () => {
	test("pglt-doc 1 ben doc run-log chua khai thi thieu-khai", async () => {
		const { quetDauVao } = await quet();
		const goc = khoQuet({ ...SO_HO_SO, ...BEN_DOC });
		expect(quetDauVao(goc, { mien: {} }).baoCao).toContain(THIEU_A);
		expect(cliQuet(goc).ma).toBe(1);
	});

	test("pglt-doc 2 ben doc decisions chua khai thi thieu-khai", async () => {
		const { quetDauVao } = await quet();
		const goc = khoQuet({ ...SO_HO_SO, ...BEN_DOC });
		expect(quetDauVao(goc, { mien: {} }).baoCao).toContain(THIEU_B);
	});

	test("pglt-doc 3 doi chung khong ben doc thi bao cao rong", async () => {
		const { quetDauVao } = await quet();
		const goc = khoQuet({ ...SO_HO_SO });
		expect(quetDauVao(goc, { mien: {} }).baoCao).toEqual([]);
		expect(cliQuet(goc)).toEqual({
			ma: 0,
			ra: expect.stringMatching(/^sach:/),
		});
	});

	test("pglt-doc 4 config khong glob run-log thi run-log khong la dich", async () => {
		const { quetDauVao } = await quet();
		const goc = khoQuet(
			{ ...SO_HO_SO, ...BEN_DOC },
			boDong(cauHinhThat(), GLOB_RUN_LOG),
		);
		const bc = quetDauVao(goc, { mien: {} }).baoCao;
		expect(bc).not.toContain(THIEU_A);
		expect(bc).toContain(THIEU_B);
	});
});

const TEP_CONG = join(GOC_KHO, ".github", "workflows", "acceptance.yml");
const LOC_DUONG = ["paths", "paths-ignore", "branches-ignore"];
const TYPES_CAN = ["opened", "synchronize", "reopened"];
const IF_BUOC = "\u0024{{ !cancelled() }}";
const NHAC_PHAN_LOAI = /phan-loai|\bnang\b/;

type Buoc = {
	name?: string;
	if?: string;
	run?: string;
	"continue-on-error"?: unknown;
};
type Job = {
	name?: string;
	needs?: unknown;
	if?: unknown;
	"continue-on-error"?: unknown;
	steps?: Buoc[];
};
type Workflow = {
	on?: {
		pull_request?: {
			types?: string[];
			paths?: string[];
			"paths-ignore"?: string[];
			"branches-ignore"?: string[];
		} | null;
	};
	jobs?: Record<string, Job>;
};

function kiemJobCong(chu: string): string[] {
	const wf = Bun.YAML.parse(chu) as Workflow;
	const loi: string[] = [];
	const pr = wf.on?.pull_request ?? {};
	for (const k of LOC_DUONG)
		if (k in pr) loi.push(`on-loc-duong: on.pull_request co ${k}`);
	const types = pr.types;
	if (types) {
		const thieu = TYPES_CAN.filter((t) => !types.includes(t));
		if (thieu.length) loi.push(`on-types: thieu ${thieu.join(", ")}`);
	}
	const job = wf.jobs?.["luat-kho"];
	if (job?.name !== "acceptance gate")
		return [...loi, "job-thieu: khong co luat-kho «acceptance gate»"];
	if ("needs" in job) loi.push("job-needs: luat-kho co needs");
	if ("if" in job) loi.push("job-if: luat-kho co if cap job");
	if ("continue-on-error" in job)
		loi.push("job-continue-on-error: luat-kho co continue-on-error");
	const buoc = (ten: string) => (job.steps ?? []).find((b) => b.name === ten);
	const premerge = buoc("Pre-merge check");
	if (!premerge) return [...loi, "buoc-thieu: khong co buoc Pre-merge check"];
	if ("continue-on-error" in premerge)
		loi.push("buoc-continue-on-error: Pre-merge check co continue-on-error");
	if (premerge.if !== IF_BUOC)
		loi.push(`buoc-if: Pre-merge check if = ${premerge.if}`);
	for (const b of [premerge, buoc("Product map")]) {
		if (b && NHAC_PHAN_LOAI.test(`${b.if ?? ""}\n${b.run ?? ""}`))
			loi.push(`buoc-nhac-phan-loai: ${b.name} nhac phan-loai hay nang`);
	}
	return loi;
}

const DAU_PR = "    types: [opened, synchronize, reopened, ready_for_review]\n";
const DAU_JOB = "    name: acceptance gate\n";
const DAU_BUOC = `      - name: Pre-merge check\n        if: ${IF_BUOC}\n`;

const MA_TRAN_JOB: [string, [string, string] | null, string[]][] = [
	["tep that", null, []],
	[
		"paths-ignore",
		[DAU_PR, `${DAU_PR}    paths-ignore: ['_acceptance/*/run-log.jsonl']\n`],
		["on-loc-duong"],
	],
	["paths", [DAU_PR, `${DAU_PR}    paths: ['apps/**']\n`], ["on-loc-duong"]],
	["types bo synchronize", ["synchronize, ", ""], ["on-types"]],
	["needs", [DAU_JOB, `${DAU_JOB}    needs: phan-loai\n`], ["job-needs"]],
	[
		"if cap job",
		[DAU_JOB, `${DAU_JOB}    if: needs.phan-loai.outputs.nang != 'false'\n`],
		["job-if"],
	],
	[
		"continue-on-error cap job",
		[DAU_JOB, `${DAU_JOB}    continue-on-error: true\n`],
		["job-continue-on-error"],
	],
	[
		"continue-on-error buoc",
		[DAU_BUOC, `${DAU_BUOC}        continue-on-error: true\n`],
		["buoc-continue-on-error"],
	],
	[
		"if buoc theo phan loai",
		[
			DAU_BUOC,
			"      - name: Pre-merge check\n        if: steps.x.outputs.nang == 'true'\n",
		],
		["buoc-if", "buoc-nhac-phan-loai"],
	],
];

describe("pglt-job", () => {
	test("pglt-job so ca", () => {
		if (MA_TRAN_JOB.length !== 9) throw new Error("so ca lech");
	});

	MA_TRAN_JOB.forEach(([ten, doi, luat], i) => {
		test(`pglt-job ${i + 1} ${ten}`, () => {
			const that = readFileSync(TEP_CONG, "utf8");
			const chu = doi ? that.replace(doi[0], doi[1]) : that;
			if (doi && chu === that)
				throw new Error(`pglt-job ${i + 1}: ban chep khong doi`);
			const loi = kiemJobCong(chu);
			expect(loi.map((l) => l.split(":")[0]).sort()).toEqual([...luat].sort());
		});
	});
});
