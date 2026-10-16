import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import type { INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import {
	enrollmentUpsertInput,
	templateCreateInput,
} from "../src/onboarding/onboarding.contracts";
import { OnboardingService } from "../src/onboarding/onboarding.service";
import { orgDepartmentCreateInput } from "../src/to-chuc/to-chuc.contracts";
import { ToChucService } from "../src/to-chuc/to-chuc.service";
import { TO_CHUC } from "../src/to-chuc/to-chuc-config";
import { batLoi } from "./dieu-phoi-gieo";
import { gieoThanhVien, mintPhien } from "./phien-thu";

const TIEN_TO = "nbn";

let dem = 0;

function ma(phan: string): string {
	dem += 1;
	return `${TIEN_TO}-${phan}-${Date.now().toString(36)}-${dem}`;
}

function quaJson<T>(giaTri: T): unknown {
	return JSON.parse(JSON.stringify(giaTri));
}

const daGieo = {
	nguoi: [] as string[],
	phien: [] as string[],
	boPhan: [] as string[],
	khuon: [] as string[],
};

const service = new OnboardingService(db);
const toChuc = new ToChucService(db);

async function gieoNguoi(): Promise<string> {
	const id = ma("u");
	await db.user.create({
		data: { id, name: "Nguoi thu", email: `${id}@thu.test` },
	});
	daGieo.nguoi.push(id);
	return id;
}

async function gieoBoPhan(): Promise<string> {
	const bp = await toChuc.createDepartment({
		name: ma("Bo phan"),
		divisionId: null,
	});
	daGieo.boPhan.push(bp.id);
	return bp.id;
}

async function phienCua(userId: string): Promise<string> {
	await gieoThanhVien(userId, "member");
	const phien = await mintPhien(userId);
	daGieo.phien.push(phien.token);
	return phien.cookie;
}

function ngayLichUtc(d: Date): string {
	return d.toISOString().slice(0, 10);
}

let app: INestApplication;

beforeAll(async () => {
	const { AppModule } = await import("../src/app.module");
	const modul: TestingModule = await Test.createTestingModule({
		imports: [AppModule],
	}).compile();
	app = modul.createNestApplication({ bodyParser: false });
	await app.init();
});

afterAll(async () => {
	await app.close();
	await db.onboardingPlan.deleteMany({
		where: { company: { name: { startsWith: TIEN_TO } } },
	});
	await db.contact.deleteMany({
		where: { firstName: { startsWith: TIEN_TO } },
	});
	await db.company.deleteMany({ where: { name: { startsWith: TIEN_TO } } });
	await db.onboardingTemplate.deleteMany({
		where: { id: { in: daGieo.khuon } },
	});
	await db.session.deleteMany({ where: { token: { in: daGieo.phien } } });
	await db.viec.deleteMany({
		where: {
			OR: [
				{ taoBoiId: { in: daGieo.nguoi } },
				{ nguoiGiaoId: { in: daGieo.nguoi } },
				{ nguoiThucHienId: { in: daGieo.nguoi } },
			],
		},
	});
	await db.member.deleteMany({ where: { userId: { in: daGieo.nguoi } } });
	await db.user.deleteMany({ where: { id: { in: daGieo.nguoi } } });
	await db.department.deleteMany({ where: { id: { in: daGieo.boPhan } } });
});

describe("ghi-bo-phan", () => {
	test("ghi-bo-phan: dau vao qua JSON va schema that ghi dung mot bo phan", async () => {
		const ten = ma("Kinh doanh");
		const input = orgDepartmentCreateInput.parse(
			quaJson({ name: ten, divisionId: null }),
		);
		const bp = await toChuc.createDepartment(input);
		daGieo.boPhan.push(bp.id);

		const hang = await db.department.findMany({ where: { name: ten } });
		expect(hang.map((h) => h.name)).toEqual([ten]);

		const trong = { name: { in: ["", "  "] } };
		const truoc = await db.department.count({ where: trong });
		const loi = await batLoi(async () =>
			toChuc.createDepartment(
				orgDepartmentCreateInput.parse(
					quaJson({ name: "  ", divisionId: null }),
				),
			),
		);
		expect(loi).toBe(`BadRequestException: ${TO_CHUC.thongDiep.tenTrong}`);
		expect(await db.department.count({ where: trong })).toBe(truoc);
	});
});

describe("ghi-khuon", () => {
	const CA = [
		{ ten: "co loai doi tac", partnerType: "San moi gioi" },
		{ ten: "loai doi tac null", partnerType: null },
	] as const;

	test("ghi-khuon: hai ca, khuon ghi dung ten, loai doi tac va thu tu buoc", async () => {
		const [a, b] = [await gieoBoPhan(), await gieoBoPhan()];
		let soCa = 0;
		for (const ca of CA) {
			const tenKhuon = ma("Khuon");
			const buoc = [
				{ label: "Ky hop dong", departmentId: a, position: 0, offsetDays: 0 },
				{ label: "Dao tao", departmentId: b, position: 1, offsetDays: 7 },
			];
			const input = templateCreateInput.parse(
				quaJson({ name: tenKhuon, partnerType: ca.partnerType, steps: buoc }),
			);
			const khuon = await service.createTemplate(input);
			daGieo.khuon.push(khuon.id);

			const doc = await db.onboardingTemplate.findUniqueOrThrow({
				where: { id: khuon.id },
			});
			expect(`${ca.ten}: ${doc.name} | ${doc.partnerType}`).toBe(
				`${ca.ten}: ${tenKhuon} | ${ca.partnerType}`,
			);
			expect(doc.steps).toEqual(buoc);
			soCa += 1;
		}
		expect(soCa).toBe(2);

		const loi = await batLoi(async () =>
			templateCreateInput.parse(
				quaJson({ name: "x", partnerType: null, steps: [] }),
			),
		);
		expect(loi).toContain("steps");
	});
});

describe("ghi-ke-hoach-json", () => {
	test("ghi-ke-hoach-json: HTTP that toi thu tuc tao ke hoach, ngay lich dung, buoc chep tu khuon", async () => {
		const nguoi = await gieoNguoi();
		const cookie = await phienCua(nguoi);
		const [a, b] = [await gieoBoPhan(), await gieoBoPhan()];
		const buocKhuon = [
			{ label: "Ky hop dong", departmentId: a, position: 0, offsetDays: 0 },
			{ label: "Dao tao", departmentId: b, position: 1, offsetDays: 7 },
		];
		const khuon = await service.createTemplate({
			name: ma("Khuon"),
			partnerType: null,
			steps: buocKhuon,
		});
		daGieo.khuon.push(khuon.id);
		const congTy = await db.company.create({ data: { name: ma("Cong ty") } });
		const ngay = "2026-09-21";

		const traLoi = await request(app.getHttpServer())
			.post("/api/trpc/onboarding.createFromTemplate")
			.set("cookie", cookie)
			.set("content-type", "application/json")
			.send(
				JSON.stringify({
					companyId: congTy.id,
					templateId: khuon.id,
					startedAt: ngay,
					ownerId: nguoi,
				}),
			);
		expect(
			`HTTP ${traLoi.status} ${JSON.stringify(traLoi.body).slice(0, 200)}`,
		).toStartWith("HTTP 200");

		const keHoach = await db.onboardingPlan.findMany({
			where: { companyId: congTy.id },
			include: { steps: { orderBy: { position: "asc" } } },
		});
		expect(keHoach).toHaveLength(1);
		const kh = keHoach[0];
		if (!kh) throw new Error("khong co ke hoach");
		expect(`startedAt ${ngayLichUtc(kh.startedAt)}`).toBe(`startedAt ${ngay}`);
		expect(
			`buoc 0 den han ${ngayLichUtc(kh.steps[0]?.dueAt ?? new Date(0))}`,
		).toBe(`buoc 0 den han ${ngay}`);
		expect(`${kh.companyId}|${kh.templateId}|${kh.ownerId}`).toBe(
			`${congTy.id}|${khuon.id}|${nguoi}`,
		);
		expect(
			`so buoc ${kh.steps.length}: ${kh.steps.map((s) => s.label).join(",")}`,
		).toBe(
			`so buoc ${buocKhuon.length}: ${buocKhuon.map((s) => s.label).join(",")}`,
		);
	});
});

describe("ghi-danh", () => {
	test("ghi-danh: dau vao qua JSON va schema that ghi mot ghi danh nguon tay", async () => {
		const nguoi = await gieoNguoi();
		const congTy = await db.company.create({ data: { name: ma("Cong ty") } });
		const plan = await db.onboardingPlan.create({
			data: {
				companyId: congTy.id,
				ownerId: nguoi,
				startedAt: new Date(),
				targetDays: 30,
			},
		});
		const caNhan = await db.contact.create({
			data: { firstName: ma("Ca nhan") },
		});

		const input = enrollmentUpsertInput.parse(
			quaJson({ planId: plan.id, contactId: caNhan.id, source: "tay" }),
		);
		await service.upsertEnrollment(input);

		const hang = await db.onboardingEnrollment.findMany({
			where: { planId: plan.id },
		});
		expect(
			hang.map(
				(h) =>
					`${h.contactId}|${h.source}|${h.accountAt}|${h.courseAt}|${h.activeAt}|${h.dealAt}`,
			),
		).toEqual([`${caNhan.id}|tay|null|null|null|null`]);

		const loi = await batLoi(async () =>
			enrollmentUpsertInput.parse(quaJson({ planId: plan.id, contactId: "" })),
		);
		expect(loi).toContain("contactId");
	});
});
