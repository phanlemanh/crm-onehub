import { describe, expect, test } from "bun:test";
import type { MucTuTin } from "@crm/validation/okr-cap-nhat";
import { dienBienKr } from "../src/okr/dien-bien";
import {
	cacTuan,
	type KrSo,
	soTuanCuaNhom,
	xepHopTuan,
} from "../src/okr/hop-tuan";
import { kyVongTheoNgay } from "../src/okr/tien-do";
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

const krTrong = (id: string): KrSo => ({
	id,
	thuTu: 0,
	khoaLuc: null,
	lan: [],
});

const mt = (
	level: MucTieuTinh["level"],
	unitId: string | null,
	progress: number,
	expected: number | null,
	soKr: number,
): MucTieuTinh => ({
	level,
	unitId,
	progress,
	expected,
	kr: Array.from({ length: soKr }, (_, i) => krTrong(`${unitId}-${i}`)),
});

const KHONG_TUAN = { tuanKy: [], homNay: new Date("2026-11-18T03:00:00Z") };

const TUAN_RONG = {
	tuTin: { cao: 0, vua: 0, thap: 0 },
	daCapNhat: 0,
	dangBan: null,
	theoTuan: [],
};

const TONG_RONG = {
	daCapNhat: 0,
	daCapNhatTruoc: 0,
	tuTinThap: 0,
	tuTinThapTruoc: 0,
};

const vn = (s: string) => new Date(`${s}+07:00`);

const lan = (
	tuan: string,
	luc: string,
	tuTin: MucTuTin,
	ghiChu = "",
	giaTri = 0,
) => ({ tuan, luc: vn(luc), tuTin, ghiChu, giaTri });

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
			KHONG_TUAN,
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
				...TUAN_RONG,
			},
			{
				key: "bp:b",
				ten: "B",
				cap: "bo-phan",
				tienDo: 46,
				kyVong: 40,
				soMucTieu: 3,
				soKr: 4,
				...TUAN_RONG,
			},
			{
				key: "pb:p1",
				ten: "P1",
				cap: "phong-ban",
				tienDo: 44,
				kyVong: 40,
				soMucTieu: 2,
				soKr: 3,
				...TUAN_RONG,
			},
			{
				key: "pb:p2",
				ten: "P2",
				cap: "phong-ban",
				tienDo: null,
				kyVong: null,
				soMucTieu: 0,
				soKr: 0,
				...TUAN_RONG,
			},
			{
				key: "bp:c",
				ten: "C",
				cap: "bo-phan",
				tienDo: 50,
				kyVong: 20,
				soMucTieu: 1,
				soKr: 1,
				...TUAN_RONG,
			},
			{
				key: "pb:p3",
				ten: "P3",
				cap: "phong-ban",
				tienDo: 50,
				kyVong: 20,
				soMucTieu: 1,
				soKr: 1,
				...TUAN_RONG,
			},
			{
				key: "pb:p4",
				ten: "P4",
				cap: "phong-ban",
				tienDo: null,
				kyVong: null,
				soMucTieu: 0,
				soKr: 0,
				...TUAN_RONG,
			},
		]);
		expect(ra.tongQuan).toEqual({
			tienDo: 43,
			kyVong: 35,
			donViCongBo: 3,
			tongDonVi: 6,
			donViChuaDat: ["P2", "C", "P4"],
			tongKr: 7,
			...TONG_RONG,
		});
	});

	test("toan-canh: ky chua co muc tieu cong bo nao — moi hang rong, khong nem", () => {
		const ra = gopToanCanh(CAY, [], "OneHub", KHONG_TUAN);
		expect(ra.hang.every((h) => h.tienDo === null && h.soMucTieu === 0)).toBe(
			true,
		);
		expect(ra.tongQuan).toEqual({
			tienDo: null,
			kyVong: null,
			donViCongBo: 0,
			tongDonVi: 6,
			donViChuaDat: ["B", "P1", "P2", "C", "P3", "P4"],
			tongKr: 0,
			...TONG_RONG,
		});
	});
});

