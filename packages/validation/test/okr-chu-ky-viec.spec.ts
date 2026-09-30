import { describe, expect, test } from "bun:test";
import {
	LOAI_CHU_KY,
	suaChuKyInput,
	type TinhTrangChuKy,
	type ViecChuKy,
	viecChuKy,
} from "../src/okr-chu-ky";

type CaBang = { state: TinhTrangChuKy; mong: ViecChuKy };

const BANG: CaBang[] = [
	{
		state: {
			phase: "lap-ke-hoach",
			kind: "nam",
			trong: true,
			daAn: true,
			quyConHien: 0,
		},
		mong: {
			suaMoiO: false,
			suaTen: false,
			go: false,
			an: false,
			hienLai: true,
		},
	},
	{
		state: {
			phase: "lap-ke-hoach",
			kind: "quy",
			trong: true,
			daAn: true,
			quyConHien: 0,
		},
		mong: {
			suaMoiO: false,
			suaTen: false,
			go: false,
			an: false,
			hienLai: true,
		},
	},
	{
		state: {
			phase: "lap-ke-hoach",
			kind: "nam",
			trong: false,
			daAn: true,
			quyConHien: 0,
		},
		mong: {
			suaMoiO: false,
			suaTen: false,
			go: false,
			an: false,
			hienLai: true,
		},
	},
	{
		state: {
			phase: "lap-ke-hoach",
			kind: "nam",
			trong: false,
			daAn: true,
			quyConHien: 1,
		},
		mong: {
			suaMoiO: false,
			suaTen: false,
			go: false,
			an: false,
			hienLai: true,
		},
	},
	{
		state: {
			phase: "lap-ke-hoach",
			kind: "quy",
			trong: false,
			daAn: true,
			quyConHien: 0,
		},
		mong: {
			suaMoiO: false,
			suaTen: false,
			go: false,
			an: false,
			hienLai: true,
		},
	},
	{
		state: {
			phase: "lap-ke-hoach",
			kind: "nam",
			trong: true,
			daAn: false,
			quyConHien: 0,
		},
		mong: { suaMoiO: true, suaTen: true, go: true, an: false, hienLai: false },
	},
	{
		state: {
			phase: "lap-ke-hoach",
			kind: "quy",
			trong: true,
			daAn: false,
			quyConHien: 0,
		},
		mong: { suaMoiO: true, suaTen: true, go: true, an: false, hienLai: false },
	},
	{
		state: {
			phase: "lap-ke-hoach",
			kind: "nam",
			trong: false,
			daAn: false,
			quyConHien: 0,
		},
		mong: { suaMoiO: false, suaTen: true, go: false, an: true, hienLai: false },
	},
	{
		state: {
			phase: "lap-ke-hoach",
			kind: "nam",
			trong: false,
			daAn: false,
			quyConHien: 1,
		},
		mong: {
			suaMoiO: false,
			suaTen: true,
			go: false,
			an: false,
			hienLai: false,
		},
	},
	{
		state: {
			phase: "lap-ke-hoach",
			kind: "quy",
			trong: false,
			daAn: false,
			quyConHien: 0,
		},
		mong: { suaMoiO: false, suaTen: true, go: false, an: true, hienLai: false },
	},
	{
		state: {
			phase: "dang-chay",
			kind: "nam",
			trong: true,
			daAn: true,
			quyConHien: 0,
		},
		mong: {
			suaMoiO: false,
			suaTen: false,
			go: false,
			an: false,
			hienLai: true,
		},
	},
	{
		state: {
			phase: "dang-chay",
			kind: "quy",
			trong: true,
			daAn: true,
			quyConHien: 0,
		},
		mong: {
			suaMoiO: false,
			suaTen: false,
			go: false,
			an: false,
			hienLai: true,
		},
	},
	{
		state: {
			phase: "dang-chay",
			kind: "nam",
			trong: false,
			daAn: true,
			quyConHien: 0,
		},
		mong: {
			suaMoiO: false,
			suaTen: false,
			go: false,
			an: false,
			hienLai: true,
		},
	},
	{
		state: {
			phase: "dang-chay",
			kind: "nam",
			trong: false,
			daAn: true,
			quyConHien: 1,
		},
		mong: {
			suaMoiO: false,
			suaTen: false,
			go: false,
			an: false,
			hienLai: true,
		},
	},
	{
		state: {
			phase: "dang-chay",
			kind: "quy",
			trong: false,
			daAn: true,
			quyConHien: 0,
		},
		mong: {
			suaMoiO: false,
			suaTen: false,
			go: false,
			an: false,
			hienLai: true,
		},
	},
	{
		state: {
			phase: "dang-chay",
			kind: "nam",
			trong: true,
			daAn: false,
			quyConHien: 0,
		},
		mong: { suaMoiO: false, suaTen: true, go: true, an: false, hienLai: false },
	},
	{
		state: {
			phase: "dang-chay",
			kind: "quy",
			trong: true,
			daAn: false,
			quyConHien: 0,
		},
		mong: { suaMoiO: false, suaTen: true, go: true, an: false, hienLai: false },
	},
	{
		state: {
			phase: "dang-chay",
			kind: "nam",
			trong: false,
			daAn: false,
			quyConHien: 0,
		},
		mong: { suaMoiO: false, suaTen: true, go: false, an: true, hienLai: false },
	},
	{
		state: {
			phase: "dang-chay",
			kind: "nam",
			trong: false,
			daAn: false,
			quyConHien: 1,
		},
		mong: {
			suaMoiO: false,
			suaTen: true,
			go: false,
			an: false,
			hienLai: false,
		},
	},
	{
		state: {
			phase: "dang-chay",
			kind: "quy",
			trong: false,
			daAn: false,
			quyConHien: 0,
		},
		mong: { suaMoiO: false, suaTen: true, go: false, an: true, hienLai: false },
	},
	{
		state: {
			phase: "cham-diem",
			kind: "nam",
			trong: true,
			daAn: true,
			quyConHien: 0,
		},
		mong: {
			suaMoiO: false,
			suaTen: false,
			go: false,
			an: false,
			hienLai: true,
		},
	},
	{
		state: {
			phase: "cham-diem",
			kind: "quy",
			trong: true,
			daAn: true,
			quyConHien: 0,
		},
		mong: {
			suaMoiO: false,
			suaTen: false,
			go: false,
			an: false,
			hienLai: true,
		},
	},
	{
		state: {
			phase: "cham-diem",
			kind: "nam",
			trong: false,
			daAn: true,
			quyConHien: 0,
		},
		mong: {
			suaMoiO: false,
			suaTen: false,
			go: false,
			an: false,
			hienLai: true,
		},
	},
	{
		state: {
			phase: "cham-diem",
			kind: "nam",
			trong: false,
			daAn: true,
			quyConHien: 1,
		},
		mong: {
			suaMoiO: false,
			suaTen: false,
			go: false,
			an: false,
			hienLai: true,
		},
	},
	{
		state: {
			phase: "cham-diem",
			kind: "quy",
			trong: false,
			daAn: true,
			quyConHien: 0,
		},
		mong: {
			suaMoiO: false,
			suaTen: false,
			go: false,
			an: false,
			hienLai: true,
		},
	},
	{
		state: {
			phase: "cham-diem",
			kind: "nam",
			trong: true,
			daAn: false,
			quyConHien: 0,
		},
		mong: { suaMoiO: false, suaTen: true, go: true, an: false, hienLai: false },
	},
	{
		state: {
			phase: "cham-diem",
			kind: "quy",
			trong: true,
			daAn: false,
			quyConHien: 0,
		},
		mong: { suaMoiO: false, suaTen: true, go: true, an: false, hienLai: false },
	},
	{
		state: {
			phase: "cham-diem",
			kind: "nam",
			trong: false,
			daAn: false,
			quyConHien: 0,
		},
		mong: { suaMoiO: false, suaTen: true, go: false, an: true, hienLai: false },
	},
	{
		state: {
			phase: "cham-diem",
			kind: "nam",
			trong: false,
			daAn: false,
			quyConHien: 1,
		},
		mong: {
			suaMoiO: false,
			suaTen: true,
			go: false,
			an: false,
			hienLai: false,
		},
	},
	{
		state: {
			phase: "cham-diem",
			kind: "quy",
			trong: false,
			daAn: false,
			quyConHien: 0,
		},
		mong: { suaMoiO: false, suaTen: true, go: false, an: true, hienLai: false },
	},
	{
		state: {
			phase: "da-dong",
			kind: "nam",
			trong: true,
			daAn: true,
			quyConHien: 0,
		},
		mong: {
			suaMoiO: false,
			suaTen: false,
			go: false,
			an: false,
			hienLai: true,
		},
	},
	{
		state: {
			phase: "da-dong",
			kind: "quy",
			trong: true,
			daAn: true,
			quyConHien: 0,
		},
		mong: {
			suaMoiO: false,
			suaTen: false,
			go: false,
			an: false,
			hienLai: true,
		},
	},
	{
		state: {
			phase: "da-dong",
			kind: "nam",
			trong: false,
			daAn: true,
			quyConHien: 0,
		},
		mong: {
			suaMoiO: false,
			suaTen: false,
			go: false,
			an: false,
			hienLai: true,
		},
	},
	{
		state: {
			phase: "da-dong",
			kind: "nam",
			trong: false,
			daAn: true,
			quyConHien: 1,
		},
		mong: {
			suaMoiO: false,
			suaTen: false,
			go: false,
			an: false,
			hienLai: true,
		},
	},
	{
		state: {
			phase: "da-dong",
			kind: "quy",
			trong: false,
			daAn: true,
			quyConHien: 0,
		},
		mong: {
			suaMoiO: false,
			suaTen: false,
			go: false,
			an: false,
			hienLai: true,
		},
	},
	{
		state: {
			phase: "da-dong",
			kind: "nam",
			trong: true,
			daAn: false,
			quyConHien: 0,
		},
		mong: {
			suaMoiO: false,
			suaTen: false,
			go: true,
			an: false,
			hienLai: false,
		},
	},
	{
		state: {
			phase: "da-dong",
			kind: "quy",
			trong: true,
			daAn: false,
			quyConHien: 0,
		},
		mong: {
			suaMoiO: false,
			suaTen: false,
			go: true,
			an: false,
			hienLai: false,
		},
	},
	{
		state: {
			phase: "da-dong",
			kind: "nam",
			trong: false,
			daAn: false,
			quyConHien: 0,
		},
		mong: {
			suaMoiO: false,
			suaTen: false,
			go: false,
			an: true,
			hienLai: false,
		},
	},
	{
		state: {
			phase: "da-dong",
			kind: "nam",
			trong: false,
			daAn: false,
			quyConHien: 1,
		},
		mong: {
			suaMoiO: false,
			suaTen: false,
			go: false,
			an: false,
			hienLai: false,
		},
	},
	{
		state: {
			phase: "da-dong",
			kind: "quy",
			trong: false,
			daAn: false,
			quyConHien: 0,
		},
		mong: {
			suaMoiO: false,
			suaTen: false,
			go: false,
			an: true,
			hienLai: false,
		},
	},
];

