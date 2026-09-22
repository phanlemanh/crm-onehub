import { canManageOnboarding, workspaceRoleOf } from "@crm/auth";
import type { Db, Prisma } from "@crm/db";
import {
	type OnboardingTemplateStep,
	parseOnboardingTemplateSteps,
} from "@crm/validation/onboarding-template";
import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import type {
	AccessOutput,
	ArchivedInput,
	BangCotInput,
	BangCotOutput,
	DanhMucOutput,
	DeletedOutput,
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
	PlanDetailOutput,
	PlanIdInput,
	PlanListInput,
	PlanListOutput,
	PlanOutput,
	PlanOwnerInput,
	StepAddInput,
	StepAssignInput,
	StepDoneInput,
	StepIdInput,
	StepListInput,
	StepListOutput,
	StepOutput,
	StepRemovedOutput,
	StepReorderInput,
	StepRescheduleInput,
	TemplateCreateInput,
	TemplateIdInput,
	TemplateOutput,
	TemplateUpdateInput,
} from "./onboarding.contracts";
import { MA_NEN_TANG, ONBOARDING } from "./onboarding-config";
import {
	bangCotTuHang,
	CHON_KE_HOACH_DANH_MUC,
	danhSachTuHang,
	dungHang,
	type HangDanhMuc,
	hangCuaBangCot,
	manDanhMucTuHang,
} from "./onboarding-danh-muc";
import { buocRa, CHON_BUOC, keHoachRa, OnboardingGhi } from "./onboarding-ghi";

const DAY_MS = 24 * 60 * 60 * 1000;

const CHON_BO_PHAN = {
	id: true,
	name: true,
	position: true,
	archivedAt: true,
	_count: { select: { steps: true } },
} as const;

type HangBoPhan = {
	id: string;
	name: string;
	position: number;
	archivedAt: Date | null;
	_count: { steps: number };
};

type KhuonNhac = { name: string; archived: boolean };

function boPhanRa(row: HangBoPhan, khuon: KhuonNhac[]): DepartmentOutput {
	return {
		id: row.id,
		name: row.name,
		position: row.position,
		archivedAt: row.archivedAt,
		purgeable:
			row.archivedAt !== null && row._count.steps === 0 && khuon.length === 0,
	};
}

type HangKhuon = {
	id: string;
	name: string;
	partnerType: string | null;
	steps: Prisma.JsonValue;
	archivedAt: Date | null;
	_count: { plans: number };
};

function khuonRa(row: HangKhuon): TemplateOutput {
	return {
		id: row.id,
		name: row.name,
		partnerType: row.partnerType,
		steps: parseOnboardingTemplateSteps(row.steps),
		archivedAt: row.archivedAt,
		purgeable: row.archivedAt !== null && row._count.plans === 0,
	};
}

const DEM_KE_HOACH = { _count: { select: { plans: true } } } as const;

const CHON_GHI_DANH = {
	id: true,
	planId: true,
	contactId: true,
	accountAt: true,
	courseAt: true,
	activeAt: true,
	dealAt: true,
	source: true,
	contact: { select: { firstName: true, lastName: true } },
} as const;

type HangGhiDanh = {
	id: string;
	planId: string;
	contactId: string;
	accountAt: Date | null;
	courseAt: Date | null;
	activeAt: Date | null;
	dealAt: Date | null;
	source: string;
	contact: { firstName: string | null; lastName: string | null };
};

function ghiDanhRa(row: HangGhiDanh): EnrollmentOutput {
	return {
		id: row.id,
		planId: row.planId,
		contactId: row.contactId,
		contactName: [row.contact.firstName, row.contact.lastName]
			.filter((phan) => phan !== null && phan.trim() !== "")
			.join(" "),
		accountAt: row.accountAt,
		courseAt: row.courseAt,
		activeAt: row.activeAt,
		dealAt: row.dealAt,
		source: row.source,
	};
}

@Injectable()
export class OnboardingService {
	private readonly ghi: OnboardingGhi;

	constructor(@InjectDatabase() private readonly db: Db) {
		this.ghi = new OnboardingGhi(db);
	}

	assignStep(
		input: StepAssignInput,
		actingUserId: string,
	): Promise<StepOutput> {
		return this.ghi.assignStep(input, actingUserId);
	}

