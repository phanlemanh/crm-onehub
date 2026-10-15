import { z } from "zod";
import { listInput } from "../trpc/list-input";
import { ONBOARDING } from "./onboarding-config";

export const ngayLich = z.iso
	.date()
	.transform((ngay) => new Date(`${ngay}T00:00:00.000Z`));

export const archivedInput = z
	.object({ archived: z.boolean().default(false) })
	.default({ archived: false });

export const deletedOutput = z.object({ id: z.string() });

export const accessOutput = z.object({ canManage: z.boolean() });

export const departmentOutput = z.object({
	id: z.string(),
	name: z.string(),
	position: z.number(),
	archivedAt: z.date().nullable(),
	purgeable: z.boolean(),
	headUserId: z.string().nullable().default(null),
});

export const departmentListOutput = z.array(departmentOutput);

export type DepartmentOutput = z.infer<typeof departmentOutput>;
export type ArchivedInput = z.infer<typeof archivedInput>;
export type DeletedOutput = z.infer<typeof deletedOutput>;
export type AccessOutput = z.infer<typeof accessOutput>;

export const nguoiNhanViecOutput = z.array(
	z.object({
		id: z.string(),
		name: z.string(),
		email: z.string(),
		image: z.string().nullable(),
	}),
);

export type NguoiNhanViecOutput = z.infer<typeof nguoiNhanViecOutput>;

export const templateStepInput = z.object({
	label: z.string().trim().min(1).max(200),
	departmentId: z.string().trim().min(1).max(120),
	position: z.int().min(0).max(100),
	offsetDays: z.int().min(0).max(365),
});

export const templateCreateInput = z.object({
	name: z.string().trim().min(1).max(200),
	partnerType: z.string().trim().min(1).max(120).nullable(),
	steps: z.array(templateStepInput).min(1).max(100),
});

export const templateUpdateInput = z.object({
	id: z.string().trim().min(1),
	name: z.string().trim().min(1).max(200).optional(),
	partnerType: z.string().trim().min(1).max(120).nullable().optional(),
	steps: z.array(templateStepInput).min(1).max(100).optional(),
});

export const templateIdInput = z.object({
	id: z.string().trim().min(1),
});

export const templateOutput = z.object({
	id: z.string(),
	name: z.string(),
	partnerType: z.string().nullable(),
	steps: z.array(templateStepInput),
	archivedAt: z.date().nullable(),
	purgeable: z.boolean(),
});

export const templateListOutput = z.array(templateOutput);

export const planCreateFromTemplateInput = z.object({
	companyId: z.string().trim().min(1),
	templateId: z.string().trim().min(1),
	startedAt: ngayLich,
	ownerId: z.string().trim().min(1),
	nguoiTheoPhongBan: z
		.array(
			z.object({
				departmentId: z.string().trim().min(1),
				userId: z.string().trim().min(1),
			}),
		)
		.optional(),
});

export const stepOutput = z.object({
	id: z.string(),
	planId: z.string(),
	label: z.string(),
	departmentId: z.string(),
	departmentName: z.string(),
	assigneeId: z.string().nullable(),
	dueAt: z.date(),
	completedAt: z.date().nullable(),
	position: z.number(),
	assignee: z
		.object({ id: z.string(), name: z.string(), image: z.string().nullable() })
		.nullable(),
	viecId: z.string().nullable().default(null),
	viecTrangThai: z
		.enum(["CHUA_LAM", "DANG_LAM", "CHO_DANH_GIA", "XONG", "HUY"])
		.nullable()
		.default(null),
});

export const planOutput = z.object({
	id: z.string(),
	companyId: z.string(),
	templateId: z.string().nullable(),
	startedAt: z.date(),
	targetDays: z.number(),
	closedAt: z.date().nullable(),
	ownerId: z.string(),
});

export const planDetailOutput = planOutput.extend({
	companyName: z.string(),
	company: z.object({
		id: z.string(),
		name: z.string(),
		iconUrl: z.string().nullable(),
		iconDarkUrl: z.string().nullable(),
		iconTone: z.string().nullable(),
		logoUrl: z.string().nullable(),
	}),
	owner: z.object({
		id: z.string(),
		name: z.string(),
		email: z.string(),
		image: z.string().nullable(),
	}),
	templateName: z.string().nullable(),
	ngayThu: z.number(),
	buocXong: z.number(),
	buocTong: z.number(),
	imNgay: z.number(),
	tacO: z.string().nullable(),
	dangTheoDoi: z.boolean(),
	nguoiTheoDoi: z.array(z.object({ id: z.string(), name: z.string() })),
});

export const watchInput = z.object({ planId: z.string().min(1) });

export const watchOutput = z.object({
	dangTheoDoi: z.boolean(),
	soNguoiTheoDoi: z.number().int(),
});

