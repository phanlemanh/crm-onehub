import { describe, expect, test } from "bun:test";
import type { ViecNhac } from "@crm/db/onboarding-nhac";
import { dongLoiTenCu, soatTenCu } from "@crm/validation/ten-cu-okr";
import { duongTrongApp } from "../agent/lib/nhac-ke-hoach";
import { dungTin, type KhuonTin, TIEU_DE } from "../agent/lib/tin-nhac";

const SANG = new Date("2026-10-13T08:31:00+07:00");
const APP = "https://crm.test/onehub";
const NHAN = "Doanh thu quý 1";
const KHUON: readonly KhuonTin[] = ["slack", "tron"];

const GOP: ViecNhac = {
	loai: "okr-hoi-y-gop",
	hoiYId: "hy-1",
	cycleId: "ky-1",
	nhan: NHAN,
	hanLuc: "2026-10-14T10:00:00.000Z",
};

const CONG_BO: ViecNhac = {
	loai: "okr-hoi-y-cong-bo",
	hoiYId: "hy-1",
	cycleId: "ky-1",
	nhan: NHAN,
};

const lienKet = (v: ViecNhac) => `${APP}${duongTrongApp(v)}`;
const tin = (v: ViecNhac, khuon: KhuonTin) =>
	dungTin("An", SANG, [v], lienKet, khuon).text;

describe("cmst-nhac", () => {
	test("tieu de hai loai lay y kien", () => {
		expect([TIEU_DE["okr-hoi-y-gop"], TIEU_DE["okr-hoi-y-cong-bo"]]).toEqual([
			"Lấy ý kiến",
			"Lấy ý kiến đã công bố",
		]);
	});

	for (const khuon of KHUON) {
		test(`tin ${khuon} cua hai loai dung chu moi`, () => {
			const gop = tin(GOP, khuon);
			const congBo = tin(CONG_BO, khuon);
			const sai: string[] = [];
			if (!gop.includes(`Công ty đang lấy ý kiến cho mục tiêu ${NHAN}`))
				sai.push(`cmst: nhac okr-hoi-y-gop ${khuon} ${gop}`);
			if (!gop.includes("/okr/hoi-y") || !congBo.includes("/okr/hoi-y"))
				sai.push(`cmst: nhac duong ${khuon}`);
			if (khuon === "slack" && !gop.includes("|mở Lấy ý kiến>"))
				sai.push(`cmst: nhac okr-hoi-y-gop slack ${gop}`);
			if (khuon === "slack" && !congBo.includes("|mở Lấy ý kiến>"))
				sai.push(`cmst: nhac okr-hoi-y-cong-bo slack ${congBo}`);
			const loi = soatTenCu([
				{ nguon: "tin-nhac", khoa: `okr-hoi-y-gop.${khuon}`, chu: gop },
				{ nguon: "tin-nhac", khoa: `okr-hoi-y-cong-bo.${khuon}`, chu: congBo },
			]).map(dongLoiTenCu);
			expect([...sai, ...loi]).toEqual([]);
		});
	}

	test("doi chung: tieu de mang chu cu bi luat bat", () => {
		const gia = tin(GOP, "tron").replace(
			TIEU_DE["okr-hoi-y-gop"],
			"Hỏi ý mục tiêu",
		);
		expect(
			soatTenCu([{ nguon: "tin-nhac", khoa: "okr-hoi-y-gop", chu: gia }]).map(
				dongLoiTenCu,
			),
		).toEqual(["tin-nhac#okr-hoi-y-gop: hỏi ý"]);
	});
});
