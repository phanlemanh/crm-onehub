import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { MEASURE_DATABASE, treeSlug } from "@crm/db/measure-database";
import { dauMocCay } from "../agent/lib/cay";
import { APP } from "./support/khoi-dong";

const BIEN = MEASURE_DATABASE.treeVariable;
let cu: string | undefined;
let ngoaiKho: string;

beforeEach(() => {
	cu = process.env[BIEN];
	delete process.env[BIEN];
	ngoaiKho = mkdtempSync(join(tmpdir(), "agent-okr-cay-"));
});

afterEach(() => {
	if (cu === undefined) delete process.env[BIEN];
	else process.env[BIEN] = cu;
	rmSync(ngoaiKho, { recursive: true, force: true });
});

describe("dauMocCay", () => {
	test("trong kho git: tên thư mục gốc kho, đã slug", () => {
		const goc = Bun.spawnSync(["git", "rev-parse", "--show-toplevel"], {
			cwd: APP,
		})
			.stdout.toString()
			.trim();
		expect(dauMocCay(APP)).toBe(treeSlug(goc.split("/").at(-1) ?? ""));
	});

	test("PHIEN_DO_TEN_CAY thắng thư mục", () => {
		process.env[BIEN] = "Cay Khac";
		expect(dauMocCay(APP)).toBe("cay_khac");
	});

	test("không phải kho git, không có PHIEN_DO_TEN_CAY: null", () => {
		expect(dauMocCay(ngoaiKho)).toBeNull();
	});
});
