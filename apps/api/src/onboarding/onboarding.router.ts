import { Inject } from "@nestjs/common";
import {
	Ctx,
	Input,
	Mutation,
	Query,
	Router,
	UseMiddlewares,
} from "nestjs-trpc";
import type { z } from "zod";
import type { AuthedTrpcContext } from "../trpc/context.types";
import { AuthMiddleware } from "../trpc/middlewares/auth.middleware";
import { restMeta } from "../trpc/openapi";
import {
	accessOutput,
	archivedInput,
	bangCotInput,
	bangCotOutput,
	danhMucOutput,
	deletedOutput,
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
	planDetailOutput,
	planIdInput,
	planListInput,
	planListOutput,
	planOutput,
	planOwnerInput,
	stepAddInput,
	stepAssignInput,
	stepDoneInput,
	stepIdInput,
	stepListInput,
	stepListOutput,
	stepOutput,
	stepRemovedOutput,
	stepReorderInput,
	stepRescheduleInput,
	templateCreateInput,
	templateIdInput,
	templateListOutput,
	templateOutput,
	templateUpdateInput,
} from "./onboarding.contracts";
import { OnboardingService } from "./onboarding.service";

const TAG = ["Onboarding"];

@Router({ alias: "onboarding" })
@UseMiddlewares(AuthMiddleware)
export class OnboardingRouter {
	constructor(
		@Inject(OnboardingService)
		private readonly onboarding: OnboardingService,
	) {}

	@Query({
		output: accessOutput,
		meta: restMeta("GET", "/onboarding/access", TAG),
	})
	access(@Ctx() ctx: AuthedTrpcContext) {
		return this.onboarding.access(ctx.user.id);
	}

	@Query({
		input: archivedInput,
		output: departmentListOutput,
		meta: restMeta("GET", "/onboarding/departments", TAG),
	})
	listDepartments(@Input() input: z.infer<typeof archivedInput>) {
		return this.onboarding.listDepartments(input);
	}

	@Mutation({
		input: departmentCreateInput,
		output: departmentOutput,
		meta: restMeta("POST", "/onboarding/departments", TAG),
	})
	async createDepartment(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof departmentCreateInput>,
	) {
		await this.onboarding.yeuCauQuanTri(ctx.user.id);
		return this.onboarding.createDepartment(input);
	}

	@Mutation({
		input: departmentUpdateInput,
		output: departmentOutput,
		meta: restMeta("PATCH", "/onboarding/departments/{id}", TAG),
	})
	async updateDepartment(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof departmentUpdateInput>,
	) {
		await this.onboarding.yeuCauQuanTri(ctx.user.id);
		return this.onboarding.updateDepartment(input);
	}

	@Mutation({
		input: departmentIdInput,
		output: departmentOutput,
		meta: restMeta("POST", "/onboarding/departments/{id}/archive", TAG),
	})
	async archiveDepartment(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof departmentIdInput>,
	) {
		await this.onboarding.yeuCauQuanTri(ctx.user.id);
		return this.onboarding.archiveDepartment(input);
	}

	@Mutation({
		input: departmentIdInput,
		output: departmentOutput,
		meta: restMeta("POST", "/onboarding/departments/{id}/restore", TAG),
	})
	async restoreDepartment(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof departmentIdInput>,
	) {
		await this.onboarding.yeuCauQuanTri(ctx.user.id);
		return this.onboarding.restoreDepartment(input);
	}

	@Mutation({
		input: departmentIdInput,
		output: deletedOutput,
		meta: restMeta("DELETE", "/onboarding/departments/{id}", TAG),
	})
	async purgeDepartment(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof departmentIdInput>,
	) {
		await this.onboarding.yeuCauQuanTri(ctx.user.id);
		return this.onboarding.purgeDepartment(input);
	}

