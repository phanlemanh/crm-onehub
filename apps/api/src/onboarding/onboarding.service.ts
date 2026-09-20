import type { Db } from "@crm/db";
import {
	type OnboardingTemplateStep,
	parseOnboardingTemplateSteps,
} from "@crm/validation/onboarding-template";
import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import type {
	DepartmentCreateInput,
	DepartmentIdInput,
	DepartmentOutput,
	DepartmentReorderInput,
	DepartmentUpdateInput,
	PlanCreateFromTemplateInput,
	PlanOutput,
	StepListInput,
	StepListOutput,
	TemplateCreateInput,
	TemplateIdInput,
	TemplateOutput,
	TemplateUpdateInput,
} from "./onboarding.contracts";
import { ONBOARDING } from "./onboarding-config";

const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class OnboardingService {
	constructor(@InjectDatabase() private readonly db: Db) {}

	async listDepartments(): Promise<DepartmentOutput[]> {
		return this.db.department.findMany({
			where: { archivedAt: null },
			orderBy: { position: "asc" },
			select: { id: true, name: true, position: true, archivedAt: true },
		});
	}

	async createDepartment(
		input: DepartmentCreateInput,
	): Promise<DepartmentOutput> {
		const cuoi = await this.db.department.findFirst({
			orderBy: { position: "desc" },
			select: { position: true },
		});

		return this.db.department.create({
			data: { name: input.name, position: (cuoi?.position ?? -1) + 1 },
			select: { id: true, name: true, position: true, archivedAt: true },
		});
	}

	async updateDepartment(
		input: DepartmentUpdateInput,
	): Promise<DepartmentOutput> {
		await this.doiChieuBoPhan(input.id);

		return this.db.department.update({
			where: { id: input.id },
			data: { name: input.name },
			select: { id: true, name: true, position: true, archivedAt: true },
		});
	}

	async archiveDepartment(input: DepartmentIdInput): Promise<DepartmentOutput> {
		await this.doiChieuBoPhan(input.id);

		return this.db.department.update({
			where: { id: input.id },
			data: { archivedAt: new Date() },
			select: { id: true, name: true, position: true, archivedAt: true },
		});
	}

	async reorderDepartments(
		input: DepartmentReorderInput,
	): Promise<DepartmentOutput[]> {
		await this.db.$transaction(
			input.ids.map((id, viTri) =>
				this.db.department.update({
					where: { id },
					data: { position: viTri },
				}),
			),
		);

		return this.listDepartments();
	}

	async listTemplates(): Promise<TemplateOutput[]> {
		const rows = await this.db.onboardingTemplate.findMany({
			where: { archivedAt: null },
			orderBy: { createdAt: "asc" },
		});

		return rows.map((row) => ({
			id: row.id,
			name: row.name,
			partnerType: row.partnerType,
			steps: parseOnboardingTemplateSteps(row.steps),
			archivedAt: row.archivedAt,
		}));
	}

	async createTemplate(input: TemplateCreateInput): Promise<TemplateOutput> {
		const steps = parseOnboardingTemplateSteps(input.steps);

		const row = await this.db.onboardingTemplate.create({
			data: { name: input.name, partnerType: input.partnerType, steps },
		});

		return {
			id: row.id,
			name: row.name,
			partnerType: row.partnerType,
			steps,
			archivedAt: row.archivedAt,
		};
	}

	async updateTemplate(input: TemplateUpdateInput): Promise<TemplateOutput> {
		const hien = await this.docKhuon(input.id);
		const steps =
			input.steps === undefined
				? hien.steps
				: parseOnboardingTemplateSteps(input.steps);

		const row = await this.db.onboardingTemplate.update({
			where: { id: input.id },
			data: {
				name: input.name ?? hien.name,
				partnerType:
					input.partnerType === undefined
						? hien.partnerType
						: input.partnerType,
				steps,
			},
		});

		return {
			id: row.id,
			name: row.name,
			partnerType: row.partnerType,
			steps,
			archivedAt: row.archivedAt,
		};
	}

	async archiveTemplate(input: TemplateIdInput): Promise<TemplateOutput> {
		const hien = await this.docKhuon(input.id);

		const row = await this.db.onboardingTemplate.update({
			where: { id: input.id },
			data: { archivedAt: new Date() },
		});

		return {
			id: row.id,
			name: row.name,
			partnerType: row.partnerType,
			steps: hien.steps,
			archivedAt: row.archivedAt,
		};
	}

	async createFromTemplate(
		input: PlanCreateFromTemplateInput,
	): Promise<PlanOutput> {
		if (input.ownerId.trim() === "") {
			throw new BadRequestException(
				"Kế hoạch phải có người cầm trịch — thiếu thì không tạo.",
			);
		}

		const khuon = await this.docKhuon(input.templateId);

		return this.db.$transaction(async (tx) => {
			const plan = await tx.onboardingPlan.create({
				data: {
					companyId: input.companyId,
					templateId: khuon.id,
					startedAt: input.startedAt,
					targetDays: ONBOARDING.plan.defaultTargetDays,
					ownerId: input.ownerId,
				},
			});

			await tx.onboardingStep.createMany({
				data: khuon.steps.map((buoc: OnboardingTemplateStep) => ({
					planId: plan.id,
					label: buoc.label,
					departmentId: buoc.departmentId,
					dueAt: new Date(input.startedAt.getTime() + buoc.offsetDays * DAY_MS),
					position: buoc.position,
				})),
			});

			return {
				id: plan.id,
				companyId: plan.companyId,
				templateId: plan.templateId,
				startedAt: plan.startedAt,
				targetDays: plan.targetDays,
				closedAt: plan.closedAt,
				ownerId: plan.ownerId,
			};
		});
	}

	async listSteps(input: StepListInput): Promise<StepListOutput> {
		const where = {
			planId: input.planId,
			...(input.departmentId === undefined
				? {}
				: { departmentId: input.departmentId }),
		};

		const [rows, total] = await Promise.all([
			this.db.onboardingStep.findMany({
				where,
				orderBy: { position: "asc" },
				select: {
					id: true,
					planId: true,
					label: true,
					departmentId: true,
					assigneeId: true,
					dueAt: true,
					completedAt: true,
					position: true,
				},
			}),
			this.db.onboardingStep.count({ where }),
		]);

		return { rows, total };
	}

	private async docKhuon(id: string): Promise<{
		id: string;
		name: string;
		partnerType: string | null;
		steps: OnboardingTemplateStep[];
	}> {
		const row = await this.db.onboardingTemplate.findUnique({ where: { id } });

		if (row === null) {
			throw new NotFoundException(`Không có khuôn kế hoạch nào mang mã ${id}.`);
		}

		return {
			id: row.id,
			name: row.name,
			partnerType: row.partnerType,
			steps: parseOnboardingTemplateSteps(row.steps),
		};
	}

	private async doiChieuBoPhan(id: string): Promise<void> {
		const co = await this.db.department.findUnique({
			where: { id },
			select: { id: true },
		});

		if (co === null) {
			throw new NotFoundException(`Không có bộ phận nào mang mã ${id}.`);
		}
	}
}
