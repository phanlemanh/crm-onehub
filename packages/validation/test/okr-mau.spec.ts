import { describe, expect, test } from "bun:test";
import { krInput } from "../src/okr-kr";
import { mauNoiDung, OKR_MAU, parseMauNoiDung } from "../src/okr-mau";
import { mucTieuInput } from "../src/okr-muc-tieu";

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
	["tên KR hai ký tự", noiDung([kr({ title: "KH" })]), false],
	["câu mục tiêu hai ký tự", noiDung([kr()], { cauMucTieu: "Ab" }), false],
	[
		"tên KR và câu mục tiêu đủ ba ký tự",
		noiDung([kr({ title: "KH1" })], { cauMucTieu: "Abc" }),
		true,
	],
];

const ngan = noiDung([kr(), kr({ title: "KH" })], { cauMucTieu: "Ab" });

describe("okr-mau", () => {
	test(`mauNoiDung: ${CA_MAU.length} ca`, () =>
		expect(CA_MAU.map(([, v]) => mauNoiDung.safeParse(v).success)).toEqual(
			CA_MAU.map(([, , k]) => k),
		));

	test("đích nhỏ hơn khởi điểm ghim path krs.1.targetValue", () => {
		const r = mauNoiDung.safeParse(dichNhoHonKhoi);
		expect(r.success).toBe(false);
		if (!r.success)
			expect(r.error.issues[0].path).toEqual(["krs", 1, "targetValue"]);
	});

	test("tiêu đề ngắn: cùng trần với tạo KR tay và tạo mục tiêu tay, ghim path krs.1.title và cauMucTieu", () => {
		const r = mauNoiDung.safeParse(ngan);
		expect({
			tenKr: {
				min: krInput.shape.title.minLength,
				max: krInput.shape.title.maxLength,
			},
			cauMucTieu: {
				min: mucTieuInput.shape.title.minLength,
				max: mucTieuInput.shape.title.maxLength,
			},
		}).toEqual({ tenKr: OKR_MAU.tenKr, cauMucTieu: OKR_MAU.cauMucTieu });
		expect({
			krTay: krInput.shape.title.safeParse("KH").success,
			mucTieuTay: mucTieuInput.shape.title.safeParse("Ab").success,
			loi: r.success
				? []
				: r.error.issues.map((i) => ({
						path: i.path.join("."),
						code: i.code,
						minimum: "minimum" in i ? Number(i.minimum) : null,
					})),
		}).toEqual({
			krTay: false,
			mucTieuTay: false,
			loi: [
				{
					path: "cauMucTieu",
					code: "too_small",
					minimum: OKR_MAU.cauMucTieu.min,
				},
				{
					path: "krs.1.title",
					code: "too_small",
					minimum: OKR_MAU.tenKr.min,
				},
			],
		});
	});

	test("parseMauNoiDung({}) ném lỗi nêu krs", () => {
		expect(() => parseMauNoiDung({})).toThrow(/krs/);
	});
});
