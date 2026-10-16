import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { DEFAULT_WORKSPACE_NAME, WORKSPACE_ID } from "@crm/auth";
import { db } from "@crm/db";
import { workspaceSlug } from "@crm/db/workspace";
import { parseOnboardingActivityMeta } from "@crm/validation/onboarding-activity";
import type { HttpException } from "@nestjs/common";
import { ActivitiesService } from "../src/activities/activities.service";
import type { AgentQueueService } from "../src/agent/agent-queue.service";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { CompaniesService } from "../src/companies/companies.service";
import type { FaviconService } from "../src/companies/favicon.service";
import { ActivityStampService } from "../src/crm/activity-stamp.service";
import type { ConversionService } from "../src/currency/conversion.service";
import type { FieldsService } from "../src/fields/fields.service";
import {
	type PlanListInput,
	stepAssignInput,
	stepDoneInput,
	stepRescheduleInput,
} from "../src/onboarding/onboarding.contracts";
import { OnboardingService } from "../src/onboarding/onboarding.service";
import { ONBOARDING } from "../src/onboarding/onboarding-config";
import { withDiscardedCrmEvents } from "./agent-trigger.stub";
import payload from "./fixtures/ke-hoach-payload.json";

const DAY_MS = 24 * 60 * 60 * 1000;

const TIEN_TO = "khbg";

const daGieo = { nguoi: [] as string[], boPhan: [] as string[] };

let demToken = 0;

function token(): string {
	demToken += 1;
	return `${TIEN_TO}${Date.now().toString(36)}x${demToken}`;
}

beforeAll(async () => {
	await db.organization.upsert({
		where: { id: WORKSPACE_ID },
		update: {},
		create: {
			id: WORKSPACE_ID,
			name: DEFAULT_WORKSPACE_NAME,
			slug: workspaceSlug(DEFAULT_WORKSPACE_NAME),
			createdAt: new Date(),
		},
	});
});

afterAll(async () => {
	await db.activity.deleteMany({
		where: {
			OR: [
				{ plan: { company: { name: { startsWith: TIEN_TO } } } },
				{ createdById: { in: daGieo.nguoi } },
			],
		},
	});
	await db.onboardingPlan.deleteMany({
		where: { company: { name: { startsWith: TIEN_TO } } },
	});
	await db.contact.deleteMany({
		where: { firstName: { startsWith: TIEN_TO } },
	});
	await db.company.deleteMany({ where: { name: { startsWith: TIEN_TO } } });
	await db.member.deleteMany({ where: { userId: { in: daGieo.nguoi } } });
	await db.viec.deleteMany({
		where: {
			OR: [
				{ taoBoiId: { in: daGieo.nguoi } },
				{ nguoiGiaoId: { in: daGieo.nguoi } },
				{ nguoiThucHienId: { in: daGieo.nguoi } },
			],
		},
	});
	await db.user.deleteMany({ where: { id: { in: daGieo.nguoi } } });
	await db.department.deleteMany({ where: { id: { in: daGieo.boPhan } } });
});

export function dichVu(): OnboardingService {
	return new OnboardingService(db);
}

export async function gieoThanhVien(ten?: string) {
	const id = token();
	const nguoi = await db.user.create({
		data: { id, name: ten ?? `Nguoi ${id}`, email: `${id}@thu.test` },
	});
	await db.member.create({
		data: {
			id: `m-${id}`,
			organizationId: WORKSPACE_ID,
			userId: id,
			role: "member",
			createdAt: new Date(),
		},
	});
	daGieo.nguoi.push(id);
	return nguoi;
}

export async function gieoBoPhan() {
	const boPhan = await db.department.create({
		data: { name: token(), position: 0 },
	});
	daGieo.boPhan.push(boPhan.id);
	return boPhan;
}

type BuocGieo = {
	label: string;
	departmentId: string;
	xong?: boolean;
	nguoi?: string;
	han?: Date;
};

