import { describe, expect, test } from "bun:test";
import { isDeepStrictEqual } from "node:util";
import {
	CHAM_BO,
	chamBo,
	type KrCham,
	type LoiBo,
	MA_LUAT_BO,
	type MaLuatBo,
	type MucTieuCham,
} from "../src/okr-cham-bo";
import { kiemOkr, MA_LUAT_OKR } from "../src/okr-kiem";
import type { KieuKr } from "../src/okr-kr";

const kr = (
	title: string,
	kind: KieuKr,
	startValue: number | null,
	targetValue: number | null,
	ownerUserId: string | null = "u1",
): KrCham => ({ title, kind, startValue, targetValue, ownerUserId });

const tangToi = (i: number) =>
	kr(`Doanh số kênh ${i + 1} đạt ${(i + 2) * 10}`, "tang-toi", 5, (i + 2) * 10);

const DOANH_THU = kr("Doanh thu đạt 5 tỷ", "tang-toi", 1, 5);
const KHACH_MOI = kr("Khách mới đạt 40", "tang-toi", 10, 40);
const GIU_CHAN = kr("Tỷ lệ giữ chân trên 90%", "giu-tren", 85, 90);

const mt = (keyResults: KrCham[]): MucTieuCham => ({
	title: "Tăng trưởng bền vững ở miền Nam",
	whyNow: "Thị phần đang chững lại",
	keyResults,
});

const SACH = mt([DOANH_THU, KHACH_MOI, GIU_CHAN]);

type Ca = {
	bo: string;
	ma: MaLuatBo | "khong-loi";
	duLieu: MucTieuCham[];
	dat: number;
	xet: number;
	loi: LoiBo[];
};

const MA_TRAN: Ca[] = [
	{ bo: "sach", ma: "khong-loi", duLieu: [SACH], dat: 12, xet: 12, loi: [] },
	{
		bo: "kr-la-viec",
		ma: "kr-la-viec",
		duLieu: [
			mt([{ ...DOANH_THU, title: "Gọi 300 cuộc" }, KHACH_MOI, GIU_CHAN]),
		],
		dat: 11,
		xet: 12,
		loi: [{ ma: "kr-la-viec", mucTieu: 0, kr: 0 }],
	},
	{
		bo: "thieu-khoi-diem",
		ma: "thieu-khoi-diem",
		duLieu: [mt([DOANH_THU, { ...KHACH_MOI, startValue: 0 }, GIU_CHAN])],
		dat: 11,
		xet: 12,
		loi: [{ ma: "thieu-khoi-diem", mucTieu: 0, kr: 1 }],
	},
	{
		bo: "dich-bang-khoi-diem",
		ma: "dich-bang-khoi-diem",
		duLieu: [
			mt([
				DOANH_THU,
				KHACH_MOI,
				{ ...GIU_CHAN, startValue: 90, targetValue: 90 },
			]),
		],
		dat: 11,
		xet: 12,
		loi: [{ ma: "dich-bang-khoi-diem", mucTieu: 0, kr: 2 }],
	},
	{
		bo: "thieu-doi-trong",
		ma: "thieu-doi-trong",
		duLieu: [mt([DOANH_THU, KHACH_MOI, tangToi(0)])],
		dat: 10,
		xet: 11,
		loi: [{ ma: "thieu-doi-trong", mucTieu: 0, kr: null }],
	},
	{
		bo: "it-hon-2-kr",
		ma: "it-hon-2-kr",
		duLieu: [mt([DOANH_THU])],
		dat: 3,
		xet: 4,
		loi: [{ ma: "it-hon-2-kr", mucTieu: 0, kr: null }],
	},
	{
		bo: "nhieu-hon-5-kr",
		ma: "nhieu-hon-5-kr",
		duLieu: [mt([0, 1, 2, 3, 4, 5].map(tangToi))],
		dat: 18,
		xet: 20,
		loi: [
			{ ma: "nhieu-hon-5-kr", mucTieu: 0, kr: null },
			{ ma: "thieu-doi-trong", mucTieu: 0, kr: null },
		],
	},
	{
		bo: "kr-thieu-nguoi",
		ma: "kr-thieu-nguoi",
		duLieu: [mt([DOANH_THU, { ...KHACH_MOI, ownerUserId: null }, GIU_CHAN])],
		dat: 11,
		xet: 12,
		loi: [{ ma: "kr-thieu-nguoi", mucTieu: 0, kr: 1 }],
	},
	{
		bo: "hai-muc-tieu",
		ma: "khong-loi",
		duLieu: [SACH, SACH],
		dat: 24,
		xet: 24,
		loi: [],
	},
];

