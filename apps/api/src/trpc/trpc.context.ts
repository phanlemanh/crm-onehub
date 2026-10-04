import { auth } from "@crm/auth";
import { Injectable, Logger } from "@nestjs/common";
import { fromNodeHeaders } from "better-auth/node";
import type { Request } from "express";
import type { ContextOptions, TRPCContext } from "nestjs-trpc";
import type { BaseTrpcContext } from "./context.types";

const logger = new Logger("TrpcContext");

async function docPhien(
	req: Request,
): Promise<Pick<BaseTrpcContext, "session" | "sessionError">> {
	try {
		const session = await auth.api.getSession({
			headers: fromNodeHeaders(req.headers),
		});
		return { session, sessionError: false };
	} catch (error) {
		logger.error(
			{ message: "Could not read the session" },
			error instanceof Error ? error.stack : String(error),
		);
		return { session: null, sessionError: true };
	}
}

export async function createBaseTrpcContext(
	req: Request | undefined,
): Promise<BaseTrpcContext> {
	if (!req) return { req, session: null, sessionError: false };
	return { req, ...(await docPhien(req)) };
}

@Injectable()
export class TrpcContext implements TRPCContext {
	async create(opts: ContextOptions): Promise<BaseTrpcContext> {
		const req = "req" in opts ? opts.req : undefined;
		return createBaseTrpcContext(req);
	}
}
