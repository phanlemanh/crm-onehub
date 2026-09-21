import type { Db, Prisma } from "@crm/db";
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
	BangCotInput,
	BangCotOutput,
	DanhMucOutput,
	DepartmentCreateInput,
	DepartmentIdInput,
	DepartmentOutput,
	DepartmentReorderInput,
	DepartmentUpdateInput,
	EnrollmentOutput,
	EnrollmentRemoveInput,
	EnrollmentRemoveOutput,
	EnrollmentStageInput,
	EnrollmentUpsertInput,
	PlanCreateFromTemplateInput,
	PlanIdInput,
	PlanListInput,
	PlanListOutput,
	PlanOutput,
	StepListInput,
	StepListOutput,
	TemplateCreateInput,
	TemplateIdInput,
	TemplateOutput,
	TemplateUpdateInput,
} from "./onboarding.contracts";
import { MA_NEN_TANG, ONBOARDING } from "./onboarding-config";
import {
	bangCotTuHang,
	danhSachTuHang,
	dungHang,
	type HangDanhMuc,
	hangCuaBangCot,
	manDanhMucTuHang,
} from "./onboarding-danh-muc";

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
		const where: Prisma.OnboardingStepWhereInput = { planId: input.planId };
		if (input.departmentId !== undefined) {
			where.departmentId = input.departmentId;
		}

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
		const [tap, soKhuon] = await Promise.all([
			this.taiTap(input),
			this.db.onboardingTemplate.count({ where: { archivedAt: null } }),
		]);

		return manDanhMucTuHang(tap, input, soKhuon);
	}

	async listPlans(input: PlanListInput): Promise<PlanListOutput> {
		return danhSachTuHang(await this.taiTap(input), input);
	}

	async bangCot(input: BangCotInput): Promise<BangCotOutput> {
		const hang = hangCuaBangCot(await this.taiTap(input), input);
		const ghiDanh =
			input.cachChia === "bac"
				? await this.db.onboardingEnrollment.findMany({
						where: { planId: { in: hang.map((h) => h.id) } },
						orderBy: [{ createdAt: "asc" }, { id: "asc" }],
						select: {
							id: true,
							planId: true,
							accountAt: true,
							courseAt: true,
							activeAt: true,
							dealAt: true,
							contact: { select: { firstName: true, lastName: true } },
						},
					})
				: [];

		return bangCotTuHang(hang, input, ghiDanh);
	}

	private async taiTap(
		input: Pick<PlanListInput, "q">,
	): Promise<HangDanhMuc[]> {
		const where: Prisma.OnboardingPlanWhereInput = {};
		const q = input.q.trim();
		if (q !== "") {
			where.company = { name: { contains: q, mode: "insensitive" } };
		}

		const plans = await this.db.onboardingPlan.findMany({
			where,
			include: {
				company: { select: { name: true } },
				steps: {
					orderBy: { position: "asc" },
					select: {
						completedAt: true,
						label: true,
						position: true,
						updatedAt: true,
						department: { select: { id: true, name: true, position: true } },
					},
				},
			},
		});

		const bayGio = new Date();
		return plans.map((plan) => dungHang(plan, bayGio));
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

	async removeEnrollment(
		input: EnrollmentRemoveInput,
	): Promise<EnrollmentRemoveOutput> {
		const co = await this.db.onboardingEnrollment.findUnique({
			where: {
				planId_contactId: { planId: input.planId, contactId: input.contactId },
			},
			select: { id: true },
		});

		if (co === null) {
			throw new NotFoundException(
				`Không có ghi danh nào của cá nhân ${input.contactId} trong kế hoạch ${input.planId}.`,
			);
		}

		return this.db.onboardingEnrollment.delete({
			where: { id: co.id },
			select: { id: true },
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
