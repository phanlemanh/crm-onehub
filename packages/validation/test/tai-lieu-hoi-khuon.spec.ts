import { describe, expect, test } from "bun:test";
import { LOAI_SU_KIEN, parseSuKienChiTiet } from "../src/tai-lieu";
import {
	parseGanNhat,
	parseTraLoi,
	TAI_LIEU_HOI,
	type TraLoiDaKiem,
} from "../src/tai-lieu-hoi";

const HOP_LE: TraLoiDaKiem = {
	cau: [
		{
			chu: "Tầng 2 hưởng 1,2%.",
			trich: [
				{
					slug: "hoa-hong",
					ten: "Chính sách hoa hồng",
					phienBan: 5,
					duyetLuc: "2026-07-01T03:00:00.000Z",
					doan: "| Tầng 2 | 2 – 10 tỷ | 1,2% |",
				},
			],
		},
	],
	quaHan: [],
};

describe("khuon-tra-loi", () => {
	test("bản một câu một trích đọc được nguyên vẹn", () => {
		expect(parseTraLoi(HOP_LE)).toEqual(HOP_LE);
	});

	test("câu rỗng, câu không trích, phiên bản dạng chữ đều bị từ chối", () => {
		expect(() => parseTraLoi({ ...HOP_LE, cau: [] })).toThrow(
			"câu trả lời kho không đọc được",
		);
		expect(() =>
			parseTraLoi({ ...HOP_LE, cau: [{ chu: "x", trich: [] }] }),
		).toThrow("câu trả lời kho không đọc được");
		const sai = structuredClone(HOP_LE) as unknown as {
			cau: { trich: { phienBan: unknown }[] }[];
		};
		sai.cau[0].trich[0].phienBan = "5";
		expect(() => parseTraLoi(sai)).toThrow("câu trả lời kho không đọc được");
	});

	test("trang gần nhất tối đa ba", () => {
		const bon = ["a", "b", "c", "d"].map((slug) => ({ slug, ten: slug }));
		expect(parseGanNhat(bon.slice(0, 3))).toHaveLength(3);
		expect(() => parseGanNhat(bon)).toThrow("trang gần nhất không đọc được");
		expect(TAI_LIEU_HOI.ganNhatToiDa).toBe(3);
	});

	test("sự kiện XAC_MINH ghi được và đọc lại được", () => {
		expect(LOAI_SU_KIEN).toContain("XAC_MINH");
		expect(parseSuKienChiTiet({ loai: "XAC_MINH", den: "2026-12-20" })).toEqual(
			{ loai: "XAC_MINH", den: "2026-12-20" },
		);
		expect(parseSuKienChiTiet({ loai: "XAC_MINH", den: null })).toEqual({
			loai: "XAC_MINH",
			den: null,
		});
	});
});
