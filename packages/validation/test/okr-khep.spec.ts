import { describe, expect, test } from "bun:test";
import {
	cachDoc,
	diemChuan,
	diemMucTieu,
	diemTheoThang,
	goiYDiem,
} from "../src/okr-khep";

const O: [string, Parameters<typeof goiYDiem>, number][] = [
	["tăng tới 60→80 chốt 70", ["tang-toi", 60, 80, 70], 0.5],
	["tăng tới 60→80 chốt 80", ["tang-toi", 60, 80, 80], 1],
	["tăng tới 60→80 chốt 90", ["tang-toi", 60, 80, 90], 1],
	["tăng tới 0→100 chốt 84", ["tang-toi", 0, 100, 84], 0.8],
	["tăng tới 0→100 chốt 85", ["tang-toi", 0, 100, 85], 0.9],
	["tăng tới 0→100 chốt 86", ["tang-toi", 0, 100, 86], 0.9],
	["giảm xuống 8→2 chốt 5", ["giam-xuong", 8, 2, 5], 0.5],
	["giảm xuống 8→2 chốt 2", ["giam-xuong", 8, 2, 2], 1],
	["giảm xuống 8→2 chốt 1", ["giam-xuong", 8, 2, 1], 1],
	["giữ trên 90 chốt 85", ["giu-tren", 80, 90, 85], 0],
	["giữ trên 90 chốt 90", ["giu-tren", 80, 90, 90], 1],
	["giữ trên 90 chốt 95", ["giu-tren", 80, 90, 95], 1],
	["giữ dưới 5 chốt 6", ["giu-duoi", 7, 5, 6], 0],
	["giữ dưới 5 chốt 5", ["giu-duoi", 7, 5, 5], 1],
	["giữ dưới 5 chốt 4", ["giu-duoi", 7, 5, 4], 1],
	["mốc chốt 0", ["moc", 0, 1, 0], 0],
	["mốc chốt 1", ["moc", 0, 1, 1], 1],
	["phần trăm 20→80 chốt 50", ["phan-tram", 20, 80, 50], 0.5],
	["phần trăm 20→80 chốt 80", ["phan-tram", 20, 80, 80], 0.8],
	["phần trăm 20→80 chốt 100", ["phan-tram", 20, 80, 100], 1],
];

describe("goi-y-diem", () => {
	for (const [ten, dau, mong] of O)
		test(ten, () => expect(goiYDiem(...dau)).toBe(mong));
});

describe("thang", () => {
	test("0-1 nhận 0.8, từ chối 0.75 và 1.1", () => {
		expect(diemChuan(0.8, "0-1")).toBe(0.8);
		expect(diemChuan(0.75, "0-1")).toBeNull();
		expect(diemChuan(1.1, "0-1")).toBeNull();
	});
	test("0-100 nhận 80, từ chối 85 và 0.8", () => {
		expect(diemChuan(80, "0-100")).toBe(0.8);
		expect(diemChuan(85, "0-100")).toBeNull();
		expect(diemChuan(0.8, "0-100")).toBeNull();
	});
	test("đọc theo thang", () => {
		expect(diemTheoThang(0.8, "0-100")).toBe(80);
		expect(diemTheoThang(0.8, "0-1")).toBe(0.8);
	});
});

describe("diem-muc-tieu", () => {
	test("chưa chấm hết → null", () =>
		expect(
			diemMucTieu(
				[
					{ diem: 1, weight: 1 },
					{ diem: null, weight: 1 },
				],
				false,
			),
		).toBeNull());
	test("trung bình thường", () =>
		expect(
			diemMucTieu(
				[
					{ diem: 1, weight: 3 },
					{ diem: 0.4, weight: 1 },
				],
				false,
			),
		).toBe(0.7));
	test("trung bình có trọng số 3/1", () =>
		expect(
			diemMucTieu(
				[
					{ diem: 1, weight: 3 },
					{ diem: 0.4, weight: 1 },
				],
				true,
			),
		).toBe(0.85));
});

describe("cach-doc", () => {
	test("tham vọng 0.7 → tốt", () =>
		expect(cachDoc("tham-vong", 0.7, "")).toBe("tot"));
	test("tham vọng 0.65 → dưới mức tốt", () =>
		expect(cachDoc("tham-vong", 0.65, "")).toBe("duoi-muc-tot"));
	test("cam kết 1 → đạt", () => expect(cachDoc("cam-ket", 1, "")).toBe("dat"));
	test("cam kết 0.9 → chưa trọn", () =>
		expect(cachDoc("cam-ket", 0.9, "")).toBe("chua-tron"));
});
