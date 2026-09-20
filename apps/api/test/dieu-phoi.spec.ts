import { describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { OnboardingService } from "../src/onboarding/onboarding.service";
import {
	batLoi,
	gieoBaBuoc,
	gieoCongTy,
	gieoKeHoach,
	gieoKeHoachVaCaNhan,
	gieoNguoi,
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

const baBuocKhuon = (departmentId: string) => [
	{ label: "Ky bien ban ban giao", departmentId, position: 0, offsetDays: 0 },
	{
		label: "Mo tai khoan cho moi gioi",
		departmentId,
		position: 1,
		offsetDays: 3,
	},
	{
		label: "Chuyen du lieu tin dang cu",
		departmentId,
		position: 2,
		offsetDays: 7,
	},
];

describe("tao ke hoach tu khuon", () => {
	test("chep-khong-tham-chieu: sua nhan trong khuon khong dong ke hoach dang chay", async () => {
		const service = await dungDichVu();
		const dep = await service.createDepartment({ name: "Van hanh" });
		const tpl = await service.createTemplate({
			name: "San moi gioi",
			partnerType: "moi-gioi",
			steps: baBuocKhuon(dep.id),
		});
		const congTy = await gieoCongTy();
		const nguoi = await gieoNguoi();

		const plan = await service.createFromTemplate({
			companyId: congTy.id,
			templateId: tpl.id,
			startedAt: new Date("2026-09-01T00:00:00.000Z"),
			ownerId: nguoi.id,
		});

		const nhanCu = baBuocKhuon(dep.id)[1]?.label;
		await service.updateTemplate({
			id: tpl.id,
			steps: baBuocKhuon(dep.id).map((b, i) =>
				i === 1 ? { ...b, label: "NHAN DA SUA TRONG KHUON" } : b,
			),
		});

		const steps = await db.onboardingStep.findMany({
			where: { planId: plan.id },
			orderBy: { position: "asc" },
		});

		expect(steps).toHaveLength(3);
		expect(steps[1]?.label).toBe(nhanCu);
		expect(steps[1]?.label).not.toBe("NHAN DA SUA TRONG KHUON");
	});

	test("buoc-chua-giao: van mang bo phan va van loc ra duoc", async () => {
		const service = await dungDichVu();
		const dep = await service.createDepartment({ name: "Ky thuat" });
		const tpl = await service.createTemplate({
			name: "San moi gioi",
			partnerType: null,
			steps: baBuocKhuon(dep.id),
		});
		const congTy = await gieoCongTy();
		const nguoi = await gieoNguoi();

		const plan = await service.createFromTemplate({
			companyId: congTy.id,
			templateId: tpl.id,
			startedAt: new Date(),
			ownerId: nguoi.id,
		});

		const step = await db.onboardingStep.findFirst({
			where: { planId: plan.id },
			orderBy: { position: "asc" },
		});
		if (step === null) throw new Error("khong co buoc nao duoc chep");
		expect(step.departmentId).toBe(dep.id);
		expect(step.assigneeId).toBeNull();

		const loc = await service.listSteps({
			planId: plan.id,
			departmentId: dep.id,
		});
		expect(loc.rows.map((r) => r.id)).toContain(step.id);
		expect(loc.total).toBe(3);

		const depKhac = await service.createDepartment({ name: "Dao tao" });
		const locKhac = await service.listSteps({
			planId: plan.id,
			departmentId: depKhac.id,
		});
		expect(locKhac.rows).toHaveLength(0);
		expect(locKhac.total).toBe(0);
	});

	test("nguoi-cam-trich: ownerId khac rong, cong thuc dem tra ve 1, thieu thi khong sinh hang", async () => {
		const service = await dungDichVu();
		const dep = await service.createDepartment({ name: "Van hanh" });
		const tpl = await service.createTemplate({
			name: "San moi gioi",
			partnerType: null,
			steps: baBuocKhuon(dep.id),
		});
		const congTy = await gieoCongTy();
		const nguoi = await gieoNguoi();

		const plan = await service.createFromTemplate({
			companyId: congTy.id,
			templateId: tpl.id,
			startedAt: new Date(),
			ownerId: nguoi.id,
		});

		const doc = await db.onboardingPlan.findUniqueOrThrow({
			where: { id: plan.id },
		});
		expect(doc.ownerId).toBe(nguoi.id);

		const dem = await db.onboardingPlan.count({
			where: { id: plan.id, ownerId: { not: "" }, steps: { some: {} } },
		});
		expect(dem).toBe(1);

		const truoc = await db.onboardingPlan.count();
		const loi = await batLoi(() =>
			service.createFromTemplate({
				companyId: congTy.id,
				templateId: tpl.id,
				startedAt: new Date(),
				ownerId: "",
			}),
		);
		expect(loi).toContain("người cầm trịch");
		expect(await db.onboardingPlan.count()).toBe(truoc);
	});

	test("chep-khong-tham-chieu: han suy tu ngay bat dau cong lech ngay cua khuon", async () => {
		const service = await dungDichVu();
		const dep = await service.createDepartment({ name: "Van hanh" });
		const tpl = await service.createTemplate({
			name: "San moi gioi",
			partnerType: null,
			steps: baBuocKhuon(dep.id),
		});
		const congTy = await gieoCongTy();
		const nguoi = await gieoNguoi();
		const batDau = new Date("2026-09-01T00:00:00.000Z");

		const plan = await service.createFromTemplate({
			companyId: congTy.id,
			templateId: tpl.id,
			startedAt: batDau,
			ownerId: nguoi.id,
		});

		const steps = await db.onboardingStep.findMany({
			where: { planId: plan.id },
			orderBy: { position: "asc" },
		});
		const ngay = 86_400_000;
		expect(steps[0]?.dueAt.getTime()).toBe(batDau.getTime());
		expect(steps[1]?.dueAt.getTime()).toBe(batDau.getTime() + 3 * ngay);
		expect(steps[2]?.dueAt.getTime()).toBe(batDau.getTime() + 7 * ngay);
	});
});
