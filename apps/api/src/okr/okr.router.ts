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
	createCycleInput,
	cyclesOutput,
	okOutput,
	okrAccessOutput,
	programOutput,
	setCyclePhaseInput,
	setProgramInput,
} from "./okr.contracts";
import { OkrService } from "./okr.service";

const TAG = ["OKR"];

@Router({ alias: "okr" })
@UseMiddlewares(PhamViOkrMiddleware)
export class OkrRouter {
	constructor(@Inject(OkrService) private readonly okr: OkrService) {}

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
	program() {
		return this.okr.program();
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
}
