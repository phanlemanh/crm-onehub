import { canManageOnboarding, workspaceRoleOf } from "@crm/auth";
import type { Db, Prisma } from "@crm/db";
import { datBuocXong, type VetBuocXong } from "@crm/db/onboarding-buoc";
import { demViecMoCua } from "@crm/db/viec";
import { goTheoDoiCuaNguoi } from "@crm/db/viec-ghi";
import { WORKSPACE_ID } from "@crm/db/workspace";
import {
	type OnboardingActivityMeta,
	vet,
	vetCoCongTy,
} from "@crm/validation/onboarding-activity";
import { docDuocDoiTac } from "@crm/validation/vai-workspace";
import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	NotFoundException,
} from "@nestjs/common";
import { TO_CHUC } from "../to-chuc/to-chuc-config";
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
	TransferOutput,
	TransferPreviewInput,
	TransferWorkInput,
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

export async function kiemNguoiNhanViec(
	tx: Tx,
	userId: string,
): Promise<{ id: string; name: string }> {
	const nguoi = await tx.user.findFirst({
		where: { id: userId, members: { some: { organizationId: WORKSPACE_ID } } },
		select: {
			id: true,
			name: true,
			members: {
				where: { organizationId: WORKSPACE_ID },
				select: { role: true },
			},
		},
	});
	if (nguoi === null) {
		throw new BadRequestException(
			ONBOARDING.thongDiep.khongPhaiThanhVien(userId),
		);
	}
	if (!nguoi.members.some((m) => docDuocDoiTac(m.role))) {
		throw new BadRequestException(ONBOARDING.thongDiep.vaiChiOkr(nguoi.name));
	}
	return { id: nguoi.id, name: nguoi.name };
}

async function boPhanDangDung(tx: Tx, departmentId: string): Promise<void> {
	const boPhan = await tx.department.findUnique({
		where: { id: departmentId },
		select: { name: true, archivedAt: true },
	});
	if (boPhan === null) {
		throw new BadRequestException(
			TO_CHUC.thongDiep.khongCoBoPhan(departmentId),
		);
	}
	if (boPhan.archivedAt !== null) {
		throw new BadRequestException(
			ONBOARDING.thongDiep.boPhanDaLuuTru([boPhan.name]),
		);
	}
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

function dieuKienChuyen(from: string) {
	return {
		keHoach: { ownerId: from, closedAt: null },
		buoc: { assigneeId: from, completedAt: null, plan: { closedAt: null } },
	} satisfies {
		keHoach: Prisma.OnboardingPlanWhereInput;
		buoc: Prisma.OnboardingStepWhereInput;
	};
}

export async function demViecDangGiu(
	tx: Tx,
	userId: string,
): Promise<{ keHoach: number; buoc: number; viec: number }> {
	const dk = dieuKienChuyen(userId);
	const [keHoach, buoc, viec] = await Promise.all([
		tx.onboardingPlan.count({ where: dk.keHoach }),
		tx.onboardingStep.count({ where: dk.buoc }),
		demViecMoCua(tx, userId),
	]);
	return { keHoach, buoc, viec };
}

export async function xoaTheoDoiCua(tx: Tx, userId: string): Promise<number> {
	const { count } = await tx.onboardingWatch.deleteMany({ where: { userId } });
	return count + (await goTheoDoiCuaNguoi(tx, userId, new Date()));
}

async function yeuCauQuanTri(userId: string): Promise<void> {
	if (!canManageOnboarding(await workspaceRoleOf(userId))) {
		throw new ForbiddenException(ONBOARDING.thongDiep.canQuyenQuanTri);
	}
}

const VET_MAN: VetBuocXong<OnboardingActivityMeta> = {
	xong: vet.buocXong,
	boXong: vet.buocBoXong,
	coCongTy: vetCoCongTy,
};

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
					: await kiemNguoiNhanViec(tx, input.assigneeId);
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
			const ket = await datBuocXong(
				tx,
				{ ...input, nguoiId: actingUserId, now: new Date() },
				VET_MAN,
			);
			if (ket.ket === "khong-co-buoc") {
				throw new NotFoundException(
					ONBOARDING.thongDiep.khongCoBuoc(input.stepId),
				);
			}
			if (ket.ket === "ke-hoach-dong") {
				throw new ConflictException(ONBOARDING.thongDiep.keHoachDaDong);
			}
			const sau = await tx.onboardingStep.findUniqueOrThrow({
				where: { id: input.stepId },
				select: CHON_BUOC,
			});
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
			await boPhanDangDung(tx, input.departmentId);
			const nguoi = input.assigneeId
				? await kiemNguoiNhanViec(tx, input.assigneeId)
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

			const moi = await kiemNguoiNhanViec(tx, input.ownerId);
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

	async transferPreview(
		input: TransferPreviewInput,
		actingUserId: string,
	): Promise<TransferOutput> {
		await yeuCauQuanTri(actingUserId);
		const dk = dieuKienChuyen(input.fromUserId);
		const [keHoach, buoc] = await Promise.all([
			this.db.onboardingPlan.count({ where: dk.keHoach }),
			this.db.onboardingStep.count({ where: dk.buoc }),
		]);
		return { keHoach, buoc };
	}

	async transferWork(
		input: TransferWorkInput,
		actingUserId: string,
	): Promise<TransferOutput> {
		await yeuCauQuanTri(actingUserId);
		if (input.fromUserId === input.toUserId) {
			throw new BadRequestException(ONBOARDING.thongDiep.chuyenChoChinhMinh);
		}
		return this.db.$transaction(async (tx) => {
			const den = await kiemNguoiNhanViec(tx, input.toUserId);
			const dk = dieuKienChuyen(input.fromUserId);
			const keHoach = await tx.onboardingPlan.findMany({
				where: dk.keHoach,
				orderBy: { id: "asc" },
			});
			const buoc = await tx.onboardingStep.findMany({
				where: dk.buoc,
				select: { ...CHON_BUOC, plan: { select: { companyId: true } } },
				orderBy: { id: "asc" },
			});
			if (keHoach.length === 0 && buoc.length === 0) {
				return { keHoach: 0, buoc: 0 };
			}

			const tuTen = await tenNguoi(tx, input.fromUserId);
			for (const plan of keHoach) {
				await tx.onboardingPlan.update({
					where: { id: plan.id },
					data: { ownerId: den.id },
				});
				await ghiVet(
					tx,
					plan,
					vet.keHoachDoiCamTrich({
						tu: plan.ownerId,
						tuTen,
						den: den.id,
						denTen: den.name,
					}),
					actingUserId,
				);
			}
			for (const b of buoc) {
				await tx.onboardingStep.update({
					where: { id: b.id },
					data: { assigneeId: den.id },
				});
				await ghiVet(
					tx,
					{ id: b.planId, companyId: b.plan.companyId },
					vet.buocGiao({
						stepId: b.id,
						nhan: b.label,
						tu: input.fromUserId,
						tuTen,
						den: den.id,
						denTen: den.name,
					}),
					actingUserId,
				);
			}
			return { keHoach: keHoach.length, buoc: buoc.length };
		});
	}
}
