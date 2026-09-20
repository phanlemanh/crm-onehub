import { Inject } from "@nestjs/common";
import { Input, Mutation, Query, Router, UseMiddlewares } from "nestjs-trpc";
import type { z } from "zod";
import { AuthMiddleware } from "../trpc/middlewares/auth.middleware";
import { restMeta } from "../trpc/openapi";
import {
	departmentCreateInput,
	departmentIdInput,
	departmentListOutput,
	departmentOutput,
	departmentReorderInput,
	departmentUpdateInput,
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
}
