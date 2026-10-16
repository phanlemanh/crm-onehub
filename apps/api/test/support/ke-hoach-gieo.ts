import { DEFAULT_WORKSPACE_NAME, WORKSPACE_ID } from "@crm/auth";
import { db } from "@crm/db";
import { ngayVN } from "@crm/db/onboarding-nhac";
import { workspaceSlug } from "@crm/db/workspace";
import type { HttpException } from "@nestjs/common";
import { OnboardingService } from "../../src/onboarding/onboarding.service";
import { OnboardingNoi } from "../../src/onboarding/onboarding-noi";

export const DAY_MS = 24 * 60 * 60 * 1000;

const TIEN_TO = "mpkh";

const daGieo = { nguoi: [] as string[], boPhan: [] as string[] };

let demToken = 0;

export function token(): string {
	demToken += 1;
	return `${TIEN_TO}${Date.now().toString(36)}x${demToken}`;
}

export async function moXuong(): Promise<void> {
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
}

export async function donDep(): Promise<void> {
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
}

export function dichVu(): OnboardingService {
	return new OnboardingService(db);
}

export function noi(): OnboardingNoi {
	return new OnboardingNoi(db);
}

export async function gieoNguoiNgoai(ten?: string) {
	const id = token();
	const nguoi = await db.user.create({
		data: { id, name: ten ?? `Ngoai ${id}`, email: `${id}@thu.test` },
	});
	daGieo.nguoi.push(id);
	return nguoi;
}

export async function gieoThanhVien(
	ten?: string,
	vaiTro: "owner" | "admin" | "member" | "okr" = "member",
) {
	const nguoi = await gieoNguoiNgoai(ten);
	await db.member.create({
		data: {
			id: `m-${nguoi.id}`,
			organizationId: WORKSPACE_ID,
			userId: nguoi.id,
			role: vaiTro,
			createdAt: new Date(),
		},
	});
	return nguoi;
}

export async function doiVai(userId: string, vai: string): Promise<void> {
	await db.member.update({
		where: { organizationId_userId: { organizationId: WORKSPACE_ID, userId } },
		data: { role: vai },
	});
}

export async function gieoBoPhan() {
	const boPhan = await db.department.create({
		data: { name: token(), position: 0 },
	});
	daGieo.boPhan.push(boPhan.id);
	return boPhan;
}

export async function gieoCongTy() {
	return db.company.create({ data: { name: token() } });
}

export type BuocGieo = {
	nhan: string;
	boPhanId: string;
	giao?: string;
	xong?: boolean;
	han?: Date;
};

export async function gieoKeHoach(input: {
	camTrich: string;
	buoc: BuocGieo[];
	congTyId?: string;
	dong?: boolean;
	batDau?: Date;
	soNgay?: number;
}) {
	const congTyId = input.congTyId ?? (await gieoCongTy()).id;
	const plan = await db.onboardingPlan.create({
		data: {
			companyId: congTyId,
			ownerId: input.camTrich,
			startedAt: input.batDau ?? new Date(Date.now() - 3 * DAY_MS),
			targetDays: input.soNgay ?? 30,
			closedAt: input.dong ? new Date() : null,
		},
	});
	for (const [i, b] of input.buoc.entries()) {
		await db.onboardingStep.create({
			data: {
				planId: plan.id,
				label: b.nhan,
				departmentId: b.boPhanId,
				assigneeId: b.giao ?? null,
				dueAt: b.han ?? new Date("2026-09-22T00:00:00.000Z"),
				completedAt: b.xong ? new Date() : null,
				position: i,
			},
		});
	}
	return { plan, congTyId };
}

export async function gieoCaNhan(congTyId: string) {
	return db.contact.create({
		data: { firstName: token(), lastName: "Thu", companyId: congTyId },
	});
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

export function phan<T>(ds: T[], i: number): T {
	const gia = ds.at(i);
	if (gia === undefined) {
		throw new Error(
			`khong co phan tu thu ${i} trong danh sach ${ds.length} phan tu`,
		);
	}
	return gia;
}

export async function batHttp(
	chay: () => Promise<unknown>,
	ten: string,
): Promise<HttpException> {
	try {
		await chay();
	} catch (loi) {
		return loi as HttpException;
	}
	throw new Error(`${ten}: mong mot loi HTTP, nhung lenh chay tron ven`);
}

export function ngayCach(soNgay: number): Date {
	return new Date(
		Date.parse(`${ngayVN(new Date())}T00:00:00Z`) + soNgay * DAY_MS,
	);
}
