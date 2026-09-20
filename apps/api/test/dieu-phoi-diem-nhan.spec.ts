import { describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import type { HttpException } from "@nestjs/common";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { OnboardingController } from "../src/onboarding/onboarding.controller";
import { OnboardingService } from "../src/onboarding/onboarding.service";
import { ONBOARDING } from "../src/onboarding/onboarding-config";
import { OnboardingIngestService } from "../src/onboarding/onboarding-ingest.service";
import { gieoCaNhan, gieoKeHoach } from "./dieu-phoi-gieo";

const KHOA = "bi-mat-dieu-phoi";

let daGoiTacNhan: { planId: string; ma: string }[] = [];

const tacNhan = {
	onboardingMatchNeeded: async (planId: string, ma: string) => {
		daGoiTacNhan.push({ planId, ma });
		await db.agentTask.create({
			data: {
				kind: "onboarding-identify",
				reason: `Khong khop ma nen tang ${ma}`,
				dueAt: new Date(),
				payload: { planId, platformBrokerId: ma },
			},
		});
	},
} as unknown as AgentTriggerService;

function dungController(khoa: string | undefined) {
	const ingest = new OnboardingIngestService(db, tacNhan);
	const config = {
		get: () => khoa,
	} as unknown as ConstructorParameters<typeof OnboardingController>[1];
	return new OnboardingController(ingest, config);
}

async function tuChoi(chay: Promise<unknown>): Promise<HttpException> {
	try {
		await chay;
	} catch (loi) {
		return loi as HttpException;
	}
	throw new Error("mong doi mot loi, nhung lenh chay tron ven");
}

async function gieoMaNenTang(contactId: string, ma: string) {
	const service = new OnboardingService(db);
	const fieldId = await service.ensureMaNenTangField();
	await db.fieldValue.upsert({
		where: { fieldId_contactId: { fieldId, contactId } },
		create: { fieldId, contactId, text: ma },
		update: { text: ma },
	});
}

function muc(ma: string) {
	return {
		platformBrokerId: ma,
		accountAt: "2026-09-01T00:00:00.000Z",
		courseAt: null,
		activeAt: null,
		dealAt: null,
	};
}

describe("diem nhan tu nen tang", () => {
	test("lo-sai-tu-choi-tron: mot muc hong thi khong muc nao duoc ghi", async () => {
		daGoiTacNhan = [];
		const plan = await gieoKeHoach();
		const ca = await gieoCaNhan();
		await gieoMaNenTang(ca.id, "mg-tron-1");

		const truoc = await db.onboardingEnrollment.count();
		const truocTask = await db.agentTask.count();

		const loi = await tuChoi(
			dungController(KHOA).ingest(`Bearer ${KHOA}`, {
				source: "onehub-platform",
				planId: plan.id,
				observedAt: "2026-09-20T00:00:00.000Z",
				items: [
					muc("mg-tron-1"),
					{ ...muc("mg-tron-2"), platformBrokerId: "" },
				],
			}),
		);

		expect(loi.getStatus()).toBe(400);
		expect(JSON.stringify(loi.getResponse())).toContain("platformBrokerId");
		expect(await db.onboardingEnrollment.count()).toBe(truoc);
		expect(await db.agentTask.count()).toBe(truocTask);
	});

	test("khong-khop-agenttask: muc khong khop khong sinh ghi danh, sinh mot AgentTask", async () => {
		daGoiTacNhan = [];
		const plan = await gieoKeHoach();
		const ca = await gieoCaNhan();
		await gieoMaNenTang(ca.id, "mg-khop-1");

		const truocTask = await db.agentTask.count();

		const ketQua = await dungController(KHOA).ingest(`Bearer ${KHOA}`, {
			source: "onehub-platform",
			planId: plan.id,
			observedAt: "2026-09-20T00:00:00.000Z",
			items: [muc("mg-khop-1"), muc("mg-khong-co-that")],
		});

		const rows = await db.onboardingEnrollment.findMany({
			where: { planId: plan.id },
		});
		expect(rows).toHaveLength(1);
		expect(rows[0]?.contactId).toBe(ca.id);
		expect(rows[0]?.source).toBe("nen-tang");

		expect(await db.agentTask.count()).toBe(truocTask + 1);
		expect(daGoiTacNhan).toEqual([{ planId: plan.id, ma: "mg-khong-co-that" }]);
		expect(ketQua).toEqual({ khop: 1, chuyenTacNhan: 1 });
	});

	test("thieu-khoa-503: dung duoc controller, diem nhan tra 503", async () => {
		const controller = dungController(undefined);
		expect(controller).toBeDefined();

		const plan = await gieoKeHoach();
		const loi = await tuChoi(
			controller.ingest("Bearer bat-ky", {
				source: "onehub-platform",
				planId: plan.id,
				observedAt: "2026-09-20T00:00:00.000Z",
				items: [muc("mg-1")],
			}),
		);
		expect(loi.getStatus()).toBe(503);
	});

	test("thieu-khoa-503: khoa sai thi 403, khong phai 503", async () => {
		const plan = await gieoKeHoach();
		const loi = await tuChoi(
			dungController(KHOA).ingest("Bearer sai-khoa", {
				source: "onehub-platform",
				planId: plan.id,
				observedAt: "2026-09-20T00:00:00.000Z",
				items: [muc("mg-1")],
			}),
		);
		expect(loi.getStatus()).toBe(403);
	});

	test("tran lo doc tu cau hinh, khong ghim trong ma", () => {
		expect(ONBOARDING.ingest.maxItemsPerBatch).toBe(500);
	});
});