const MA_OKR: readonly string[] = MA_LUAT_OKR;

const sapXep = (ds: LoiBo[]) =>
	[...ds].sort(
		(a, b) =>
			a.mucTieu - b.mucTieu ||
			(a.kr ?? -1) - (b.kr ?? -1) ||
			a.ma.localeCompare(b.ma),
	);

const phai = (dung: boolean, thongDiep: string) => {
	if (!dung) throw new Error(thongDiep);
};

function tuKiemOkr(bo: MucTieuCham[]): LoiBo[] {
	return bo.flatMap((m, mucTieu) =>
		kiemOkr({
			title: m.title,
			whyNow: m.whyNow,
			keyResults: m.keyResults.map((k) => ({
				title: k.title,
				kind: k.kind,
				startValue: k.startValue ?? 0,
				targetValue: k.targetValue ?? k.startValue ?? 0,
			})),
		}).map((k) => ({ ma: k.ma, mucTieu, kr: k.krIndex })),
	);
}

function kiemCa(ca: Ca, tuyChon?: { tatLuat?: readonly MaLuatBo[] }): void {
	const thongDiep = `vk10-cham: ${ca.bo} ${ca.ma} lech`;
	const ra = chamBo(ca.duLieu, tuyChon);
	phai(ra.dat === ca.dat && ra.xet === ca.xet, thongDiep);
	phai(isDeepStrictEqual(sapXep(ra.loi), sapXep(ca.loi)), thongDiep);
	const bonLuat = ra.loi.filter((l) => MA_OKR.includes(l.ma));
	phai(
		isDeepStrictEqual(sapXep(bonLuat), sapXep(tuKiemOkr(ca.duLieu))),
		thongDiep,
	);
}

const caCua = (bo: string): Ca => {
	const ca = MA_TRAN.find((c) => c.bo === bo);
	if (!ca) throw new Error(`vk10-cham: khong co bo ${bo}`);
	return ca;
};

describe("chamBo", () => {
	test("vk10-cham: ma trận chín bộ giả khớp hằng ghim của E6", () => {
		expect(MA_TRAN.length).toBe(9);
		const moiLuat = new Set(
			MA_TRAN.filter((c) => c.ma !== "khong-loi").map((c) => c.ma),
		);
		expect(moiLuat).toEqual(new Set(MA_LUAT_BO));
		for (const ca of MA_TRAN) kiemCa(ca);
	});

	test("vk10-cham: số trống tính như chưa có khởi điểm", () => {
		const ra = chamBo([
			mt([
				DOANH_THU,
				{ ...KHACH_MOI, startValue: null, targetValue: 40 },
				{ ...GIU_CHAN, startValue: 90, targetValue: null },
			]),
		]);
		expect(ra, "vk10-cham: so-trong khong-loi lech").toEqual({
			dat: 10,
			xet: 12,
			loi: [
				{ ma: "thieu-khoi-diem", mucTieu: 0, kr: 1 },
				{ ma: "dich-bang-khoi-diem", mucTieu: 0, kr: 2 },
			],
		});
	});

	test("vk10-cham: ngưỡng KR đọc từ CHAM_BO", () => {
		expect(CHAM_BO).toEqual({ krToiThieu: 2, krToiDa: 5 });
	});

	test("vk10-cham: luật bị tắt vẫn được xét nhưng không sinh lỗi", () => {
		const ra = chamBo(caCua("it-hon-2-kr").duLieu, {
			tatLuat: ["it-hon-2-kr"],
		});
		expect(ra).toEqual({ dat: 4, xet: 4, loi: [] });
	});
});

describe("chamBo chiều đỏ", () => {
	test("vk10-cham-do: thêm KR là việc thì điểm và lỗi đổi đúng", () => {
		const ca: Ca = {
			bo: "sach-them-viec",
			ma: "kr-la-viec",
			duLieu: [
				mt([
					DOANH_THU,
					KHACH_MOI,
					GIU_CHAN,
					kr("Gọi 50 cuộc", "tang-toi", 5, 50),
				]),
			],
			dat: 14,
			xet: 15,
			loi: [{ ma: "kr-la-viec", mucTieu: 0, kr: 3 }],
		};
		expect(() => kiemCa(ca)).not.toThrow();
	});

	test("vk10-cham-do: tắt luật 2–5 KR thì ca it-hon-2-kr bắt", () => {
		expect(() =>
			kiemCa(caCua("it-hon-2-kr"), { tatLuat: ["it-hon-2-kr"] }),
		).toThrow("vk10-cham: it-hon-2-kr it-hon-2-kr lech");
	});
});
