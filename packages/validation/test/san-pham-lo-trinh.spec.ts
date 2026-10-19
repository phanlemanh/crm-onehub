import { describe, expect, test } from "bun:test";
import { BAN_CHUP_LO_TRINH } from "../src/ban-chup-lo-trinh";
import {
	LO_TRINH_SAN_PHAM,
	maTuTen,
	sanPhamKhai,
	TRANG_THAI_LAY,
} from "../src/san-pham-lo-trinh";

const HOP_LE = {
	ten: "Kit nghiệm thu",
	kho: "phanlemanh/acceptance-gate-kit",
	nhanh: "main",
	duongTep: "LO-TRINH.html",
};

describe("san-pham-khai", () => {
	test("vật lành qua khuôn", () => {
		expect(sanPhamKhai.safeParse(HOP_LE).success).toBe(true);
	});

	const SAI: [keyof typeof HOP_LE, string][] = [
		["kho", "khong-co-gach"],
		["kho", "a/b/c"],
		["kho", "/kho"],
		["nhanh", ""],
		["nhanh", "co khoang"],
		["duongTep", "../x.html"],
		["duongTep", "/x.html"],
		["duongTep", "a/../x.html"],
		["duongTep", "x".repeat(201)],
		["ten", ""],
		["ten", "x".repeat(61)],
	];

	test.each(SAI)("ô %s nhận %p thì hỏng đúng ô", (o, gt) => {
		const kq = sanPhamKhai.safeParse({ ...HOP_LE, [o]: gt });
		expect(kq.success).toBe(false);
		expect([...new Set(kq.error?.issues.map((i) => i.path[0]))]).toEqual([o]);
	});

	test("kho và nhánh được cắt khoảng trắng hai đầu, giữ hoa thường", () => {
		const kq = sanPhamKhai.parse({
			...HOP_LE,
			kho: "  Phanlemanh/Acceptance-Gate-Kit ",
			nhanh: " main ",
		});
		expect(kq.kho).toBe("Phanlemanh/Acceptance-Gate-Kit");
		expect(kq.nhanh).toBe("main");
	});
});

describe("ma-tu-ten", () => {
	test.each([
		["Kit nghiệm thu", "kit-nghiem-thu"],
		["OneHub Platform", "onehub-platform"],
		["Đường đi  —  mới", "duong-di-moi"],
		["!!!", ""],
		["x".repeat(80), "x".repeat(40)],
	])("%p → %p", (ten, ma) => {
		expect(maTuTen(ten)).toBe(ma);
	});
});

describe("hang-cua-khu", () => {
	test("trần tệp bằng trần thân bản chụp", () => {
		expect(LO_TRINH_SAN_PHAM.tranTepByte).toBe(BAN_CHUP_LO_TRINH.tranThanByte);
	});

	test("trạng thái lấy là danh sách đóng không trùng", () => {
		expect(new Set(TRANG_THAI_LAY).size).toBe(TRANG_THAI_LAY.length);
		expect(TRANG_THAI_LAY[0]).toBe("chua-lay");
	});
});
