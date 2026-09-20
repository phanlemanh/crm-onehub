import { describe, expect, test } from "bun:test";
import { parseOnboardingBatch } from "../src/onboarding-ingest";
import { parseOnboardingTemplateSteps } from "../src/onboarding-template";

function batLoi(chay: () => unknown): string {
	try {
		chay();
	} catch (loi) {
		return loi instanceof Error ? `${loi.name}: ${loi.message}` : String(loi);
	}
	throw new Error("mong doi mot loi, nhung lenh chay tron ven");
}

describe("khuon ke hoach", () => {
	test("buoc phai co nhan, bo phan, thu tu, lech ngay", () => {
		const ok = parseOnboardingTemplateSteps([
			{ label: "Ky bien ban", departmentId: "d1", position: 0, offsetDays: 2 },
		]);
		expect(ok).toHaveLength(1);
		expect(ok[0].offsetDays).toBe(2);
	});

	test("thieu bo phan thi nem, va thong diep ghim ten truong", () => {
		const loi = batLoi(() =>
			parseOnboardingTemplateSteps([{ label: "Thieu bo phan", position: 0 }]),
		);
		expect(loi).toContain("departmentId");
		expect(loi).toContain("bước của khuôn kế hoạch");
	});

	test("mang rong khong phai mot khuon", () => {
		const loi = batLoi(() => parseOnboardingTemplateSteps([]));
		expect(loi).toContain("bước của khuôn kế hoạch");
	});
});

describe("lo so lieu tu nen tang", () => {
	const mucHopLe = {
		platformBrokerId: "mg-001",
		accountAt: "2026-09-01T00:00:00.000Z",
		courseAt: null,
		activeAt: null,
		dealAt: null,
	};

	test("lo dung khuon parse duoc", () => {
		const lo = parseOnboardingBatch({
			source: "onehub-platform",
			planId: "kh-1",
			observedAt: "2026-09-20T00:00:00.000Z",
			items: [mucHopLe],
		});
		expect(lo.items).toHaveLength(1);
		expect(lo.items[0].courseAt).toBeNull();
	});

	test("mot muc thieu ma moi gioi thi CA LO nem, thong diep ghim ten truong", () => {
		const loi = batLoi(() =>
			parseOnboardingBatch({
				source: "onehub-platform",
				planId: "kh-1",
				observedAt: "2026-09-20T00:00:00.000Z",
				items: [mucHopLe, { ...mucHopLe, platformBrokerId: undefined }],
			}),
		);
		expect(loi).toContain("platformBrokerId");
	});

	test("nguon la khong phai nen tang thi nem", () => {
		const loi = batLoi(() =>
			parseOnboardingBatch({
				source: "nhatot",
				planId: "kh-1",
				observedAt: "2026-09-20T00:00:00.000Z",
				items: [mucHopLe],
			}),
		);
		expect(loi).toContain("source");
	});
});
