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
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

const GOC_KHO = resolve(import.meta.dir, "..", "..", "..");
const CAU_HINH = "_acceptance/config.yaml";
const TEP_CHEP = [
	"scripts/pre-push-t1.mjs",
	".github/scripts/phan-loai.mjs",
	"scripts/pre-merge-check.sh",
	"lib/workspace-record.cjs",
	"lib/evidence-core.cjs",
	"lib/eval-yaml.cjs",
	".githooks/gate-shape.json",
];
const DONG_BO_DOCS =
	"pre-push: chỉ tệp T1 (1 tệp) — bỏ test, build; CI phân loại PR theo cùng luật.";
const KHONG_PHAN_LOAI = "không phân loại được";
const HOOK_TAM = `#!/bin/sh
node scripts/pre-push-t1.mjs "$1" >"$RA" 2>"$LOI"
exit 0
`;

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

let mau = "";

function khoMau(): string {
	if (mau) return mau;
	const d = realpathSync(mkdtempSync(join(tmpdir(), "t1-ma-doc-mau-")));
	tam.push(d);
	const goc = join(d, "kho");
	for (const t of TEP_CHEP) {
		mkdirSync(dirname(join(goc, t)), { recursive: true });
		copyFileSync(join(GOC_KHO, t), join(goc, t));
	}
	ghi(goc, "apps/api/a.ts", "export const a = 1;\n");
	ghi(goc, "docs/khong-ai-doc.md", "a\n");
	ghi(goc, "docs/design.md", "d\n");
	ghi(goc, "LO-TRINH.html", "<p>l</p>\n");
	ghi(goc, "apps/agent/agent/subagents/x/instructions.md", "i\n");
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
	ghi(goc, CAU_HINH, readFileSync(join(GOC_KHO, CAU_HINH), "utf8"));
	mau = d;
	return d;
}

type Day = { ma: number; ra: string; loi: string; tep: string[] };