export const stepListInput = z.object({
	planId: z.string().trim().min(1),
	departmentId: z.string().trim().min(1).optional(),
});

export const stepListOutput = z.object({
	rows: z.array(stepOutput),
	total: z.number(),
});

const maBuoc = z.string().trim().min(1).max(120);

export const stepAssignInput = z.object({
	stepId: maBuoc,
	assigneeId: maBuoc.nullable(),
});

export const stepDoneInput = z.object({ stepId: maBuoc, done: z.boolean() });

export const stepRescheduleInput = z.object({
	stepId: maBuoc,
	dueAt: ngayLich,
});

export const stepAddInput = z.object({
	planId: maBuoc,
	label: z.string().trim().min(1).max(200),
	departmentId: maBuoc,
	dueAt: ngayLich,
	assigneeId: maBuoc.nullable().optional(),
});

export const stepIdInput = z.object({ stepId: maBuoc });

export const stepReorderInput = z.object({
	planId: maBuoc,
	stepIds: z.array(maBuoc).min(1).max(100),
});

export const planOwnerInput = z.object({ planId: maBuoc, ownerId: maBuoc });

export const transferPreviewInput = z.object({ fromUserId: maBuoc });

export const transferWorkInput = z.object({
	fromUserId: maBuoc,
	toUserId: maBuoc,
});

export const transferOutput = z.object({
	keHoach: z.number().int().nonnegative(),
	buoc: z.number().int().nonnegative(),
	viec: z.number().int().nonnegative(),
});

export const stepRemovedOutput = z.object({ id: z.string() });

export type StepAssignInput = z.infer<typeof stepAssignInput>;
export type StepDoneInput = z.infer<typeof stepDoneInput>;
export type StepRescheduleInput = z.infer<typeof stepRescheduleInput>;
export type StepAddInput = z.infer<typeof stepAddInput>;
export type StepIdInput = z.infer<typeof stepIdInput>;
export type StepReorderInput = z.infer<typeof stepReorderInput>;
export type PlanOwnerInput = z.infer<typeof planOwnerInput>;
export type PlansOfCompanyInput = z.infer<typeof plansOfCompanyInput>;
export type CompanyPlanRow = z.infer<typeof companyPlanRow>;
export type PlansOfContactInput = z.infer<typeof plansOfContactInput>;
export type ContactPlanRow = z.infer<typeof contactPlanRow>;
export type TransferPreviewInput = z.infer<typeof transferPreviewInput>;
export type TransferWorkInput = z.infer<typeof transferWorkInput>;
export type TransferOutput = z.infer<typeof transferOutput>;
export type StepRemovedOutput = z.infer<typeof stepRemovedOutput>;

export type TemplateStepInput = z.infer<typeof templateStepInput>;
export type TemplateCreateInput = z.infer<typeof templateCreateInput>;
export type TemplateUpdateInput = z.infer<typeof templateUpdateInput>;
export type TemplateIdInput = z.infer<typeof templateIdInput>;
export type TemplateOutput = z.infer<typeof templateOutput>;
export type PlanCreateFromTemplateInput = z.infer<
	typeof planCreateFromTemplateInput
>;
export type PlanOutput = z.infer<typeof planOutput>;
export type PlanDetailOutput = z.infer<typeof planDetailOutput>;
export type WatchInput = z.infer<typeof watchInput>;
export type WatchOutput = z.infer<typeof watchOutput>;
export type NguoiTheoDoi = PlanDetailOutput["nguoiTheoDoi"];
export type StepOutput = z.infer<typeof stepOutput>;
export type StepListInput = z.infer<typeof stepListInput>;
export type StepListOutput = z.infer<typeof stepListOutput>;

export const planStatus = z.enum(["dang-chay", "da-dong", "tat-ca"]);

export const DANH_MUC_SAP = [
	"companyName",
	"startedAt",
	"imNgay",
	"buocXong",
] as const;

const danhSachMa = z.array(z.string().trim().min(1).max(120)).max(200);

export const planListInput = listInput.extend({
	pageSize: z
		.number()
		.int()
		.min(1)
		.max(100)
		.default(ONBOARDING.danhMuc.pageSize),
	status: planStatus.default("dang-chay"),
	boPhan: danhSachMa.default([]),
	nguoiCam: danhSachMa.default([]),
	nguoiGiao: danhSachMa.default([]),
	division: danhSachMa.optional(),
});

export const planRow = z.object({
	id: z.string(),
	companyId: z.string(),
	companyName: z.string(),
	startedAt: z.date(),
	targetDays: z.number(),
	ngayThu: z.number(),
	buocXong: z.number(),
	buocTong: z.number(),
	tacO: z.string().nullable(),
	boPhanTac: z.string().nullable(),
	boPhanTacId: z.string().nullable(),
	boPhanCapTrenId: z.string().nullable(),
	imNgay: z.number(),
	ownerId: z.string(),
	closedAt: z.date().nullable(),
});

