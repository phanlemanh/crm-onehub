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
	DanhMucOutput,
	DepartmentCreateInput,
	DepartmentIdInput,
	DepartmentOutput,
	DepartmentReorderInput,
	DepartmentUpdateInput,
	EnrollmentOutput,
	EnrollmentStageInput,
	EnrollmentUpsertInput,
	PlanCreateFromTemplateInput,
	PlanIdInput,
	PlanListInput,
	PlanListOutput,
	PlanOutput,
	PlanRow,
	StepListInput,
	StepListOutput,
	TemplateCreateInput,
	TemplateIdInput,
	TemplateOutput,
	TemplateUpdateInput,
} from "./onboarding.contracts";
import { MA_NEN_TANG, ONBOARDING } from "./onboarding-config";

const DAY_MS = 24 * 60 * 60 * 1000;

function soNgay(tu: Date, den: Date): number {
	return Math.floor((den.getTime() - tu.getTime()) / DAY_MS);
}

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

	async manDanhMuc(input: PlanListInput): Promise<DanhMucOutput> {
		const [danhSach, soKhuon] = await Promise.all([
			this.listPlans(input),
			this.db.onboardingTemplate.count({ where: { archivedAt: null } }),
		]);

		const trangThai =
			danhSach.rows.length > 0
				? "ST-danhmuc-codulieu"
				: soKhuon === 0
					? "ST-danhmuc-chuacokhuon"
					: "ST-danhmuc-empty";

		return { ...danhSach, soKhuon, trangThai };
	}

	async listPlans(input: PlanListInput): Promise<PlanListOutput> {
		const where = {
			closedAt: input.status === "da-dong" ? { not: null } : null,
			...(input.departmentId === undefined
				? {}
				: { steps: { some: { departmentId: input.departmentId } } }),
		};

		const [plans, total] = await Promise.all([
			this.db.onboardingPlan.findMany({
				where,
				orderBy: { startedAt: "asc" },
				skip: (input.page - 1) * input.pageSize,
				take: input.pageSize,
				include: {
					company: { select: { name: true } },
					steps: {
						orderBy: { position: "asc" },
						select: {
							completedAt: true,
							label: true,
							updatedAt: true,
							department: { select: { id: true, name: true } },
						},
					},
				},
			}),
			this.db.onboardingPlan.count({ where }),
		]);

		const rows: PlanRow[] = plans.map((plan) => {
			const xong = plan.steps.filter((s) => s.completedAt !== null).length;
			const dang = plan.steps.find((s) => s.completedAt === null);
			const moiNhat = plan.steps.reduce<Date>(
				(moc, s) => (s.updatedAt > moc ? s.updatedAt : moc),
				plan.steps[0]?.updatedAt ?? plan.startedAt,
			);

			return {
				id: plan.id,
				companyId: plan.companyId,
				companyName: plan.company.name,
				startedAt: plan.startedAt,
				targetDays: plan.targetDays,
				ngayThu: soNgay(plan.startedAt, new Date()),
				buocXong: xong,
				buocTong: plan.steps.length,
				tacO: dang?.label ?? null,
				boPhanTac: dang?.department.name ?? null,
				imNgay: soNgay(moiNhat, new Date()),
				ownerId: plan.ownerId,
				closedAt: plan.closedAt,
			};
		});

		const theoBoPhan = await this.db.onboardingStep.groupBy({
			by: ["departmentId"],
			where: { plan: { closedAt: where.closedAt } },
			_count: { planId: true },
		});

		const boPhan: Record<string, number> = {};
		for (const hang of theoBoPhan) {
			const dem = await this.db.onboardingPlan.count({
				where: {
					closedAt: where.closedAt,
					steps: { some: { departmentId: hang.departmentId } },
				},
			});
			boPhan[hang.departmentId] = dem;
		}

		return { rows, total, facetCounts: { boPhan } };
	}

	async closePlan(input: PlanIdInput): Promise<PlanOutput> {
		const plan = await this.db.onboardingPlan.findUnique({
			where: { id: input.id },
		});

		if (plan === null) {
			throw new NotFoundException(`Không có kế hoạch nào mang mã ${input.id}.`);
		}

		const sau = await this.db.onboardingPlan.update({
			where: { id: input.id },
			data: { closedAt: new Date() },
		});

		return {
			id: sau.id,
			companyId: sau.companyId,
			templateId: sau.templateId,
			startedAt: sau.startedAt,
			targetDays: sau.targetDays,
			closedAt: sau.closedAt,
			ownerId: sau.ownerId,
		};
	}

	async listEnrollments(input: PlanIdInput): Promise<EnrollmentOutput[]> {
		return this.db.onboardingEnrollment.findMany({
			where: { planId: input.id },
			orderBy: { createdAt: "asc" },
			select: {
				id: true,
				planId: true,
				contactId: true,
				accountAt: true,
				courseAt: true,
				activeAt: true,
				dealAt: true,
				source: true,
			},
		});
	}

	async upsertEnrollment(
		input: EnrollmentUpsertInput,
	): Promise<EnrollmentOutput> {
		return this.db.onboardingEnrollment.upsert({
			where: {
				planId_contactId: { planId: input.planId, contactId: input.contactId },
			},
			create: {
				planId: input.planId,
				contactId: input.contactId,
				source: input.source,
			},
			update: { source: input.source },
			select: {
				id: true,
				planId: true,
				contactId: true,
				accountAt: true,
				courseAt: true,
				activeAt: true,
				dealAt: true,
				source: true,
			},
		});
	}

	async markEnrollmentStage(
		input: EnrollmentStageInput,
	): Promise<EnrollmentOutput> {
		const co = await this.db.onboardingEnrollment.findUnique({
			where: { id: input.id },
			select: { id: true },
		});

		if (co === null) {
			throw new NotFoundException(`Không có ghi danh nào mang mã ${input.id}.`);
		}

		return this.db.onboardingEnrollment.update({
			where: { id: input.id },
			data: { [input.stage]: input.at },
			select: {
				id: true,
				planId: true,
				contactId: true,
				accountAt: true,
				courseAt: true,
				activeAt: true,
				dealAt: true,
				source: true,
			},
		});
	}

	async ensureMaNenTangField(): Promise<string> {
		const co = await this.db.fieldDefinition.findUnique({
			where: { entity_key: { entity: "CONTACT", key: MA_NEN_TANG.key } },
			select: { id: true },
		});

		if (co !== null) return co.id;

		const cuoi = await this.db.fieldDefinition.findFirst({
			where: { entity: "CONTACT" },
			orderBy: { position: "desc" },
			select: { position: true },
		});

		const moi = await this.db.fieldDefinition.create({
			data: {
				entity: "CONTACT",
				key: MA_NEN_TANG.key,
				label: MA_NEN_TANG.label,
				type: "TEXT",
				agentFilled: false,
				position: (cuoi?.position ?? -1) + 1,
			},
			select: { id: true },
		});

		return moi.id;
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
