import { describe, expect, test } from "bun:test";
import { kiemPhieu, kyPhieu } from "../src/tai-lieu/phieu-nguon";

const KHOA = "kho-tai-lieu:phieu-nguon:khoa-thu";
const N = { userId: "u-tai", pathname: "kho-tai-lieu/nguon/a" };
const BAY_GIO = 1_790_000_000_000;
const HET_HAN = BAY_GIO + 60_000;

describe("phieu-nguon", () => {
	test("phieu-nguon: dung nguoi, dung duong luu, con han thi nhan", () => {
		expect(kiemPhieu(KHOA, N, kyPhieu(KHOA, N, HET_HAN), BAY_GIO)).toBe(true);
	});

	test("phieu-nguon: sai nguoi, sai duong luu, qua han, sai khoa, cut hay rong deu bac", () => {
		const p = kyPhieu(KHOA, N, HET_HAN);
		const ca: [string, boolean][] = [
			["sai-nguoi", kiemPhieu(KHOA, { ...N, userId: "u-khac" }, p, BAY_GIO)],
			[
				"sai-duong",
				kiemPhieu(KHOA, { ...N, pathname: "kho-tai-lieu/nguon/b" }, p, BAY_GIO),
			],
			["qua-han", kiemPhieu(KHOA, N, p, HET_HAN + 1)],
			["sai-khoa", kiemPhieu(`${KHOA}-khac`, N, p, BAY_GIO)],
			[
				"doi-han",
				kiemPhieu(
					KHOA,
					N,
					p.replace(String(HET_HAN), String(HET_HAN + 1)),
					BAY_GIO,
				),
			],
			["cut", kiemPhieu(KHOA, N, p.slice(0, -3), BAY_GIO)],
			["rong", kiemPhieu(KHOA, N, "", BAY_GIO)],
		];
		expect(ca.filter(([, dung]) => dung).map(([ten]) => ten)).toEqual([]);
	});
});
