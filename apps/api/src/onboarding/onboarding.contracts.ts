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
