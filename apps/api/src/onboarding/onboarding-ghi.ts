import type { Db, Prisma } from "@crm/db";
import {
	type OnboardingActivityMeta,
	vet,
	vetCoCongTy,
} from "@crm/validation/onboarding-activity";
import {
	BadRequestException,
	ConflictException,
	NotFoundException,
} from "@nestjs/common";
import type {
	PlanOutput,
	PlanOwnerInput,
	StepAddInput,
	StepAssignInput,
	StepDoneInput,
	StepIdInput,
	StepListOutput,
	StepOutput,
	StepRemovedOutput,
	StepReorderInput,
	StepRescheduleInput,
} from "./onboarding.contracts";
import { ONBOARDING } from "./onboarding-config";

type Tx = Prisma.TransactionClient;

type KeHoachGoc = {
	id: string;
	companyId: string;
	templateId: string | null;
	startedAt: Date;
	targetDays: number;
	closedAt: Date | null;
	ownerId: string;
};

export const CHON_BUOC = {
	id: true,
	planId: true,
	label: true,
	departmentId: true,
	department: { select: { name: true } },
	assigneeId: true,
	assignee: { select: { id: true, name: true, image: true } },
	dueAt: true,
	completedAt: true,
	position: true,
} as const;

type HangBuoc = Prisma.OnboardingStepGetPayload<{ select: typeof CHON_BUOC }>;

export function buocRa({ department, ...buoc }: HangBuoc): StepOutput {
	return { ...buoc, departmentName: department.name };
}

export function keHoachRa(plan: KeHoachGoc): PlanOutput {
	return {
		id: plan.id,
		companyId: plan.companyId,
		templateId: plan.templateId,
		startedAt: plan.startedAt,
		targetDays: plan.targetDays,
		closedAt: plan.closedAt,
		ownerId: plan.ownerId,
	};
}

function ngay(moc: Date): string {
	return moc.toISOString().slice(0, 10);
}

async function keHoachMo(tx: Tx, planId: string): Promise<KeHoachGoc> {
	const plan = await tx.onboardingPlan.findUnique({ where: { id: planId } });
	if (plan === null) {
		throw new NotFoundException(ONBOARDING.thongDiep.khongCoKeHoach(planId));
	}
	if (plan.closedAt !== null) {
		throw new ConflictException(ONBOARDING.thongDiep.keHoachDaDong);
	}
	return plan;
}

async function buocCuaKeHoachMo(
	tx: Tx,
	stepId: string,
): Promise<{ buoc: HangBuoc; plan: KeHoachGoc }> {
	const buoc = await tx.onboardingStep.findUnique({
		where: { id: stepId },
		select: CHON_BUOC,
	});
	if (buoc === null) {
		throw new NotFoundException(ONBOARDING.thongDiep.khongCoBuoc(stepId));
	}
	return { buoc, plan: await keHoachMo(tx, buoc.planId) };
}

async function thanhVien(
	tx: Tx,
	userId: string,
): Promise<{ id: string; name: string }> {
	const nguoi = await tx.user.findFirst({
		where: { id: userId, members: { some: {} } },
		select: { id: true, name: true },
	});
	if (nguoi === null) {
		throw new BadRequestException(
			ONBOARDING.thongDiep.khongPhaiThanhVien(userId),
		);
	}
	return nguoi;
}

async function tenNguoi(tx: Tx, userId: string): Promise<string> {
	const nguoi = await tx.user.findUnique({
		where: { id: userId },
		select: { name: true },
	});
	return nguoi?.name ?? userId;
}

export async function ghiVet(
	tx: Tx,
	plan: { id: string; companyId: string },
	meta: OnboardingActivityMeta,
	actingUserId: string,
): Promise<void> {
	await tx.activity.create({
		data: {
			type: "PLAN_CHANGE",
			occurredAt: new Date(),
			planId: plan.id,
			companyId: vetCoCongTy(meta) ? plan.companyId : null,
			createdById: actingUserId,
			meta,
		},
	});
}

export class OnboardingGhi {
	constructor(private readonly db: Db) {}

	assignStep(
		input: StepAssignInput,
		actingUserId: string,
	): Promise<StepOutput> {
		return this.db.$transaction(async (tx) => {
			const { buoc, plan } = await buocCuaKeHoachMo(tx, input.stepId);
			if (buoc.assigneeId === input.assigneeId) return buocRa(buoc);

			const den =
				input.assigneeId === null
					? null
					: await thanhVien(tx, input.assigneeId);
			const sau = await tx.onboardingStep.update({
				where: { id: buoc.id },
				data: { assigneeId: den?.id ?? null },
				select: CHON_BUOC,
			});
			await ghiVet(
				tx,
				plan,
				vet.buocGiao({
					stepId: buoc.id,
					nhan: buoc.label,
					tu: buoc.assignee?.id ?? null,
					tuTen: buoc.assignee?.name ?? null,
					den: den?.id ?? null,
					denTen: den?.name ?? null,
				}),
				actingUserId,
			);
			return buocRa(sau);
		});
	}