function dayNhanh(tep: [string, string][]): Day {
	const d = realpathSync(mkdtempSync(join(tmpdir(), "t1-ma-doc-")));
	tam.push(d);
	cpSync(khoMau(), d, { recursive: true });
	const goc = join(d, "kho");
	git(goc, "checkout", "-q", "-b", "nhanh");
	for (const [t, c] of tep) ghi(goc, t, c);
	git(goc, "add", "--", ...tep.map(([t]) => t));
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

const dongMaDoc = (ds: string) =>
	`pre-push: có tệp T1 mà mã đọc (${ds}) — chạy đủ năm bước.`;

const MA_TRAN_DAY: {
	ten: string;
	tep: [string, string][];
	ra: string;
	loi: string;
}[] = [
	{
		ten: "day 1 chi docs/design.md",
		tep: [["docs/design.md", "e\n"]],
		ra: "",
		loi: dongMaDoc("docs/design.md"),
	},
	{
		ten: "day 2 chi instructions.md cua agent",
		tep: [["apps/agent/agent/subagents/x/instructions.md", "j\n"]],
		ra: "",
		loi: dongMaDoc("apps/agent/agent/subagents/x/instructions.md"),
	},
	{
		ten: "day 3 chi LO-TRINH.html",
		tep: [["LO-TRINH.html", "<p>m</p>\n"]],
		ra: "",
		loi: dongMaDoc("LO-TRINH.html"),
	},
	{
		ten: "day 4 chi docs/khong-ai-doc.md",
		tep: [["docs/khong-ai-doc.md", "b\n"]],
		ra: "test build",
		loi: DONG_BO_DOCS,
	},
	{
		ten: "day 5 docs/khong-ai-doc.md va docs/design.md",
		tep: [
			["docs/khong-ai-doc.md", "b\n"],
			["docs/design.md", "e\n"],
		],
		ra: "",
		loi: dongMaDoc("docs/design.md"),
	},
	{
		ten: "day 6 tep ma",
		tep: [["apps/api/a.ts", "export const a = 2;\n"]],
		ra: "",
		loi: "",
	},
];

describe("day", () => {
	test("day so ca", () => expect(MA_TRAN_DAY.length).toBe(6));
	for (const ca of MA_TRAN_DAY) {
		test(ca.ten, () => {
			const kq = dayNhanh(ca.tep);
			expect(kq.ma).toBe(0);
			expect(kq.tep).toEqual(ca.tep.map(([t]) => t).sort());
			expect(kq.loi).not.toContain(KHONG_PHAN_LOAI);
			expect(kq.ra).toBe(ca.ra);
			expect(kq.loi).toBe(ca.loi);
		}, 60000);
	}
});

type Quet = {
	dich: Map<string, string[]>;
	thieu: { dich: string; nguon: string }[];
	mienThua: { dich: string; nguon: string }[];
	globChet: string[];
	baoCao: string[];
};
type BoQuet = {
	quetDauVao: (
		goc?: string,
		tuy?: { mien?: Record<string, Record<string, string>> },
	) => Quet;
};

const BO_QUET = join(GOC_KHO, ".github", "scripts", "t1-ma-doc.mjs");
const quet = (): Promise<BoQuet> => import(BO_QUET);

const BEN_DOC_BIET: [string, string][] = [
	["docs/design.md", "packages/ui/test/status-tone.spec.ts"],
	["docs/design.md", "_acceptance/nen-chat-ai-elements/rang/mau-ban-kinh.mjs"],
	["docs/telemetry.md", "packages/telemetry/test/allowlist.spec.ts"],
	["docs/setup.md", "apps/api/test/okr-mau-chan.spec.ts"],
	["CONTEXT.md", "apps/api/test/okr-mau-chan.spec.ts"],
	[
		"docs/environment.md",
		"apps/agent/test/zalo-qua-webhook.integration.spec.ts",
	],
	["LO-TRINH.html", "apps/app/lib/lo-trinh/doc-tep.ts"],
	["scripts/pre-merge-check.sh", ".github/scripts/phan-loai.mjs"],
];

describe("quet-that", () => {
	test("quet-that cay that khong thieu khai, khong mien thua, khong glob chet", async () => {
		const { quetDauVao } = await quet();
		const bd = performance.now();
		const kq = quetDauVao(GOC_KHO);
		const ms = performance.now() - bd;
		expect(kq.baoCao).toEqual([]);
		expect(kq.thieu).toEqual([]);
		expect(kq.mienThua).toEqual([]);
		expect(kq.globChet).toEqual([]);
		for (const [d, n] of BEN_DOC_BIET) {
			if (!(kq.dich.get(d) ?? []).includes(n))
				throw new Error(`quet-that: thieu ben doc ${d} ← ${n}`);
		}
		expect(ms).toBeLessThan(5000);
	}, 30000);
});

function khoQuet(
	tep: Record<string, string>,
	maDoc: string[],
	themT1: string[] = [],
): string {
	const d = realpathSync(mkdtempSync(join(tmpdir(), "t1-ma-doc-quet-")));
	tam.push(d);
	let cfg = readFileSync(join(GOC_KHO, CAU_HINH), "utf8").replace(
		/^ {2}t1_ma_doc:\r?\n(?:(?: {4}.*|\s*)\r?\n)*/m,
		"",
	);
	cfg = cfg.replace(
		/^ {2}t1_skip_globs:\r?\n/m,
		(m) =>
			`  t1_ma_doc:\n${maDoc.map((g) => `    - "${g}"\n`).join("")}${m}${themT1.map((g) => `    - "${g}"\n`).join("")}`,
	);
	ghi(d, CAU_HINH, cfg);
	for (const [t, c] of Object.entries(tep)) ghi(d, t, c);
	git(d, "init", "-q", "--template=");
	git(d, "add", "-A");
	return d;
}

const doc = (duong: string) =>
	`import { readFileSync } from "node:fs";\nimport { join } from "node:path";\nexport const x = readFileSync(join(GOC, ${duong
		.split("/")
		.map((p) => JSON.stringify(p))
		.join(", ")}), "utf8");\n`;
const nhacSuong = (duong: string) =>
	`export const ten = ${JSON.stringify(duong)};\n`;
const goi = (duong: string) =>
	`import { spawnSync } from "node:child_process";\nspawnSync("node", [${JSON.stringify(duong)}]);\n`;

describe("quet-do", () => {
	test("quet-do 1 chi nhac ten khong goi doc thi khong la dich", async () => {
		const { quetDauVao } = await quet();
		const goc = khoQuet(
			{
				"docs/moi.md": "m\n",
				"apps/x/a.ts": nhacSuong("docs/moi.md"),
				"docs/neo.md": "n\n",
				"apps/x/neo.ts": doc("docs/neo.md"),
			},
			["docs/neo.md"],
		);
		const kq = quetDauVao(goc, { mien: {} });
		expect(kq.dich.has("docs/moi.md")).toBe(false);
		expect(kq.dich.get("docs/neo.md")).toEqual(["apps/x/neo.ts"]);
		expect(kq.baoCao).toEqual([]);
	});

	test("quet-do 2 ben doc moi chua khai thi thieu-khai", async () => {
		const { quetDauVao } = await quet();
		const goc = khoQuet(
			{
				"docs/moi.md": "m\n",
				"apps/x/a.ts": nhacSuong("docs/moi.md"),
				"apps/x/b.ts": doc("docs/moi.md"),
				"docs/neo.md": "n\n",
				"apps/x/neo.ts": doc("docs/neo.md"),
			},
			["docs/neo.md"],
		);
		const kq = quetDauVao(goc, { mien: {} });
		expect(kq.baoCao).toContain("thieu-khai docs/moi.md ← apps/x/b.ts");
		const r = spawnSync("node", [BO_QUET, "--goc", goc, "--mien-rong"], {
			encoding: "utf8",
		});
		expect(r.status).toBe(1);
		expect(r.stdout.trim()).toBe("thieu-khai docs/moi.md ← apps/x/b.ts");
	});

	test("quet-do 3 go docs/design.md khoi t1_ma_doc thi thieu-khai", async () => {
		const { quetDauVao } = await quet();
		const goc = khoQuet(
			{
				"docs/design.md": "d\n",
				"apps/x/c.ts": doc("docs/design.md"),
				"docs/neo.md": "n\n",
				"apps/x/neo.ts": doc("docs/neo.md"),
			},
			["docs/neo.md"],
		);
		expect(quetDauVao(goc, { mien: {} }).baoCao).toContain(
			"thieu-khai docs/design.md ← apps/x/c.ts",
		);
	});

	test("quet-do 4 cap mien khong con nhac thi mien-thua", async () => {
		const { quetDauVao } = await quet();
		const goc = khoQuet(
			{ "docs/neo.md": "n\n", "apps/x/neo.ts": doc("docs/neo.md") },
			["docs/neo.md"],
		);
		const kq = quetDauVao(goc, {
			mien: { "docs/cu.md": { "apps/x/a.ts": "ly do" } },
		});
		expect(kq.baoCao).toEqual(["mien-thua docs/cu.md ← apps/x/a.ts"]);
	});

	test("quet-do 5 glob khong khop tep nao thi glob-chet", async () => {
		const { quetDauVao } = await quet();
		const goc = khoQuet(
			{ "docs/neo.md": "n\n", "apps/x/neo.ts": doc("docs/neo.md") },
			["docs/neo.md", "docs/khong-co/**"],
		);
		expect(quetDauVao(goc, { mien: {} }).baoCao).toEqual([
			"glob-chet docs/khong-co/**",
		]);
	});

	test("quet-do 6 doi chung khai docs/moi.md thi sach va CLI ma 0", async () => {
		const { quetDauVao } = await quet();
		const goc = khoQuet(
			{ "docs/moi.md": "m\n", "apps/x/b.ts": doc("docs/moi.md") },
			["docs/moi.md"],
		);
		expect(quetDauVao(goc, { mien: {} }).baoCao).toEqual([]);
		const r = spawnSync("node", [BO_QUET, "--goc", goc, "--mien-rong"], {
			encoding: "utf8",
		});
		expect(r.status).toBe(0);
	});

	test("quet-do 7 cau mot bac tu ma trong apps", async () => {
		const { quetDauVao } = await quet();
		const goc = khoQuet(
			{
				"scripts/a.mjs": doc("docs/x.md"),
				"docs/x.md": "x\n",
				"apps/y/t.ts": goi("scripts/a.mjs"),
			},
			["docs/x.md"],
		);
		expect(quetDauVao(goc, { mien: {} }).dich.get("docs/x.md")).toEqual([
			"scripts/a.mjs",
		]);
	});

	test("quet-do 8 hai bac cau khong la dich", async () => {
		const { quetDauVao } = await quet();
		const goc = khoQuet(
			{
				"scripts/b.mjs": doc("docs/z.md"),
				"docs/z.md": "z\n",
				"scripts/a.mjs": goi("scripts/b.mjs"),
				"apps/y/t.ts": goi("scripts/a.mjs"),
				"docs/neo.md": "n\n",
				"apps/x/neo.ts": doc("docs/neo.md"),
			},
			["docs/neo.md"],
		);
		expect(quetDauVao(goc, { mien: {} }).dich.has("docs/z.md")).toBe(false);
	});

	test("quet-do 9 JSON khong la nguon", async () => {
		const { quetDauVao } = await quet();
		const goc = khoQuet(
			{
				"apps/y/du-lieu.json": `{"a":"docs/w.md","b":"readFileSync"}\n`,
				"docs/w.md": "w\n",
				"docs/neo.md": "n\n",
				"apps/x/neo.ts": doc("docs/neo.md"),
			},
			["docs/neo.md"],
		);
		expect(quetDauVao(goc, { mien: {} }).dich.has("docs/w.md")).toBe(false);
	});

	test("quet-do 10 script khai trong khoi rang cua gate-shape la nguon", async () => {
		const { quetDauVao } = await quet();
		const hinh = {
			checkers: [
				{
					id: "test",
					kind: "turbo",
					rang: { checks: [{ id: "r", script: "_acceptance/s/rang/r.mjs" }] },
				},
			],
		};
		const goc = khoQuet(
			{
				".githooks/gate-shape.json": JSON.stringify(hinh),
				"_acceptance/s/rang/r.mjs": doc("docs/v.md"),
				"docs/v.md": "v\n",
			},
			["docs/v.md"],
		);
		expect(quetDauVao(goc, { mien: {} }).dich.get("docs/v.md")).toEqual([
			"_acceptance/s/rang/r.mjs",
		]);
	});

	test("quet-do 11 tep T1 trong cay ma khong la dich", async () => {
		const { quetDauVao } = await quet();
		const goc = khoQuet(
			{
				"apps/y/ghi-chu.md": "r\n",
				"apps/y/t.ts": doc("apps/y/ghi-chu.md"),
				"docs/neo.md": "n\n",
				"apps/x/neo.ts": doc("docs/neo.md"),
			},
			["docs/neo.md", "apps/**"],
		);
		expect(quetDauVao(goc, { mien: {} }).dich.has("apps/y/ghi-chu.md")).toBe(
			false,
		);
	});

	test("quet-do 12 mien theo cap khong che ben doc moi", async () => {
		const { quetDauVao } = await quet();
		const mien = { "docs/cu.md": { "apps/x/a.ts": "ly do" } };
		const tep = {
			"docs/cu.md": "c\n",
			"apps/x/a.ts": doc("docs/cu.md"),
			"docs/neo.md": "n\n",
			"apps/x/neo.ts": doc("docs/neo.md"),
		};
		expect(quetDauVao(khoQuet(tep, ["docs/neo.md"]), { mien }).baoCao).toEqual(
			[],
		);
		const kq = quetDauVao(
			khoQuet({ ...tep, "apps/x/d.ts": doc("docs/cu.md") }, ["docs/neo.md"]),
			{ mien },
		);
		expect(kq.baoCao).toEqual(["thieu-khai docs/cu.md ← apps/x/d.ts"]);
	});

	test("quet-do 13 tep cau khop T1 la dich khong la nguon", async () => {
		const { quetDauVao } = await quet();
		const goc = khoQuet(
			{
				"scripts/cong.mjs": doc("docs/u.md"),
				"docs/u.md": "u\n",
				"apps/y/t.ts": goi("scripts/cong.mjs"),
			},
			["scripts/cong.mjs"],
			["scripts/cong.mjs"],
		);
		const kq = quetDauVao(goc, { mien: {} });
		expect(kq.dich.get("scripts/cong.mjs")).toEqual(["apps/y/t.ts"]);
		expect(kq.dich.has("docs/u.md")).toBe(false);
	});
});
