import { describe, expect, test } from "bun:test";
import type { ViecNhac } from "@crm/db/onboarding-nhac";
import { dungTin, type KhuonTin } from "../agent/lib/tin-nhac";

const SANG = new Date("2026-10-13T08:31:00+07:00");

const TOM_TAT: ViecNhac = {
	loai: "okr-tom-tat",
	tomTatId: "tt-1",
	departmentId: "pb-1",
	cycleId: "ky-1",
	phongTen: "Kinh doanh",
	krDangBan: ["kr-1", "kr-2"],
	soKrDangBan: 2,
};

const tran = (muc: 80 | 100): ViecNhac => ({
	loai: "ai-tran",
	thang: "2026-10",
	muc,
	chiUsd: muc === 100 ? 8 : 6.4,
	tranUsd: 8,
});

const CAP_NHAT: ViecNhac = {
	loai: "okr-cap-nhat",
	krIds: ["kr-1"],
	nhan: "Doanh thu",
	soKr: 1,
};

const KHUON: readonly KhuonTin[] = ["slack", "tron"];

describe("kmt-tin-nhac", () => {
	for (const khuon of KHUON) {
		test(`kmt-tin-nhac: khuon ${khuon} goi Kara o tieu de nhom va cau tran`, () => {
			const { text } = dungTin("An", SANG, [TOM_TAT], () => null, khuon);
			const tieuDe = text.split("\n").filter((d) => d.includes("Kara · OKR"));
			if (tieuDe.length === 0)
				throw new Error(`kmt: tin nhac tieu de ${khuon} ${text}`);
			for (const muc of [80, 100] as const) {
				const tin = dungTin("An", SANG, [tran(muc)], () => null, khuon).text;
				const cau = tin
					.split("\n")
					.find((d) =>
						d.includes(muc === 100 ? "chạm trần tháng" : "80% trần tháng"),
					);
				if (!cau || !/(^|[^\p{L}])Kara /u.test(cau))
					throw new Error(`kmt: tin nhac tran ${muc} ${cau ?? tin}`);
				if (tin.includes("Trợ lý"))
					throw new Error(`kmt: tin nhac con tro ly ${khuon}`);
			}
			if (text.includes("Trợ lý"))
				throw new Error(`kmt: tin nhac con tro ly ${khuon}`);
		});
	}

	test("kmt-tin-nhac: doi chung, nhom cap nhat tuan giu tieu de cu", () => {
		const { text } = dungTin("An", SANG, [CAP_NHAT], () => null, "slack");
		if (!text.split("\n").includes("*Cập nhật tuần*"))
			throw new Error(`kmt: tin nhac doi nhom khac ${text}`);
		expect(text.includes("Kara")).toBe(false);
	});
});
