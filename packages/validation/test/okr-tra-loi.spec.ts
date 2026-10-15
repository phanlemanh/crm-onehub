import { describe, expect, test } from "bun:test";
import { docSo, type GiaTriTrich, kiemSoCau } from "../src/okr-tra-loi";

const kr = (id: string, truong: number[]): GiaTriTrich => ({
	loai: "kr",
	id,
	truong,
});
const mt = (id: string, truong: number[]): GiaTriTrich => ({
	loai: "objective",
	id,
	truong,
});

const CA: Array<{
	ten: string;
	chu: string;
	trich: GiaTriTrich[];
	ok: boolean;
	so?: string;
}> = [
	{
		ten: "truong-tien-do-khop",
		chu: "KR này đạt 42%.",
		trich: [kr("k1", [42.49, 10, 20])],
		ok: true,
	},
	{
		ten: "truong-tien-do-lech",
		chu: "KR này đạt 55%.",
		trich: [kr("k1", [42.49, 10, 20])],
		ok: false,
		so: "55",
	},
	{
		ten: "truong-hien-tai-phay",
		chu: "Hiện là 42,5 hợp đồng.",
		trich: [kr("k1", [10, 42.5, 60])],
		ok: true,
	},
	{
		ten: "truong-hien-tai-cham",
		chu: "Hiện là 42.5 hợp đồng.",
		trich: [kr("k1", [10, 42.5, 60])],
		ok: true,
	},
	{
		ten: "truong-dich-lech",
		chu: "Đích là 70.",
		trich: [kr("k1", [10, 42.5, 60])],
		ok: false,
		so: "70",
	},
	{
		ten: "truong-tu-tin-khop",
		chu: "Mức tự tin 3.",
		trich: [kr("k1", [10, 3])],
		ok: true,
	},
	{
		ten: "nghin",
		chu: "Đã chốt 14.000.000 đồng.",
		trich: [kr("k1", [14000000])],
		ok: true,
	},
	{
		ten: "dem-kr-khop",
		chu: "Có 2 KR đang chậm.",
		trich: [kr("k1", [1]), kr("k2", [1])],
		ok: true,
	},
	{
		ten: "dem-kr-lech",
		chu: "Có 3 KR đang chậm.",
		trich: [kr("k1", [1]), kr("k2", [1])],
		ok: false,
		so: "3",
	},
	{
		ten: "dem-muc-tieu-khop",
		chu: "Phòng có 1 Mục tiêu.",
		trich: [mt("o1", [50])],
		ok: true,
	},
	{
		ten: "mien-nam-quy",
		chu: "Trong quý 4 năm 2026 chưa có Mục tiêu nào trượt.",
		trich: [],
		ok: true,
	},
	{
		ten: "so-la",
		chu: "Đạt 80% kế hoạch.",
		trich: [kr("k1", [42, 10, 20])],
		ok: false,
		so: "80",
	},
	{
		ten: "khong-so",
		chu: "KR này đang đúng nhịp.",
		trich: [kr("k1", [42])],
		ok: true,
	},
	{
		ten: "so-trong-ten-van-ngoai-lop",
		chu: "Mục tiêu «Doanh thu hợp đồng mới đạt 48 tỷ đồng» đang ở 35%.",
		trich: [mt("m1", [35])],
		ok: false,
		so: "48",
	},
	{
		ten: "quy-gach-nam",
		chu: "Trong quý 4/2026, KR này đạt 42%.",
		trich: [kr("k1", [42])],
		ok: true,
	},
	{
		ten: "q-gach-nam",
		chu: "Ở Q4/2026, KR này đạt 42%.",
		trich: [kr("k1", [42])],
		ok: true,
	},
];

describe("okr-tra-loi kiem so", () => {
	for (const c of CA) {
		test(c.ten, () => {
			const kq = kiemSoCau(c.chu, c.trich);
			expect(kq.ok).toBe(c.ok);
			if (!kq.ok) expect(kq.so).toBe(c.so ?? "");
		});
	}

	test("so-ca-bang-so-hang", () => {
		expect(CA.length).toBe(16);
	});

	test("doc-so", () => {
		expect(docSo("42,5")).toBe(42.5);
		expect(docSo("42.5")).toBe(42.5);
		expect(docSo("1.000")).toBe(1000);
		expect(docSo("14.000.000")).toBe(14000000);
		expect(docSo("42.500")).toBe(42500);
		expect(docSo("abc")).toBeNull();
	});
});
