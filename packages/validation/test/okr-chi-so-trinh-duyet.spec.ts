import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const DANH_MUC = join(
	import.meta.dir,
	"..",
	"..",
	"db",
	"src",
	"okr-chi-so-danh-muc.ts",
);

const CAU_NAP =
	/^\s*(import\b|export\s+(\*|\{[^}]*\})\s+from\b)|\brequire\s*\(|\bimport\s*\(/m;

function cauNap(nguon: string): string[] {
	return nguon
		.split("\n")
		.filter((dong) => CAU_NAP.test(dong))
		.map((dong) => dong.trim());
}

describe("danh muc chi so toi trinh duyet", () => {
	test("okr-chi-so-danh-muc.ts khong nap tep nao, vi no toi trinh duyet qua @crm/validation/okr-chi-so", () => {
		expect(cauNap(readFileSync(DANH_MUC, "utf8"))).toEqual([]);
	});

	test("bo bat cau nap do duoc tren vat thu", () => {
		const vatThu = [
			'import { Pool } from "pg";',
			'import type { Prisma } from "./generated/prisma";',
			'export * from "./client";',
			'export { db } from "./client";',
			'const pg = require("pg");',
			'const m = await import("./client");',
			"export const CHI_SO = { a: 1 } as const;",
			"export type MaChiSo = keyof typeof CHI_SO;",
		].join("\n");
		expect(cauNap(vatThu)).toEqual([
			'import { Pool } from "pg";',
			'import type { Prisma } from "./generated/prisma";',
			'export * from "./client";',
			'export { db } from "./client";',
			'const pg = require("pg");',
			'const m = await import("./client");',
		]);
	});
});
