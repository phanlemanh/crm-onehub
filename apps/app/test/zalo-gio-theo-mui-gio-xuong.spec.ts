import { describe, expect, test } from "bun:test";
import { NHAC } from "@crm/db/onboarding-nhac";
import { ngayGio } from "@/lib/nhac-qua-zalo-man";

const CA_PRODUCTION = "2026-09-24T22:27:04Z";
const TRUOC_NUA_DEM = "2026-09-24T16:59:00Z";
const QUA_NUA_DEM = "2026-09-24T17:00:00Z";

describe("ca-production", () => {
	test("ca-production: tien trinh UTC, 22:27Z in theo gio xuong o vi va en", () => {
		const khongMuiGio = new Intl.DateTimeFormat("vi", {
			day: "2-digit",
			month: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		}).format(new Date(CA_PRODUCTION));
		expect(khongMuiGio, "tien trinh dang chay UTC").toBe("22:27 24-09");
		expect(
			{
				vi: ngayGio("vi", CA_PRODUCTION, NHAC.muiGio),
				en: ngayGio("en", CA_PRODUCTION, NHAC.muiGio),
			},
			"gio theo mui gio xuong",
		).toEqual({ vi: "05:27 25-09", en: "09/25, 05:27 AM" });
	});
});

describe("bien-nua-dem", () => {
	test("bien-nua-dem: 2 thoi diem x 2 ngon ngu, ngay theo gio VN", () => {
		expect(
			{
				"vi/16:59Z": ngayGio("vi", TRUOC_NUA_DEM, NHAC.muiGio),
				"vi/17:00Z": ngayGio("vi", QUA_NUA_DEM, NHAC.muiGio),
				"en/16:59Z": ngayGio("en", TRUOC_NUA_DEM, NHAC.muiGio),
				"en/17:00Z": ngayGio("en", QUA_NUA_DEM, NHAC.muiGio),
			},
			"bien nua dem theo gio VN",
		).toEqual({
			"vi/16:59Z": "23:59 24-09",
			"vi/17:00Z": "00:00 25-09",
			"en/16:59Z": "09/24, 11:59 PM",
			"en/17:00Z": "09/25, 12:00 AM",
		});
	});
});
