import { describe, expect, test } from "bun:test";
import {
	type CayGon,
	gopToanCanh,
	type MucTieuTinh,
} from "../src/okr/toan-canh";

const pb = (id: string) => ({ id, name: id.toUpperCase(), head: null });

const CAY: CayGon = {
	divisions: [
		{ id: "b", name: "B", head: null, departments: [pb("p1"), pb("p2")] },
		{ id: "c", name: "C", head: null, departments: [pb("p3")] },
	],
	chuaXep: [pb("p4")],
};

const mt = (
	level: MucTieuTinh["level"],
	unitId: string | null,
	progress: number,
	expected: number | null,
	soKr: number,
): MucTieuTinh => ({ level, unitId, progress, expected, soKr });

describe("toan-canh", () => {
	test("toan-canh: gop theo thu tu cay, bo phan gom phong ban con, don vi chua dat", () => {
		const ra = gopToanCanh(
			CAY,
			[
				mt("onehub", null, 25, 40, 1),
				mt("bo-phan", "b", 50, 40, 1),
				mt("phong-ban", "p1", 25, 40, 1),
				mt("phong-ban", "p1", 63, null, 2),
				mt("phong-ban", "p3", 50, 20, 1),
				mt("ca-nhan", "u", 90, 40, 1),
			],
			"OneHub",
		);
		expect(ra.hang).toEqual([
			{
				key: "goc",
				ten: "OneHub",
				cap: "goc",
				tienDo: 25,
				kyVong: 40,
				soMucTieu: 1,
				soKr: 1,
			},
			{
				key: "bp:b",
				ten: "B",
				cap: "bo-phan",
				tienDo: 46,
				kyVong: 40,
				soMucTieu: 3,
				soKr: 4,
			},
			{
				key: "pb:p1",
				ten: "P1",
				cap: "phong-ban",
				tienDo: 44,
				kyVong: 40,
				soMucTieu: 2,
				soKr: 3,
			},
			{
				key: "pb:p2",
				ten: "P2",
				cap: "phong-ban",
				tienDo: null,
				kyVong: null,
				soMucTieu: 0,
				soKr: 0,
			},
			{
				key: "bp:c",
				ten: "C",
				cap: "bo-phan",
				tienDo: 50,
				kyVong: 20,
				soMucTieu: 1,
				soKr: 1,
			},
			{
				key: "pb:p3",
				ten: "P3",
				cap: "phong-ban",
				tienDo: 50,
				kyVong: 20,
				soMucTieu: 1,
				soKr: 1,
			},
			{
				key: "pb:p4",
				ten: "P4",
				cap: "phong-ban",
				tienDo: null,
				kyVong: null,
				soMucTieu: 0,
				soKr: 0,
			},
		]);
		expect(ra.tongQuan).toEqual({
			tienDo: 43,
			kyVong: 35,
			donViCongBo: 3,
			tongDonVi: 6,
			donViChuaDat: ["P2", "C", "P4"],
		});
	});

	test("toan-canh: ky chua co muc tieu cong bo nao — moi hang rong, khong nem", () => {
		const ra = gopToanCanh(CAY, [], "OneHub");
		expect(ra.hang.every((h) => h.tienDo === null && h.soMucTieu === 0)).toBe(
			true,
		);
		expect(ra.tongQuan).toEqual({
			tienDo: null,
			kyVong: null,
			donViCongBo: 0,
			tongDonVi: 6,
			donViChuaDat: ["B", "P1", "P2", "C", "P3", "P4"],
		});
	});
});
