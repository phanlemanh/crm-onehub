import { describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { batLoi, gieoKeHoachVaCaNhan } from "./dieu-phoi-gieo";

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
