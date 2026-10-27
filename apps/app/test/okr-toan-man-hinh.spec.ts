import { describe, expect, test } from "bun:test";
import {
	type BuocEsc,
	buocEsc,
	laDuongSoDo,
} from "../app/(app)/[slug]/okr/toan-man-hinh-luat";

describe("vk6-toan-man-thuan", () => {
	const MA_TRAN: Array<[boolean, boolean, boolean, BuocEsc]> = [
		[false, false, false, "thoat"],
		[false, false, true, "dong-the"],
		[false, true, false, "nhuong"],
		[false, true, true, "nhuong"],
		[true, false, false, "nhuong"],
		[true, false, true, "nhuong"],
		[true, true, false, "nhuong"],
		[true, true, true, "nhuong"],
	];

	test("buocEsc phủ đủ tám ô", () => {
		expect(MA_TRAN).toHaveLength(8);
		for (const [tuXuLy, lopMo, theDonViMo, mong] of MA_TRAN) {
			expect(
				`${tuXuLy}/${lopMo}/${theDonViMo} → ${buocEsc({ tuXuLy, lopMo, theDonViMo })}`,
			).toBe(`${tuXuLy}/${lopMo}/${theDonViMo} → ${mong}`);
		}
	});

	test("laDuongSoDo chỉ nhận hai đường Sơ đồ", () => {
		const CA: Array<[string, boolean]> = [
			["/ws/okr/so-do", true],
			["/ws/okr/so-do/muc-tieu/m1", true],
			["/ws/okr/so-do-x", false],
			["/ws/okr/bo-okr", false],
			["/ws/okr", false],
		];
		for (const [duong, mong] of CA) {
			expect(`${duong} → ${laDuongSoDo(duong)}`).toBe(`${duong} → ${mong}`);
		}
	});
});
