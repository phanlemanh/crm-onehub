import { describe, expect, test } from "bun:test";
import { TRO_LY_OKR_TRAN } from "../src/okr-tro-ly-danh-muc";
import { KIEU_KR, type KieuKr, xuHuongKr } from "../src/okr-xu-huong";

const NGAY_MS = 24 * 60 * 60 * 1000;
const TUAN_DAU = Date.parse("2031-01-06T00:00:00Z");
const KET_THUC_KY = new Date("2031-03-31T00:00:00Z");

const chuoi = (diem: [number, number][]) =>
	diem.map(([i, giaTri]) => ({
		tuan: new Date(TUAN_DAU + i * 7 * NGAY_MS),
		giaTri,
	}));

type Mong = { moiTuan: number; uocCuoiKy: number } | null;

const BANG: [KieuKr, string, [number, number][], Mong][] = [
	[
		"tang-toi",
		"2 diem",
		[
			[0, 10],
			[1, 12],
		],
		null,
	],
	[
		"tang-toi",
		"3 diem deu",
		[
			[0, 10],
			[1, 12.5],
			[2, 14],
		],
		{ moiTuan: 2, uocCuoiKy: 34.17 },
	],
	[
		"tang-toi",
		"4 diem co tuan trong",
		[
			[0, 100],
			[1, 110],
			[3, 125],
			[4, 140],
		],
		{ moiTuan: 9.5, uocCuoiKy: 213.75 },
	],
	[
		"giam-xuong",
		"2 diem",
		[
			[0, 50],
			[1, 48],
		],
		null,
	],
	[
		"giam-xuong",
		"3 diem deu",
		[
			[0, 50],
			[1, 47],
			[2, 45.5],
		],
		{ moiTuan: -2.25, uocCuoiKy: 22.75 },
	],
	[
		"giam-xuong",
		"4 diem co tuan trong",
		[
			[0, 80],
			[2, 70],
			[3, 66],
			[4, 61],
		],
		{ moiTuan: -4.71, uocCuoiKy: 23.29 },
	],
	[
		"giu-tren",
		"2 diem",
		[
			[0, 95],
			[1, 96],
		],
		null,
	],
	[
		"giu-tren",
		"3 diem deu",
		[
			[0, 95],
			[1, 96],
			[2, 94],
		],
		{ moiTuan: -0.5, uocCuoiKy: 89.5 },
	],
	[
		"giu-tren",
		"4 diem co tuan trong",
		[
			[0, 90],
			[1, 92],
			[2, 91],
			[4, 93],
		],
		{ moiTuan: 0.63, uocCuoiKy: 97.94 },
	],
	[
		"giu-duoi",
		"2 diem",
		[
			[0, 3],
			[1, 2.5],
		],
		null,
	],
	[
		"giu-duoi",
		"3 diem deu",
		[
			[0, 3],
			[1, 2.5],
			[2, 2.8],
		],
		{ moiTuan: -0.1, uocCuoiKy: 1.67 },
	],
	[
		"giu-duoi",
		"4 diem co tuan trong",
		[
			[0, 5],
			[2, 4.6],
			[3, 4.9],
			[4, 4.2],
		],
		{ moiTuan: -0.16, uocCuoiKy: 3.14 },
	],
	[
		"phan-tram",
		"2 diem",
		[
			[0, 40],
			[1, 55],
		],
		null,
	],
	[
		"phan-tram",
		"3 diem deu",
		[
			[0, 40],
			[1, 55],
			[2, 70],
		],
		{ moiTuan: 15, uocCuoiKy: 100 },
	],
	[
		"phan-tram",
		"4 diem co tuan trong",
		[
			[0, 10],
			[1, 12],
			[3, 15],
			[4, 16],
		],
		{ moiTuan: 1.5, uocCuoiKy: 28.25 },
	],
	[
		"moc",
		"2 diem",
		[
			[0, 0],
			[1, 1],
		],
		null,
	],
	[
		"moc",
		"3 diem deu",
		[
			[0, 0],
			[1, 0],
			[2, 1],
		],
		null,
	],
	[
		"moc",
		"4 diem co tuan trong",
		[
			[0, 0],
			[1, 0],
			[3, 1],
			[4, 1],
		],
		null,
	],
];

describe("xu-huong", () => {
	test.each(BANG)("xu huong %s · %s", (kieu, _ten, diem, mong) => {
		const kq = xuHuongKr(chuoi(diem), KET_THUC_KY, kieu);
		if (diem.length === 2 && kq !== null) {
			throw new Error(`xu huong tu 2 diem: ${kieu} ra ${JSON.stringify(kq)}`);
		}
		expect(kq).toEqual(mong);
	});

	test("xu huong: bảng phủ đủ sáu kiểu KR, mỗi kiểu ba ca", () => {
		expect(
			KIEU_KR.map((k) => BANG.filter(([kieu]) => kieu === k).length),
		).toEqual(KIEU_KR.map(() => 3));
	});

	test("xu huong: số điểm tối thiểu rút từ cấu hình", () => {
		const n = TRO_LY_OKR_TRAN.diemXuHuongToiThieu;
		const day = (so: number) =>
			chuoi(Array.from({ length: so }, (_, i) => [i, 10 + i * 2]));
		expect(xuHuongKr(day(n - 1), KET_THUC_KY, "tang-toi")).toBeNull();
		expect(xuHuongKr(day(n), KET_THUC_KY, "tang-toi")).not.toBeNull();
	});

	test("xu huong: hai số cùng tuần là một điểm, lấy số sau", () => {
		expect(
			xuHuongKr(
				chuoi([
					[0, 10],
					[1, 11],
					[1, 12.5],
					[2, 14],
				]),
				KET_THUC_KY,
				"tang-toi",
			),
		).toEqual({ moiTuan: 2, uocCuoiKy: 34.17 });
		expect(
			xuHuongKr(
				chuoi([
					[0, 10],
					[1, 11],
					[1, 12],
				]),
				KET_THUC_KY,
				"tang-toi",
			),
		).toBeNull();
	});
});
