import { describe, expect, test } from "bun:test";
import {
	chiTietTu,
	dungSheet,
	kho,
	m,
	mtSheet,
	nhip,
	qs,
} from "./khung-gop-y-dung-cho";

describe("trang-thai-kara", () => {
	test("danh sach Kara dang tai thi khong hien Kara dang doc", async () => {
		kho.chiTiet = () => chiTietTu(mtSheet({ soGopYCho: 0 }));
		kho.troLy = () => new Promise(() => {});
		await dungSheet();
		await nhip(10);
		if (document.body.textContent?.includes(m.vung.dangDoc))
			throw new Error("dang tai ma noi Kara dang doc");
		expect(qs("[data-nhom-kara]")).toBeNull();
	});
});
