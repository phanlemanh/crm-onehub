import { describe, expect, it } from "bun:test";
import {
	DIA_CHI,
	diaChiDaKy,
	ganDiaChiTin,
	headerProxyKyDiaChi,
	kyDiaChi,
} from "../src/dia-chi";

const KHOA = "khoa-thu-dia-chi";
const DIA_CHI_THAT = "203.0.113.7";

function coHeader(cap: Record<string, string>): Headers {
	return new Headers(cap);
}

describe("dia-chi", () => {
	it("ky roi doc lai dung dia chi; sai khoa, sua dia chi hay thieu khoa thi khong tin", () => {
		const ky = kyDiaChi(DIA_CHI_THAT, KHOA);
		const dung = coHeader({ [DIA_CHI.goc]: DIA_CHI_THAT, [DIA_CHI.ky]: ky });
		expect(diaChiDaKy(dung, KHOA)).toBe(DIA_CHI_THAT);
		expect(diaChiDaKy(dung, "khoa-khac")).toBeNull();
		expect(diaChiDaKy(dung, undefined)).toBeNull();
		const suaDiaChi = coHeader({
			[DIA_CHI.goc]: "198.51.100.1",
			[DIA_CHI.ky]: ky,
		});
		expect(diaChiDaKy(suaDiaChi, KHOA)).toBeNull();
		expect(
			diaChiDaKy(coHeader({ [DIA_CHI.goc]: DIA_CHI_THAT }), KHOA),
		).toBeNull();
	});

	it("proxy ky dia chi nen tang, bo header gia va khong dung x-forwarded-for", () => {
		const ra = headerProxyKyDiaChi(
			coHeader({
				[DIA_CHI.nenTang]: DIA_CHI_THAT,
				"x-forwarded-for": "9.9.9.9",
				[DIA_CHI.goc]: "6.6.6.6",
				[DIA_CHI.ky]: "gia",
				[DIA_CHI.tin]: "6.6.6.6",
			}),
			KHOA,
		);
		expect(diaChiDaKy(ra, KHOA)).toBe(DIA_CHI_THAT);
		expect(ra.get(DIA_CHI.tin)).toBeNull();
	});

	it("proxy thieu khoa hoac thieu dia chi nen tang thi khong dat header dia chi nao", () => {
		for (const [vao, khoa] of [
			[coHeader({ [DIA_CHI.nenTang]: DIA_CHI_THAT }), undefined],
			[coHeader({ [DIA_CHI.goc]: "6.6.6.6", [DIA_CHI.ky]: "gia" }), KHOA],
		] as const) {
			const ra = headerProxyKyDiaChi(vao, khoa);
			expect([ra.get(DIA_CHI.goc), ra.get(DIA_CHI.ky)]).toEqual([null, null]);
		}
	});

	it("cua vao chi dat header tin khi chu ky dung, va bo header tin tu gui", () => {
		const ky = kyDiaChi(DIA_CHI_THAT, KHOA);
		const dung = coHeader({ [DIA_CHI.goc]: DIA_CHI_THAT, [DIA_CHI.ky]: ky });
		ganDiaChiTin(dung, KHOA);
		expect(dung.get(DIA_CHI.tin)).toBe(DIA_CHI_THAT);
		expect([dung.get(DIA_CHI.goc), dung.get(DIA_CHI.ky)]).toEqual([null, null]);
		const tuGui = coHeader({ [DIA_CHI.tin]: "6.6.6.6" });
		ganDiaChiTin(tuGui, KHOA);
		expect(tuGui.get(DIA_CHI.tin)).toBeNull();
	});
});