const tenCa = (t: TinhTrangChuKy) =>
	`${t.phase} ${t.kind} trong=${t.trong} daAn=${t.daAn} quyConHien=${t.quyConHien}`;

describe("viec-chu-ky", () => {
	test("du 40 ca", () => expect(BANG.length).toBe(40));
	test("khong hai ca cung tinh trang", () =>
		expect(new Set(BANG.map((c) => tenCa(c.state))).size).toBe(BANG.length));
	for (const c of BANG)
		test(tenCa(c.state), () => {
			expect(viecChuKy(c.state)).toEqual(c.mong);
		});
	test("ca ghim", () => {
		expect(
			viecChuKy({
				phase: "lap-ke-hoach",
				kind: "quy",
				trong: true,
				daAn: false,
				quyConHien: 0,
			}),
		).toEqual({
			suaMoiO: true,
			suaTen: true,
			go: true,
			an: false,
			hienLai: false,
		});
		expect(
			viecChuKy({
				phase: "dang-chay",
				kind: "quy",
				trong: false,
				daAn: false,
				quyConHien: 0,
			}),
		).toEqual({
			suaMoiO: false,
			suaTen: true,
			go: false,
			an: true,
			hienLai: false,
		});
		expect(
			viecChuKy({
				phase: "da-dong",
				kind: "quy",
				trong: false,
				daAn: false,
				quyConHien: 0,
			}),
		).toEqual({
			suaMoiO: false,
			suaTen: false,
			go: false,
			an: true,
			hienLai: false,
		});
		expect(
			viecChuKy({
				phase: "dang-chay",
				kind: "nam",
				trong: false,
				daAn: false,
				quyConHien: 1,
			}).an,
		).toBe(false);
	});
	test("ten-khoang-trang", () => {
		expect(
			suaChuKyInput.safeParse({
				id: "c",
				name: "   ",
				startsOn: "2027-01-01",
				endsOn: "2027-12-31",
				breakStartsOn: null,
				breakEndsOn: null,
				updateWeekday: 1,
			}).success,
		).toBe(false);
	});
	test("so loai", () => expect(LOAI_CHU_KY).toEqual(["nam", "quy"]));
});
