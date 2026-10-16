import { describe, expect, test } from "bun:test";
import {
	khoaThongBao,
	LOAI_THONG_BAO,
	parseNoiDungThongBao,
} from "../src/thong-bao";

const SANG = new Date("2026-10-14T01:30:00Z");

describe("khoa-thong-bao", () => {
	test("muc gop khong mang so dem", () => {
		const a = khoaThongBao({ loai: "tai-lieu-cho-duyet", so: 3 }, SANG);
		const b = khoaThongBao({ loai: "tai-lieu-cho-duyet", so: 5 }, SANG);
		expect(a, "muc gop sinh thong bao moi khi so doi").toBe(b);
	});

	test("cap nhat tuan theo tuan, khong theo danh sach KR", () => {
		const t3 = khoaThongBao(
			{ loai: "okr-cap-nhat", krIds: ["k1"], nhan: "x", soKr: 1 },
			SANG,
		);
		const t4 = khoaThongBao(
			{ loai: "okr-cap-nhat", krIds: ["k1", "k2"], nhan: "x", soKr: 2 },
			new Date("2026-10-15T01:30:00Z"),
		);
		const tuanSau = khoaThongBao(
			{ loai: "okr-cap-nhat", krIds: ["k1"], nhan: "x", soKr: 1 },
			new Date("2026-10-20T01:30:00Z"),
		);
		expect(t3, "cap nhat tuan sinh thong bao moi khi KR doi").toBe(t4);
		expect(t3).not.toBe(tuanSau);
	});

	test("tom tat OKR khong mang so KR dang ban", () => {
		const a = khoaThongBao(
			{
				loai: "okr-tom-tat",
				tomTatId: "t1",
				departmentId: "d",
				cycleId: "c",
				phongTen: "p",
				krDangBan: ["k1"],
				soKrDangBan: 1,
			},
			SANG,
		);
		const b = khoaThongBao(
			{
				loai: "okr-tom-tat",
				tomTatId: "t1",
				departmentId: "d",
				cycleId: "c",
				phongTen: "p",
				krDangBan: [],
				soKrDangBan: 0,
			},
			SANG,
		);
		expect(a, "tom tat sinh thong bao moi khi so KR doi").toBe(b);
	});

	test("ban ghi khac thi khoa khac", () => {
		expect(
			khoaThongBao(
				{ loai: "viec-qua-han", viecId: "v1", tieuDe: "a", banGhi: null },
				SANG,
			),
		).not.toBe(
			khoaThongBao(
				{ loai: "viec-qua-han", viecId: "v2", tieuDe: "a", banGhi: null },
				SANG,
			),
		);
	});

	test("noiDung sai khuon thi nem loi co ten", () => {
		expect(() => parseNoiDungThongBao({ loai: "khong-co" })).toThrow(
			/noiDung thong bao sai khuon/,
		);
		expect(parseNoiDungThongBao({ loai: "tai-lieu-cho-duyet", so: 2 })).toEqual(
			{ loai: "tai-lieu-cho-duyet", so: 2 },
		);
	});

	test("du 22 loai, khong trung", () => {
		expect(new Set(LOAI_THONG_BAO).size).toBe(22);
	});
});
