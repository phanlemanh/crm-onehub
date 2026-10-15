import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const APP = join(import.meta.dir, "..");
const MAN_OKR = [
	"app/(app)/[slug]/okr",
	"app/(app)/[slug]/settings/okr",
	"components/crm/record-sheet",
];
const KHONG_DOI_KHI_GHI_OKR = new Set([
	"access",
	"thanhVien",
	"chiSo",
	"hoiPhien",
]);

function diCay(thuMuc: string, ra: string[]): string[] {
	for (const ten of readdirSync(thuMuc)) {
		const duong = join(thuMuc, ten);
		if (statSync(duong).isDirectory()) diCay(duong, ra);
		else if (/\.tsx?$/.test(ten)) ra.push(duong);
	}
	return ra;
}

function truyVanManDoc(): Set<string> {
	const ra = new Set<string>();
	for (const g of MAN_OKR)
		for (const tep of diCay(join(APP, g), []))
			for (const m of readFileSync(tep, "utf8").matchAll(
				/trpc\.okr\.(\w+)\.queryOptions/g,
			))
				if (m[1]) ra.add(m[1]);
	return ra;
}

function truyVanLamMoi(): Set<string> {
	const nguon = readFileSync(join(APP, "lib/trpc/cache.ts"), "utf8");
	const dau = nguon.indexOf("okr: (id, options) =>");
	const cuoi = nguon.indexOf("options,", dau);
	expect(dau).toBeGreaterThan(-1);
	return new Set(
		[...nguon.slice(dau, cuoi).matchAll(/trpc\.okr\.(\w+)\.queryKey/g)].flatMap(
			(m) => (m[1] ? [m[1]] : []),
		),
	);
}

describe("làm mới sau khi ghi OKR", () => {
	test("mọi truy vấn okr mà một màn OKR đọc đều được cache.okr làm mới", () => {
		const doc = truyVanManDoc();
		const lamMoi = truyVanLamMoi();
		expect(doc.size).toBeGreaterThan(5);
		const sot = [...doc]
			.filter((t) => !KHONG_DOI_KHI_GHI_OKR.has(t))
			.filter((t) => !lamMoi.has(t))
			.sort();
		expect(sot).toEqual([]);
	});
});