export const plansOfCompanyInput = z.object({ companyId: maBuoc });

export const companyPlanRow = planRow.extend({
	ownerName: z.string(),
	templateName: z.string().nullable(),
});

export const companyPlanListOutput = z.array(companyPlanRow);

export const planListOutput = z.object({
	rows: z.array(planRow),
	total: z.number(),
	facetCounts: z.record(z.string(), z.record(z.string(), z.number())),
});

export const planIdInput = z.object({ id: z.string().trim().min(1) });

export const planCloseInput = z.object({
	id: z.string().trim().min(1),
	huyViecMo: z.boolean().optional(),
});

export const enrollmentStage = z.enum([
	"accountAt",
	"courseAt",
	"activeAt",
	"dealAt",
]);

export const plansOfContactInput = z.object({ contactId: maBuoc });

export const contactPlanRow = z.object({
	planId: z.string(),
	companyName: z.string(),
	bac: enrollmentStage.nullable(),
});

export const contactPlanListOutput = z.array(contactPlanRow);

export const enrollmentUpsertInput = z.object({
	planId: z.string().trim().min(1),
	contactId: z.string().trim().min(1),
	source: z.enum(["tay", "nen-tang"]).default("tay"),
});

export const enrollmentRemoveInput = z.object({
	planId: z.string().trim().min(1),
	contactId: z.string().trim().min(1),
});

export const enrollmentRemoveOutput = z.object({ id: z.string() });

export const enrollmentStageInput = z.object({
	id: z.string().trim().min(1),
	stage: enrollmentStage,
	at: ngayLich.nullable(),
});

export const enrollmentOutput = z.object({
	id: z.string(),
	planId: z.string(),
	contactId: z.string(),
	contactName: z.string(),
	accountAt: z.date().nullable(),
	courseAt: z.date().nullable(),
	activeAt: z.date().nullable(),
	dealAt: z.date().nullable(),
	source: z.string(),
});

export const enrollmentListOutput = z.array(enrollmentOutput);

export type PlanStatus = z.infer<typeof planStatus>;
export type PlanListInput = z.infer<typeof planListInput>;
export type PlanRow = z.infer<typeof planRow>;
export type PlanListOutput = z.infer<typeof planListOutput>;
export type PlanIdInput = z.infer<typeof planIdInput>;
export type PlanCloseInput = z.infer<typeof planCloseInput>;
export type EnrollmentStage = z.infer<typeof enrollmentStage>;
export type EnrollmentUpsertInput = z.infer<typeof enrollmentUpsertInput>;
export type EnrollmentRemoveInput = z.infer<typeof enrollmentRemoveInput>;
export type EnrollmentRemoveOutput = z.infer<typeof enrollmentRemoveOutput>;
export type EnrollmentStageInput = z.infer<typeof enrollmentStageInput>;
export type EnrollmentOutput = z.infer<typeof enrollmentOutput>;

export const danhMucTrangThai = z.enum([
	"ST-danhmuc-codulieu",
	"ST-danhmuc-khongkhop",
	"ST-danhmuc-empty",
	"ST-danhmuc-chuacokhuon",
]);

export const danhMucOutput = planListOutput.extend({
	soKhuon: z.number(),
	trangThai: danhMucTrangThai,
	boPhanCapTren: z
		.array(z.object({ id: z.string(), name: z.string() }))
		.optional(),
});

export type DanhMucTrangThai = z.infer<typeof danhMucTrangThai>;
export type DanhMucOutput = z.infer<typeof danhMucOutput>;

export const bangCotCachChia = z.enum([
	"buoc",
	"bo-phan",
	"bac",
	"trang-thai",
	"nguoi-giao",
]);

export const bangCotInput = planListInput.extend({
	cachChia: bangCotCachChia,
});

export const bangCotThe = z.object({
	id: z.string(),
	planId: z.string(),
	tieuDe: z.string(),
	phu: z.string().nullable(),
	imNgay: z.number().nullable(),
});

export const bangCotCot = z.object({
	khoa: z.string(),
	nhan: z.string().nullable(),
	tong: z.number(),
	the: z.array(bangCotThe),
});

export const bangCotOutput = z.object({
	cachChia: bangCotCachChia,
	tranThe: z.number(),
	cot: z.array(bangCotCot),
});

export type BangCotCachChia = z.infer<typeof bangCotCachChia>;
export type BangCotInput = z.infer<typeof bangCotInput>;
export type BangCotThe = z.infer<typeof bangCotThe>;
export type BangCotCot = z.infer<typeof bangCotCot>;
export type BangCotOutput = z.infer<typeof bangCotOutput>;