	@Mutation({
		input: departmentReorderInput,
		output: departmentListOutput,
		meta: restMeta("POST", "/onboarding/departments/reorder", TAG),
	})
	async reorderDepartments(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof departmentReorderInput>,
	) {
		await this.onboarding.yeuCauQuanTri(ctx.user.id);
		return this.onboarding.reorderDepartments(input);
	}

	@Query({
		input: archivedInput,
		output: templateListOutput,
		meta: restMeta("GET", "/onboarding/templates", TAG),
	})
	listTemplates(@Input() input: z.infer<typeof archivedInput>) {
		return this.onboarding.listTemplates(input);
	}

	@Mutation({
		input: templateCreateInput,
		output: templateOutput,
		meta: restMeta("POST", "/onboarding/templates", TAG),
	})
	async createTemplate(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof templateCreateInput>,
	) {
		await this.onboarding.yeuCauQuanTri(ctx.user.id);
		return this.onboarding.createTemplate(input);
	}

	@Mutation({
		input: templateUpdateInput,
		output: templateOutput,
		meta: restMeta("PATCH", "/onboarding/templates/{id}", TAG),
	})
	async updateTemplate(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof templateUpdateInput>,
	) {
		await this.onboarding.yeuCauQuanTri(ctx.user.id);
		return this.onboarding.updateTemplate(input);
	}

	@Mutation({
		input: templateIdInput,
		output: templateOutput,
		meta: restMeta("POST", "/onboarding/templates/{id}/archive", TAG),
	})
	async archiveTemplate(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof templateIdInput>,
	) {
		await this.onboarding.yeuCauQuanTri(ctx.user.id);
		return this.onboarding.archiveTemplate(input);
	}

	@Mutation({
		input: templateIdInput,
		output: templateOutput,
		meta: restMeta("POST", "/onboarding/templates/{id}/restore", TAG),
	})
	async restoreTemplate(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof templateIdInput>,
	) {
		await this.onboarding.yeuCauQuanTri(ctx.user.id);
		return this.onboarding.restoreTemplate(input);
	}

	@Mutation({
		input: templateIdInput,
		output: deletedOutput,
		meta: restMeta("DELETE", "/onboarding/templates/{id}", TAG),
	})
	async purgeTemplate(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof templateIdInput>,
	) {
		await this.onboarding.yeuCauQuanTri(ctx.user.id);
		return this.onboarding.purgeTemplate(input);
	}

	@Query({
		input: planListInput,
		output: planListOutput,
		meta: restMeta("GET", "/onboarding/plans", TAG),
	})
	listPlans(@Input() input: z.infer<typeof planListInput>) {
		return this.onboarding.listPlans(input);
	}

	@Query({
		input: planIdInput,
		output: planDetailOutput,
		meta: restMeta("GET", "/onboarding/plans/{id}", TAG),
	})
	planById(@Input() input: z.infer<typeof planIdInput>) {
		return this.onboarding.planById(input);
	}

	@Mutation({
		input: planCreateFromTemplateInput,
		output: planOutput,
		meta: restMeta("POST", "/onboarding/plans", TAG),
	})
	createFromTemplate(
		@Input() input: z.infer<typeof planCreateFromTemplateInput>,
	) {
		return this.onboarding.createFromTemplate(input);
	}

	@Mutation({
		input: planIdInput,
		output: planOutput,
		meta: restMeta("POST", "/onboarding/plans/{id}/close", TAG),
	})
	closePlan(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof planIdInput>,
	) {
		return this.onboarding.closePlan(input, ctx.user.id);
	}

	@Mutation({
		input: planIdInput,
		output: planOutput,
		meta: restMeta("POST", "/onboarding/plans/{id}/reopen", TAG),
	})
	reopenPlan(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof planIdInput>,
	) {
		return this.onboarding.reopenPlan(input, ctx.user.id);
	}