export async function gieoKeHoach(input: {
	ownerId: string;
	buoc: BuocGieo[];
	dong?: boolean;
	imNgay?: number;
}) {
	const congTy = await db.company.create({ data: { name: token() } });
	const plan = await db.onboardingPlan.create({
		data: {
			companyId: congTy.id,
			ownerId: input.ownerId,
			startedAt: new Date(Date.now() - 3 * DAY_MS),
			targetDays: 30,
			closedAt: input.dong ? new Date() : null,
		},
	});
	await db.onboardingStep.createMany({
		data: input.buoc.map((b, i) => ({
			planId: plan.id,
			label: b.label,
			departmentId: b.departmentId,
			assigneeId: b.nguoi ?? null,
			dueAt: b.han ?? new Date("2026-09-22T00:00:00.000Z"),
			completedAt: b.xong ? new Date() : null,
			position: i,
		})),
	});
	if (input.imNgay !== undefined) {
		await db.onboardingStep.updateMany({
			where: { planId: plan.id },
			data: { updatedAt: new Date(Date.now() - input.imNgay * DAY_MS) },
		});
	}
	return { plan, congTy };
}

export async function buocCua(planId: string) {
	return db.onboardingStep.findMany({
		where: { planId },
		orderBy: { position: "asc" },
	});
}

export async function vetCua(planId: string) {
	return db.activity.findMany({
		where: { planId },
		orderBy: [{ createdAt: "asc" }, { id: "asc" }],
	});
}

function phan<T>(ds: T[], i: number): T {
	const gia = ds.at(i);
	if (gia === undefined) {
		throw new Error(
			`khong co phan tu thu ${i} trong danh sach ${ds.length} phan tu`,
		);
	}
	return gia;
}

function loc(q: string): PlanListInput {
	return {
		q,
		sort: "",
		dir: "asc",
		page: 1,
		pageSize: ONBOARDING.danhMuc.pageSize,
		status: "tat-ca",
		boPhan: [],
		nguoiCam: [],
		nguoiGiao: [],
	};
}

async function batHttp(
	chay: () => Promise<unknown>,
	ten = "lenh",
): Promise<HttpException> {
	try {
		await chay();
	} catch (loi) {
		return loi as HttpException;
	}
	throw new Error(
		`${ten}: mong 409 — mong doi mot loi HTTP, nhung lenh chay tron ven`,
	);
}

describe("giao-buoc", () => {
	test("giao-buoc: doc lai thay nguoi, vet buoc.giao mang nguoi bam", async () => {
		const [O, A, B] = [
			await gieoThanhVien(),
			await gieoThanhVien(),
			await gieoThanhVien(),
		];
		const bp = await gieoBoPhan();
		const { plan } = await gieoKeHoach({
			ownerId: O.id,
			buoc: [{ label: "Dao tao", departmentId: bp.id }],
			imNgay: 2,
		});
		const truoc = phan(await buocCua(plan.id), 0);

		await dichVu().assignStep({ stepId: truoc.id, assigneeId: A.id }, B.id);

		const sau = phan(await buocCua(plan.id), 0);
		const vet = await vetCua(plan.id);
		expect(sau.assigneeId).toBe(A.id);
		expect(sau.updatedAt.getTime()).toBeGreaterThan(truoc.updatedAt.getTime());
		expect(vet.length, "buoc.giao: so vet mong 1").toBe(1);
		expect(phan(vet, 0).type).toBe("PLAN_CHANGE");
		expect(parseOnboardingActivityMeta(phan(vet, 0).meta)).toMatchObject({
			kind: "buoc.giao",
			stepId: truoc.id,
			tu: null,
			den: A.id,
		});
		expect(
			phan(vet, 0).createdById,
			`mong ${B.id} / nhan ${phan(vet, 0).createdById}`,
		).toBe(B.id);

		await dichVu().assignStep({ stepId: truoc.id, assigneeId: B.id }, B.id);
		const lan2 = await vetCua(plan.id);
		expect(parseOnboardingActivityMeta(phan(lan2, 1).meta)).toMatchObject({
			kind: "buoc.giao",
			tu: A.id,
			den: B.id,
		});
	});
});

