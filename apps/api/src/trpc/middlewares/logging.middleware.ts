import { Injectable, Logger } from "@nestjs/common";
import type {
	MiddlewareOptions,
	MiddlewareResponse,
	TRPCMiddleware,
} from "nestjs-trpc";
import type { BaseTrpcContext } from "../context.types";
import { moPhamViYeuCau } from "../pham-vi-yeu-cau";

@Injectable()
export class LoggingMiddleware implements TRPCMiddleware {
	private readonly logger = new Logger("tRPC");

	async use(opts: MiddlewareOptions): Promise<MiddlewareResponse> {
		const startedAt = Date.now();
		const phamViYeuCau = moPhamViYeuCau();
		const ctx: BaseTrpcContext = {
			...(opts.ctx as BaseTrpcContext),
			phamViYeuCau,
		};
		const result = await opts.next({ ctx });
		const durationMs = Date.now() - startedAt;
		const { role, phamVi } = phamViYeuCau;

		this.logger.log({
			message: `${opts.type} ${opts.path} ${result.ok ? "ok" : "err"} ${durationMs}ms`,
			type: opts.type,
			path: opts.path,
			outcome: result.ok ? "ok" : "err",
			durationMs,
			role,
			phamVi,
		});

		return result;
	}
}
