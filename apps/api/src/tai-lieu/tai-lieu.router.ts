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
	taiLieuDeXuatTrangInput,
	taiLieuGetOutput,
	taiLieuIdInput,
	taiLieuLichSuOutput,
	taiLieuListInput,
	taiLieuListOutput,
	taiLieuNhacToiOutput,
	taiLieuOkOutput,
	taiLieuPhienBanInput,
	taiLieuPhienBanOutput,
	taiLieuProposalOutput,
	taiLieuProposalsInput,
	taiLieuProposalsOutput,
	taiLieuProposeInput,
	taiLieuProposeOutput,
	taiLieuRejectInput,
	taiLieuSlugInput,
	taiLieuSucKhoeOutput,
	taiLieuTimInput,
	taiLieuTimOutput,
} from "./tai-lieu.contracts";
import { TaiLieuService } from "./tai-lieu.service";
import {
	taiLieuDatXacMinhInput,
	taiLieuXuLyBaoSaiInput,
	taiLieuXuLyChuaTraLoiInput,
} from "./tai-lieu-hoi.contracts";
import { TaiLieuHoiService } from "./tai-lieu-hoi.service";
import { TaiLieuLichSuService } from "./tai-lieu-lich-su.service";
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
		@Inject(TaiLieuHoiService) private readonly hoiKho: TaiLieuHoiService,
		@Inject(TaiLieuLichSuService)
		private readonly lichSuTrang: TaiLieuLichSuService,
	) {}

	@Query({
		input: taiLieuSlugInput,
		output: taiLieuLichSuOutput,
		meta: restMeta("GET", "/tai-lieu/trang/{slug}/lich-su", TAG),
	})
	lichSu(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof taiLieuSlugInput>,
	) {
		return this.lichSuTrang.lichSu(nguoiGoi(ctx), input.slug);
	}

	@Query({
		input: taiLieuPhienBanInput,
		output: taiLieuPhienBanOutput,
		meta: restMeta("GET", "/tai-lieu/trang/{slug}/lich-su/{so}", TAG),
	})
	phienBan(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof taiLieuPhienBanInput>,
	) {
		return this.lichSuTrang.phienBan(nguoiGoi(ctx), input);
	}

	@Mutation({
		input: taiLieuPhienBanInput,
		output: taiLieuProposeOutput,
		meta: restMeta("POST", "/tai-lieu/trang/{slug}/lich-su/{so}/quay-lai", TAG),
	})
	quayLai(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof taiLieuPhienBanInput>,
	) {
		return this.lichSuTrang.quayLai(nguoiGoi(ctx), input);
	}

	@Mutation({
		input: taiLieuDeXuatTrangInput,
		output: taiLieuProposeOutput,
		meta: restMeta("POST", "/tai-lieu/trang/{slug}/de-xuat-luu-tru", TAG),
	})
	deXuatLuuTru(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof taiLieuDeXuatTrangInput>,
	) {
		return this.lichSuTrang.deXuatLuuTru(nguoiGoi(ctx), input);
	}

	@Mutation({
		input: taiLieuDeXuatTrangInput,
		output: taiLieuProposeOutput,
		meta: restMeta("POST", "/tai-lieu/trang/{slug}/de-xuat-khoi-phuc", TAG),
	})
	deXuatKhoiPhuc(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof taiLieuDeXuatTrangInput>,
	) {
		return this.lichSuTrang.deXuatKhoiPhuc(nguoiGoi(ctx), input);
	}

	@Mutation({
		input: taiLieuDatXacMinhInput,
		output: taiLieuOkOutput,
		meta: restMeta("POST", "/tai-lieu/{slug}/xac-minh", TAG),
	})
	datXacMinh(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof taiLieuDatXacMinhInput>,
	) {
		return this.taiLieu.datXacMinh(nguoiGoi(ctx), input);
	}

	@Mutation({
		input: taiLieuXuLyChuaTraLoiInput,
		output: taiLieuOkOutput,
		meta: restMeta("POST", "/tai-lieu/chua-tra-loi/{hoiId}/xu-ly", TAG),
	})
	xuLyChuaTraLoi(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof taiLieuXuLyChuaTraLoiInput>,
	) {
		return this.hoiKho.xuLyChuaTraLoi(nguoiGoi(ctx), input.hoiId);
	}

	@Mutation({
		input: taiLieuXuLyBaoSaiInput,
		output: taiLieuOkOutput,
		meta: restMeta("POST", "/tai-lieu/bao-sai/{id}/xu-ly", TAG),
	})
	xuLyBaoSai(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof taiLieuXuLyBaoSaiInput>,
	) {
		return this.hoiKho.xuLyBaoSai(nguoiGoi(ctx), input);
	}

	@Query({
		input: taiLieuTimInput,
		output: taiLieuTimOutput,
		meta: restMeta("GET", "/tai-lieu/tim", TAG),
	})
	tim(@Input() input: z.infer<typeof taiLieuTimInput>) {
		return this.timKiem.tim(input.q);
	}

	@Query({
		output: taiLieuSucKhoeOutput,
		meta: restMeta("GET", "/tai-lieu/suc-khoe", TAG),
	})
	sucKhoe(@Ctx() ctx: AuthedTrpcContext) {
		return this.timKiem.sucKhoe(nguoiGoi(ctx));
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
		input: taiLieuProposalsInput,
		output: taiLieuProposalsOutput,
		meta: restMeta("GET", "/tai-lieu/de-xuat", TAG),
	})
	proposals(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof taiLieuProposalsInput>,
	) {
		return this.taiLieu.proposals(nguoiGoi(ctx), input);
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
