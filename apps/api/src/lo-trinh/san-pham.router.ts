import { sanPhamKhai } from "@crm/validation/san-pham-lo-trinh";
import { Inject } from "@nestjs/common";
import {
	Ctx,
	Input,
	Mutation,
	Query,
	Router,
	UseMiddlewares,
} from "nestjs-trpc";
import { z } from "zod";
import type { AuthedTrpcContext } from "../trpc/context.types";
import { PhamViChungMiddleware } from "../trpc/middlewares/pham-vi-du-lieu.middleware";
import { restMeta } from "../trpc/openapi";
import {
	sanPhamDanhSach,
	sanPhamGhiRa,
	sanPhamHang,
	sanPhamMaVao,
	sanPhamNguoiXemRa,
	sanPhamNguoiXemVao,
	sanPhamSuaVao,
} from "./san-pham.contracts";
import { SanPhamLoTrinhService } from "./san-pham.service";

const THE = ["Roadmap products"];

@Router({ alias: "sanPhamLoTrinh" })
@UseMiddlewares(PhamViChungMiddleware)
export class SanPhamLoTrinhRouter {
	constructor(
		@Inject(SanPhamLoTrinhService)
		private readonly sanPham: SanPhamLoTrinhService,
	) {}

	@Query({
		output: sanPhamDanhSach,
		meta: restMeta("GET", "/roadmap-products", THE),
	})
	async danhSach(@Ctx() ctx: AuthedTrpcContext) {
		return this.sanPham.danhSach(ctx.user.id);
	}

	@Query({
		output: z.array(sanPhamHang),
		meta: restMeta("GET", "/roadmap-products/archived", THE),
	})
	async daLuuTru(@Ctx() ctx: AuthedTrpcContext) {
		return this.sanPham.daLuuTru(ctx.user.id);
	}

	@Query({
		input: sanPhamMaVao,
		output: sanPhamNguoiXemRa,
		meta: restMeta("GET", "/roadmap-products/{ma}/viewers", THE),
	})
	async nguoiXem(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof sanPhamMaVao>,
	) {
		return this.sanPham.nguoiXem(ctx.user.id, input.ma);
	}

	@Mutation({
		input: sanPhamKhai,
		output: sanPhamGhiRa,
		meta: restMeta("POST", "/roadmap-products", THE),
	})
	async tao(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof sanPhamKhai>,
	) {
		return this.sanPham.tao(ctx.user.id, input);
	}

	@Mutation({
		input: sanPhamSuaVao,
		output: sanPhamGhiRa,
		meta: restMeta("PATCH", "/roadmap-products/{ma}", THE),
	})
	async sua(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof sanPhamSuaVao>,
	) {
		return this.sanPham.sua(ctx.user.id, input);
	}

	@Mutation({
		input: sanPhamNguoiXemVao,
		output: sanPhamGhiRa,
		meta: restMeta("PUT", "/roadmap-products/{ma}/viewers", THE),
	})
	async datNguoiXem(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof sanPhamNguoiXemVao>,
	) {
		return this.sanPham.datNguoiXem(ctx.user.id, input);
	}

	@Mutation({
		input: sanPhamMaVao,
		output: sanPhamGhiRa,
		meta: restMeta("POST", "/roadmap-products/{ma}/archive", THE),
	})
	async luuTru(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof sanPhamMaVao>,
	) {
		return this.sanPham.luuTru(ctx.user.id, input.ma);
	}

	@Mutation({
		input: sanPhamMaVao,
		output: sanPhamGhiRa,
		meta: restMeta("POST", "/roadmap-products/{ma}/restore", THE),
	})
	async khoiPhuc(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof sanPhamMaVao>,
	) {
		return this.sanPham.khoiPhuc(ctx.user.id, input.ma);
	}

	@Mutation({
		input: sanPhamMaVao,
		output: sanPhamGhiRa,
		meta: restMeta("DELETE", "/roadmap-products/{ma}", THE),
	})
	async xoa(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof sanPhamMaVao>,
	) {
		return this.sanPham.xoa(ctx.user.id, input.ma);
	}

	@Mutation({
		input: sanPhamMaVao,
		output: sanPhamGhiRa,
		meta: restMeta("POST", "/roadmap-products/{ma}/purge", THE),
	})
	async xoaVinhVien(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof sanPhamMaVao>,
	) {
		return this.sanPham.xoaVinhVien(ctx.user.id, input.ma);
	}
}