describe("xong-lam-song-danh-muc", () => {
	test("xong-lam-song-danh-muc: danh dau xong thi Buoc tang va Im lang ve 0", async () => {
		const [O, B] = [await gieoThanhVien(), await gieoThanhVien()];
		const bp = await gieoBoPhan();
		const { plan, congTy } = await gieoKeHoach({
			ownerId: O.id,
			buoc: ["Kickoff", "Tai khoan", "Dao tao", "Giao dich"].map((label) => ({
				label,
				departmentId: bp.id,
			})),
			imNgay: 5,
		});
		const hangCua = async () =>
			(await dichVu().manDanhMuc(loc(congTy.name))).rows.find(
				(r) => r.id === plan.id,
			);

		const truoc = await hangCua();
		expect(truoc?.buocXong).toBe(0);
		expect(truoc?.imNgay).toBe(5);

		const dau = phan(await buocCua(plan.id), 0);
		await dichVu().setStepDone({ stepId: dau.id, done: true }, B.id);

		const sau = await hangCua();
		expect(sau?.buocXong).toBe(1);
		expect(sau?.buocTong).toBe(4);
		expect(sau?.imNgay, "imNgay mong doi 0").toBe(0);
		const doc = phan(await buocCua(plan.id), 0);
		expect(doc.completedAt).not.toBeNull();
		const vet = await vetCua(plan.id);
		expect(vet.at(-1)?.createdById).toBe(B.id);
		expect(parseOnboardingActivityMeta(vet.at(-1)?.meta).kind).toBe(
			"buoc.xong",
		);

		await dichVu().setStepDone({ stepId: dau.id, done: false }, B.id);
		const lui = phan(await buocCua(plan.id), 0);
		expect(lui.completedAt).toBeNull();
		expect((await hangCua())?.buocXong).toBe(0);
		expect(
			parseOnboardingActivityMeta((await vetCua(plan.id)).at(-1)?.meta).kind,
		).toBe("buoc.boXong");
	});
});

describe("doi-han", () => {
	test("doi-han: doc lai han moi, vet mang ngay cu va ngay moi dang ngay", async () => {
		const O = await gieoThanhVien();
		const bp = await gieoBoPhan();
		const { plan } = await gieoKeHoach({
			ownerId: O.id,
			buoc: [
				{
					label: "Kickoff",
					departmentId: bp.id,
					han: new Date("2026-09-22T00:00:00.000Z"),
				},
			],
		});
		const buoc = phan(await buocCua(plan.id), 0);

		await dichVu().rescheduleStep(
			{ stepId: buoc.id, dueAt: new Date("2026-09-25T00:00:00.000Z") },
			O.id,
		);

		const sau = phan(await buocCua(plan.id), 0);
		expect(sau.dueAt.toISOString().slice(0, 10)).toBe("2026-09-25");
		const vet = await vetCua(plan.id);
		const meta = parseOnboardingActivityMeta(phan(vet, 0).meta);
		expect(meta, "doiHan: mong tu 2026-09-22 den 2026-09-25").toMatchObject({
			kind: "buoc.doiHan",
			tu: "2026-09-22",
			den: "2026-09-25",
		});

		await dichVu().rescheduleStep(
			{ stepId: buoc.id, dueAt: new Date("2026-09-25T00:00:00.000Z") },
			O.id,
		);
		expect((await vetCua(plan.id)).length).toBe(1);
	});
});

describe("them-bo-buoc", () => {
	test("them-bo-buoc: tap buoc dung, moi thao tac mot vet, vet bo con doc duoc", async () => {
		const O = await gieoThanhVien();
		const bp = await gieoBoPhan();
		const { plan } = await gieoKeHoach({
			ownerId: O.id,
			buoc: ["X", "Y", "Z"].map((label) => ({ label, departmentId: bp.id })),
		});
		const y = phan(await buocCua(plan.id), 1);

		const w = await dichVu().addStep(
			{
				planId: plan.id,
				label: "W",
				departmentId: bp.id,
				dueAt: new Date("2026-09-30T00:00:00.000Z"),
			},
			O.id,
		);
		await dichVu().removeStep({ stepId: y.id }, O.id);

		const con = await buocCua(plan.id);
		const nhan = con.map((b) => b.label).sort();
		expect(nhan).toEqual(["W", "X", "Z"]);
		expect(nhan.length).toBe(3);
		expect(con.find((b) => b.label === "W")?.position).toBe(
			Math.max(...con.map((b) => b.position)),
		);
		expect(w.label).toBe("W");
		const meta = (await vetCua(plan.id)).map((v) =>
			parseOnboardingActivityMeta(v.meta),
		);
		expect(meta.filter((m) => m.kind === "buoc.them")).toEqual([
			{ kind: "buoc.them", stepId: w.id, nhan: "W" },
		]);
		expect(
			meta.filter((m) => m.kind === "buoc.bo"),
			"buoc.bo mat vet",
		).toEqual([{ kind: "buoc.bo", stepId: y.id, nhan: "Y" }]);

		const khac = await gieoKeHoach({
			ownerId: O.id,
			buoc: [{ label: "K", departmentId: bp.id }],
		});
		const k = phan(await buocCua(khac.plan.id), 0);
		await dichVu().removeStep({ stepId: k.id }, O.id);
		expect((await buocCua(plan.id)).length).toBe(3);
	});
});

