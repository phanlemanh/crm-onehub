import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import type { Locale } from "@crm/ui/lib/locale";
import { BANG_NGANH, tenNganh } from "./ten-nganh";

const UNION_NGANH = /\bindustry:\s*((?:\|\s*)?'[^']*'(?:\s*\|\s*'[^']*')+)/g;

function nganhTuKhaiBao(khaiBao: string): string[] {
	const khoi = new Set(
		[...khaiBao.matchAll(UNION_NGANH)].map((m) =>
			(m[1] ?? "").replace(/\s+/g, " "),
		),
	);
	if (khoi.size !== 1)
		throw new Error(`khuon thu vien doi: ${khoi.size} union industry`);
	const [mot = ""] = khoi;
	return [...mot.matchAll(/'([^']*)'/g)].map((m) => m[1] ?? "");
}

function soTapNganh(bang: Record<string, string>, ds: string[]) {
	const khoa = Object.keys(bang);
	return {
		thieu: ds.filter((n) => !khoa.includes(n)),
		thua: khoa.filter((k) => !ds.includes(k)),
	};
}

function kiemPhuBang(bang: Record<string, string>, ds: string[]) {
	const { thieu, thua } = soTapNganh(bang, ds);
	if (thieu.length > 0)
		throw new Error(`bang nganh thieu: ${thieu.join(", ")}`);
	if (thua.length > 0) throw new Error(`bang nganh thua: ${thua.join(", ")}`);
}

function loiCua(chay: () => void): string | null {
	try {
		chay();
		return null;
	} catch (loi) {
		return (loi as Error).message;
	}
}

const tacNhan = createRequire(
	join(import.meta.dir, "../../agent/package.json"),
);
const goc = dirname(tacNhan.resolve("context.dev/package.json"));
const khaiBao = readFileSync(join(goc, "resources/brand.d.ts"), "utf8");
const DS = nganhTuKhaiBao(khaiBao);

describe("phu-bang", () => {
	test("rut duoc danh sach nganh tu thu vien tac nhan cai", () => {
		expect(DS.length).toBeGreaterThan(0);
		expect(new Set(DS).size).toBe(DS.length);
		expect(DS).toContain("Real Estate & PropTech");
	});

	test("bang phu dung danh sach thu vien", () => {
		expect(soTapNganh(BANG_NGANH, DS)).toEqual({ thieu: [], thua: [] });
		expect(loiCua(() => kiemPhuBang(BANG_NGANH, DS))).toBeNull();
	});

	test("chieu do: bang thieu mot nganh", () => {
		const banSao = { ...BANG_NGANH };
		delete banSao["Real Estate & PropTech"];
		expect(soTapNganh(banSao, DS)).toEqual({
			thieu: ["Real Estate & PropTech"],
			thua: [],
		});
		expect(loiCua(() => kiemPhuBang(banSao, DS))).toBe(
			"bang nganh thieu: Real Estate & PropTech",
		);
	});

	test("chieu do: thu vien them nganh moi", () => {
		expect(soTapNganh(BANG_NGANH, [...DS, "Quantum Computing"]).thieu).toEqual([
			"Quantum Computing",
		]);
	});

	test("chieu do: bang con khoa thu vien da bo", () => {
		const banSao = { ...BANG_NGANH, "Old Industry": "Ngành cũ" };
		expect(soTapNganh(banSao, DS)).toEqual({
			thieu: [],
			thua: ["Old Industry"],
		});
		expect(loiCua(() => kiemPhuBang(banSao, DS))).toBe(
			"bang nganh thua: Old Industry",
		);
	});

	test("chieu do: khuon thu vien doi", () => {
		const khongUnion = khaiBao.replace(UNION_NGANH, "industry: string");
		expect(loiCua(() => nganhTuKhaiBao(khongUnion))).toContain(
			"khuon thu vien doi",
		);
	});
});

describe("ten-nganh", () => {
	test("moi nganh trong thu vien x hai ngon ngu", () => {
		const ngonNgu: Locale[] = ["vi", "en"];
		let dem = 0;
		for (const nganh of DS) {
			for (const locale of ngonNgu) {
				const mong =
					locale === "vi"
						? { ten: BANG_NGANH[nganh] ?? "", dich: true }
						: { ten: nganh, dich: false };
				expect(tenNganh(nganh, locale)).toEqual(mong);
				dem += 1;
			}
		}
		expect(dem).toBe(2 * DS.length);
	});

	test("ngoai danh sach hien nguyen van", () => {
		for (const la of ["Môi giới nhà phố", "Quantum Computing"]) {
			expect(tenNganh(la, "vi")).toEqual({ ten: la, dich: false });
			expect(tenNganh(la, "en")).toEqual({ ten: la, dich: false });
		}
	});

	test("bien", () => {
		expect(tenNganh("  Technology  ", "vi")).toEqual({
			ten: "Công nghệ",
			dich: true,
		});
		expect(tenNganh("technology", "vi")).toEqual({
			ten: "technology",
			dich: false,
		});
		expect(tenNganh(null, "vi")).toBeNull();
		expect(tenNganh("", "vi")).toBeNull();
		expect(tenNganh("   ", "vi")).toBeNull();
	});
});
