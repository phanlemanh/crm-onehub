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
	taiLieuNguonGetOutput,
	taiLieuNguonIdInput,
	taiLieuNguonListOutput,
	taiLieuNguonNhanInput,
	taiLieuNguonNhanOutput,
	taiLieuNguonOkOutput,
	taiLieuNguonTaiVeOutput,
	taiLieuNguonTrangThaiOutput,
	taiLieuNguonXinChoInput,
	taiLieuNguonXinChoOutput,
} from "./tai-lieu-nguon.contracts";
import { TaiLieuNguonService } from "./tai-lieu-nguon.service";

const TAG = ["Document sources"];

function nguoiGoi(ctx: AuthedTrpcContext): NguoiGoi {
	return { id: ctx.user.id, role: docPhamViYeuCau(ctx).role };
}

@Router({ alias: "taiLieuNguon" })
@UseMiddlewares(PhamViChungMiddleware)
export class TaiLieuNguonRouter {
	constructor(
		@Inject(TaiLieuNguonService) private readonly nguon: TaiLieuNguonService,
	) {}

	@Query({
		output: taiLieuNguonTrangThaiOutput,
		meta: restMeta("GET", "/tai-lieu/nguon/trang-thai", TAG),
	})
	trangThai() {
		return this.nguon.trangThai();
	}

	@Mutation({
		input: taiLieuNguonXinChoInput,
		output: taiLieuNguonXinChoOutput,
		meta: restMeta("POST", "/tai-lieu/nguon/xin-cho", TAG),
	})
	xinCho(@Input() input: z.infer<typeof taiLieuNguonXinChoInput>) {
		return this.nguon.xinCho(input);
	}

	@Mutation({
		input: taiLieuNguonNhanInput,
		output: taiLieuNguonNhanOutput,
		meta: restMeta("POST", "/tai-lieu/nguon/nhan", TAG),
	})
	nhan(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof taiLieuNguonNhanInput>,
	) {
		return this.nguon.nhan(nguoiGoi(ctx), input);
	}

	@Query({
		output: taiLieuNguonListOutput,
		meta: restMeta("GET", "/tai-lieu/nguon", TAG),
	})
	list(@Ctx() ctx: AuthedTrpcContext) {
		return this.nguon.list(nguoiGoi(ctx));
	}

	@Query({
		input: taiLieuNguonIdInput,
		output: taiLieuNguonGetOutput,
		meta: restMeta("GET", "/tai-lieu/nguon/{id}", TAG),
	})
	get(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof taiLieuNguonIdInput>,
	) {
		return this.nguon.get(nguoiGoi(ctx), input.id);
	}

	@Mutation({
		input: taiLieuNguonIdInput,
		output: taiLieuNguonTaiVeOutput,
		meta: restMeta("POST", "/tai-lieu/nguon/{id}/tai-ve", TAG),
	})
	taiVe(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof taiLieuNguonIdInput>,
	) {
		return this.nguon.taiVe(nguoiGoi(ctx), input.id);
	}

	@Mutation({
		input: taiLieuNguonIdInput,
		output: taiLieuNguonOkOutput,
		meta: restMeta("POST", "/tai-lieu/nguon/{id}/soan-lai", TAG),
	})
	soanLai(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof taiLieuNguonIdInput>,
	) {
		return this.nguon.soanLai(nguoiGoi(ctx), input.id);
	}
}
