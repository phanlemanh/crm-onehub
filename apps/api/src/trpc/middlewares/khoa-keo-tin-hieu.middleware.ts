import {
	API_KEY_HEADER,
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
		if (!key) throw new TRPCError({ code: "UNAUTHORIZED" });
		const khoa = await xacMinhKhoaKeoTinHieu(key).catch(() => null);
		if (!khoa) throw new TRPCError({ code: "UNAUTHORIZED" });
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
