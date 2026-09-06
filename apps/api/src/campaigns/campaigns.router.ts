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
	campaignCreateInput,
	campaignDetailOutput,
	campaignIdInput,
	campaignListOutput,
	campaignMembersInput,
	campaignMembersOutput,
	campaignRepointInput,
	campaignTouchInput,
	campaignTouchOutput,
} from "./campaigns.contracts";
import { CampaignsService } from "./campaigns.service";

@Router({ alias: "campaigns" })
@UseMiddlewares(AuthMiddleware)
export class CampaignsRouter {
	constructor(
		@Inject(CampaignsService) private readonly campaigns: CampaignsService,
	) {}

	@Query({
		output: campaignListOutput,
		meta: restMeta("GET", "/campaigns", ["Campaigns"]),
	})
	async list() {
		return this.campaigns.list();
	}

	@Query({
		input: campaignIdInput,
		output: campaignDetailOutput,
		meta: restMeta("GET", "/campaigns/{id}", ["Campaigns"]),
	})
	async byId(@Input("id") id: string) {
		return this.campaigns.byId(id);
	}

	@Query({
		input: campaignMembersInput,
		output: campaignMembersOutput,
		meta: restMeta("POST", "/campaigns/{id}/members", ["Campaigns"]),
	})
	async members(@Input() input: z.infer<typeof campaignMembersInput>) {
		return this.campaigns.members(input);
	}

	@Mutation({
		input: campaignCreateInput,
		output: campaignDetailOutput,
		meta: restMeta("POST", "/campaigns", ["Campaigns"]),
	})
	async create(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof campaignCreateInput>,
	) {
		return this.campaigns.create(input, ctx.user.id);
	}

	@Mutation({
		input: campaignIdInput,
		output: campaignDetailOutput,
		meta: restMeta("POST", "/campaigns/{id}/start", ["Campaigns"]),
	})
	async start(@Input("id") id: string) {
		return this.campaigns.start(id);
	}

	@Mutation({
		input: campaignIdInput,
		output: campaignDetailOutput,
		meta: restMeta("POST", "/campaigns/{id}/finish", ["Campaigns"]),
	})
	async finish(@Input("id") id: string) {
		return this.campaigns.finish(id);
	}

	@Mutation({
		input: campaignRepointInput,
		output: campaignDetailOutput,
		meta: restMeta("POST", "/campaigns/{id}/segment", ["Campaigns"]),
	})
	async repoint(@Input() input: z.infer<typeof campaignRepointInput>) {
		return this.campaigns.repoint(input);
	}

	@Mutation({
		input: campaignTouchInput,
		output: campaignTouchOutput,
		meta: restMeta("POST", "/campaigns/{id}/touches", ["Campaigns"]),
	})
	async touch(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof campaignTouchInput>,
	) {
		return this.campaigns.touch(input, ctx.user.id);
	}
}
