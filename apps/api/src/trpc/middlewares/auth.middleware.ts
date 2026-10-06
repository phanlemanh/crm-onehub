import {
	docDuocPhamVi,
	KHONG_TRONG_PHAM_VI,
	NOT_A_MEMBER,
	type PhamViDuLieu,
	workspaceRoleOf,
} from "@crm/auth";
import { Injectable } from "@nestjs/common";
import { TRPCError } from "@trpc/server";
import type {
	MiddlewareOptions,
	MiddlewareResponse,
	TRPCMiddleware,
} from "nestjs-trpc";
import { setRequestUserId } from "../../logging/request-context";
import type { AuthedTrpcContext, BaseTrpcContext } from "../context.types";
import { ghiPhamViYeuCau } from "../pham-vi-yeu-cau";

@Injectable()
export class AuthMiddleware implements TRPCMiddleware {
	protected readonly phamVi: PhamViDuLieu | null = null;

	async use(opts: MiddlewareOptions): Promise<MiddlewareResponse> {
		const ctx = opts.ctx as BaseTrpcContext;

		if (ctx.sessionError) {
			throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
		}

		const user = ctx.session?.user;

		if (!user) {
			throw new TRPCError({ code: "UNAUTHORIZED" });
		}

		setRequestUserId(user.id);

		const role = await workspaceRoleOf(user.id);

		if (!role) {
			throw new TRPCError({ code: "FORBIDDEN", message: NOT_A_MEMBER });
		}

		ghiPhamViYeuCau(ctx, { role, phamVi: this.phamVi });

		if (!docDuocPhamVi(role, this.phamVi)) {
			throw new TRPCError({ code: "FORBIDDEN", message: KHONG_TRONG_PHAM_VI });
		}

		const nextCtx: AuthedTrpcContext = { ...ctx, user };
		return opts.next({ ctx: nextCtx });
	}
}