describe("sap-lai", () => {
	test("sap-lai: tap sai bi tu choi va thu tu khong doi, tap dung duoc luu", async () => {
		const O = await gieoThanhVien();
		const bp = await gieoBoPhan();
		const { plan: P } = await gieoKeHoach({
			ownerId: O.id,
			buoc: ["A", "B", "C"].map((label) => ({ label, departmentId: bp.id })),
		});
		const { plan: Q } = await gieoKeHoach({
			ownerId: O.id,
			buoc: [{ label: "D", departmentId: bp.id }],
		});
		const cuaP = await buocCua(P.id);
		const [a, b, c] = [phan(cuaP, 0), phan(cuaP, 1), phan(cuaP, 2)];
		const d = phan(await buocCua(Q.id), 0);
		const thuTu = async () => (await buocCua(P.id)).map((x) => x.label);

		const thieu = await batHttp(() =>
			dichVu().reorderSteps({ planId: P.id, stepIds: [c.id, a.id] }),
		);
		expect(thieu.getStatus()).toBe(400);
		expect(await thuTu(), "thieu: thu tu mong A B C").toEqual(["A", "B", "C"]);

		const lan = await batHttp(() =>
			dichVu().reorderSteps({ planId: P.id, stepIds: [c.id, a.id, d.id] }),
		);
		expect(lan.getStatus()).toBe(400);
		expect(await thuTu(), "lan: thu tu mong A B C").toEqual(["A", "B", "C"]);

		const trung = await batHttp(() =>
			dichVu().reorderSteps({ planId: P.id, stepIds: [c.id, a.id, a.id] }),
		);
		expect(trung.getStatus()).toBe(400);
		expect(await thuTu(), "trung: thu tu mong A B C").toEqual(["A", "B", "C"]);

		await dichVu().reorderSteps({ planId: P.id, stepIds: [c.id, a.id, b.id] });
		expect(await thuTu()).toEqual(["C", "A", "B"]);
	});
});

describe("doi-cam-trich", () => {
	test("doi-cam-trich: doc lai nguoi moi, chi vet keHoach mang cong ty", async () => {
		const [A, B] = [await gieoThanhVien(), await gieoThanhVien()];
		const bp = await gieoBoPhan();
		const { plan, congTy } = await gieoKeHoach({
			ownerId: A.id,
			buoc: [{ label: "Kickoff", departmentId: bp.id }],
		});
		const buoc = phan(await buocCua(plan.id), 0);
		await dichVu().assignStep({ stepId: buoc.id, assigneeId: B.id }, A.id);

		await dichVu().setPlanOwner({ planId: plan.id, ownerId: B.id }, A.id);

		const doc = await db.onboardingPlan.findUniqueOrThrow({
			where: { id: plan.id },
		});
		expect(doc.ownerId).toBe(B.id);
		const vet = await vetCua(plan.id);
		const doi = vet.find(
			(v) => parseOnboardingActivityMeta(v.meta).kind === "keHoach.doiCamTrich",
		);
		expect(parseOnboardingActivityMeta(doi?.meta)).toMatchObject({
			tu: A.id,
			den: B.id,
		});
		expect(doi?.companyId).toBe(congTy.id);
		const vetBuoc = vet.filter((v) =>
			parseOnboardingActivityMeta(v.meta).kind.startsWith("buoc."),
		);
		expect(vetBuoc.length).toBeGreaterThan(0);
		expect(
			vetBuoc.filter((v) => v.companyId !== null).length,
			"so vet buoc.* mang companyId",
		).toBe(0);
	});
});

