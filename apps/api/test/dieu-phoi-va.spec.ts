import { afterAll, describe, expect, test } from "bun:test";
import { ActivityType, db } from "@crm/db";
import { DIRECT_KINDS } from "@crm/db/agent-tasks";
import { dauNgayVN } from "@crm/db/onboarding-nhac";
import {
	LOAI_VIEC_MA_LECH,
	MA_NEN_TANG_KEY,
	onboardingIdentifyPayload,
} from "@crm/validation/onboarding-identify";
import type { HttpException } from "@nestjs/common";
import { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { ConversionService } from "../src/currency/conversion.service";
import { DashboardService } from "../src/dashboard/dashboard.service";
import { OnboardingController } from "../src/onboarding/onboarding.controller";
import { OnboardingService } from "../src/onboarding/onboarding.service";
import { MA_NEN_TANG } from "../src/onboarding/onboarding-config";
import { OnboardingIngestService } from "../src/onboarding/onboarding-ingest.service";
import {
	donGieo,
	gieoBoPhan,
	gieoCaNhan,
	gieoKeHoach,
	gieoNguoi,
} from "./dieu-phoi-gieo";

const KHOA = "bi-mat-dieu-phoi-va";
const DAY_MS = 86_400_000;
const MACH_LIEN = "dpv-mach-lien-";

let dem = 0;

function maMoi(tien: string): string {
	dem += 1;
	return `${tien}-${Date.now()}-${dem}`;
}

function dungController() {
	const ingest = new OnboardingIngestService(db, new AgentTriggerService(db));
	const config = {
		get: () => KHOA,
	} as unknown as ConstructorParameters<typeof OnboardingController>[1];
	return new OnboardingController(ingest, config);
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

function lo(planId: string, ma: string[]) {
	return {
		source: "onehub-platform" as const,
		planId,
		observedAt: "2026-10-09T00:00:00.000Z",
		items: ma.map(muc),
	};
}

async function gieoMaNenTang(contactId: string, ma: string) {
	const fieldId = await new OnboardingService(db).ensureMaNenTangField();
	await db.fieldValue.upsert({
		where: { fieldId_contactId: { fieldId, contactId } },
		create: { fieldId, contactId, text: ma },
		update: { text: ma },
	});
}

async function hangCua(planId: string) {
	return db.agentTask.findMany({
		where: {
			kind: LOAI_VIEC_MA_LECH,
			payload: { path: ["planId"], equals: planId },
		},
		select: { id: true, kind: true, payload: true },
	});
}

async function loiCua(chay: Promise<unknown>): Promise<HttpException> {
	try {
		await chay;
	} catch (loi) {
		return loi as HttpException;
	}
	throw new Error("mong doi mot loi, nhung lenh chay tron ven");
}

const daGieoKeHoach: string[] = [];

afterAll(async () => {
	await db.agentTask.deleteMany({
		where: {
			kind: LOAI_VIEC_MA_LECH,
			OR: daGieoKeHoach.map((planId) => ({
				payload: { path: ["planId"], equals: planId },
			})),
		},
	});
	await db.activity.deleteMany({ where: { planId: { in: daGieoKeHoach } } });
	await donGieo();
});

describe("nhan-lo", () => {
	test("ma lech thanh hang onboarding-identify o lan truc tiep, payload qua schema", async () => {
		expect(
			MA_NEN_TANG.key,
			"khoa truong ma nen tang lech giua API va tac nhan",
		).toBe(MA_NEN_TANG_KEY);

		const plan = await gieoKeHoach();
		daGieoKeHoach.push(plan.id);
		const ca = await gieoCaNhan();
		const maKhop = maMoi("dpv-khop");
		const maLech = maMoi("dpv-lech");
		await gieoMaNenTang(ca.id, maKhop);

		await dungController().ingest(
			`Bearer ${KHOA}`,
			lo(plan.id, [maKhop, maLech]),
		);

		const hang = await hangCua(plan.id);
		expect(hang.length).toBe(1);
		const [mot] = hang;
		const payload = onboardingIdentifyPayload.safeParse(mot?.payload);
		expect(
			payload.success,
			"payload onboarding-identify khong qua schema",
		).toBe(true);
		expect(payload.data?.planId).toBe(plan.id);
		expect(payload.data?.platformBrokerId).toBe(maLech);
		expect((DIRECT_KINDS as readonly string[]).includes(mot?.kind ?? "")).toBe(
			true,
		);
	});

	test("lo ba ma lech thanh ba hang, moi hang mot ma", async () => {
		const plan = await gieoKeHoach();
		daGieoKeHoach.push(plan.id);
		const ma = [maMoi("dpv-ba"), maMoi("dpv-ba"), maMoi("dpv-ba")];

		await dungController().ingest(`Bearer ${KHOA}`, lo(plan.id, ma));

		const hang = await hangCua(plan.id);
		expect(hang.length, "ma lech bi gom vao mot hang").toBe(3);
		const maTrongHang = hang
			.map((h) => onboardingIdentifyPayload.parse(h.payload).platformBrokerId)
			.sort();
		expect(maTrongHang).toEqual([...ma].sort());
	});
});

describe.skipIf(process.env.DPV_MACH_LIEN !== "1")("mach-lien-ghi", () => {
	test("API ghi hai hang cho mach lien, khong don", async () => {
		const [congTy, nguoi] = await Promise.all([
			db.company.create({ data: { name: maMoi("Cong ty mach lien") } }),
			db.user.create({
				data: {
					id: maMoi("u-mach"),
					name: "Nguoi cam trich mach lien",
					email: `${maMoi("mach")}@thu.test`,
				},
			}),
		]);
		const plan = await db.onboardingPlan.create({
			data: {
				id: `${MACH_LIEN}${process.pid}-${Date.now()}`,
				companyId: congTy.id,
				ownerId: nguoi.id,
				startedAt: new Date(),
				targetDays: 30,
			},
		});
		await dungController().ingest(
			`Bearer ${KHOA}`,
			lo(plan.id, [maMoi("dpv-mach"), maMoi("dpv-mach")]),
		);
		expect((await hangCua(plan.id)).length).toBe(2);
	});
});

describe("bo-phan-hong", () => {
	test("bo phan khong co that hoac da luu tru tra BAD_REQUEST, khong ghi buoc", async () => {
		const plan = await gieoKeHoach();
		daGieoKeHoach.push(plan.id);
		const service = new OnboardingService(db);
		const daCat = await gieoBoPhan();
		await db.department.update({
			where: { id: daCat.id },
			data: { archivedAt: new Date() },
		});
		const maLa = maMoi("bp-khong-co");
		const truoc = await db.onboardingStep.count({ where: { planId: plan.id } });

		const khongCo = await loiCua(
			service.addStep(
				{ planId: plan.id, label: "A", departmentId: maLa, dueAt: new Date() },
				plan.ownerId,
			),
		);
		expect(khongCo.getStatus()).toBe(404);
		expect(khongCo.message).toContain(maLa);

		const cat = await loiCua(
			service.addStep(
				{
					planId: plan.id,
					label: "B",
					departmentId: daCat.id,
					dueAt: new Date(),
				},
				plan.ownerId,
			),
		);
		expect(cat.getStatus(), "addStep ghi buoc vao bo phan da luu tru").toBe(
			400,
		);
		expect(cat.message).toContain(daCat.name);
		expect(await db.onboardingStep.count({ where: { planId: plan.id } })).toBe(
			truoc,
		);

		const song = await gieoBoPhan();
		await service.addStep(
			{ planId: plan.id, label: "C", departmentId: song.id, dueAt: new Date() },
			plan.ownerId,
		);
		expect(await db.onboardingStep.count({ where: { planId: plan.id } })).toBe(
			truoc + 1,
		);
	});
});

describe("dem-qua-han", () => {
	test("dem viec va buoc qua han khong bi tran 10", async () => {
		const now = new Date();
		const dau = dauNgayVN(now);
		const truocHan = new Date(dau.getTime() - 2 * DAY_MS);
		const homNay = new Date(dau.getTime() + 60_000);
		const [a, b] = await Promise.all([gieoNguoi(), gieoNguoi()]);

		const viecQuaHan = {
			type: ActivityType.TASK,
			completedAt: null,
			dueAt: { lt: dau },
		} as const;
		const sanCo = await db.activity.count({ where: viecQuaHan });

		const taoViec = (createdById: string, dueAt: Date, xong = false) =>
			db.activity.create({
				data: {
					type: ActivityType.TASK,
					subject: maMoi("viec"),
					dueAt,
					createdById,
					completedAt: xong ? new Date() : null,
				},
			});
		for (let i = 0; i < 25; i += 1) await taoViec(a.id, truocHan);
		for (let i = 0; i < 3; i += 1) await taoViec(b.id, truocHan);
		for (let i = 0; i < 2; i += 1) await taoViec(a.id, truocHan, true);
		for (let i = 0; i < 2; i += 1) await taoViec(a.id, homNay);

		const bp = await gieoBoPhan();
		const mo = await gieoKeHoach();
		const dong = await gieoKeHoach({ closedAt: new Date() });
		daGieoKeHoach.push(mo.id, dong.id);
		const taoBuoc = (planId: string, position: number) =>
			db.onboardingStep.create({
				data: {
					planId,
					label: maMoi("buoc"),
					departmentId: bp.id,
					dueAt: truocHan,
					assigneeId: a.id,
					position,
				},
			});
		for (let i = 0; i < 15; i += 1) await taoBuoc(mo.id, i);
		for (let i = 0; i < 2; i += 1) await taoBuoc(dong.id, i);

		const tongQuan = new DashboardService(db, new ConversionService(db));
		const cuaToi = await tongQuan.summary(a.id, { scope: "me" });
		expect(cuaToi.quaHan.viec, "quaHan.viec bi tran 10").toBe(25);
		expect(cuaToi.quaHan.buoc).toBe(15);
		expect(cuaToi.overdueTasks.length).toBe(10);

		const tatCa = await tongQuan.summary(a.id, { scope: "everyone" });
		expect(tatCa.quaHan.viec).toBe(sanCo + 28);
		expect(tatCa.quaHan.buoc).toBe(15);

		await db.activity.deleteMany({
			where: { createdById: { in: [a.id, b.id] } },
		});
		await db.onboardingStep.deleteMany({
			where: { planId: { in: [mo.id, dong.id] } },
		});
	});
});
