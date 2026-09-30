import { describe, expect, test } from "bun:test";
import {
	LOAI_CHU_KY,
	PHA_CHU_KY,
	suaChuKyInput,
	type TinhTrangChuKy,
	type ViecChuKy,
	viecChuKy,
} from "../src/okr-chu-ky";

const KHONG: ViecChuKy = {
	suaMoiO: false,
	suaTen: false,
	go: false,
	an: false,
	hienLai: false,
};

function mong(t: TinhTrangChuKy): ViecChuKy {
	if (t.daAn) return { ...KHONG, hienLai: true };
	const conQuy = t.kind === "nam" && t.quyConHien > 0;
	return {
		suaMoiO: t.trong && t.phase === "lap-ke-hoach",
		suaTen: t.phase !== "da-dong",
		go: t.trong,
		an: !t.trong && !conQuy,
		hienLai: false,
	};
}

const LOAI_CA = [
	{ kind: "nam", quyConHien: 0 },
	{ kind: "nam", quyConHien: 1 },
	{ kind: "quy", quyConHien: 0 },
] as const;

const CA: TinhTrangChuKy[] = [];
for (const phase of PHA_CHU_KY)
	for (const trong of [true, false])
		for (const daAn of [true, false])
			for (const l of LOAI_CA)
				CA.push({
					phase,
					trong,
					daAn,
					kind: l.kind,
					quyConHien: trong && l.kind === "nam" ? 0 : l.quyConHien,
				});

describe("viec-chu-ky", () => {
	test("du 48 ca", () => expect(CA.length).toBe(48));
	for (const t of CA)
		test(`${t.phase} trong=${t.trong} an=${t.daAn} ${t.kind}/${t.quyConHien}`, () => {
			expect(viecChuKy(t)).toEqual(mong(t));
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
