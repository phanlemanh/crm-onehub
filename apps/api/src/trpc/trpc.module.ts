import { Module } from "@nestjs/common";
import { TRPCModule } from "nestjs-trpc";
import { ContextLogger } from "../logging/context-logger";
import { formatTrpcError } from "./error-formatter";
import { AuthMiddleware } from "./middlewares/auth.middleware";
import { DomainErrorMiddleware } from "./middlewares/domain-error.middleware";
import { KhoaKeoTinHieuMiddleware } from "./middlewares/khoa-keo-tin-hieu.middleware";
import { LoggingMiddleware } from "./middlewares/logging.middleware";
import {
	PhamViChungMiddleware,
	PhamViDoiTacMiddleware,
	PhamViOkrMiddleware,
	PhamViToChucMiddleware,
} from "./middlewares/pham-vi-du-lieu.middleware";
import { SessionOnlyMiddleware } from "./middlewares/session-only.middleware";
import { SignedInMiddleware } from "./middlewares/signed-in.middleware";
import { TrpcContext } from "./trpc.context";
import { TrpcErrorHandler } from "./trpc-error.handler";

@Module({
	imports: [
		TRPCModule.forRoot({
			basePath: "/api/trpc",
			context: TrpcContext,
			logger: new ContextLogger(),
			errorFormatter: formatTrpcError,
			onError: TrpcErrorHandler,
			globalMiddlewares: [LoggingMiddleware, DomainErrorMiddleware],
		}),
	],
	providers: [
		TrpcContext,
		TrpcErrorHandler,
		LoggingMiddleware,
		DomainErrorMiddleware,
		AuthMiddleware,
		PhamViDoiTacMiddleware,
		PhamViToChucMiddleware,
		PhamViOkrMiddleware,
		PhamViChungMiddleware,
		SessionOnlyMiddleware,
		SignedInMiddleware,
		KhoaKeoTinHieuMiddleware,
	],
	exports: [
		AuthMiddleware,
		PhamViDoiTacMiddleware,
		PhamViToChucMiddleware,
		PhamViOkrMiddleware,
		PhamViChungMiddleware,
		SessionOnlyMiddleware,
		SignedInMiddleware,
		KhoaKeoTinHieuMiddleware,
	],
})
export class TrpcModule {}
