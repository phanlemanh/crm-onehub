import { describe, expect, test } from "bun:test";
import { chamCau, docPhieu, NGUONG, tongHop } from "./cham-hoi.mjs";

const CA = {
	ma: "c-liet-ke",
	nguoiHoi: "ngo-van-toan",
	yDinh: "liet-ke",
	cauHoi: "Phòng pháp chế quý này đặt những Mục tiêu gì?",
	kyVong: {
		loai: "tra-loi",
		trichBatBuoc: [
			{ loai: "objective", ma: "q4-phap-che-1" },
			{ loai: "objective", ma: "q4-phap-che-2" },
		],
	},
};
const ID = (m: string) => `mau-okr-mt-${m}`;
const idCua = (loai: string, m: string) =>
	loai === "kr" ? `mau-okr-kr-${m}` : ID(m);
const TRA_LOI = {
	loai: "tra-loi",
	cau: [
		{
			chu: "Pháp chế có 2 Mục tiêu.",
			trich: [
				{ loai: "objective", id: ID("q4-phap-che-1"), ten: "Hợp đồng mùa Tết" },
				{ loai: "objective", id: ID("q4-phap-che-2"), ten: "Câu hỏi pháp lý" },
			],
		},
	],
};
const THAY = new Set([ID("q4-phap-che-1"), ID("q4-phap-che-2")]);
const TEN_CAM = ["Xử lý dứt điểm các tranh chấp hợp đồng đang mở"];

describe("do-hoi-dap cham", () => {
	test("cau dung: dat quyen va dat trich", () => {
		const kq = chamCau({
			ca: CA,
			traLoi: TRA_LOI,
			chuPhien: "Pháp chế có 2 Mục tiêu.",
			tenCam: TEN_CAM,
			maThay: THAY,
			idCua,
		});
		expect(kq).toMatchObject({ quyen: true, trichSo: true });
	});

	test("ca hong: nhac ten cam thi truot luat quyen va goi ten cau", () => {
		const kq = chamCau({
			ca: CA,
			traLoi: TRA_LOI,
			chuPhien: `Còn mục «${TEN_CAM[0]}» nữa.`,
			tenCam: TEN_CAM,
			maThay: THAY,
			idCua,
		});
		expect(kq.quyen).toBe(false);
		const tong = tongHop([{ ...kq, ma: CA.ma, dungY: true }]);
		expect(tong.ma).toBe(1);
		expect(tong.dong).toContain(CA.ma);
	});

	test("ca hong: trich ngoai tap thay thi truot luat quyen", () => {
		const kq = chamCau({
			ca: CA,
			traLoi: {
				...TRA_LOI,
				cau: [
					{
						chu: "x",
						trich: [{ loai: "objective", id: ID("q4-phap-che-3"), ten: "y" }],
					},
				],
			},
			chuPhien: "",
			tenCam: [],
			maThay: THAY,
			idCua,
		});
		expect(kq.quyen).toBe(false);
	});

	test("thieu trich bat buoc hay sai loai thi truot luat trich", () => {
		const thieu = chamCau({
			ca: CA,
			traLoi: { ...TRA_LOI, cau: [{ ...TRA_LOI.cau[0], trich: [] }] },
			chuPhien: "",
			tenCam: [],
			maThay: THAY,
			idCua,
		});
		expect(thieu.trichSo).toBe(false);
		const khong = chamCau({
			ca: CA,
			traLoi: null,
			chuPhien: "",
			tenCam: [],
			maThay: THAY,
			idCua,
		});
		expect(khong.trichSo).toBe(false);
	});

	test("phieu duoi nguong dung y thi thoat 1 va in ty le", () => {
		const n = 20;
		const sai = Math.ceil(n * (1 - NGUONG.dungY)) + 1;
		const ds = Array.from({ length: n }, (_, i) => ({
			ma: `c${i}`,
			quyen: true,
			trichSo: true,
			dungY: i >= sai,
			lyDo: [],
		}));
		const tong = tongHop(ds);
		const tyLe = (((n - sai) / n) * 100).toFixed(1);
		expect(tong.ma).toBe(1);
		expect(tong.dong.split("\n")).toContain(
			`dung y ${tyLe}% < ${NGUONG.dungY * 100}%`,
		);
		const dat = tongHop(ds.map((d) => ({ ...d, dungY: true })));
		expect(dat.ma).toBe(0);
		expect(dat.dong.split("\n")).toEqual([
			`quyen 100.0% · trich va so 100.0% · dung y 100.0% tren ${n} cau`,
		]);
	});

	test("doc phieu hoi dong", () => {
		expect(docPhieu('{"dungY": true, "lyDo": "ok"}')).toEqual({
			dungY: true,
			lyDo: "ok",
		});
		expect(
			docPhieu('chu truoc {"dungY": false, "lyDo": "lac de"} sau'),
		).toEqual({
			dungY: false,
			lyDo: "lac de",
		});
		expect(docPhieu("khong co json")).toBeNull();
	});
});
