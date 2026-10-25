import { describe, expect, it } from "bun:test";
import { type LyDoRong, lyDoRong } from "@/app/(app)/[slug]/okr/ly-do-rong";
import { hopTuanOutput } from "../../api/src/okr/okr-xem.contracts";

const HOM_NAY_VN_SAU_NUA_DEM = new Date("2026-10-24T17:30:00Z");
const NGAY_BAT_DAU_HOM_NAY = "2026-10-25";
const NGAY_BAT_DAU_SAU = "2026-10-27";

function hop(v: { tongKr: number; daCapNhat: number; tuanDau: boolean }) {
	return hopTuanOutput.parse({
		tuan: "2026-10-19",
		tuanDau: v.tuanDau,
		daCapNhat: v.daCapNhat,
		tongKr: v.tongKr,
		dangBan: [],
		conLai: [],
	});
}

type CaLyDo = {
	ten: string;
	hop: ReturnType<typeof hop>;
	chuKy: { phase: string; startsOn: string };
	can: LyDoRong;
};

const MA_TRAN_LY_DO: readonly CaLyDo[] = [
	{
		ten: "lap-ke-hoach",
		hop: hop({ tongKr: 0, daCapNhat: 0, tuanDau: false }),
		chuKy: { phase: "lap-ke-hoach", startsOn: NGAY_BAT_DAU_SAU },
		can: "chu-ky-chua-chay",
	},
	{
		ten: "chua-toi-ngay",
		hop: hop({ tongKr: 3, daCapNhat: 0, tuanDau: true }),
		chuKy: { phase: "dang-chay", startsOn: NGAY_BAT_DAU_SAU },
		can: "chu-ky-chua-chay",
	},
	{
		ten: "chua-kr",
		hop: hop({ tongKr: 0, daCapNhat: 0, tuanDau: true }),
		chuKy: { phase: "dang-chay", startsOn: NGAY_BAT_DAU_HOM_NAY },
		can: "chua-kr-cong-bo",
	},
	{
		ten: "chua-cap-nhat",
		hop: hop({ tongKr: 4, daCapNhat: 0, tuanDau: true }),
		chuKy: { phase: "dang-chay", startsOn: NGAY_BAT_DAU_HOM_NAY },
		can: "chua-ai-cap-nhat",
	},
	{
		ten: "co-cap-nhat",
		hop: hop({ tongKr: 4, daCapNhat: 2, tuanDau: false }),
		chuKy: { phase: "dang-chay", startsOn: NGAY_BAT_DAU_HOM_NAY },
		can: null,
	},
];

describe("htmb-ly-do-ham", () => {
	it("lyDoRong chon dung ly do cho tung o cua ma tran", () => {
		let dem = 0;
		for (const ca of MA_TRAN_LY_DO) {
			const ra = lyDoRong({
				hop: ca.hop,
				chuKy: ca.chuKy,
				homNay: HOM_NAY_VN_SAU_NUA_DEM,
			});
			expect(ra, `htmb-ly-do: ${ca.ten} ra ${ra}`).toBe(ca.can);
			dem += 1;
		}
		expect(dem).toBe(5);
	});
});