describe("thao-tac-rong", () => {
	test("thao-tac-rong: giao lai dung nguoi va tich lai buoc xong khong ghi gi", async () => {
		const [O, A, B] = [
			await gieoThanhVien(),
			await gieoThanhVien(),
			await gieoThanhVien(),
		];
		const bp = await gieoBoPhan();
		const { plan } = await gieoKeHoach({
			ownerId: O.id,
			buoc: [
				{ label: "Kickoff", departmentId: bp.id, nguoi: A.id, xong: true },
			],
			imNgay: 3,
		});
		const truoc = phan(await buocCua(plan.id), 0);
		const soVet = (await vetCua(plan.id)).length;

		await dichVu().assignStep({ stepId: truoc.id, assigneeId: A.id }, O.id);
		await dichVu().setStepDone({ stepId: truoc.id, done: true }, O.id);

		const sau = phan(await buocCua(plan.id), 0);
		expect((await vetCua(plan.id)).length, "thao tac rong: so vet doi").toBe(
			soVet,
		);
		expect(sau.updatedAt.getTime(), "thao tac rong: updatedAt doi").toBe(
			truoc.updatedAt.getTime(),
		);

		await dichVu().assignStep({ stepId: truoc.id, assigneeId: B.id }, O.id);
		const doi = phan(await buocCua(plan.id), 0);
		expect((await vetCua(plan.id)).length).toBe(soVet + 1);
		expect(doi.updatedAt.getTime()).toBeGreaterThan(truoc.updatedAt.getTime());
	});
});

describe("dong-la-chi-doc", () => {
	test("dong-la-chi-doc: moi thu tuc ghi tren ke hoach dong tra 409 va khong ghi gi", async () => {
		const [O, A] = [await gieoThanhVien(), await gieoThanhVien()];
		const bp = await gieoBoPhan();
		const { plan } = await gieoKeHoach({
			ownerId: O.id,
			buoc: ["A", "B", "C"].map((label) => ({ label, departmentId: bp.id })),
			dong: true,
		});
		const buoc = await buocCua(plan.id);
		const chup = async () => ({
			buoc: (await buocCua(plan.id)).map((b) => ({ ...b })),
			vet: (await vetCua(plan.id)).length,
			owner: (
				await db.onboardingPlan.findUniqueOrThrow({ where: { id: plan.id } })
			).ownerId,
		});
		const truoc = await chup();
		const s = dichVu();

		const MA_TRAN: [string, () => Promise<unknown>][] = [
			[
				"assignStep",
				() =>
					s.assignStep({ stepId: phan(buoc, 0).id, assigneeId: A.id }, O.id),
			],
			[
				"setStepDone",
				() => s.setStepDone({ stepId: phan(buoc, 0).id, done: true }, O.id),
			],
			[
				"rescheduleStep",
				() =>
					s.rescheduleStep(
						{
							stepId: phan(buoc, 0).id,
							dueAt: new Date("2026-10-01T00:00:00.000Z"),
						},
						O.id,
					),
			],
			[
				"addStep",
				() =>
					s.addStep(
						{
							planId: plan.id,
							label: "W",
							departmentId: bp.id,
							dueAt: new Date("2026-10-01T00:00:00.000Z"),
						},
						O.id,
					),
			],
			["removeStep", () => s.removeStep({ stepId: phan(buoc, 1).id }, O.id)],
			[
				"reorderSteps",
				() =>
					s.reorderSteps({
						planId: plan.id,
						stepIds: [phan(buoc, 2).id, phan(buoc, 1).id, phan(buoc, 0).id],
					}),
			],
			[
				"setPlanOwner",
				() => s.setPlanOwner({ planId: plan.id, ownerId: A.id }, O.id),
			],
		];
		expect(MA_TRAN.length).toBe(7);

		for (const [ten, chay] of MA_TRAN) {
			const loi = await batHttp(chay, ten);
			expect(loi.getStatus?.(), `${ten}: mong 409`).toBe(409);
			expect(loi.message, `${ten}: thong diep`).toBe(
				"Kế hoạch đã đóng — mở lại trước khi sửa.",
			);
		}

		expect(await chup()).toEqual(truoc);

		await s.reopenPlan({ id: plan.id }, O.id);
		await s.assignStep({ stepId: phan(buoc, 0).id, assigneeId: A.id }, O.id);
		expect(phan(await buocCua(plan.id), 0).assigneeId).toBe(A.id);
	});
});

