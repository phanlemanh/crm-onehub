import { describe, expect, test } from "bun:test";
import { phanTichLoOkr, type SnapNhapOkr } from "../src/okr/nhap";
import { OKR } from "../src/okr/okr-config";
import { khoa } from "../src/to-chuc/nhap";

const N = OKR.thongDiep.nhap;
const S = OKR.thongDiep.soTheoKieu;

const SNAP: SnapNhapOkr = {
	members: [
		{ id: "u-an", email: "An@OneHub.vn" },
		{ id: "u-binh", email: "binh@onehub.vn" },
	],
	daCo: [khoa("Mở rộng miền Bắc")],
	tranConLai: null,
	tranKr: null,
};

const dong = (...o: string[]) => o.join("\t");

const LO = [
	dong("Mục tiêu", "KR", "Kiểu", "Khởi điểm", "Đích", "Đơn vị", "Email"),
	dong("", "KR mồ côi", "tăng tới", "0", "10", "khách", "an@onehub.vn"),
	dong("Tăng doanh thu", "", "tăng tới", "0", "10", "khách", "an@onehub.vn"),
	dong("Tăng doanh thu", "KR ba", "lên cao", "0", "10", "", "an@onehub.vn"),
	"",
	dong("Tăng doanh thu", "KR bốn", "tăng tới", "0", "10", "", "la@khac.vn"),
	dong("Tăng doanh thu", "KR năm", "tăng tới", "0", "", "", "an@onehub.vn"),
	dong("Tăng doanh thu", "KR sáu", "tăng tới", "50", "50", "", "an@onehub.vn"),
	dong(
		"Tăng doanh thu",
		"KR bảy",
		"giảm xuống",
		"10",
		"20",
		"",
		"an@onehub.vn",
	),
	dong(
		"Tăng doanh thu",
		"KR tám",
		"phần trăm",
		"0",
		"120",
		"%",
		"an@onehub.vn",
	),
	dong("Mở rộng miền Bắc", "KR chín", "tăng tới", "0", "5", "", "an@onehub.vn"),
	dong(
		"Tăng doanh thu",
		"Doanh thu quý",
		"Tăng tới",
		"1.250,5",
		"2.000,75",
		"triệu",
		"AN@ONEHUB.VN",
	),
	"   ",
	dong("tăng doanh thu ", "Khách mới", "mốc", "", "", "", "binh@onehub.vn"),
	dong(
		"Giữ chân khách",
		"Tỉ lệ giữ",
		"Phần trăm",
		"",
		"90",
		"%",
		"binh@onehub.vn",
	),
	dong("Tăng doanh thu", "KR", "tăng tới", "0", "10", "", "an@onehub.vn"),
].join("\n");

const MA_TRAN: [number, string | null][] = [
	[2, N.thieuMucTieu],
	[3, N.thieuKr],
	[4, N.kieuLa],
	[6, N.emailLa],
	[7, N.thieuDich],
	[8, S["dich-phai-lon-hon-khoi-diem"]],
	[9, S["dich-phai-nho-hon-khoi-diem"]],
	[10, S["phan-tram-ngoai-0-100"]],
	[11, N.daCo],
	[12, null],
	[14, null],
	[15, null],
	[16, N.doDai],
];

