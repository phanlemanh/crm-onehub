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
import { PhamViOkrMiddleware } from "../trpc/middlewares/pham-vi-du-lieu.middleware";
import { restMeta } from "../trpc/openapi";
import {
	alignmentInput,
	alignmentTargetsInput,
	alignmentTargetsOutput,
	alignmentTreeInput,
	alignmentTreeOutput,
	byUnitInput,
	byUnitOutput,
	countByUnitInput,
	createCycleInput,
	createKrInput,
	createObjectiveInput,
	cyclesOutput,
	idInput,
	mineInput,
	mineOutput,
	objectiveInput,
	objectiveOutput,
	okOutput,
	okrAccessOutput,
	okrCountByUnitOutput,
	okrImportApplyInput,
	okrImportApplyOutput,
	okrImportInput,
	okrImportPreviewOutput,
	programOutput,
	setCyclePhaseInput,
	setProgramInput,
	updateKrInput,
	updateObjectiveInput,
} from "./okr.contracts";
import { OkrService } from "./okr.service";
import { danhSachInput, danhSachOutput } from "./okr-xem.contracts";
import { OkrXemService } from "./okr-xem.service";

const TAG = ["OKR"];

@Router({ alias: "okr" })
@UseMiddlewares(PhamViOkrMiddleware)
export class OkrRouter {
	constructor(
		@Inject(OkrService) private readonly okr: OkrService,
		@Inject(OkrXemService) private readonly xem: OkrXemService,
	) {}

	@Query({ output: okrAccessOutput, meta: restMeta("GET", "/okr/access", TAG) })
	access(@Ctx() ctx: AuthedTrpcContext) {
		return this.okr.access(ctx.user.id);
	}

	@Query({ output: cyclesOutput, meta: restMeta("GET", "/okr/cycles", TAG) })
	cycles() {
		return this.okr.cycles();
	}

	@Mutation({
		input: createCycleInput,
		output: okOutput,
		meta: restMeta("POST", "/okr/cycles", TAG),
	})
	createCycle(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof createCycleInput>,
	) {
		return this.okr.createCycle(ctx.user.id, input);
	}

	@Mutation({
		input: setCyclePhaseInput,
		output: okOutput,
		meta: restMeta("POST", "/okr/cycles/{id}/phase", TAG),
	})
	setCyclePhase(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof setCyclePhaseInput>,
	) {
		return this.okr.setCyclePhase(ctx.user.id, input.id, input.phase);
	}

	@Query({ output: programOutput, meta: restMeta("GET", "/okr/program", TAG) })
	program(@Ctx() ctx: AuthedTrpcContext) {
		return this.okr.programFor(ctx.user.id);
	}

	@Mutation({
		input: setProgramInput,
		output: programOutput,
		meta: restMeta("PUT", "/okr/program", TAG),
	})
	setProgram(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof setProgramInput>,
	) {
		return this.okr.setProgram(ctx.user.id, input);
	}

	@Query({
		input: byUnitInput,
		output: byUnitOutput,
		meta: restMeta("POST", "/okr/units/objectives", TAG),
	})
	byUnit(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof byUnitInput>,
	) {
		return this.okr.byUnit(ctx.user.id, input.cycleId, input.unit);
	}

	@Query({
		input: countByUnitInput,
		output: okrCountByUnitOutput,
		meta: restMeta("GET", "/okr/units/count", TAG),
	})
	countByUnit(@Input() input: z.infer<typeof countByUnitInput>) {
		return this.okr.countByUnit(input.cycleId);
	}

	@Query({
		input: mineInput,
		output: mineOutput,
		meta: restMeta("GET", "/okr/mine", TAG),
	})
	mine(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof mineInput>,
	) {
		return this.okr.mine(ctx.user.id, input.cycleId);
	}

	@Query({
		input: objectiveInput,
		output: objectiveOutput,
		meta: restMeta("GET", "/okr/objectives/{id}", TAG),
	})
	objective(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof objectiveInput>,
	) {
		return this.okr.objective(ctx.user.id, input.id);
	}