describe("go-dung-nguoi", () => {
	test("go-dung-nguoi: go nguoi thu hai, nguoi thu nhat con nguyen", async () => {
		const O = await gieoThanhVien();
		const bp = await gieoBoPhan();
		const { plan } = await gieoKeHoach({
			ownerId: O.id,
			buoc: [{ label: "Kickoff", departmentId: bp.id }],
		});
		const [c1, c2] = await Promise.all([
			db.contact.create({ data: { firstName: `${TIEN_TO}-mot` } }),
			db.contact.create({ data: { firstName: `${TIEN_TO}-hai` } }),
		]);
		await db.onboardingEnrollment.createMany({
			data: [c1, c2].map((c) => ({
				planId: plan.id,
				contactId: c.id,
				source: "tay",
			})),
		});

		await dichVu().removeEnrollment({ planId: plan.id, contactId: c2.id });

		const con = await db.onboardingEnrollment.findMany({
			where: { planId: plan.id },
		});
		expect(
			con.map((e) => e.contactId),
			`nguoi 1 ${c1.id} phai con`,
		).toEqual([c1.id]);

		const lan2 = await batHttp(() =>
			dichVu().removeEnrollment({ planId: plan.id, contactId: c2.id }),
		);
		expect(lan2.getStatus()).toBe(404);
		expect(
			(await db.onboardingEnrollment.findMany({ where: { planId: plan.id } }))
				.length,
		).toBe(1);
	});
});

const stamp = new ActivityStampService(db);

function hoatDong(): ActivitiesService {
	return new ActivitiesService(db, stamp);
}

function congTyDichVu(): CompaniesService {
	return new CompaniesService(
		db,
		{ withCrmEvents: withDiscardedCrmEvents } as unknown as AgentTriggerService,
		{} as unknown as AgentQueueService,
		{ backfill: async () => undefined } as unknown as FaviconService,
		stamp,
		{} as unknown as ConversionService,
		{} as unknown as FieldsService,
	);
}

describe("ghi-chu-hai-dong-thoi-gian", () => {
	test("ghi-chu-hai-dong-thoi-gian: ghi chu chi mang planId hien o ke hoach va cong ty, vet buoc thi khong", async () => {
		const [O, A] = [await gieoThanhVien(), await gieoThanhVien()];
		const bp = await gieoBoPhan();
		const { plan, congTy } = await gieoKeHoach({
			ownerId: O.id,
			buoc: [{ label: "Kickoff", departmentId: bp.id }],
		});
		const buoc = phan(await buocCua(plan.id), 0);
		await dichVu().assignStep({ stepId: buoc.id, assigneeId: A.id }, O.id);
		const vetBuoc = phan(await vetCua(plan.id), 0);

		const ghiChu = await hoatDong().create(
			{ type: "NOTE", body: "Hen goi lai thu Sau", planId: plan.id },
			O.id,
		);

		const doc = await db.activity.findUniqueOrThrow({
			where: { id: ghiChu.id },
		});
		expect(doc.planId).toBe(plan.id);
		expect(doc.companyId, `ghi chu ${ghiChu.id} vang mat o cong ty`).toBe(
			congTy.id,
		);

		const theoKeHoach = await hoatDong().timeline({
			planId: plan.id,
			filter: "all",
			limit: 30,
		});
		const theoCongTy = await hoatDong().timeline({
			companyId: congTy.id,
			filter: "all",
			limit: 30,
		});
		const idKeHoach = theoKeHoach.entries.map((e) => e.id);
		const idCongTy = theoCongTy.entries.map((e) => e.id);
		expect(idKeHoach).toContain(ghiChu.id);
		expect(idCongTy, `ghi chu ${ghiChu.id} vang mat o cong ty`).toContain(
			ghiChu.id,
		);
		expect(idKeHoach).toContain(vetBuoc.id);
		expect(idCongTy).not.toContain(vetBuoc.id);
	});
});