	setStepDone(input: StepDoneInput, actingUserId: string): Promise<StepOutput> {
		return this.ghi.setStepDone(input, actingUserId);
	}

	rescheduleStep(
		input: StepRescheduleInput,
		actingUserId: string,
	): Promise<StepOutput> {
		return this.ghi.rescheduleStep(input, actingUserId);
	}

	addStep(input: StepAddInput, actingUserId: string): Promise<StepOutput> {
		return this.ghi.addStep(input, actingUserId);
	}

	removeStep(
		input: StepIdInput,
		actingUserId: string,
	): Promise<StepRemovedOutput> {
		return this.ghi.removeStep(input, actingUserId);
	}

	reorderSteps(input: StepReorderInput): Promise<StepListOutput> {
		return this.ghi.reorderSteps(input);
	}

	setPlanOwner(
		input: PlanOwnerInput,
		actingUserId: string,
	): Promise<PlanOutput> {
		return this.ghi.setPlanOwner(input, actingUserId);
	}

	async access(userId: string): Promise<AccessOutput> {
		return { canManage: canManageOnboarding(await workspaceRoleOf(userId)) };
	}

	async listDepartments(
		input: ArchivedInput = { archived: false },
	): Promise<DepartmentOutput[]> {
		const rows = await this.db.department.findMany({
			where: { archivedAt: input.archived ? { not: null } : null },
			orderBy: { position: "asc" },
			select: CHON_BO_PHAN,
		});
		const banDo = await this.banDoKhuon();
		return rows.map((row) => boPhanRa(row, banDo.get(row.id) ?? []));
	}

	async createDepartment(
		input: DepartmentCreateInput,
	): Promise<DepartmentOutput> {
		const cuoi = await this.db.department.findFirst({
			orderBy: { position: "desc" },
			select: { position: true },
		});

		return this.motBoPhanRa(
			await this.db.department.create({
				data: { name: input.name, position: (cuoi?.position ?? -1) + 1 },
				select: CHON_BO_PHAN,
			}),
		);
	}

	async updateDepartment(
		input: DepartmentUpdateInput,
	): Promise<DepartmentOutput> {
		await this.doiChieuBoPhan(input.id);

		return this.motBoPhanRa(
			await this.db.department.update({
				where: { id: input.id },
				data: { name: input.name },
				select: CHON_BO_PHAN,
			}),
		);
	}

	async archiveDepartment(input: DepartmentIdInput): Promise<DepartmentOutput> {
		await this.doiChieuBoPhan(input.id);

		const khuon = await this.khuonDungBoPhan(input.id);
		if (khuon.length > 0) {
			throw new BadRequestException(
				ONBOARDING.thongDiep.boPhanTrongKhuon(khuon),
			);
		}

		return this.motBoPhanRa(
			await this.db.department.update({
				where: { id: input.id },
				data: { archivedAt: new Date() },
				select: CHON_BO_PHAN,
			}),
		);
	}

	async restoreDepartment(input: DepartmentIdInput): Promise<DepartmentOutput> {
		await this.doiChieuBoPhan(input.id);

		return this.motBoPhanRa(
			await this.db.department.update({
				where: { id: input.id },
				data: { archivedAt: null },
				select: CHON_BO_PHAN,
			}),
		);
	}

