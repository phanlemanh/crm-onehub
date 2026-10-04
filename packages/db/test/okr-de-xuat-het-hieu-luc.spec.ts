import { describe, expect, test } from "bun:test";
import { hetHieuLuc } from "../src/okr-de-xuat";

const MT = {
	title: "Mạng lưới đủ dày",
	whyNow: "Vì sao lúc này",
	keyResults: [
		{ id: "kr1", title: "Đạt số giao dịch" },
		{ id: "kr2", title: "Công ty ký mới" },
	],
};

const hang = (
	loai: string,
	truong: string | null,
	keyResultId: string | null,
	truoc: string | null,
) => ({ loai, truong, keyResultId, truoc });

const MA_TRAN: readonly {
	ten: string;
	vao: ReturnType<typeof hang>;
	ky: boolean;
}[] = [
	{
		ten: "title-con-nguyen",
		vao: hang("viet-lai", "title", null, "Mạng lưới đủ dày"),
		ky: false,
	},
	{
		ten: "title-da-doi",
		vao: hang("viet-lai", "title", null, "Tên cũ"),
		ky: true,
	},
	{
		ten: "whyNow-con-nguyen",
		vao: hang("viet-lai", "whyNow", null, "Vì sao lúc này"),
		ky: false,
	},
	{
		ten: "kr-title-con-nguyen",
		vao: hang("viet-lai", "kr.title", "kr1", "Đạt số giao dịch"),
		ky: false,
	},
	{
		ten: "kr-title-da-doi",
		vao: hang("viet-lai", "kr.title", "kr2", "Tên KR cũ"),
		ky: true,
	},
	{
		ten: "kr-da-xoa",
		vao: hang("viet-lai", "kr.title", "kr9", "Đạt số giao dịch"),
		ky: true,
	},
	{ ten: "cau-hoi-khong-xet", vao: hang("hoi", null, "kr1", null), ky: false },
	{
		ten: "can-chinh-khong-xet",
		vao: hang("can-chinh", null, null, null),
		ky: false,
	},
];

describe("hetHieuLuc", () => {
	for (const ca of MA_TRAN) {
		test(ca.ten, () => {
			expect(hetHieuLuc(MT, ca.vao)).toBe(ca.ky);
		});
	}
	test("so ca bang ma tran viet truoc", () => {
		expect(MA_TRAN.length).toBe(8);
	});
});