describe("xoa-day-chuyen", () => {
	test("xoa-day-chuyen: xoa cong ty keo theo vet ke hoach, ca nhan con lai", async () => {
		const [O, A] = [await gieoThanhVien(), await gieoThanhVien()];
		const bp = await gieoBoPhan();
		const { plan, congTy } = await gieoKeHoach({
			ownerId: O.id,
			buoc: [{ label: "Kickoff", departmentId: bp.id }],
		});
		const buoc = phan(await buocCua(plan.id), 0);
		await dichVu().assignStep({ stepId: buoc.id, assigneeId: A.id }, O.id);
		await hoatDong().create(
			{ type: "NOTE", body: "Ghi chu", planId: plan.id },
			O.id,
		);
		const caNhan = await db.contact.create({
			data: { firstName: `${TIEN_TO}-cn`, companyId: congTy.id },
		});
		await db.onboardingEnrollment.create({
			data: { planId: plan.id, contactId: caNhan.id, source: "tay" },
		});
		const idVet = (await vetCua(plan.id)).map((v) => v.id);
		expect(idVet.length).toBeGreaterThan(0);

		await congTyDichVu().archive(congTy.id);
		await congTyDichVu().purge(congTy.id);

		const con = await db.activity.count({ where: { id: { in: idVet } } });
		expect(con, `so vet cua ke hoach ${plan.id} mong 0`).toBe(0);
		expect(
			await db.onboardingPlan.findUnique({ where: { id: plan.id } }),
		).toBeNull();
		expect(
			await db.contact.findUnique({ where: { id: caNhan.id } }),
		).not.toBeNull();
	});
});

describe("noi-man-buoc", () => {
	test("noi-man-buoc: ba payload man gui qua duoc schema va ghi dung dong hai", async () => {
		const [O, A] = [await gieoThanhVien(), await gieoThanhVien()];
		const bp = await gieoBoPhan();
		const { plan } = await gieoKeHoach({
			ownerId: O.id,
			buoc: ["S1", "S2"].map((label) => ({ label, departmentId: bp.id })),
		});
		const [s1, s2] = [
			phan(await buocCua(plan.id), 0),
			phan(await buocCua(plan.id), 1),
		];
		const thay = (v: (typeof payload)[number]["dauVao"]) =>
			JSON.parse(
				JSON.stringify(v)
					.replaceAll('"S2"', `"${s2.id}"`)
					.replaceAll('"A"', `"${A.id}"`),
			);
		expect(payload.map((p) => p.thuTuc)).toEqual([
			"setStepDone",
			"assignStep",
			"rescheduleStep",
		]);

		for (const muc of payload) {
			const dauVao = thay(muc.dauVao);
			if (muc.thuTuc === "setStepDone") {
				const hop = stepDoneInput.safeParse(dauVao);
				expect(hop.success, `setStepDone: ${hop.error?.message}`).toBe(true);
				if (hop.success) await dichVu().setStepDone(hop.data, O.id);
			}
			if (muc.thuTuc === "assignStep") {
				const hop = stepAssignInput.safeParse(dauVao);
				expect(hop.success, `assignStep: ${hop.error?.message}`).toBe(true);
				if (hop.success) await dichVu().assignStep(hop.data, O.id);
			}
			if (muc.thuTuc === "rescheduleStep") {
				const hop = stepRescheduleInput.safeParse(dauVao);
				expect(hop.success, `rescheduleStep: ${hop.error?.message}`).toBe(true);
				if (hop.success) await dichVu().rescheduleStep(hop.data, O.id);
			}
		}

		const [d1, d2] = [
			phan(await buocCua(plan.id), 0),
			phan(await buocCua(plan.id), 1),
		];
		expect(d2.completedAt).not.toBeNull();
		expect(d2.assigneeId).toBe(A.id);
		expect(d2.dueAt.toISOString().slice(0, 10)).toBe("2026-09-25");
		expect(d1).toEqual(s1);
	});
});
