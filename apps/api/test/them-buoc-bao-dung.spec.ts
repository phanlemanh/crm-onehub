import { afterAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import type { HttpException } from "@nestjs/common";
import { OnboardingService } from "../src/onboarding/onboarding.service";
import { ToChucService } from "../src/to-chuc/to-chuc.service";
import { donGieo, gieoBoPhan, gieoKeHoach } from "./dieu-phoi-gieo";

let dem = 0;
const khuonDaTao: string[] = [];

function maMoi(tien: string): string {
	dem += 1;
	return `${tien}-${Date.now()}-${dem}`;
}

async function loiCua(chay: Promise<unknown>): Promise<HttpException> {
	try {
		await chay;
	} catch (loi) {
		return loi as HttpException;
	}
	throw new Error("mong doi mot loi, nhung lenh chay tron ven");
}

function buocKhuon(departmentId: string, position = 0) {
	return { label: `Buoc ${position}`, departmentId, position, offsetDays: 0 };
}

async function khuonSong(service: OnboardingService, departmentId: string) {
	const k = await service.createTemplate({
		name: maMoi("Khuon"),
		partnerType: null,
		steps: [buocKhuon(departmentId)],
	});
	khuonDaTao.push(k.id);
	return k;
}

afterAll(async () => {
	await db.onboardingTemplate.deleteMany({ where: { id: { in: khuonDaTao } } });
	await donGieo();
});

describe("phong-ban-khong-co", () => {
	test("addStep, tao khuon, sua khuon tra cung loi voi org.*", async () => {
		const service = new OnboardingService(db);
		const plan = await gieoKeHoach();
		const song = await gieoBoPhan();
		const khuon = await khuonSong(service, song.id);
		const maLa = maMoi("pb-khong-co");
		const soBuoc = await db.onboardingStep.count({
			where: { planId: plan.id },
		});
		const soKhuon = await db.onboardingTemplate.count();

		const thamChieu = await loiCua(
			new ToChucService(db).luuTruXemTruoc({ id: maLa }),
		);
		expect(thamChieu.getStatus(), "cot tham chieu org.* rong").toBe(404);
		expect(thamChieu.message).toContain(maLa);

		const duong = {
			addStep: await loiCua(
				service.addStep(
					{
						planId: plan.id,
						label: "A",
						departmentId: maLa,
						dueAt: new Date(),
					},
					plan.ownerId,
				),
			),
			createTemplate: await loiCua(
				service.createTemplate({
					name: maMoi("Khuon la"),
					partnerType: null,
					steps: [buocKhuon(maLa, 0), buocKhuon(maLa, 1)],
				}),
			),
			updateTemplate: await loiCua(
				service.updateTemplate({ id: khuon.id, steps: [buocKhuon(maLa)] }),
			),
		};
		for (const [ten, loi] of Object.entries(duong)) {
			expect(
				loi.getStatus(),
				`${ten} tra loi khac org.* cho phong ban khong co`,
			).toBe(thamChieu.getStatus());
			expect(
				loi.message,
				`${ten} tra cau khac org.* cho phong ban khong co`,
			).toBe(thamChieu.message);
		}
		expect(await db.onboardingStep.count({ where: { planId: plan.id } })).toBe(
			soBuoc,
		);
		expect(await db.onboardingTemplate.count()).toBe(soKhuon);
		const sau = await db.onboardingTemplate.findUniqueOrThrow({
			where: { id: khuon.id },
		});
		expect(sau.steps).toEqual([buocKhuon(song.id)]);
	});
});

describe("phong-ban-luu-tru", () => {
	test("addStep, tao khuon, sua khuon cung mot cau cho phong ban da luu tru", async () => {
		const service = new OnboardingService(db);
		const plan = await gieoKeHoach();
		const song = await gieoBoPhan();
		const khuon = await khuonSong(service, song.id);
		const cat = await gieoBoPhan();
		await db.department.update({
			where: { id: cat.id },
			data: { archivedAt: new Date() },
		});
		const soBuoc = await db.onboardingStep.count({
			where: { planId: plan.id },
		});
		const soKhuon = await db.onboardingTemplate.count();

		const a = await loiCua(
			service.addStep(
				{
					planId: plan.id,
					label: "A",
					departmentId: cat.id,
					dueAt: new Date(),
				},
				plan.ownerId,
			),
		);
		const b = await loiCua(
			service.createTemplate({
				name: maMoi("Khuon cat"),
				partnerType: null,
				steps: [buocKhuon(cat.id)],
			}),
		);
		const c = await loiCua(
			service.updateTemplate({ id: khuon.id, steps: [buocKhuon(cat.id)] }),
		);
		expect(a.getStatus(), "addStep ghi buoc vao phong ban da luu tru").toBe(
			400,
		);
		expect(a.message).toContain(cat.name);
		expect(b.getStatus()).toBe(400);
		expect(b.message).toBe(a.message);
		expect(c.getStatus()).toBe(400);
		expect(c.message).toBe(a.message);
		expect(await db.onboardingStep.count({ where: { planId: plan.id } })).toBe(
			soBuoc,
		);
		expect(await db.onboardingTemplate.count()).toBe(soKhuon);

		await service.addStep(
			{ planId: plan.id, label: "B", departmentId: song.id, dueAt: new Date() },
			plan.ownerId,
		);
		await khuonSong(service, song.id);
		expect(await db.onboardingStep.count({ where: { planId: plan.id } })).toBe(
			soBuoc + 1,
		);
		expect(await db.onboardingTemplate.count()).toBe(soKhuon + 1);
	});
});