	setStepDone(input: StepDoneInput, actingUserId: string): Promise<StepOutput> {
		return this.db.$transaction(async (tx) => {
			const { buoc, plan } = await buocCuaKeHoachMo(tx, input.stepId);
			if ((buoc.completedAt !== null) === input.done) return buocRa(buoc);

			const sau = await tx.onboardingStep.update({
				where: { id: buoc.id },
				data: { completedAt: input.done ? new Date() : null },
				select: CHON_BUOC,
			});
			const chung = { stepId: buoc.id, nhan: buoc.label };
			await ghiVet(
				tx,
				plan,
				input.done ? vet.buocXong(chung) : vet.buocBoXong(chung),
				actingUserId,
			);
			return buocRa(sau);
		});
	}

	rescheduleStep(
		input: StepRescheduleInput,
		actingUserId: string,
	): Promise<StepOutput> {
		return this.db.$transaction(async (tx) => {
			const { buoc, plan } = await buocCuaKeHoachMo(tx, input.stepId);
			if (ngay(buoc.dueAt) === ngay(input.dueAt)) return buocRa(buoc);

			const sau = await tx.onboardingStep.update({
				where: { id: buoc.id },
				data: { dueAt: input.dueAt },
				select: CHON_BUOC,
			});
			await ghiVet(
				tx,
				plan,
				vet.buocDoiHan({
					stepId: buoc.id,
					nhan: buoc.label,
					tu: ngay(buoc.dueAt),
					den: ngay(input.dueAt),
				}),
				actingUserId,
			);
			return buocRa(sau);
		});
	}

	addStep(input: StepAddInput, actingUserId: string): Promise<StepOutput> {
		return this.db.$transaction(async (tx) => {
			const plan = await keHoachMo(tx, input.planId);
			const nguoi = input.assigneeId
				? await thanhVien(tx, input.assigneeId)
				: null;
			const cuoi = await tx.onboardingStep.findFirst({
				where: { planId: plan.id },
				orderBy: { position: "desc" },
				select: { position: true },
			});
			const moi = await tx.onboardingStep.create({
				data: {
					planId: plan.id,
					label: input.label,
					departmentId: input.departmentId,
					dueAt: input.dueAt,
					assigneeId: nguoi?.id ?? null,
					position: (cuoi?.position ?? -1) + 1,
				},
				select: CHON_BUOC,
			});
			await ghiVet(
				tx,
				plan,
				vet.buocThem({ stepId: moi.id, nhan: moi.label }),
				actingUserId,
			);
			return buocRa(moi);
		});
	}

	removeStep(
		input: StepIdInput,
		actingUserId: string,
	): Promise<StepRemovedOutput> {
		return this.db.$transaction(async (tx) => {
			const { buoc, plan } = await buocCuaKeHoachMo(tx, input.stepId);
			await tx.onboardingStep.delete({ where: { id: buoc.id } });
			await ghiVet(
				tx,
				plan,
				vet.buocBo({ stepId: buoc.id, nhan: buoc.label }),
				actingUserId,
			);
			return { id: buoc.id };
		});
	}

	reorderSteps(input: StepReorderInput): Promise<StepListOutput> {
		return this.db.$transaction(async (tx) => {
			const plan = await keHoachMo(tx, input.planId);
			const co = await tx.onboardingStep.findMany({
				where: { planId: plan.id },
				select: { id: true },
			});
			const tap = new Set(input.stepIds);
			const dungTap =
				tap.size === input.stepIds.length &&
				tap.size === co.length &&
				co.every((buoc) => tap.has(buoc.id));
			if (!dungTap) {
				throw new BadRequestException(ONBOARDING.thongDiep.sapLaiSaiTap);
			}

			for (const [position, id] of input.stepIds.entries()) {
				await tx.onboardingStep.update({ where: { id }, data: { position } });
			}

			const hang = await tx.onboardingStep.findMany({
				where: { planId: plan.id },
				orderBy: { position: "asc" },
				select: CHON_BUOC,
			});
			return { rows: hang.map(buocRa), total: hang.length };
		});
	}

	setPlanOwner(
		input: PlanOwnerInput,
		actingUserId: string,
	): Promise<PlanOutput> {
		return this.db.$transaction(async (tx) => {
			const plan = await keHoachMo(tx, input.planId);
			if (plan.ownerId === input.ownerId) return keHoachRa(plan);

			const moi = await thanhVien(tx, input.ownerId);
			const sau = await tx.onboardingPlan.update({
				where: { id: plan.id },
				data: { ownerId: moi.id },
			});
			await ghiVet(
				tx,
				plan,
				vet.keHoachDoiCamTrich({
					tu: plan.ownerId,
					tuTen: await tenNguoi(tx, plan.ownerId),
					den: moi.id,
					denTen: moi.name,
				}),
				actingUserId,
			);
			return keHoachRa(sau);
		});
	}

	datDong(
		id: string,
		dong: boolean,
		actingUserId: string,
	): Promise<PlanOutput> {
		return this.db.$transaction(async (tx) => {
			const plan = await tx.onboardingPlan.findUnique({ where: { id } });
			if (plan === null) {
				throw new NotFoundException(ONBOARDING.thongDiep.khongCoKeHoach(id));
			}
			if ((plan.closedAt !== null) === dong) return keHoachRa(plan);

			const sau = await tx.onboardingPlan.update({
				where: { id },
				data: { closedAt: dong ? new Date() : null },
			});
			await ghiVet(
				tx,
				plan,
				dong ? vet.keHoachDong() : vet.keHoachMoLai(),
				actingUserId,
			);
			return keHoachRa(sau);
		});
	}
}