const HOM_NAY = vn("2026-11-18T10:00:00");

describe("hop-tuan", () => {
	test("hop-tuan: tut hai bac truoc tut mot bac, roi im lau, roi ghi chu moi; KR khong gi moi vao con lai", () => {
		const kr = (id: string, thuTu: number, l: KrSo["lan"]): KrSo => ({
			id,
			thuTu,
			khoaLuc: vn("2026-10-05T09:00:00"),
			lan: l,
		});
		const ra = xepHopTuan(
			[
				kr("Ka", 0, [
					lan("2026-11-09", "2026-11-10T09:00:00", "vua"),
					lan("2026-11-16", "2026-11-17T09:00:00", "thap"),
				]),
				kr("Kb", 1, [
					lan("2026-11-09", "2026-11-10T09:00:00", "cao"),
					lan("2026-11-16", "2026-11-16T15:00:00", "thap"),
				]),
				kr("Kc", 2, [
					lan("2026-11-09", "2026-11-10T09:00:00", "cao"),
					lan("2026-11-16", "2026-11-17T11:00:00", "vua", "Đối tác lùi lịch"),
				]),
				kr("Kd", 3, [lan("2026-11-02", "2026-11-03T09:00:00", "cao")]),
				kr("Ke", 4, [
					lan("2026-11-09", "2026-11-15T09:00:00", "vua", "Chờ duyệt"),
				]),
				kr("Kf", 5, [lan("2026-11-16", "2026-11-17T09:00:00", "cao")]),
			],
			HOM_NAY,
		);
		expect(ra).toEqual({
			dangBan: [
				{ id: "Kb", lyDo: [{ loai: "tut", tu: "cao", den: "thap", bac: 2 }] },
				{ id: "Ka", lyDo: [{ loai: "tut", tu: "vua", den: "thap", bac: 1 }] },
				{
					id: "Kc",
					lyDo: [
						{ loai: "tut", tu: "cao", den: "vua", bac: 1 },
						{ loai: "ghi-chu", ngay: "2026-11-17" },
					],
				},
				{ id: "Kd", lyDo: [{ loai: "im", soNgay: 15 }] },
				{ id: "Ke", lyDo: [{ loai: "ghi-chu", ngay: "2026-11-15" }] },
			],
			conLai: [{ id: "Kf", lyDo: [] }],
		});
	});

	test("hop-tuan: KR chua cap nhat lan nao ma khoa khoi diem 14 ngay la im, 13 ngay thi chua", () => {
		const ra = xepHopTuan(
			[
				{ id: "K14", thuTu: 0, khoaLuc: vn("2026-11-04T09:00:00"), lan: [] },
				{ id: "K13", thuTu: 1, khoaLuc: vn("2026-11-05T09:00:00"), lan: [] },
				{ id: "Kx", thuTu: 2, khoaLuc: null, lan: [] },
			],
			HOM_NAY,
		);
		expect(ra.dangBan).toEqual([
			{ id: "K14", lyDo: [{ loai: "im", soNgay: 14 }] },
		]);
		expect(ra.conLai.map((d) => d.id)).toEqual(["K13", "Kx"]);
	});
});