describe("okr-nhap", () => {
	test("okr-nhap: lo 13 dong, ma tran 13 x cau loi ghim, gom 2 muc tieu", () => {
		const kq = phanTichLoOkr(LO, SNAP);
		expect(kq.rows.map((r) => [r.line, r.error])).toEqual(MA_TRAN);
		expect(kq.summary).toEqual({ valid: 3, invalid: 10, objectives: 2 });
		expect(kq.vuotTran).toBe(false);
		expect(kq.mucTieu).toEqual([
			{
				title: "Tăng doanh thu",
				keyResults: [
					{
						line: 12,
						title: "Doanh thu quý",
						kind: "tang-toi",
						startValue: 1250.5,
						targetValue: 2000.75,
						unit: "triệu",
						ownerUserId: "u-an",
					},
					{
						line: 14,
						title: "Khách mới",
						kind: "moc",
						startValue: 0,
						targetValue: 1,
						unit: "",
						ownerUserId: "u-binh",
					},
				],
			},
			{
				title: "Giữ chân khách",
				keyResults: [
					{
						line: 15,
						title: "Tỉ lệ giữ",
						kind: "phan-tram",
						startValue: 0,
						targetValue: 90,
						unit: "%",
						ownerUserId: "u-binh",
					},
				],
			},
		]);
		expect(kq.rows[0]).toEqual({
			line: 2,
			objective: "",
			keyResult: "KR mồ côi",
			kind: "tăng tới",
			start: "0",
			target: "10",
			unit: "khách",
			email: "an@onehub.vn",
			error: N.thieuMucTieu,
		});
	});

	test("okr-nhap: nhap-so-viet, so la, dong trong bo, khong tieu de", () => {
		const kq = phanTichLoOkr(
			[
				dong(
					"Mục A",
					"KR 1",
					"giữ trên",
					"1.250,5",
					"1.300,25",
					"",
					"BINH@onehub.vn",
				),
				"",
				dong("Mục A", "KR 2", "giữ dưới", "1.5", "abc", "", "binh@onehub.vn"),
				dong("Mục A", "KR 3", "tăng tới", "", "10", "", "binh@onehub.vn"),
				dong("Mục A", "KR 4", "giam xuong", "1e13", "0", "", "binh@onehub.vn"),
				dong("Mục A", "KR 5", "phần trăm", "0", "", "", "binh@onehub.vn"),
				dong("Mục A", "KR 6", "", "0", "10", "", "binh@onehub.vn"),
				dong(
					"Mục A",
					"KR 7",
					"giữ trên",
					"1.000",
					"1.250.000",
					"",
					"binh@onehub.vn",
				),
				dong("Mục A", "KR 8", "giữ dưới", "3.5", "1.500", "", "binh@onehub.vn"),
			].join("\n"),
			SNAP,
		);
		expect(kq.rows.map((r) => [r.line, r.error])).toEqual([
			[1, null],
			[3, N.soLa],
			[4, N.soLa],
			[5, N.soLa],
			[6, N.thieuDich],
			[7, N.kieuLa],
			[8, null],
			[9, null],
		]);
		expect(
			kq.mucTieu[0]?.keyResults.map((k) => [k.startValue, k.targetValue]),
		).toEqual([
			[1250.5, 1300.25],
			[1000, 1250000],
			[3.5, 1500],
		]);
		expect(kq.mucTieu[0]?.keyResults[0]).toMatchObject({
			kind: "giu-tren",
			startValue: 1250.5,
			targetValue: 1300.25,
			ownerUserId: "u-binh",
		});
		expect(phanTichLoOkr(dong("Objective", "KR", "kind"), SNAP).rows).toEqual(
			[],
		);
	});

	test("okr-nhap: tran con lai chi danh dau vuot tran, khong doi dong", () => {
		const hai = [
			dong("Mục A", "KR 1", "mốc", "", "", "", "an@onehub.vn"),
			dong("Mục B", "KR 2", "mốc", "", "", "", "an@onehub.vn"),
			dong("Mở rộng miền Bắc", "KR 3", "mốc", "", "", "", "an@onehub.vn"),
		].join("\n");
		const theoTran = [null, 3, 2, 1, 0].map((tranConLai) => {
			const kq = phanTichLoOkr(hai, { ...SNAP, tranConLai });
			return [tranConLai, kq.vuotTran, kq.summary.valid];
		});
		expect(theoTran).toEqual([
			[null, false, 2],
			[3, false, 2],
			[2, false, 2],
			[1, true, 2],
			[0, true, 2],
		]);
	});

	test("okr-nhap: do dai ten va don vi la loi dong, khong cat chu", () => {
		const dai = "M".repeat(250);
		const kq = phanTichLoOkr(
			[
				dong(dai, "KR dài", "mốc", "", "", "", "an@onehub.vn"),
				dong("Mục A", "K".repeat(201), "mốc", "", "", "", "an@onehub.vn"),
				dong(
					"Mục A",
					"KR đơn vị",
					"mốc",
					"",
					"",
					"đ".repeat(25),
					"an@onehub.vn",
				),
				dong("Mở rộng miền Bắc", "KR", "mốc", "", "", "", "an@onehub.vn"),
				dong(
					"M".repeat(200),
					"K".repeat(200),
					"mốc",
					"",
					"",
					"đ".repeat(24),
					"an@onehub.vn",
				),
				dong("Mục", "KR3", "mốc", "", "", "", "an@onehub.vn"),
			].join("\n"),
			SNAP,
		);
		expect(kq.rows.map((r) => [r.line, r.error])).toEqual([
			[1, N.doDai],
			[2, N.doDai],
			[3, N.doDai],
			[4, N.doDai],
			[5, null],
			[6, null],
		]);
		expect(kq.mucTieu.map((m) => m.title.length)).toEqual([200, 3]);
	});

	test("okr-nhap: cham phay cua CSV kieu Viet, dau phay van tach nhu cu", () => {
		const kq = phanTichLoOkr(
			[
				"Mục C;KR chấm phẩy;tăng tới;0;10;;an@onehub.vn",
				"Mục C;KR thập phân;tăng tới;0;1.250,5;triệu;an@onehub.vn",
				'"Mục; có chấm phẩy";"KR ""trích""";mốc;;;;an@onehub.vn',
				"Tăng A; giảm B,KR phẩy,mốc,,,,an@onehub.vn",
			].join("\n"),
			SNAP,
		);
		expect(
			kq.rows.map((r) => [r.objective, r.keyResult, r.target, r.error]),
		).toEqual([
			["Mục C", "KR chấm phẩy", "10", null],
			["Mục C", "KR thập phân", "1.250,5", null],
			["Mục; có chấm phẩy", 'KR "trích"', "", null],
			["Tăng A; giảm B", "KR phẩy", "", null],
		]);
		expect(kq.mucTieu[0]?.keyResults.map((k) => k.targetValue)).toEqual([
			10, 1250.5,
		]);
	});

	test("okr-nhap: tran KR khi chan, dung bang tran thi qua, lo khong co muc tieu moi khong vuot tran", () => {
		const ba = ["KR 1", "KR 2", "KR 3"]
			.map((t) => dong("Mục A", t, "mốc", "", "", "", "an@onehub.vn"))
			.join("\n");
		expect(
			[null, 3, 2].map(
				(tranKr) => phanTichLoOkr(ba, { ...SNAP, tranKr }).vuotTranKr,
			),
		).toEqual([false, false, true]);
		const chiDaCo = dong(
			"Mở rộng miền Bắc",
			"KR x",
			"mốc",
			"",
			"",
			"",
			"an@onehub.vn",
		);
		const lai = phanTichLoOkr(chiDaCo, { ...SNAP, tranConLai: -1, tranKr: 0 });
		expect([lai.vuotTran, lai.vuotTranKr, lai.summary.objectives]).toEqual([
			false,
			false,
			0,
		]);
	});
});
