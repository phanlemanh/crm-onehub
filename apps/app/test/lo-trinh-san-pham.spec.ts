import { describe, expect, test } from "bun:test";
import { chonSanPham, danhSachChon } from "@/lib/lo-trinh/san-pham";
import { SP_KIT } from "./lo-trinh-san-pham-mau";

describe("ltsp-quyen-trang", () => {
	const thayA = [SP_KIT];
	const thayB: (typeof SP_KIT)[] = [];

	test("người không được cấp gõ tay đường dẫn thì về CRM", () => {
		if (chonSanPham(thayB, "kit") !== "crm")
			throw new Error("duong dan go tay mo san pham khong duoc thay: P");
		expect(chonSanPham(thayA, "kit")).toBe("kit");
	});

	test.each([[null], [""], ["CRM"], ["KIT"], ["khong-co"], ["kit,kit"]])(
		"tham số %p thì về CRM",
		(thamSo) => {
			expect(chonSanPham(thayA, thamSo)).toBe("crm");
		},
	);

	test("danh sách chọn luôn có CRM đứng đầu", () => {
		expect(danhSachChon(thayB).map((s) => s.ma)).toEqual(["crm"]);
		expect(danhSachChon(thayA).map((s) => s.ma)).toEqual(["crm", "kit"]);
	});
});
