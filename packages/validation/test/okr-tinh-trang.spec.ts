import { describe, expect, test } from "bun:test";
import { type LoaiMucTieu, tinhTrang } from "../src/okr-muc-tieu";

const BANG: [number, number | null, LoaiMucTieu, string][] = [
	[40, null, "cam-ket", "chua-co-ky-vong"],
	[40, 0, "cam-ket", "chua-co-ky-vong"],
	[45, 50, "cam-ket", "dung-nhip"],
	[40, 50, "cam-ket", "cham-nhip"],
	[20, 50, "cam-ket", "truot"],
	[35, 50, "tham-vong", "dung-nhip"],
	[10, 50, "tham-vong", "cham-nhip"],
];

describe("okr-tinh-trang", () => {
	test("bay ca: chua ky vong, cam ket ba muc, tham vong hai muc", () => {
		for (const [p, k, loai, mong] of BANG) {
			expect(`${p}/${k} ${loai} -> ${tinhTrang(p, k, loai)}`).toBe(
				`${p}/${k} ${loai} -> ${mong}`,
			);
		}
	});
});