	async purgeDepartment(input: DepartmentIdInput): Promise<DeletedOutput> {
		const row = await this.db.department.findUnique({
			where: { id: input.id },
			select: CHON_BO_PHAN,
		});
		if (row === null) {
			throw new NotFoundException(`Không có bộ phận nào mang mã ${input.id}.`);
		}
		if (row.archivedAt === null) {
			throw new BadRequestException(ONBOARDING.thongDiep.chuaLuuTru);
		}
		if (row._count.steps > 0) {
			throw new BadRequestException(ONBOARDING.thongDiep.daDung);
		}
		const khuon = (await this.banDoKhuon()).get(row.id) ?? [];
		if (khuon.length > 0) {
			throw new BadRequestException(
				ONBOARDING.thongDiep.boPhanConTrongKhuon(khuon.map((k) => k.name)),
			);
		}

		return this.db.department.delete({
			where: { id: input.id },
			select: { id: true },
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

		return this.listDepartments({ archived: false });
	}

	async listTemplates(
		input: ArchivedInput = { archived: false },
	): Promise<TemplateOutput[]> {
		const rows = await this.db.onboardingTemplate.findMany({
			where: { archivedAt: input.archived ? { not: null } : null },
			orderBy: { createdAt: "asc" },
			include: DEM_KE_HOACH,
		});

		return rows.map(khuonRa);
	}

	async createTemplate(input: TemplateCreateInput): Promise<TemplateOutput> {
		const steps = parseOnboardingTemplateSteps(input.steps);
		await this.kiemBoPhanDangDung(steps);

		return khuonRa(
			await this.db.onboardingTemplate.create({
				data: { name: input.name, partnerType: input.partnerType, steps },
				include: DEM_KE_HOACH,
			}),
		);
	}

	async updateTemplate(input: TemplateUpdateInput): Promise<TemplateOutput> {
		const hien = await this.docKhuon(input.id);
		const steps =
			input.steps === undefined
				? hien.steps
				: parseOnboardingTemplateSteps(input.steps);
		if (input.steps !== undefined) await this.kiemBoPhanDangDung(steps);

		return khuonRa(
			await this.db.onboardingTemplate.update({
				where: { id: input.id },
				data: {
					name: input.name ?? hien.name,
					partnerType:
						input.partnerType === undefined
							? hien.partnerType
							: input.partnerType,
					steps,
				},
				include: DEM_KE_HOACH,
			}),
		);
	}

	async archiveTemplate(input: TemplateIdInput): Promise<TemplateOutput> {
		await this.docKhuon(input.id);

		return khuonRa(
			await this.db.onboardingTemplate.update({
				where: { id: input.id },
				data: { archivedAt: new Date() },
				include: DEM_KE_HOACH,
			}),
		);
	}

	async restoreTemplate(input: TemplateIdInput): Promise<TemplateOutput> {
		const hien = await this.docKhuon(input.id);
		await this.kiemBoPhanDangDung(hien.steps);

		return khuonRa(
			await this.db.onboardingTemplate.update({
				where: { id: input.id },
				data: { archivedAt: null },
				include: DEM_KE_HOACH,
			}),
		);
	}

	async purgeTemplate(input: TemplateIdInput): Promise<DeletedOutput> {
		const row = await this.db.onboardingTemplate.findUnique({
			where: { id: input.id },
			include: DEM_KE_HOACH,
		});
		if (row === null) {
			throw new NotFoundException(
				`Không có khuôn kế hoạch nào mang mã ${input.id}.`,
			);
		}
		if (row.archivedAt === null) {
			throw new BadRequestException(ONBOARDING.thongDiep.chuaLuuTru);
		}
		if (row._count.plans > 0) {
			throw new BadRequestException(ONBOARDING.thongDiep.daDung);
		}

		return this.db.onboardingTemplate.delete({
			where: { id: input.id },
			select: { id: true },
		});
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
		if (khuon.archivedAt !== null) {
			throw new BadRequestException(
				ONBOARDING.thongDiep.khuonDaLuuTru(khuon.name),
			);
		}

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

			return keHoachRa(plan);
		});
	}

