import { z } from "zod";

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
	startedAt: z.date(),
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
