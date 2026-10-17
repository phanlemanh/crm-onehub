import { canManageOnboarding, workspaceRoleOf } from "@crm/auth";
import type { Db, Prisma } from "@crm/db";
import { taoViecChoBuoc } from "@crm/db/buoc-viec";
import {
	boQuaGoiYTrongTx,
	dongGoiYCuaCongTy,
	GOI_Y,
} from "@crm/db/goi-y-ke-hoach";
import { demOkrTheoDonVi } from "@crm/db/okr-don-vi";
import { WORKSPACE_ID } from "@crm/db/workspace";
import {
	type OnboardingTemplateStep,
	parseOnboardingTemplateSteps,
} from "@crm/validation/onboarding-template";
import { docDuocDoiTac } from "@crm/validation/vai-workspace";
import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import { lyDoKhongXoaPhongBan } from "../to-chuc/xoa-phong-ban";
import type {
	AccessOutput,
	ArchivedInput,
	BangCotInput,
	BangCotOutput,
	BoQuaGoiYInput,
	BoQuaGoiYOutput,
	DanhMucOutput,
	DeletedOutput,
	DepartmentOutput,
	EnrollmentOutput,
	EnrollmentRemoveInput,
	EnrollmentRemoveOutput,
	EnrollmentStageInput,
	EnrollmentUpsertInput,
	GoiYCuaDealInput,
	GoiYCuaDealOutput,
	NguoiNhanViecOutput,
	PlanCloseInput,
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
import {
	buocRa,
	CHON_BUOC,
	hanTuNgay,
	keHoachRa,
	kiemNguoiNhanViec,
	kiemNguoiTheoPhong,
	kiemPhongBanDangDung,
	nguoiMacDinhTheoPhong,
	OnboardingGhi,
} from "./onboarding-ghi";
import { OnboardingTheoDoi } from "./onboarding-theo-doi";

const CHON_BO_PHAN = {
	id: true,
	name: true,
	position: true,
	archivedAt: true,
	headUserId: true,
	_count: { select: { steps: true, primaryOf: true } },
} as const;

type HangBoPhan = {
	id: string;
	name: string;
	position: number;
	archivedAt: Date | null;
	headUserId: string | null;
	_count: { steps: number; primaryOf: number };
};

type KhuonNhac = { name: string; archived: boolean };

function boPhanRa(
	row: HangBoPhan,
	khuon: KhuonNhac[],
	okrLichSu: number,
): DepartmentOutput {
	return {
		id: row.id,
		name: row.name,
		position: row.position,
		archivedAt: row.archivedAt,
		headUserId: row.headUserId,
		purgeable:
			row.archivedAt !== null &&
			lyDoKhongXoaPhongBan({
				archived: true,
				stepCount: row._count.steps,
				primaryCount: row._count.primaryOf,
				khuon: khuon.map((k) => k.name),
				okrLichSu,
			}) === null,
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
	private readonly theoDoi: OnboardingTheoDoi;

	constructor(@InjectDatabase() private readonly db: Db) {
		this.ghi = new OnboardingGhi(db);
		this.theoDoi = new OnboardingTheoDoi(db);
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

	async nguoiNhanViec(): Promise<NguoiNhanViecOutput> {
		const hang = await this.db.user.findMany({
			where: { members: { some: { organizationId: WORKSPACE_ID } } },
			select: {
				id: true,
				name: true,
				email: true,
				image: true,
				members: {
					where: { organizationId: WORKSPACE_ID },
					select: { role: true },
				},
			},
			orderBy: [{ name: "asc" }, { email: "asc" }],
		});
		return hang
			.filter((u) => u.members.some((m) => docDuocDoiTac(m.role)))
			.map(({ id, name, email, image }) => ({ id, name, email, image }));
	}

	async listDepartments(
		input: ArchivedInput = { archived: false },
	): Promise<DepartmentOutput[]> {
		const rows = await this.db.department.findMany({
			where: { archivedAt: input.archived ? { not: null } : null },
			orderBy: { position: "asc" },
			select: CHON_BO_PHAN,
		});
		const [banDo, okr] = await Promise.all([
			this.banDoKhuon(),
			demOkrTheoDonVi(this.db),
		]);
		return rows.map((row) =>
			boPhanRa(
				row,
				banDo.get(row.id) ?? [],
				okr.phongBan.get(row.id)?.lichSu ?? 0,
			),
		);
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
		await kiemPhongBanDangDung(
			this.db,
			steps.map((buoc) => buoc.departmentId),
		);

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
		if (input.steps !== undefined)
			await kiemPhongBanDangDung(
				this.db,
				steps.map((buoc) => buoc.departmentId),
			);

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
		await kiemPhongBanDangDung(
			this.db,
			hien.steps.map((buoc) => buoc.departmentId),
		);

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
		actingUserId: string = input.ownerId,
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
			await kiemNguoiNhanViec(tx, input.ownerId);
			const plan = await tx.onboardingPlan.create({
				data: {
					companyId: input.companyId,
					templateId: khuon.id,
					startedAt: input.startedAt,
					targetDays: ONBOARDING.plan.defaultTargetDays,
					ownerId: input.ownerId,
				},
			});

			const buocKhuon: OnboardingTemplateStep[] = khuon.steps;
			const nguoiPhong = await nguoiMacDinhTheoPhong(
				tx,
				buocKhuon.map((b) => b.departmentId),
				input.ownerId,
			);
			for (const chon of input.nguoiTheoPhongBan ?? []) {
				nguoiPhong.set(
					chon.departmentId,
					(await kiemNguoiTheoPhong(tx, chon)).id,
				);
			}
			const now = new Date();
			for (const buoc of buocKhuon) {
				const tao = await tx.onboardingStep.create({
					data: {
						planId: plan.id,
						label: buoc.label,
						departmentId: buoc.departmentId,
						dueAt: hanTuNgay(input.startedAt, buoc.offsetDays),
						position: buoc.position,
					},
					select: { id: true },
				});
				await taoViecChoBuoc(tx, {
					stepId: tao.id,
					planId: plan.id,
					tieuDe: buoc.label,
					hanNgay: hanTuNgay(input.startedAt, buoc.offsetDays),
					nguoiGiaoId: actingUserId,
					nguoiThucHienId: nguoiPhong.get(buoc.departmentId) ?? input.ownerId,
					nguon: "khuon",
					now,
				});
			}
			await dongGoiYCuaCongTy(tx, {
				companyId: input.companyId,
				planId: plan.id,
				nguoiId: actingUserId,
				now,
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
		const [tap, soKhuon, boPhanCapTren] = await Promise.all([
			this.taiTap(input),
			this.db.onboardingTemplate.count({ where: { archivedAt: null } }),
			this.db.division.findMany({
				where: { archivedAt: null },
				orderBy: [{ position: "asc" }, { name: "asc" }],
				select: { id: true, name: true },
			}),
		]);

		return { ...manDanhMucTuHang(tap, input, soKhuon), boPhanCapTren };
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

	async planById(
		input: PlanIdInput,
		actingUserId: string,
	): Promise<PlanDetailOutput> {
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
			...(await this.theoDoi.cua(plan.id, actingUserId)),
		};
	}

	closePlan(input: PlanCloseInput, actingUserId: string): Promise<PlanOutput> {
		return this.ghi.datDong(
			input.id,
			true,
			actingUserId,
			input.huyViecMo ?? false,
		);
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

	async goiYCuaDeal(
		input: GoiYCuaDealInput,
		userId: string,
	): Promise<GoiYCuaDealOutput> {
		const goiY = await this.db.goiYKeHoach.findFirst({
			where: {
				dealId: input.dealId,
				trangThai: "CHO",
				deal: { archivedAt: null, giaiDoan: { kind: "WON" } },
			},
			select: {
				id: true,
				dealId: true,
				companyId: true,
				nguoiNhanId: true,
				sinhLuc: true,
				company: { select: { name: true } },
			},
		});
		if (!goiY) return null;
		if (goiY.nguoiNhanId !== userId && !(await this.laQuanTri(userId))) {
			return null;
		}
		const { company, ...ra } = goiY;
		return { ...ra, companyName: company.name };
	}

	async boQuaGoiY(
		input: BoQuaGoiYInput,
		userId: string,
	): Promise<BoQuaGoiYOutput> {
		const goiY = await this.db.goiYKeHoach.findUnique({
			where: { id: input.id },
			select: { nguoiNhanId: true },
		});
		if (!goiY) throw new NotFoundException(GOI_Y.thongDiep.daXuLy);
		if (goiY.nguoiNhanId !== userId && !(await this.laQuanTri(userId))) {
			throw new ForbiddenException(GOI_Y.thongDiep.khongQuyen);
		}
		const xong = await this.db.$transaction((tx) =>
			boQuaGoiYTrongTx(tx, { id: input.id, nguoiId: userId, now: new Date() }),
		);
		if (!xong) throw new BadRequestException(GOI_Y.thongDiep.daXuLy);
		return { id: input.id, trangThai: "BO_QUA" };
	}

	private async laQuanTri(userId: string): Promise<boolean> {
		return canManageOnboarding(await workspaceRoleOf(userId));
	}

	async yeuCauQuanTri(userId: string): Promise<void> {
		if (!canManageOnboarding(await workspaceRoleOf(userId))) {
			throw new ForbiddenException(ONBOARDING.thongDiep.canQuyenQuanTri);
		}
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
}
