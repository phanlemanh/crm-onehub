import { afterAll, describe, expect, setSystemTime, test } from "bun:test";
import { db } from "@crm/db";
import { dauNgayVN } from "@crm/db/onboarding-nhac";
import { quaHanTheoNgayVN } from "@crm/validation/ngay-vn";
import type { HttpException } from "@nestjs/common";
import { ConversionService } from "../src/currency/conversion.service";
import { DashboardService } from "../src/dashboard/dashboard.service";
import { OnboardingService } from "../src/onboarding/onboarding.service";
import { ToChucService } from "../src/to-chuc/to-chuc.service";
import { donGieo, gieoBoPhan, gieoKeHoach, gieoNguoi } from "./dieu-phoi-gieo";

const DAY_MS = 86_400_000;
const GIO_MS = 3_600_000;
const DONG_HO = ["2026-10-12T17:05:00Z", "2026-10-12T16:55:00Z"];

let dem = 0;
const khuonDaTao: string[] = [];

function maMoi(tien: string): string {
	dem += 1;
	return `${tien}-${Date.now()}-${dem}`;
}

async function loiCua(
	chay: Promise<unknown>,
): Promise<HttpException | undefined> {
	try {
		await chay;
	} catch (loi) {
		return loi as HttpException;
	}
	return undefined;
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
		expect(thamChieu?.getStatus(), "cot tham chieu org.* rong").toBe(404);
		expect(thamChieu?.message).toContain(maLa);

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
				loi?.getStatus(),
				`${ten} tra loi khac org.* cho phong ban khong co`,
			).toBe(thamChieu?.getStatus());
			expect(
				loi?.message,
				`${ten} tra cau khac org.* cho phong ban khong co`,
			).toBe(thamChieu?.message);
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
		expect(a?.getStatus(), "addStep ghi buoc vao phong ban da luu tru").toBe(
			400,
		);
		expect(a?.message).toContain(cat.name);
		expect(b?.getStatus()).toBe(400);
		expect(b?.message).toBe(a?.message);
		expect(c?.getStatus()).toBe(400);
		expect(c?.message).toBe(a?.message);
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

describe.if(process.env.TBD_KHU_HOI === "1")("qua-han-khu-hoi", () => {
	test("app va may chu dem qua han theo mot ngay tren dau ra that", async () => {
		const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
		expect(
			tz !== "Asia/Ho_Chi_Minh" && tz === process.env.TZ,
			`khu hoi chay o mui gio VN (${tz})`,
		).toBe(true);
		const tongQuan = new DashboardService(db, new ConversionService(db));
		try {
			for (const luc of DONG_HO) {
				const dongHo = new Date(luc);
				setSystemTime(dongHo);
				const nguoi = await gieoNguoi();
				const plan = await gieoKeHoach();
				const pb = await gieoBoPhan();
				const dau = dauNgayVN(dongHo).getTime();
				await db.onboardingStep.createMany({
					data: [
						{ han: dau - DAY_MS, nhan: "hom qua" },
						{ han: dau + GIO_MS, nhan: "hom nay" },
					].map((b, i) => ({
						planId: plan.id,
						departmentId: pb.id,
						label: b.nhan,
						dueAt: new Date(b.han),
						position: i,
						assigneeId: nguoi.id,
					})),
				});
				const kq = await tongQuan.summary(nguoi.id, { scope: "me" });
				expect(kq.quaHan.buoc, `doi chung ${luc} ${tz}`).toBe(1);
				const app = kq.mySteps.filter((b) =>
					quaHanTheoNgayVN(b.dueAt, dongHo),
				).length;
				expect(
					app,
					`app va may chu dem qua han theo hai ngay khac nhau — ${luc} ${tz}`,
				).toBe(kq.quaHan.buoc);
			}
		} finally {
			setSystemTime();
		}
	});
});
