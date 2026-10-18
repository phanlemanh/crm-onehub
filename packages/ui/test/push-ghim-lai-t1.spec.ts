import { afterAll, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import {
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
