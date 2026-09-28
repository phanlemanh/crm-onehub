import { describe, expect, test } from "bun:test";
import { mauNoiDung, OKR_MAU, parseMauNoiDung } from "../src/okr-mau";

type MauKrIn = {
	title: string;
	kind: string;
	unit: string;
	startValue: number | null;
	targetValue: number | null;
};

const kr = (over: Partial<MauKrIn> = {}): MauKrIn => ({
	title: "Doanh thu mới",
	kind: "tang-toi",
	unit: "triệu",
	startValue: null,
	targetValue: null,
	...over,
});

const noiDung = (
	krs: MauKrIn[],
	over: { cauMucTieu?: string; loai?: string } = {},
) => ({
	cauMucTieu: "Mở rộng thị trường",
	loai: "cam-ket",
	krs,
	...over,
});

const dichNhoHonKhoi = noiDung([kr(), kr({ startValue: 40, targetValue: 10 })]);

const CA_MAU: [string, unknown, boolean][] = [
	["một KR không số", noiDung([kr()]), true],
	[
		"một KR đủ hai số hợp kiểu",
		noiDung([kr({ startValue: 0, targetValue: 40 })]),
		true,
	],
	["0 KR", noiDung([]), false],
	[
		`${OKR_MAU.krToiDa + 1} KR`,
		noiDung(Array.from({ length: OKR_MAU.krToiDa + 1 }, () => kr())),
		false,
	],
	["tăng tới đích nhỏ hơn khởi điểm", dichNhoHonKhoi, false],
	[
		"phần trăm đích 120",
		noiDung([kr({ kind: "phan-tram", startValue: 0, targetValue: 120 })]),
		false,
	],
	["kiểu lạ", noiDung([kr({ kind: "khong-ton-tai" })]), false],
	["tên KR trống", noiDung([kr({ title: "" })]), false],
];

describe("okr-mau", () => {
	test("mauNoiDung: tám ca", () =>
		expect(CA_MAU.map(([, v]) => mauNoiDung.safeParse(v).success)).toEqual(
			CA_MAU.map(([, , k]) => k),
		));

	test("đích nhỏ hơn khởi điểm ghim path krs.1.targetValue", () => {
		const r = mauNoiDung.safeParse(dichNhoHonKhoi);
		expect(r.success).toBe(false);
		if (!r.success)
			expect(r.error.issues[0].path).toEqual(["krs", 1, "targetValue"]);
	});

	test("parseMauNoiDung({}) ném lỗi nêu krs", () => {
		expect(() => parseMauNoiDung({})).toThrow(/krs/);
	});
});
