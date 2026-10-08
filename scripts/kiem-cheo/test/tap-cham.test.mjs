import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { after, describe, test } from "node:test";
import { duongCua, khuon, tapCham } from "../tap-cham.mjs";
import { taoKho } from "./kho-gia.mjs";

const kho = taoKho();
after(() => kho.don());

kho.hoSo("ky-cham", { paths: ["apps/api/src/**"] });
kho.hoSo("may-cham", {
	status: "machine-cleared",
	paths: ["apps/app/**/*.tsx"],
});
kho.hoSo("ky-khong-cham", { paths: ["packages/ui/**"] });
kho.hoSo("dang-lam-cham", {
	status: "implemented",
	paths: ["apps/api/src/**"],
});
kho.hoSo("dong-cham", {
	paths: ["apps/api/src/**", "khac/**"],
	kieuDong: true,
});
kho.hoSo("rang-cham", {
	paths: ["_acceptance/rang-cham/rang/**", "apps/khong-doi/**"],
});

const TEP_DOI = [
	"apps/api/src/okr/okr.service.ts",
	"apps/app/components/the.tsx",
	"_acceptance/ky-khong-cham/run-log.jsonl",
	"packages/ui/README.md",
];

describe("kcs-tap-cham", () => {
	test("(b) ho so that chi khai paths kieu mot dong (bo-xuong-kara) van doc duoc glob", () => {
		const goc = resolve(import.meta.dirname, "..", "..", "..");
		const text = readFileSync(
			join(goc, "_acceptance", "bo-xuong-kara", "evals.yaml"),
			"utf8",
		);
		assert.ok(
			/paths:\s*\[/.test(text),
			"fixture that phai co paths kieu mot dong",
		);
		assert.ok(
			duongCua(text).length > 0,
			"paths kieu mot dong khong duoc roi thanh rong",
		);
	});

	test("(b) dung hai ho so da ky bi cham, theo thu tu ten", () => {
		const tap = tapCham({
			goc: kho.goc,
			tepDoi: TEP_DOI.filter((t) => !t.startsWith("packages/")),
		});
		assert.deepEqual(
			tap.map((h) => h.slug),
			["dong-cham", "ky-cham", "may-cham"],
			"tap cham phai la ho so signed-off/machine-cleared co paths khop",
		);
	});

	test("(b) tep trong _acceptance/ khong lam ho so nao bi cham", () => {
		const tap = tapCham({
			goc: kho.goc,
			tepDoi: [
				"_acceptance/rang-cham/rang/do.mjs",
				"_acceptance/ky-khong-cham/run-log.jsonl",
			],
		});
		assert.deepEqual(
			tap,
			[],
			"tep _acceptance/ khong duoc tinh la tep doi (rang-cham khai glob _acceptance/rang-cham/rang/**)",
		);
	});

	test("(b) doi chung: bo glob khop khoi evals cua ky-cham -> ky-cham roi khoi tap", () => {
		kho.hoSo("ky-cham", { paths: ["apps/khac/**"] });
		const tap = tapCham({ goc: kho.goc, tepDoi: TEP_DOI });
		assert.ok(
			!tap.some((h) => h.slug === "ky-cham"),
			"ky-cham khong con glob khop thi phai roi khoi tap",
		);
		assert.ok(
			tap.some((h) => h.slug === "ky-khong-cham"),
			"packages/ui/README.md cham ky-khong-cham",
		);
		kho.hoSo("ky-cham", { paths: ["apps/api/src/**"] });
	});

	test("khuon va duongCua theo luat cu cua ho-so-cham", () => {
		assert.ok(khuon("apps/**/*.tsx").test("apps/app/a/b.tsx"));
		assert.ok(!khuon("apps/*.tsx").test("apps/app/b.tsx"));
		assert.deepEqual(
			duongCua(
				'  - id: E1\n    paths:\n      - "a/**"\n      - b/c.ts\n    expected: x\n',
			),
			["a/**", "b/c.ts"],
		);
	});
});
