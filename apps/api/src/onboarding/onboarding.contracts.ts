import { z } from "zod";
import { listInput } from "../trpc/list-input";
import { ONBOARDING } from "./onboarding-config";

export const departmentCreateInput = z.object({
	name: z.string().trim().min(1).max(120),
});

export const departmentUpdateInput = z.object({
	id: z.string().trim().min(1),
	name: z.string().trim().min(1).max(120),
});

export const departmentIdInput = z.object({
	id: z.string().trim().min(1),
});

export const departmentReorderInput = z.object({
	ids: z.array(z.string().trim().min(1)).min(1).max(200),
});

export const departmentOutput = z.object({
	id: z.string(),
	name: z.string(),
	position: z.number(),
	archivedAt: z.date().nullable(),
});

export const departmentListOutput = z.array(departmentOutput);

export type DepartmentCreateInput = z.infer<typeof departmentCreateInput>;
export type DepartmentUpdateInput = z.infer<typeof departmentUpdateInput>;
export type DepartmentIdInput = z.infer<typeof departmentIdInput>;
export type DepartmentReorderInput = z.infer<typeof departmentReorderInput>;
export type DepartmentOutput = z.infer<typeof departmentOutput>;

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
});

export const templateListOutput = z.array(templateOutput);

export const planCreateFromTemplateInput = z.object({
	companyId: z.string().trim().min(1),
	templateId: z.string().trim().min(1),
	startedAt: z.coerce.date(),
	ownerId: z.string().trim().min(1),
});

export const stepOutput = z.object({
	id: z.string(),
	planId: z.string(),
	label: z.string(),
	departmentId: z.string(),
	assigneeId: z.string().nullable(),
	dueAt: z.date(),
	completedAt: z.date().nullable(),
	position: z.number(),
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

export const stepListInput = z.object({
	planId: z.string().trim().min(1),
	departmentId: z.string().trim().min(1).optional(),
});

export const stepListOutput = z.object({
	rows: z.array(stepOutput),
	total: z.number(),
});

export type TemplateStepInput = z.infer<typeof templateStepInput>;
export type TemplateCreateInput = z.infer<typeof templateCreateInput>;
export type TemplateUpdateInput = z.infer<typeof templateUpdateInput>;
export type TemplateIdInput = z.infer<typeof templateIdInput>;
export type TemplateOutput = z.infer<typeof templateOutput>;
export type PlanCreateFromTemplateInput = z.infer<
	typeof planCreateFromTemplateInput
>;
export type PlanOutput = z.infer<typeof planOutput>;
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
	imNgay: z.number(),
	ownerId: z.string(),
	closedAt: z.date().nullable(),
});

export const planListOutput = z.object({
	rows: z.array(planRow),
	total: z.number(),
	facetCounts: z.record(z.string(), z.record(z.string(), z.number())),
});

export const planIdInput = z.object({ id: z.string().trim().min(1) });

export const enrollmentStage = z.enum([
	"accountAt",
	"courseAt",
	"activeAt",
	"dealAt",
]);

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
	at: z.date().nullable(),
});

export const enrollmentOutput = z.object({
	id: z.string(),
	planId: z.string(),
	contactId: z.string(),
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
});

export type DanhMucTrangThai = z.infer<typeof danhMucTrangThai>;
export type DanhMucOutput = z.infer<typeof danhMucOutput>;

export const bangCotCachChia = z.enum(["buoc", "bo-phan", "bac", "trang-thai"]);

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