	@Mutation({
		input: stepAssignInput,
		output: stepOutput,
		meta: restMeta("PATCH", "/onboarding/steps/{stepId}/assignee", TAG),
	})
	assignStep(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof stepAssignInput>,
	) {
		return this.onboarding.assignStep(input, ctx.user.id);
	}

	@Mutation({
		input: stepDoneInput,
		output: stepOutput,
		meta: restMeta("PATCH", "/onboarding/steps/{stepId}/done", TAG),
	})
	setStepDone(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof stepDoneInput>,
	) {
		return this.onboarding.setStepDone(input, ctx.user.id);
	}

	@Mutation({
		input: stepRescheduleInput,
		output: stepOutput,
		meta: restMeta("PATCH", "/onboarding/steps/{stepId}/due", TAG),
	})
	rescheduleStep(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof stepRescheduleInput>,
	) {
		return this.onboarding.rescheduleStep(input, ctx.user.id);
	}

	@Mutation({
		input: stepAddInput,
		output: stepOutput,
		meta: restMeta("POST", "/onboarding/plans/{planId}/steps", TAG),
	})
	addStep(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof stepAddInput>,
	) {
		return this.onboarding.addStep(input, ctx.user.id);
	}

	@Mutation({
		input: stepIdInput,
		output: stepRemovedOutput,
		meta: restMeta("DELETE", "/onboarding/steps/{stepId}", TAG),
	})
	removeStep(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof stepIdInput>,
	) {
		return this.onboarding.removeStep(input, ctx.user.id);
	}

	@Mutation({
		input: stepReorderInput,
		output: stepListOutput,
		meta: restMeta("PUT", "/onboarding/plans/{planId}/steps/order", TAG),
	})
	reorderSteps(@Input() input: z.infer<typeof stepReorderInput>) {
		return this.onboarding.reorderSteps(input);
	}

	@Mutation({
		input: planOwnerInput,
		output: planOutput,
		meta: restMeta("PATCH", "/onboarding/plans/{planId}/owner", TAG),
	})
	setPlanOwner(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof planOwnerInput>,
	) {
		return this.onboarding.setPlanOwner(input, ctx.user.id);
	}

	@Query({
		input: stepListInput,
		output: stepListOutput,
		meta: restMeta("GET", "/onboarding/steps", TAG),
	})
	listSteps(@Input() input: z.infer<typeof stepListInput>) {
		return this.onboarding.listSteps(input);
	}

	@Query({
		input: planIdInput,
		output: enrollmentListOutput,
		meta: restMeta("GET", "/onboarding/plans/{id}/enrollments", TAG),
	})
	listEnrollments(@Input() input: z.infer<typeof planIdInput>) {
		return this.onboarding.listEnrollments(input);
	}

	@Mutation({
		input: enrollmentUpsertInput,
		output: enrollmentOutput,
		meta: restMeta("POST", "/onboarding/enrollments", TAG),
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
			TAG,
		),
	})
	removeEnrollment(@Input() input: z.infer<typeof enrollmentRemoveInput>) {
		return this.onboarding.removeEnrollment(input);
	}

	@Mutation({
		input: enrollmentStageInput,
		output: enrollmentOutput,
		meta: restMeta("POST", "/onboarding/enrollments/{id}/stage", TAG),
	})
	markEnrollmentStage(@Input() input: z.infer<typeof enrollmentStageInput>) {
		return this.onboarding.markEnrollmentStage(input);
	}

	@Query({
		input: planListInput,
		output: danhMucOutput,
		meta: restMeta("GET", "/onboarding/danh-muc", TAG),
	})
	manDanhMuc(@Input() input: z.infer<typeof planListInput>) {
		return this.onboarding.manDanhMuc(input);
	}

	@Query({
		input: bangCotInput,
		output: bangCotOutput,
		meta: restMeta("GET", "/onboarding/bang-cot", TAG),
	})
	bangCot(@Input() input: z.infer<typeof bangCotInput>) {
		return this.onboarding.bangCot(input);
	}
}