	async listSteps(input: StepListInput): Promise<StepListOutput> {
		const where: Prisma.OnboardingStepWhereInput = { planId: input.planId };
		if (input.departmentId !== undefined) {
			where.departmentId = input.departmentId;
		}

		const [hang, total] = await Promise.all([
			this.db.onboardingStep.findMany({
				where,
				orderBy: { position: "asc" },
				select: CHON_BUOC,
			}),
			this.db.onboardingStep.count({ where }),
		]);

		return { rows: hang.map(buocRa), total };
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
			include: CHON_KE_HOACH_DANH_MUC,
		});

		const bayGio = new Date();
		return plans.map((plan) => dungHang(plan, bayGio));
	}

	async planById(input: PlanIdInput): Promise<PlanDetailOutput> {
		const plan = await this.db.onboardingPlan.findUnique({
			where: { id: input.id },
			include: {
				company: {
					select: {
						id: true,
						name: true,
						iconUrl: true,
						iconDarkUrl: true,
						iconTone: true,
						logoUrl: true,
					},
				},
				owner: { select: { id: true, name: true, email: true, image: true } },
				template: { select: { name: true } },
				steps: CHON_KE_HOACH_DANH_MUC.steps,
			},
		});

		if (plan === null) {
			throw new NotFoundException(
				ONBOARDING.thongDiep.khongCoKeHoach(input.id),
			);
		}

		const hang = dungHang(plan, new Date());

		return {
			...keHoachRa(plan),
			companyName: plan.company.name,
			company: plan.company,
			owner: plan.owner,
			templateName: plan.template?.name ?? null,
			ngayThu: hang.ngayThu,
			buocXong: hang.buocXong,
			buocTong: hang.buocTong,
			imNgay: hang.imNgay,
			tacO: hang.tacO,
		};
	}

	closePlan(input: PlanIdInput, actingUserId: string): Promise<PlanOutput> {
		return this.ghi.datDong(input.id, true, actingUserId);
	}

	reopenPlan(input: PlanIdInput, actingUserId: string): Promise<PlanOutput> {
		return this.ghi.datDong(input.id, false, actingUserId);
	}

	async listEnrollments(input: PlanIdInput): Promise<EnrollmentOutput[]> {
		const rows = await this.db.onboardingEnrollment.findMany({
			where: { planId: input.id },
			orderBy: { createdAt: "asc" },
			select: CHON_GHI_DANH,
		});
		return rows.map(ghiDanhRa);
	}

	async upsertEnrollment(
		input: EnrollmentUpsertInput,
	): Promise<EnrollmentOutput> {
		const co = await this.db.onboardingEnrollment.findUnique({
			where: {
				planId_contactId: { planId: input.planId, contactId: input.contactId },
			},
			select: { id: true },
		});

		if (co !== null) {
			throw new ConflictException(ONBOARDING.thongDiep.daTrongPheu);
		}

		return ghiDanhRa(
			await this.db.onboardingEnrollment.create({
				data: {
					planId: input.planId,
					contactId: input.contactId,
					source: input.source,
				},
				select: CHON_GHI_DANH,
			}),
		);
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

		return ghiDanhRa(
			await this.db.onboardingEnrollment.update({
				where: { id: input.id },
				data: { [input.stage]: input.at },
				select: CHON_GHI_DANH,
			}),
		);
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
		archivedAt: Date | null;
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
			archivedAt: row.archivedAt,
		};
	}

	async yeuCauQuanTri(userId: string): Promise<void> {
		if (!canManageOnboarding(await workspaceRoleOf(userId))) {
			throw new ForbiddenException(ONBOARDING.thongDiep.canQuyenQuanTri);
		}
	}

	private async khuonDungBoPhan(id: string): Promise<string[]> {
		const khuon = (await this.banDoKhuon()).get(id) ?? [];
		return khuon.filter((k) => !k.archived).map((k) => k.name);
	}

	private async banDoKhuon(): Promise<Map<string, KhuonNhac[]>> {
		const khuon = await this.db.onboardingTemplate.findMany({
			orderBy: { createdAt: "asc" },
			select: { name: true, steps: true, archivedAt: true },
		});

		return khuon
			.flatMap((k) =>
				[
					...new Set(
						parseOnboardingTemplateSteps(k.steps).map(
							(buoc) => buoc.departmentId,
						),
					),
				].map((id) => ({
					id,
					nhac: { name: k.name, archived: k.archivedAt !== null },
				})),
			)
			.reduce(
				(banDo, { id, nhac }) =>
					new Map(banDo).set(id, [...(banDo.get(id) ?? []), nhac]),
				new Map<string, KhuonNhac[]>(),
			);
	}

	private async motBoPhanRa(row: HangBoPhan): Promise<DepartmentOutput> {
		return boPhanRa(row, (await this.banDoKhuon()).get(row.id) ?? []);
	}

	private async kiemBoPhanDangDung(
		steps: OnboardingTemplateStep[],
	): Promise<void> {
		const ids = [...new Set(steps.map((buoc) => buoc.departmentId))];
		const boPhan = await this.db.department.findMany({
			where: { id: { in: ids } },
			select: { id: true, name: true, archivedAt: true },
		});

		const thieu = ids.filter((id) => !boPhan.some((bp) => bp.id === id));
		if (thieu.length > 0) {
			throw new NotFoundException(
				`Không có bộ phận nào mang mã ${thieu.join(", ")}.`,
			);
		}

		const daLuuTru = boPhan
			.filter((bp) => bp.archivedAt !== null)
			.map((bp) => bp.name);
		if (daLuuTru.length > 0) {
			throw new BadRequestException(
				ONBOARDING.thongDiep.boPhanDaLuuTru(daLuuTru),
			);
		}
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
