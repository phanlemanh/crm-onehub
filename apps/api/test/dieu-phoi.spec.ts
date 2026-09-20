import { describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { OnboardingService } from "../src/onboarding/onboarding.service";
import {
	batLoi,
	gieoBaBuoc,
	gieoKeHoach,
	gieoKeHoachVaCaNhan,
} from "./dieu-phoi-gieo";

async function dungDichVu(): Promise<OnboardingService> {
	return new OnboardingService(db);
}

describe("luoc-do", () => {
	test("luoc-do: ghi danh duy nhat theo cap ke hoach va ca nhan", async () => {
		const { planId, contactId } = await gieoKeHoachVaCaNhan();

		await db.onboardingEnrollment.create({
			data: { planId, contactId, source: "tay" },
		});

		const truoc = await db.onboardingEnrollment.count({ where: { planId } });
		expect(truoc).toBe(1);

		const loi = await batLoi(() =>
			db.onboardingEnrollment.create({
				data: { planId, contactId, source: "tay" },
			}),
		);
		expect(loi).toContain("planId");
		expect(loi).toContain("contactId");

		const sau = await db.onboardingEnrollment.count({ where: { planId } });
		expect(sau).toBe(1);
	});

	test("luoc-do: bon bac la moc thoi gian, khong phai Boolean", async () => {
		const { planId, contactId } = await gieoKeHoachVaCaNhan();
		const luc = new Date();

		const row = await db.onboardingEnrollment.create({
			data: { planId, contactId, source: "tay", accountAt: luc },
		});

		const doc = await db.onboardingEnrollment.findUniqueOrThrow({
			where: { id: row.id },
		});

		expect(doc.accountAt).toBeInstanceOf(Date);
		expect(typeof doc.accountAt).not.toBe("boolean");
		expect(doc.accountAt?.getTime()).toBe(luc.getTime());
		expect(doc.courseAt).toBeNull();
		expect(doc.activeAt).toBeNull();
		expect(doc.dealAt).toBeNull();
	});

	test("luoc-do: buoc khong the tro vao bo phan khong ton tai", async () => {
		const { planId } = await gieoKeHoachVaCaNhan();

		const loi = await batLoi(() =>
			db.onboardingStep.create({
				data: {
					planId,
					label: "Buoc mo coi",
					departmentId: "bo-phan-khong-co-that",
					dueAt: new Date(),
					position: 0,
				},
			}),
		);
		expect(loi).toContain("onboardingStep");
	});
});

describe("doi-ten-bo-phan", () => {
	test("doi-ten-bo-phan: ba buoc van tro dung bo phan va hien ten moi", async () => {
		const service = await dungDichVu();
		const dep = await service.createDepartment({ name: "Ky thuat" });
		const plan = await gieoKeHoach();
		await gieoBaBuoc(plan.id, dep.id);

		await service.updateDepartment({ id: dep.id, name: "Ky thuat va Du lieu" });

		const steps = await db.onboardingStep.findMany({
			where: { planId: plan.id },
			include: { department: true },
		});

		expect(steps).toHaveLength(3);
		expect(steps.every((s) => s.departmentId === dep.id)).toBe(true);
		expect(
			steps.every((s) => s.department.name === "Ky thuat va Du lieu"),
		).toBe(true);
		expect(steps.some((s) => s.departmentId === null)).toBe(false);
	});

	test("doi-ten-bo-phan: luu tru mem khong cat bo phan khoi buoc", async () => {
		const service = await dungDichVu();
		const dep = await service.createDepartment({ name: "Van hanh" });
		const plan = await gieoKeHoach();
		await gieoBaBuoc(plan.id, dep.id);

		await service.archiveDepartment({ id: dep.id });

		const steps = await db.onboardingStep.findMany({
			where: { planId: plan.id },
			include: { department: true },
		});
		expect(steps).toHaveLength(3);
		expect(steps.every((s) => s.departmentId === dep.id)).toBe(true);
		const dau = steps[0];
		if (dau === undefined) throw new Error("khong co buoc nao");
		expect(dau.department.archivedAt).toBeInstanceOf(Date);

		const dangDung = await service.listDepartments();
		expect(dangDung.map((d) => d.id)).not.toContain(dep.id);
	});
});
