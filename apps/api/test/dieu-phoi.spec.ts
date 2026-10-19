import { afterAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { OnboardingService } from "../src/onboarding/onboarding.service";
import { ToChucService } from "../src/to-chuc/to-chuc.service";
import {
	batLoi,
	donGieo,
	gieoBaBuoc,
	gieoCaNhan,
	gieoCongTy,
	gieoKeHoach,
	gieoKeHoachVaCaNhan,
	gieoNguoi,
} from "./dieu-phoi-gieo";

afterAll(donGieo);

async function dungDichVu(): Promise<OnboardingService> {
	return new OnboardingService(db);
}

const toChuc = new ToChucService(db);
let demPb = 0;
const tenRieng = (ten: string) =>
	`${ten} ${Date.now().toString(36)}-${++demPb}`;

async function taoPb(ten: string) {
	const { id } = await toChuc.createDepartment({
		name: tenRieng(ten),
		divisionId: null,
	});
	return db.department.findUniqueOrThrow({ where: { id } });
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
		const dep = await taoPb("Ky thuat");
		const plan = await gieoKeHoach();
		await gieoBaBuoc(plan.id, dep.id);

		const tenMoi = tenRieng("Ky thuat va Du lieu");
		await toChuc.renameDepartment({ id: dep.id, name: tenMoi });

		const steps = await db.onboardingStep.findMany({
			where: { planId: plan.id },
			include: { department: true },
		});

		expect(steps).toHaveLength(3);
		expect(steps.every((s) => s.departmentId === dep.id)).toBe(true);
		expect(steps.every((s) => s.department.name === tenMoi)).toBe(true);
		expect(steps.some((s) => s.departmentId === null)).toBe(false);
	});

	test("doi-ten-bo-phan: luu tru mem khong cat bo phan khoi buoc", async () => {
		const service = await dungDichVu();
		const dep = await taoPb("Van hanh");
		const plan = await gieoKeHoach();
		await gieoBaBuoc(plan.id, dep.id);

		await toChuc.archiveDepartment({ id: dep.id });

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
		const dep = await taoPb("Van hanh");
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
		const dep = await taoPb("Ky thuat");
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
		expect(step.assigneeId).toBe(nguoi.id);

		const loc = await service.listSteps({
			planId: plan.id,
			departmentId: dep.id,
		});
		expect(loc.rows.map((r) => r.id)).toContain(step.id);
		expect(loc.total).toBe(3);

		const depKhac = await taoPb("Dao tao");
		const locKhac = await service.listSteps({
			planId: plan.id,
			departmentId: depKhac.id,
		});
		expect(locKhac.rows).toHaveLength(0);
		expect(locKhac.total).toBe(0);
	});

	test("nguoi-cam-trich: ownerId khac rong, cong thuc dem tra ve 1, thieu thi khong sinh hang", async () => {
		const service = await dungDichVu();
		const dep = await taoPb("Van hanh");
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
		const dep = await taoPb("Van hanh");
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

async function gieoKeHoachCoBuoc(input: {
	service: Awaited<ReturnType<typeof dungDichVu>>;
	tenBoPhan: string;
	soBuocXong?: number;
	imNgay?: number;
}) {
	const dep = await taoPb(input.tenBoPhan);
	const tpl = await input.service.createTemplate({
		name: `Khuon ${input.tenBoPhan}`,
		partnerType: null,
		steps: baBuocKhuon(dep.id),
	});
	const congTy = await gieoCongTy();
	const nguoi = await gieoNguoi();
	const plan = await input.service.createFromTemplate({
		companyId: congTy.id,
		templateId: tpl.id,
		startedAt: new Date(Date.now() - 10 * 86_400_000),
		ownerId: nguoi.id,
	});

	const steps = await db.onboardingStep.findMany({
		where: { planId: plan.id },
		orderBy: { position: "asc" },
	});
	for (let i = 0; i < (input.soBuocXong ?? 0); i += 1) {
		const b = steps[i];
		if (b === undefined) continue;
		await db.onboardingStep.update({
			where: { id: b.id },
			data: { completedAt: new Date() },
		});
	}
	if (input.imNgay !== undefined) {
		await db.onboardingStep.updateMany({
			where: { planId: plan.id },
			data: { updatedAt: new Date(Date.now() - input.imNgay * 86_400_000) },
		});
	}
	return { plan, dep, steps };
}

describe("danh muc va vong doi", () => {
	test("danh-muc-loc: chi ke hoach khop, total nhat quan, so ngay im dung", async () => {
		const service = await dungDichVu();
		const a = await gieoKeHoachCoBuoc({
			service,
			tenBoPhan: "KT-A",
			imNgay: 9,
		});
		await gieoKeHoachCoBuoc({ service, tenBoPhan: "DT-B", imNgay: 1 });

		const kq = await service.listPlans({
			q: "",
			sort: "",
			dir: "asc",
			page: 1,
			pageSize: 25,
			status: "dang-chay",
			boPhan: [a.dep.id],
			nguoiCam: [],
			nguoiGiao: [],
		});

		expect(kq.rows).toHaveLength(1);
		expect(kq.total).toBe(1);
		expect(kq.rows[0]?.id).toBe(a.plan.id);
		expect(kq.rows[0]?.imNgay).toBe(9);
		expect(kq.facetCounts.boPhan?.[a.dep.id]).toBe(1);

		const depTrong = await taoPb("Khong co gi");
		const rong = await service.listPlans({
			q: "",
			sort: "",
			dir: "asc",
			page: 1,
			pageSize: 25,
			status: "dang-chay",
			boPhan: [depTrong.id],
			nguoiCam: [],
			nguoiGiao: [],
		});
		expect(rong.rows).toHaveLength(0);
		expect(rong.total).toBe(0);
	});

	test("bac-la-moc-ngay: danh dau ghi mot moc, go tra ve rong", async () => {
		const service = await dungDichVu();
		const plan = await gieoKeHoach();
		const ca = await gieoCaNhan();

		const e = await service.upsertEnrollment({
			planId: plan.id,
			contactId: ca.id,
			source: "tay",
		});
		expect(e.accountAt).toBeNull();

		const luc = new Date();
		await service.markEnrollmentStage({
			id: e.id,
			stage: "accountAt",
			at: luc,
		});
		const doc = await db.onboardingEnrollment.findUniqueOrThrow({
			where: { id: e.id },
		});
		expect(doc.accountAt).toBeInstanceOf(Date);
		expect(doc.accountAt?.getTime()).toBe(luc.getTime());

		await service.markEnrollmentStage({
			id: e.id,
			stage: "accountAt",
			at: null,
		});
		const sau = await db.onboardingEnrollment.findUniqueOrThrow({
			where: { id: e.id },
		});
		expect(sau.accountAt).toBeNull();
	});

	test("xoa-ghi-danh: hang di that, va bon moc bac di theo", async () => {
		const service = await dungDichVu();
		const plan = await gieoKeHoach();
		const ca = await gieoCaNhan();

		const e = await service.upsertEnrollment({
			planId: plan.id,
			contactId: ca.id,
			source: "nen-tang",
		});
		await service.markEnrollmentStage({
			id: e.id,
			stage: "accountAt",
			at: new Date(),
		});

		const kq = await service.removeEnrollment({
			planId: plan.id,
			contactId: ca.id,
		});
		expect(kq.id).toBe(e.id);

		const con = await db.onboardingEnrollment.findUnique({
			where: { id: e.id },
		});
		expect(con).toBeNull();
		expect(
			await db.onboardingEnrollment.count({ where: { planId: plan.id } }),
		).toBe(0);
	});

	test("xoa-ghi-danh: khong co hang thi bao khong thay, khong xoa nham cua ke hoach khac", async () => {
		const service = await dungDichVu();
		const [motBen, benKia] = await Promise.all([gieoKeHoach(), gieoKeHoach()]);
		const ca = await gieoCaNhan();

		await service.upsertEnrollment({
			planId: benKia.id,
			contactId: ca.id,
			source: "tay",
		});

		const loi = await batLoi(() =>
			service.removeEnrollment({ planId: motBen.id, contactId: ca.id }),
		);
		expect(loi).toContain(ca.id);
		expect(
			await db.onboardingEnrollment.count({ where: { planId: benKia.id } }),
		).toBe(1);
	});

	test("dong-ke-hoach: con buoc do van dong duoc va roi danh muc mac dinh", async () => {
		const service = await dungDichVu();
		const { plan, dep } = await gieoKeHoachCoBuoc({
			service,
			tenBoPhan: "VH-C",
			soBuocXong: 1,
		});

		await service.closePlan({ id: plan.id }, plan.ownerId);

		const doc = await db.onboardingPlan.findUniqueOrThrow({
			where: { id: plan.id },
		});
		expect(doc.closedAt).toBeInstanceOf(Date);

		const con = await db.onboardingStep.findMany({
			where: { planId: plan.id, completedAt: null },
		});
		expect(con).toHaveLength(2);

		const gocLoc = {
			q: "",
			sort: "",
			dir: "asc" as const,
			page: 1,
			pageSize: 25,
			boPhan: [dep.id],
			nguoiCam: [],
			nguoiGiao: [],
		};
		const macDinh = await service.listPlans({ ...gocLoc, status: "dang-chay" });
		expect(macDinh.rows.map((r) => r.id)).not.toContain(plan.id);

		const daDong = await service.listPlans({ ...gocLoc, status: "da-dong" });
		expect(daDong.rows.map((r) => r.id)).toContain(plan.id);
	});
});

describe("man danh muc", () => {
	const gocLoc = {
		q: "",
		sort: "",
		dir: "asc" as const,
		page: 1,
		pageSize: 25,
		status: "dang-chay" as const,
		boPhan: [],
		nguoiCam: [],
		nguoiGiao: [],
	};

	test("chua-co-khuon: DB khong con khuon nao thi man noi rieng, khong phai rong thuong", async () => {
		const service = await dungDichVu();

		const conKhuon = await db.onboardingTemplate.findMany({
			where: { archivedAt: null },
			select: { id: true },
		});
		for (const k of conKhuon) await service.archiveTemplate({ id: k.id });
		await db.onboardingPlan.deleteMany({});

		const rong = await service.manDanhMuc(gocLoc);

		expect(rong.soKhuon).toBe(0);
		expect(rong.rows).toHaveLength(0);
		expect(rong.trangThai).toBe("ST-danhmuc-chuacokhuon");

		const dep = await taoPb("Co khuon roi");
		await service.createTemplate({
			name: "Khuon dau tien",
			partnerType: null,
			steps: baBuocKhuon(dep.id),
		});

		const coKhuon = await service.manDanhMuc(gocLoc);
		expect(coKhuon.soKhuon).toBe(1);
		expect(coKhuon.rows).toHaveLength(0);
		expect(coKhuon.trangThai).toBe("ST-danhmuc-empty");
	});

	test("chua-co-khuon: co ke hoach thi trang thai la co du lieu", async () => {
		const service = await dungDichVu();
		const { dep } = await gieoKeHoachCoBuoc({ service, tenBoPhan: "MDM-A" });

		const kq = await service.manDanhMuc({ ...gocLoc, boPhan: [dep.id] });
		expect(kq.rows.length).toBeGreaterThan(0);
		expect(kq.trangThai).toBe("ST-danhmuc-codulieu");
	});
});
