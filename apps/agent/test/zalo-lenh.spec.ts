import { describe, expect, test } from "bun:test";
import { docLenh, type Lenh } from "../agent/lib/zalo-lenh";

const XONG_1_3: Lenh = { lenh: "xong", so: [1, 3] };
const THIEU_SO: Lenh = { lenh: "xong-thieu-so" };

const BANG: [string, Lenh | null][] = [
	["Xong 1 3", XONG_1_3],
	["xong 1,3", XONG_1_3],
	["done 1 3", XONG_1_3],
	["  XONG  1 , 3 ", XONG_1_3],
	["xong 3 1 3", XONG_1_3],
	["xong", THIEU_SO],
	["Xong  ", THIEU_SO],
	["xong đi", null],
	["xong 0", null],
	["xong -1", null],
	["xong 1.5", null],
	["123456", null],
	["cảm ơn", null],
	["xonG2a", null],
];

const SO_O = 14;

const HAI_MUOI_LAM_SO = `xong ${Array.from({ length: 25 }, (_, i) => i + 1).join(" ")}`;

const BIEN: [string, Lenh | null][] = [
	["xong 99999999999999999999", null],
	["xong 999", { lenh: "xong", so: [999] }],
	[HAI_MUOI_LAM_SO, null],
	["xong 1", { lenh: "xong", so: [1] }],
];

describe("doc-lenh", () => {
	test("doc-lenh: bang 14 o", () => {
		expect(BANG.length, "so o viet truoc").toBe(SO_O);
		let daChay = 0;
		for (const [chu, mong] of BANG) {
			expect(docLenh(chu), `o ${JSON.stringify(chu)}`).toEqual(mong);
			daChay += 1;
		}
		expect(daChay, "so o thuc chay").toBe(SO_O);
	});

	test("doc-lenh: bien", () => {
		for (const [chu, mong] of BIEN) {
			expect(
				docLenh(chu),
				`o bien ${JSON.stringify(chu).slice(0, 30)}`,
			).toEqual(mong);
		}
	});
});

const MOI: [string, Lenh | null][] = [
	["mới", { lenh: "moi" }],
	["Mới ", { lenh: "moi" }],
	["moi", { lenh: "moi" }],
	["/new", { lenh: "moi" }],
	["mới hỏi cái này", null],
	["làm mới", null],
];

describe("cung-phien", () => {
	test("cung-phien: docLenh nhan moi chi khi dung mot chu", () => {
		expect(MOI.length, "so o viet truoc").toBe(6);
		let daChay = 0;
		for (const [chu, mong] of MOI) {
			expect(
				docLenh(chu),
				`moi chi khi dung mot chu: ${JSON.stringify(chu)}`,
			).toEqual(mong);
			daChay += 1;
		}
		expect(daChay).toBe(MOI.length);
	});
});
