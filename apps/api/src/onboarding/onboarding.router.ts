import { Inject } from "@nestjs/common";
import { Input, Mutation, Query, Router, UseMiddlewares } from "nestjs-trpc";
import type { z } from "zod";
import { AuthMiddleware } from "../trpc/middlewares/auth.middleware";
import { restMeta } from "../trpc/openapi";
import {
	bangCotInput,
	bangCotOutput,
	danhMucOutput,
	departmentCreateInput,
	departmentIdInput,
	departmentListOutput,
	departmentOutput,
	departmentReorderInput,
	departmentUpdateInput,
	enrollmentListOutput,
	enrollmentOutput,
	enrollmentRemoveInput,
	enrollmentRemoveOutput,
	enrollmentStageInput,
	enrollmentUpsertInput,
	planCreateFromTemplateInput,
	planIdInput,
	planListInput,
	planListOutput,
	planOutput,
	stepListInput,
	stepListOutput,
	templateCreateInput,
	templateIdInput,
	templateListOutput,
	templateOutput,
	templateUpdateInput,
} from "./onboarding.contracts";
import { OnboardingService } from "./onboarding.service";

@Router({ alias: "onboarding" })
@UseMiddlewares(AuthMiddleware)
export class OnboardingRouter {
	constructor(
		@Inject(OnboardingService)
		private readonly onboarding: OnboardingService,
	) {}

	@Query({
		output: departmentListOutput,
		meta: restMeta("GET", "/onboarding/departments", ["Onboarding"]),
	})
	listDepartments() {
		return this.onboarding.listDepartments();
	}

	@Mutation({
		input: departmentCreateInput,
		output: departmentOutput,
		meta: restMeta("POST", "/onboarding/departments", ["Onboarding"]),
	})
	createDepartment(@Input() input: z.infer<typeof departmentCreateInput>) {
		return this.onboarding.createDepartment(input);
	}

	@Mutation({
		input: departmentUpdateInput,
		output: departmentOutput,
		meta: restMeta("PATCH", "/onboarding/departments/{id}", ["Onboarding"]),
	})
	updateDepartment(@Input() input: z.infer<typeof departmentUpdateInput>) {
		return this.onboarding.updateDepartment(input);
	}

	@Mutation({
		input: departmentIdInput,
		output: departmentOutput,
		meta: restMeta("POST", "/onboarding/departments/{id}/archive", [
			"Onboarding",
		]),
	})
	archiveDepartment(@Input() input: z.infer<typeof departmentIdInput>) {
		return this.onboarding.archiveDepartment(input);
	}

	@Mutation({
		input: departmentReorderInput,
		output: departmentListOutput,
		meta: restMeta("POST", "/onboarding/departments/reorder", ["Onboarding"]),
	})
	reorderDepartments(@Input() input: z.infer<typeof departmentReorderInput>) {
		return this.onboarding.reorderDepartments(input);
	}

	@Query({
		output: templateListOutput,
		meta: restMeta("GET", "/onboarding/templates", ["Onboarding"]),
	})
	listTemplates() {
		return this.onboarding.listTemplates();
	}

	@Mutation({
		input: templateCreateInput,
		output: templateOutput,
		meta: restMeta("POST", "/onboarding/templates", ["Onboarding"]),
	})
	createTemplate(@Input() input: z.infer<typeof templateCreateInput>) {
		return this.onboarding.createTemplate(input);
	}

	@Mutation({
		input: templateUpdateInput,
		output: templateOutput,
		meta: restMeta("PATCH", "/onboarding/templates/{id}", ["Onboarding"]),
	})
	updateTemplate(@Input() input: z.infer<typeof templateUpdateInput>) {
		return this.onboarding.updateTemplate(input);
	}

	@Mutation({
		input: templateIdInput,
		output: templateOutput,
		meta: restMeta("POST", "/onboarding/templates/{id}/archive", [
			"Onboarding",
		]),
	})
	archiveTemplate(@Input() input: z.infer<typeof templateIdInput>) {
		return this.onboarding.archiveTemplate(input);
	}

	@Query({
		input: planListInput,
		output: planListOutput,
		meta: restMeta("GET", "/onboarding/plans", ["Onboarding"]),
	})
	listPlans(@Input() input: z.infer<typeof planListInput>) {
		return this.onboarding.listPlans(input);
	}

	@Mutation({
		input: planCreateFromTemplateInput,
		output: planOutput,
		meta: restMeta("POST", "/onboarding/plans", ["Onboarding"]),
	})
	createFromTemplate(
		@Input() input: z.infer<typeof planCreateFromTemplateInput>,
	) {
		return this.onboarding.createFromTemplate(input);
	}

	@Mutation({
		input: planIdInput,
		output: planOutput,
		meta: restMeta("POST", "/onboarding/plans/{id}/close", ["Onboarding"]),
	})
	closePlan(@Input() input: z.infer<typeof planIdInput>) {
		return this.onboarding.closePlan(input);
	}

	@Query({
		input: stepListInput,
		output: stepListOutput,
		meta: restMeta("GET", "/onboarding/steps", ["Onboarding"]),
	})
	listSteps(@Input() input: z.infer<typeof stepListInput>) {
		return this.onboarding.listSteps(input);
	}

	@Query({
		input: planIdInput,
		output: enrollmentListOutput,
		meta: restMeta("GET", "/onboarding/plans/{id}/enrollments", ["Onboarding"]),
	})
	listEnrollments(@Input() input: z.infer<typeof planIdInput>) {
		return this.onboarding.listEnrollments(input);
	}

	@Mutation({
		input: enrollmentUpsertInput,
		output: enrollmentOutput,
		meta: restMeta("POST", "/onboarding/enrollments", ["Onboarding"]),
	})
	upsertEnrollment(@Input() input: z.infer<typeof enrollmentUpsertInput>) {
		return this.onboarding.upsertEnrollment(input);
	}

	@Mutation({
		input: enrollmentRemoveInput,
		output: enrollmentRemoveOutput,
		meta: restMeta(
			"DELETE",
			"/onboarding/plans/{planId}/enrollments/{contactId}",
			["Onboarding"],
		),
	})
	removeEnrollment(@Input() input: z.infer<typeof enrollmentRemoveInput>) {
		return this.onboarding.removeEnrollment(input);
	}

	@Mutation({
		input: enrollmentStageInput,
		output: enrollmentOutput,
		meta: restMeta("POST", "/onboarding/enrollments/{id}/stage", [
			"Onboarding",
		]),
	})
	markEnrollmentStage(@Input() input: z.infer<typeof enrollmentStageInput>) {
		return this.onboarding.markEnrollmentStage(input);
	}

	@Query({
		input: planListInput,
		output: danhMucOutput,
		meta: restMeta("GET", "/onboarding/danh-muc", ["Onboarding"]),
	})
	manDanhMuc(@Input() input: z.infer<typeof planListInput>) {
		return this.onboarding.manDanhMuc(input);
	}

	@Query({
		input: bangCotInput,
		output: bangCotOutput,
		meta: restMeta("GET", "/onboarding/bang-cot", ["Onboarding"]),
	})
	bangCot(@Input() input: z.infer<typeof bangCotInput>) {
		return this.onboarding.bangCot(input);
	}
}
