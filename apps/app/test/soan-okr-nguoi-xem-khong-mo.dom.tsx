import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
	CUOC,
	daTaiLuong,
	dat,
	datLai,
	don,
	m,
	moTrang,
	nhip,
} from "./khung-soan-okr";

beforeEach(datLai);
afterEach(don);

const QUAN_TRI = {
	id: "quan-tri",
	name: "Lê Quản Trị",
	email: "quantri@onehub.vn",
	image: null,
};

function dangMo(): boolean {
	return document.body.textContent?.includes(m.man.dangMo) ?? false;
}

describe("soan-okr-nguoi-xem-khong-mo", () => {
	test("quan tri mo cuoc dang soan cua nguoi khac: khong tai luong, khung khong ket o dang mo", async () => {
		dat("users.me", () => QUAN_TRI);
		await moTrang(true);
		await nhip(20);
		if (daTaiLuong.length > 0)
			throw new Error(
				`tai luong cuoc nguoi khac: ${daTaiLuong.join(", ")} (nguoi mo ${CUOC.nguoiMo.id}, nguoi xem ${QUAN_TRI.id})`,
			);
		expect(dangMo()).toBe(false);
		expect(
			document.querySelector(
				"[data-trang-soan]:not([data-trang-soan='dang-mo'])",
			),
		).not.toBeNull();
	});

	test("nguoi mo cuoc: tai luong dung mot lan", async () => {
		await moTrang();
		await nhip(20);
		expect(daTaiLuong).toEqual([CUOC.sessionId]);
	});
});
