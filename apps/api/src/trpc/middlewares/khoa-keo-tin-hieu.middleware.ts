import {
	API_KEY_HEADER,
	NOT_A_MEMBER,
	workspaceRoleOf,
	xacMinhKhoaKeoTinHieu,
} from "@crm/auth";
import { laQuanTriWorkspace } from "@crm/validation/vai-workspace";
import { Injectable } from "@nestjs/common";
import { TRPCError } from "@trpc/server";
import type {
	MiddlewareOptions,
	MiddlewareResponse,
	TRPCMiddleware,
} from "nestjs-trpc";
import { z } from "zod";
import { setRequestUserId } from "../../logging/request-context";
import type { BaseTrpcContext, KhoaTrpcContext } from "../context.types";

@Injectable()
export class KhoaKeoTinHieuMiddleware implements TRPCMiddleware {
	async use(opts: MiddlewareOptions): Promise<MiddlewareResponse> {
		const ctx = opts.ctx as BaseTrpcContext;
		const tho = z.string().safeParse(ctx.req?.headers[API_KEY_HEADER]);
		const key = tho.success ? tho.data.trim() : "";
		const khoa = key
			? await xacMinhKhoaKeoTinHieu(key).catch(() => null)
			: null;
		if (!khoa) {
			if (ctx.sessionError)
				throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
			const nguoi = ctx.session?.user;
			if (nguoi && !(await workspaceRoleOf(nguoi.id))) {
				throw new TRPCError({ code: "FORBIDDEN", message: NOT_A_MEMBER });
			}
			throw new TRPCError({ code: "UNAUTHORIZED" });
		}
		const role = await workspaceRoleOf(khoa.userId);
		if (!laQuanTriWorkspace(role)) throw new TRPCError({ code: "FORBIDDEN" });
		setRequestUserId(khoa.userId);
		const nextCtx: KhoaTrpcContext = {
			...ctx,
			khoaKeoTinHieu: { ...khoa, role },
		};
		return opts.next({ ctx: nextCtx });
	}
}
