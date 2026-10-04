import { describe, expect, test } from "bun:test";
import { KHOI_DONG, kiemNodeEve } from "./support/khoi-dong";

describe("kiemNodeEve", () => {
	test("Node du thi chay, bat buoc hay khong", () => {
		expect(kiemNodeEve("v24.15.0", true)).toBe(true);
		expect(kiemNodeEve("v25.0.0", false)).toBe(true);
	});

	test("Node thieu, khong bat buoc: bo qua", () => {
		expect(kiemNodeEve("v22.23.3", false)).toBe(false);
		expect(kiemNodeEve("", false)).toBe(false);
	});

	test("Node thieu, bat buoc: do ngay, khong bo qua im", () => {
		expect(() => kiemNodeEve("v22.23.3", true)).toThrow(
			`${KHOI_DONG.bienBatBuoc}=1`,
		);
		expect(() => kiemNodeEve("", true)).toThrow("khong co node");
	});
});
