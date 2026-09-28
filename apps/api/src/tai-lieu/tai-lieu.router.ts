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
import { PhamViChungMiddleware } from "../trpc/middlewares/pham-vi-du-lieu.middleware";
import { restMeta } from "../trpc/openapi";
import { docPhamViYeuCau } from "../trpc/pham-vi-yeu-cau";
import type { NguoiGoi } from "./quyen";
import {
	taiLieuApproveInput,
	taiLieuApproveOutput,
	taiLieuBoLocOutput,
	taiLieuCreateInput,
	taiLieuCreateOutput,
	taiLieuDangDungOutput,
	taiLieuGetOutput,
	taiLieuIdInput,
	taiLieuListInput,
	taiLieuListOutput,
	taiLieuNhacToiOutput,
	taiLieuOkOutput,
	taiLieuProposalOutput,
	taiLieuProposalsOutput,
	taiLieuProposeInput,
	taiLieuProposeOutput,
	taiLieuRejectInput,
	taiLieuSlugInput,
	taiLieuTimInput,
	taiLieuTimOutput,
} from "./tai-lieu.contracts";
import { TaiLieuService } from "./tai-lieu.service";
import { TaiLieuTimService } from "./tai-lieu-tim.service";

const TAG = ["Documents"];

function nguoiGoi(ctx: AuthedTrpcContext): NguoiGoi {
	return { id: ctx.user.id, role: docPhamViYeuCau(ctx).role };
}

@Router({ alias: "taiLieu" })
@UseMiddlewares(PhamViChungMiddleware)
export class TaiLieuRouter {
	constructor(
		@Inject(TaiLieuService) private readonly taiLieu: TaiLieuService,
		@Inject(TaiLieuTimService) private readonly timKiem: TaiLieuTimService,
	) {}

	@Query({
		input: taiLieuTimInput,
		output: taiLieuTimOutput,
		meta: restMeta("GET", "/tai-lieu/tim", TAG),
	})
	tim(@Input() input: z.infer<typeof taiLieuTimInput>) {
		return this.timKiem.tim(input.q);
	}

	@Query({
		output: taiLieuBoLocOutput,
		meta: restMeta("GET", "/tai-lieu/bo-loc", TAG),
	})
	boLoc(@Ctx() ctx: AuthedTrpcContext) {
		return this.timKiem.boLoc(nguoiGoi(ctx));
	}

	@Query({
		input: taiLieuSlugInput,
		output: taiLieuNhacToiOutput,
		meta: restMeta("GET", "/tai-lieu/trang/{slug}/nhac-toi", TAG),
	})
	nhacToi(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof taiLieuSlugInput>,
	) {
		return this.timKiem.nhacToi(nguoiGoi(ctx), input.slug);
	}

	@Query({
		input: taiLieuListInput,
		output: taiLieuListOutput,
		meta: restMeta("GET", "/tai-lieu", TAG),
	})
	list(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof taiLieuListInput>,
	) {
		return this.taiLieu.list(nguoiGoi(ctx), input);
	}

	@Query({
		output: taiLieuDangDungOutput,
		meta: restMeta("GET", "/tai-lieu/dang-dung", TAG),
	})
	dangDung(@Ctx() ctx: AuthedTrpcContext) {
		return this.taiLieu.dangDung(nguoiGoi(ctx));
	}

	@Query({
		input: taiLieuSlugInput,
		output: taiLieuGetOutput,
		meta: restMeta("GET", "/tai-lieu/trang/{slug}", TAG),
	})
	get(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof taiLieuSlugInput>,
	) {
		return this.taiLieu.get(nguoiGoi(ctx), input.slug);
	}

	@Mutation({
		input: taiLieuCreateInput,
		output: taiLieuCreateOutput,
		meta: restMeta("POST", "/tai-lieu/trang", TAG),
	})
	create(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof taiLieuCreateInput>,
	) {
		return this.taiLieu.create(nguoiGoi(ctx), input);
	}

	@Mutation({
		input: taiLieuProposeInput,
		output: taiLieuProposeOutput,
		meta: restMeta("POST", "/tai-lieu/trang/{slug}/de-xuat", TAG),
	})
	propose(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof taiLieuProposeInput>,
	) {
		return this.taiLieu.propose(nguoiGoi(ctx), input);
	}

	@Query({
		output: taiLieuProposalsOutput,
		meta: restMeta("GET", "/tai-lieu/de-xuat", TAG),
	})
	proposals(@Ctx() ctx: AuthedTrpcContext) {
		return this.taiLieu.proposals(nguoiGoi(ctx));
	}

	@Query({
		input: taiLieuIdInput,
		output: taiLieuProposalOutput,
		meta: restMeta("GET", "/tai-lieu/de-xuat/{id}", TAG),
	})
	proposal(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof taiLieuIdInput>,
	) {
		return this.taiLieu.proposal(nguoiGoi(ctx), input.id);
	}

	@Mutation({
		input: taiLieuApproveInput,
		output: taiLieuApproveOutput,
		meta: restMeta("POST", "/tai-lieu/de-xuat/{id}/duyet", TAG),
	})
	approve(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof taiLieuApproveInput>,
	) {
		return this.taiLieu.approve(nguoiGoi(ctx), input);
	}

	@Mutation({
		input: taiLieuRejectInput,
		output: taiLieuOkOutput,
		meta: restMeta("POST", "/tai-lieu/de-xuat/{id}/tra-lai", TAG),
	})
	reject(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof taiLieuRejectInput>,
	) {
		return this.taiLieu.reject(nguoiGoi(ctx), input);
	}
}
