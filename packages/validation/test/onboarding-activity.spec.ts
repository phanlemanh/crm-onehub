import { describe, expect, test } from "bun:test";
import {
	ONBOARDING_ACTIVITY_KINDS,
	parseOnboardingActivityMeta,
	vet,
	vetCoCongTy,
} from "../src/onboarding-activity";

const MA_TRAN = [
	vet.buocGiao({
		stepId: "s1",
		nhan: "Dao tao",
		tu: null,
		tuTen: null,
		den: "u1",
		denTen: "Thuong",
	}),
	vet.buocXong({ stepId: "s1", nhan: "Dao tao" }),
	vet.buocBoXong({ stepId: "s1", nhan: "Dao tao" }),
	vet.buocDoiHan({
		stepId: "s1",
		nhan: "Dao tao",
		tu: "2026-09-22",
		den: "2026-09-25",
	}),
	vet.buocThem({ stepId: "s1", nhan: "Dao tao" }),
	vet.buocBo({ stepId: "s1", nhan: "Dao tao" }),
	vet.keHoachDoiCamTrich({
		tu: "u1",
		tuTen: "Manh",
		den: "u2",
		denTen: "Tuan",
	}),
	vet.keHoachDong(),
	vet.keHoachMoLai(),
	vet.theoDoiBat(),
	vet.theoDoiTat(),
];

describe("onboarding-activity", () => {
	test("moi kind co mot ham dung va doc lai qua schema", () => {
		expect(new Set(MA_TRAN.map((m) => m.kind)).size).toBe(11);
		expect(ONBOARDING_ACTIVITY_KINDS.length).toBe(11);
		for (const meta of MA_TRAN) {
			expect(parseOnboardingActivityMeta(meta)).toEqual(meta);
		}
	});

	test("doi han tu choi chuoi ISO co gio", () => {
		expect(() =>
			parseOnboardingActivityMeta({
				kind: "buoc.doiHan",
				stepId: "s1",
				nhan: "x",
				tu: "2026-09-22T00:00:00.000Z",
				den: "2026-09-25",
			}),
		).toThrow("vết kế hoạch");
	});

	test("chi keHoach.* mang cong ty", () => {
		expect(MA_TRAN.filter(vetCoCongTy).map((m) => m.kind)).toEqual([
			"keHoach.doiCamTrich",
			"keHoach.dong",
			"keHoach.moLai",
		]);
	});
});