	@Mutation({
		input: createObjectiveInput,
		output: okOutput,
		meta: restMeta("POST", "/okr/objectives", TAG),
	})
	createObjective(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof createObjectiveInput>,
	) {
		return this.okr.createObjective(ctx.user.id, input);
	}

	@Mutation({
		input: updateObjectiveInput,
		output: okOutput,
		meta: restMeta("PATCH", "/okr/objectives/{id}", TAG),
	})
	updateObjective(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof updateObjectiveInput>,
	) {
		return this.okr.updateObjective(ctx.user.id, input);
	}

	@Mutation({
		input: idInput,
		output: okOutput,
		meta: restMeta("POST", "/okr/objectives/{id}/publish", TAG),
	})
	publishObjective(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof idInput>,
	) {
		return this.okr.publishObjective(ctx.user.id, input.id);
	}

	@Mutation({
		input: idInput,
		output: okOutput,
		meta: restMeta("POST", "/okr/objectives/{id}/drop", TAG),
	})
	dropObjective(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof idInput>,
	) {
		return this.okr.dropObjective(ctx.user.id, input.id);
	}

	@Mutation({
		input: createKrInput,
		output: okOutput,
		meta: restMeta("POST", "/okr/key-results", TAG),
	})
	createKeyResult(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof createKrInput>,
	) {
		return this.okr.createKeyResult(ctx.user.id, input);
	}

	@Mutation({
		input: updateKrInput,
		output: okOutput,
		meta: restMeta("PATCH", "/okr/key-results/{id}", TAG),
	})
	updateKeyResult(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof updateKrInput>,
	) {
		return this.okr.updateKeyResult(ctx.user.id, input);
	}

	@Mutation({
		input: idInput,
		output: okOutput,
		meta: restMeta("DELETE", "/okr/key-results/{id}", TAG),
	})
	removeKeyResult(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof idInput>,
	) {
		return this.okr.removeKeyResult(ctx.user.id, input.id);
	}

	@Query({
		input: alignmentTreeInput,
		output: alignmentTreeOutput,
		meta: restMeta("GET", "/okr/alignment-tree", TAG),
	})
	alignmentTree(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof alignmentTreeInput>,
	) {
		return this.okr.alignmentTree(ctx.user.id, input.cycleId);
	}

	@Query({
		input: alignmentTargetsInput,
		output: alignmentTargetsOutput,
		meta: restMeta(
			"GET",
			"/okr/objectives/{objectiveId}/alignment-targets",
			TAG,
		),
	})
	alignmentTargets(@Input() input: z.infer<typeof alignmentTargetsInput>) {
		return this.okr.alignmentTargets(input.objectiveId);
	}

	@Mutation({
		input: alignmentInput,
		output: okOutput,
		meta: restMeta("POST", "/okr/alignments", TAG),
	})
	addAlignment(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof alignmentInput>,
	) {
		return this.okr.addAlignment(ctx.user.id, input);
	}

	@Mutation({
		input: idInput,
		output: okOutput,
		meta: restMeta("DELETE", "/okr/alignments/{id}", TAG),
	})
	removeAlignment(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof idInput>,
	) {
		return this.okr.removeAlignment(ctx.user.id, input.id);
	}

	@Mutation({
		input: okrImportInput,
		output: okrImportPreviewOutput,
		meta: restMeta("POST", "/okr/import/preview", TAG),
	})
	previewImport(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof okrImportInput>,
	) {
		return this.okr.previewImport(ctx.user.id, input);
	}

	@Mutation({
		input: okrImportApplyInput,
		output: okrImportApplyOutput,
		meta: restMeta("POST", "/okr/import", TAG),
	})
	applyImport(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof okrImportApplyInput>,
	) {
		return this.okr.applyImport(ctx.user.id, input);
	}

	@Query({
		input: danhSachInput,
		output: danhSachOutput,
		meta: restMeta("POST", "/okr/units/list", TAG),
	})
	danhSach(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof danhSachInput>,
	) {
		return this.xem.danhSach(ctx.user.id, input);
	}
}
