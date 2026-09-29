import { describe, expect, test } from "bun:test";
import { kiemBanMay, rutSo } from "../src/tai-lieu-so";

const NGUON = [
	"Vinhomes Ocean Park 1",
	"Các phân khu",
	"+0.3%",
	"Mức thưởng tối đa là 12% mỗi quý.",
	"A1",
	"6 tỷ",
	"18 tỷ",
].join("\n");

const kiem = (noiDung: string, trich: string[]) =>
	kiemBanMay({
		noiDung,
		trichDoan: trich.map((t) => ({ menhDe: "m", trich: t })),
		chuNguon: NGUON,
		banGoc: null,
	});

describe("kiem-so-ngu-canh", () => {
	test("so thap phan dau cham rut tron ven, khong tach thanh 3%", () => {
		expect(rutSo("Phí hỗ trợ +0.3% và 1.500 căn, mức 1,3%.")).toEqual([
			"0.3%",
			"1.500",
			"1,3%",
		]);
	});

	test("hang bang co ten du an dung lam trich cho so thap phan", () => {
		expect(
			kiem("Ocean Park 1 được cộng +0.3%.", [
				"Vinhomes Ocean Park 1\nCác phân khu\n+0.3%",
			]),
		).toEqual({ ok: true });
	});

	test("trich tro troi mot con so bi bac vi thieu ngu canh", () => {
		const r = kiem("Mức thưởng 12%.", ["12%"]);
		expect(r.ok).toBe(false);
		expect(r.ok ? [] : r.loi).toContainEqual({
			loai: "trich-ngan",
			chi: "12%",
		});
	});

	test("trich chi co so va don vi van bi bac", () => {
		const r = kiem("Chỉ tiêu tháng 6 tỷ.", ["6 tỷ"]);
		expect(r.ok ? [] : r.loi).toContainEqual({
			loai: "trich-ngan",
			chi: "6 tỷ",
		});
	});

	test("doi chung: ca hang chi tieu co cap bac thi dat", () => {
		expect(
			kiem("Cấp A1 có chỉ tiêu tháng 6 tỷ, quý 18 tỷ.", ["A1 6 tỷ 18 tỷ"]),
		).toEqual({
			ok: true,
		});
	});
});