describe("heatmap", () => {
	test("heatmap: moi tuan la ty le KR muc cao tren KR co cap nhat tuan do, null khi khong ai hoac tuan chua toi", () => {
		const tuanKy = cacTuan(
			vn("2026-10-05T00:00:00"),
			vn("2026-12-13T00:00:00"),
		);
		expect(tuanKy).toEqual([
			"2026-10-05",
			"2026-10-12",
			"2026-10-19",
			"2026-10-26",
			"2026-11-02",
			"2026-11-09",
			"2026-11-16",
			"2026-11-23",
			"2026-11-30",
			"2026-12-07",
		]);
		const k = (id: string, thuTu: number, l: KrSo["lan"]): KrSo => ({
			id,
			thuTu,
			khoaLuc: vn("2026-10-05T09:00:00"),
			lan: l,
		});
		const ra = soTuanCuaNhom(
			[
				k("K1", 0, [
					lan("2026-10-26", "2026-10-27T09:00:00", "cao"),
					lan("2026-11-02", "2026-11-03T09:00:00", "vua"),
					lan("2026-11-16", "2026-11-17T09:00:00", "cao"),
				]),
				k("K2", 1, [
					lan("2026-10-26", "2026-10-27T09:00:00", "vua"),
					lan("2026-11-02", "2026-11-03T09:00:00", "cao"),
					lan("2026-11-09", "2026-11-10T09:00:00", "cao"),
					lan("2026-11-09", "2026-11-11T09:00:00", "thap"),
				]),
				k("K3", 2, [lan("2026-11-02", "2026-11-03T09:00:00", "cao")]),
			],
			tuanKy,
			HOM_NAY,
		);
		expect(ra).toEqual({
			tuTin: { cao: 2, vua: 0, thap: 1 },
			daCapNhat: 1,
			dangBan: { loai: "im", soKr: 1 },
			theoTuan: [null, null, null, 50, 67, 0, 100, null, null, null],
		});
	});
});

describe("dien-bien", () => {
	const tuanKy = cacTuan(vn("2026-10-05T00:00:00"), vn("2026-12-13T00:00:00"));
	const congBo = vn("2026-10-05T08:00:00");
	const ketThuc = new Date("2026-12-13T00:00:00Z");
	const kyVong = (tuan: string) =>
		kyVongTheoNgay(congBo, ketThuc, vn(`${tuan}T00:00:00`), null);
	const cacLan = [
		lan("2026-10-05", "2026-10-06T09:00:00", "vua", "", 62),
		lan("2026-10-12", "2026-10-13T09:00:00", "cao", "", 65),
		lan("2026-10-19", "2026-10-20T09:00:00", "thap", "", 66),
		lan("2026-10-19", "2026-10-22T09:00:00", "vua", "", 68),
		lan("2026-10-26", "2026-10-27T09:00:00", "cao", "Ký thêm hai đối tác", 70),
	];
	const homNay = vn("2026-10-28T10:00:00");

	test("dien-bien: moi tuan mot diem — lan cuoi trong tuan, le ra noi suy, tuan chua toi rong", () => {
		const ra = dienBienKr(
			{
				id: "k",
				thuTu: 0,
				khoaLuc: congBo,
				lan: cacLan,
				kieu: "tang-toi",
				khoi: 60,
				dich: 85,
			},
			tuanKy,
			homNay,
			kyVong,
		);
		expect(
			ra.map((d) => [d.tuan, d.giaTri, d.kyVong, d.tuTin, d.ghiChu]),
		).toEqual([
			["2026-10-05", 62, 60, "vua", null],
			["2026-10-12", 65, 62.5, "cao", null],
			["2026-10-19", 68, 65, "vua", null],
			["2026-10-26", 70, 67.5, "cao", "Ký thêm hai đối tác"],
			["2026-11-02", null, 70.25, null, null],
			["2026-11-09", null, 72.75, null, null],
			["2026-11-16", null, 75.25, null, null],
			["2026-11-23", null, 77.75, null, null],
			["2026-11-30", null, 80.25, null, null],
			["2026-12-07", null, 82.75, null, null],
		]);
	});

	test("dien-bien: KR moc khong co gia tri so, chi co muc tu tin", () => {
		const ra = dienBienKr(
			{
				id: "m",
				thuTu: 0,
				khoaLuc: congBo,
				lan: cacLan,
				kieu: "moc",
				khoi: 0,
				dich: 1,
			},
			tuanKy,
			homNay,
			kyVong,
		);
		expect(ra.map((d) => [d.giaTri, d.kyVong, d.tuTin]).slice(0, 5)).toEqual([
			[null, null, "vua"],
			[null, null, "cao"],
			[null, null, "vua"],
			[null, null, "cao"],
			[null, null, null],
		]);
	});
});
