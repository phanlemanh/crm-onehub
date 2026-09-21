import { describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import type { HttpException } from "@nestjs/common";
import { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { OnboardingController } from "../src/onboarding/onboarding.controller";
import { OnboardingService } from "../src/onboarding/onboarding.service";
import { ONBOARDING } from "../src/onboarding/onboarding-config";
import { OnboardingIngestService } from "../src/onboarding/onboarding-ingest.service";
import { gieoCaNhan, gieoKeHoach } from "./dieu-phoi-gieo";

const KHOA = "bi-mat-dieu-phoi";
const VIEC = "onboarding-identify";

let dem = 0;

function maMoi(tien: string): string {
	dem += 1;
	return `${tien}-${Date.now()}-${dem}`;
}

function dungController(khoa: string | undefined) {
	const ingest = new OnboardingIngestService(db, new AgentTriggerService(db));
	const config = {
		get: () => khoa,
	} as unknown as ConstructorParameters<typeof OnboardingController>[1];
	return new OnboardingController(ingest, config);
}

async function demViec(): Promise<number> {
	return db.agentTask.count({ where: { kind: VIEC } });
}

async function viecMang(ma: string) {
	return db.agentTask.findMany({
		where: {
			kind: VIEC,
			payload: { path: ["platformBrokerId"], equals: ma },
		},
		select: { id: true, reason: true },
	});
}

async function viecCuaKeHoach(planId: string, ma: string) {
	return db.agentTask.findMany({
		where: {
			kind: VIEC,
			AND: [
				{ payload: { path: ["planId"], equals: planId } },
				{ payload: { path: ["platformBrokerId"], equals: ma } },
			],
		},
		select: { id: true },
	});
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
		const plan = await gieoKeHoach();
		const ca = await gieoCaNhan();
		const ma = maMoi("mg-tron");
		await gieoMaNenTang(ca.id, ma);

		const truoc = await db.onboardingEnrollment.count();
		const truocTask = await db.agentTask.count();

		const loi = await tuChoi(
			dungController(KHOA).ingest(`Bearer ${KHOA}`, {
				source: "onehub-platform",
				planId: plan.id,
				observedAt: "2026-09-20T00:00:00.000Z",
				items: [muc(ma), { ...muc("mg-tron-2"), platformBrokerId: "" }],
			}),
		);

		expect(loi.getStatus()).toBe(400);
		expect(JSON.stringify(loi.getResponse())).toContain("platformBrokerId");
		expect(await db.onboardingEnrollment.count()).toBe(truoc);
		expect(await db.agentTask.count()).toBe(truocTask);
	});

	test("khong-khop-agenttask: muc khong khop khong sinh ghi danh, sinh mot AgentTask", async () => {
		const plan = await gieoKeHoach();
		const ca = await gieoCaNhan();
		const maKhop = maMoi("mg-khop");
		const maLa = maMoi("mg-khong-co-that");
		await gieoMaNenTang(ca.id, maKhop);

		const truocTask = await demViec();

		const ketQua = await dungController(KHOA).ingest(`Bearer ${KHOA}`, {
			source: "onehub-platform",
			planId: plan.id,
			observedAt: "2026-09-20T00:00:00.000Z",
			items: [muc(maKhop), muc(maLa)],
		});

		const rows = await db.onboardingEnrollment.findMany({
			where: { planId: plan.id },
		});
		expect(rows).toHaveLength(1);
		expect(rows[0]?.contactId).toBe(ca.id);
		expect(rows[0]?.source).toBe("nen-tang");

		expect(await demViec()).toBe(truocTask + 1);
		const viec = await viecMang(maLa);
		expect(viec).toHaveLength(1);
		expect(viec[0]?.reason).toContain(maLa);
		expect(await viecMang(maKhop)).toHaveLength(0);
		expect(ketQua).toEqual({ khop: 1, chuyenTacNhan: 1 });
	});

	test("khong-khop-agenttask: HAI ma khong khop trong CUNG mot lo deu toi duoc tac nhan", async () => {
		const plan = await gieoKeHoach();
		const ca = await gieoCaNhan();
		const maKhop = maMoi("mg-khop");
		const maLaMot = maMoi("mg-la-mot");
		const maLaHai = maMoi("mg-la-hai");
		await gieoMaNenTang(ca.id, maKhop);

		const truocTask = await demViec();

		const ketQua = await dungController(KHOA).ingest(`Bearer ${KHOA}`, {
			source: "onehub-platform",
			planId: plan.id,
			observedAt: "2026-09-20T00:00:00.000Z",
			items: [muc(maKhop), muc(maLaMot), muc(maLaHai)],
		});

		expect(await viecMang(maLaMot)).toHaveLength(1);
		expect(await viecMang(maLaHai)).toHaveLength(1);
		expect(await demViec()).toBe(truocTask + 2);
		expect(ketQua).toEqual({ khop: 1, chuyenTacNhan: 2 });
	});

	test("khong-khop-agenttask: cung mot ma la o HAI ke hoach thi moi ke hoach mot viec", async () => {
		const [motBen, benKia] = await Promise.all([gieoKeHoach(), gieoKeHoach()]);
		const maLa = maMoi("mg-hai-ke-hoach");

		const truocTask = await demViec();

		const lo = (planId: string) => ({
			source: "onehub-platform" as const,
			planId,
			observedAt: "2026-09-20T00:00:00.000Z",
			items: [muc(maLa)],
		});

		const mot = await dungController(KHOA).ingest(
			`Bearer ${KHOA}`,
			lo(motBen.id),
		);
		const hai = await dungController(KHOA).ingest(
			`Bearer ${KHOA}`,
			lo(benKia.id),
		);

		expect(await viecCuaKeHoach(motBen.id, maLa)).toHaveLength(1);
		expect(await viecCuaKeHoach(benKia.id, maLa)).toHaveLength(1);
		expect(await demViec()).toBe(truocTask + 2);
		expect(mot).toEqual({ khop: 0, chuyenTacNhan: 1 });
		expect(hai).toEqual({ khop: 0, chuyenTacNhan: 1 });
	});

	test("khong-khop-agenttask: ca hai muc deu khop thi KHONG viec nao duoc ghi", async () => {
		const plan = await gieoKeHoach();
		const [motNguoi, nguoiKia] = await Promise.all([
			gieoCaNhan(),
			gieoCaNhan(),
		]);
		const maMot = maMoi("mg-doi-mot");
		const maHai = maMoi("mg-doi-hai");
		await gieoMaNenTang(motNguoi.id, maMot);
		await gieoMaNenTang(nguoiKia.id, maHai);

		const truocTask = await demViec();

		const ketQua = await dungController(KHOA).ingest(`Bearer ${KHOA}`, {
			source: "onehub-platform",
			planId: plan.id,
			observedAt: "2026-09-20T00:00:00.000Z",
			items: [muc(maMot), muc(maHai)],
		});

		expect(
			await db.onboardingEnrollment.count({ where: { planId: plan.id } }),
		).toBe(2);
		expect(await demViec()).toBe(truocTask);
		expect(ketQua).toEqual({ khop: 2, chuyenTacNhan: 0 });
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
