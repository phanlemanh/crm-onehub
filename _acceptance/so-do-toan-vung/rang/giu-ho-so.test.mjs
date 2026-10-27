import { describe, expect, test } from "bun:test";
import { ketQuaManTuTep } from "./giu-ho-so.mjs";

const SHA = "a".repeat(40);
const KHAC = "b".repeat(40);
const tep = (sha, ketQua) => JSON.stringify({ sha, ketQua });

describe("ketQuaManTuTep", () => {
	test("cung sha va du khoa: lay dung ket qua tung eval", () => {
		const r = ketQuaManTuTep(
			tep(SHA, [
				{ khoa: "vo-khu-muc-tieu#E4", loai: "GIU" },
				{ khoa: "toan-canh-okr#E3", loai: "DO-SAN-NEN", chu: "HEAD 1 · nen 1" },
			]),
			SHA,
			["vo-khu-muc-tieu#E4", "toan-canh-okr#E3"],
		);
		expect(r.loi).toEqual([]);
		expect(r.kq.map((k) => `${k.khoa}:${k.loai}`)).toEqual([
			"vo-khu-muc-tieu#E4:GIU",
			"toan-canh-okr#E3:DO-SAN-NEN",
		]);
	});

	test("lech sha: khong dung lai, bao ten hai sha", () => {
		const r = ketQuaManTuTep(
			tep(KHAC, [{ khoa: "vo-khu-muc-tieu#E4", loai: "GIU" }]),
			SHA,
			["vo-khu-muc-tieu#E4"],
		);
		expect(r.kq).toEqual([]);
		expect(r.loi).toEqual(["KET QUA MAN LECH SHA bbbbbbbbb != HEAD aaaaaaaaa"]);
	});

	test("thieu mot eval man: bao dung eval thieu", () => {
		const r = ketQuaManTuTep(
			tep(SHA, [{ khoa: "vo-khu-muc-tieu#E4", loai: "GIU" }]),
			SHA,
			["vo-khu-muc-tieu#E4", "toan-canh-okr#E3"],
		);
		expect(r.loi).toEqual(["THIEU KET QUA MAN toan-canh-okr/E3"]);
		expect(r.kq).toHaveLength(1);
	});

	test("tep hong hay sai khuon: bao hong, khong lay gi", () => {
		expect(ketQuaManTuTep("{", SHA, ["x#E1"]).loi).toEqual([
			"KET QUA MAN HONG: khong phai JSON",
		]);
		const r = ketQuaManTuTep(tep(SHA, [{ khoa: "x#E1", loai: "XANH" }]), SHA, [
			"x#E1",
		]);
		expect(r.kq).toEqual([]);
		expect(r.loi[0]).toStartWith("KET QUA MAN HONG:");
	});
});
