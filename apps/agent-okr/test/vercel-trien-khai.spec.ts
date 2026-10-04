import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { minimatch } from "minimatch";
import { z } from "zod";

const TEP_CAU_HINH = join(import.meta.dir, "..", "vercel.json");

const cauHinhVercel = z
	.object({
		$schema: z.string(),
		git: z
			.object({
				deploymentEnabled: z.record(z.string(), z.boolean()),
			})
			.strict(),
	})
	.strict();

type LuatTrienKhai = {
	git: { deploymentEnabled: boolean | Record<string, boolean> };
};

const NHANH = [
	"feat/a",
	"fix/a",
	"docs/a",
	"chore/a",
	"claude/a",
	"proto/a",
	"test/a",
	"ci/a",
	"dependabot/npm_and_yarn/a",
	"main",
	"release",
	"test-lane-per-run",
	"onehub-thu",
	"onehub/con",
	"sao-luu/onehub",
];

function docTho(): unknown {
	return JSON.parse(readFileSync(TEP_CAU_HINH, "utf8"));
}

function docCauHinh(): LuatTrienKhai {
	return cauHinhVercel.parse(docTho());
}

function duocTrienKhai(cauHinh: LuatTrienKhai, nhanh: string): boolean {
	const luat = cauHinh.git.deploymentEnabled;
	if (typeof luat === "boolean") return luat;
	const khop = Object.entries(luat).filter(([mau]) => minimatch(nhanh, mau));
	if (khop.length === 0) return true;
	return khop.some(([, bat]) => bat);
}

describe("vercel-trien-khai", () => {
	test("hop-le", () => {
		expect(cauHinhVercel.safeParse(docTho()).error?.issues ?? []).toEqual([]);
	});

	test("onehub-trien-khai", () => {
		expect(duocTrienKhai(docCauHinh(), "onehub")).toBe(true);
	});

	test("nhanh-khac-khong-trien-khai", () => {
		const cauHinh = docCauHinh();
		expect(NHANH).toHaveLength(15);
		expect(
			NHANH.map((nhanh) => ({
				nhanh,
				trienKhai: duocTrienKhai(cauHinh, nhanh),
			})),
		).toEqual(NHANH.map((nhanh) => ({ nhanh, trienKhai: false })));
	});

	test("bo-khop-bat-bay-sao", () => {
		const bay = { git: { deploymentEnabled: { "*": false, onehub: true } } };
		expect({
			fix: duocTrienKhai(bay, "fix/a"),
			main: duocTrienKhai(bay, "main"),
			onehub: duocTrienKhai(bay, "onehub"),
		}).toEqual({ fix: true, main: false, onehub: true });
	});
});
