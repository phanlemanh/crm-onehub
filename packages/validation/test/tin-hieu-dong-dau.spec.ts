import { describe, expect, test } from "bun:test";
import {
	bocPhanHoiKeoVe,
	docPhanHoiKeoVeDayDu,
	keoVeOutput,
	tepTuBanGhi,
} from "../src/tin-hieu";

const MOT = {
	id: "crm-1",
	tep: tepTuBanGhi({
		tieuDe: "gap",
		muonLam: "muon",
		daXayRa: "gap",
		man: "/okr",
		guiLuc: new Date("2026-10-13T01:00:00.000Z"),
	}),
	phongBan: null,
};

describe("tvk-dau-ra", () => {
	test("khuon cu khong truong moi van doc duoc", () => {
		const kq = keoVeOutput.parse(bocPhanHoiKeoVe([MOT]));
		expect(kq.dongDauLuc).toBeUndefined();
		expect(kq.tep[0]?.keoVeLuc).toBeUndefined();
	});

	test("luc dong dau di vong qua ham boc va ham doc", () => {
		const luc = "2026-10-14T21:00:00.000Z";
		const kq = docPhanHoiKeoVeDayDu(
			JSON.parse(
				JSON.stringify(bocPhanHoiKeoVe([{ ...MOT, keoVeLuc: luc }], luc)),
			),
		);
		expect(kq.dongDauLuc).toBe(luc);
		expect(kq.tep[0]?.keoVeLuc).toBe(luc);
		expect(
			docPhanHoiKeoVeDayDu(bocPhanHoiKeoVe([MOT], null)).dongDauLuc,
		).toBeNull();
	});

	test("luc dong dau sai khuon thi nem thong diep ghim", () => {
		expect(() =>
			docPhanHoiKeoVeDayDu({ tep: [], dongDauLuc: "hom qua" }),
		).toThrow("lệnh kéo về lệch vỏ phản hồi REST");
	});
});
