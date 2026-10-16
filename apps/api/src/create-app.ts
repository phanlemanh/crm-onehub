import { API_KEY_HEADER, apiUrl, SESSION_COOKIE_NAME } from "@crm/auth";
import { BAN_CHUP_LO_TRINH } from "@crm/validation/ban-chup-lo-trinh";
import { PayloadTooLargeException, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
	ExpressAdapter,
	type NestExpressApplication,
} from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { json, type NextFunction, type Request, type Response } from "express";
import helmet from "helmet";
import { AppRouterHost } from "nestjs-trpc";
import {
	createOpenApiExpressMiddleware,
	generateOpenApiDocument,
} from "trpc-to-openapi";
import { AppModule } from "./app.module";
import { LISTING_INGEST } from "./listings/listings-config";
import { ContextLogger } from "./logging/context-logger";
import { REST_BRIDGE_BODY_LIMIT_BYTES, REST_BRIDGE_PATH } from "./trpc/openapi";
import { createBaseTrpcContext } from "./trpc/trpc.context";

export async function createApp(): Promise<NestExpressApplication> {
	const app = await NestFactory.create<NestExpressApplication>(
		AppModule,
		new ExpressAdapter(),
		{ bodyParser: false, logger: new ContextLogger() },
	);

	app.use(helmet());
	app.use(
		LISTING_INGEST.path,
		json({ limit: LISTING_INGEST.bodyLimitBytes }),
		(
			error: Error,
			_request: Request,
			_response: Response,
			next: NextFunction,
		) => {
			next(
				error.name === "PayloadTooLargeError"
					? new PayloadTooLargeException(
							`A listing batch must be ${LISTING_INGEST.bodyLimitBytes} bytes or smaller. Send it in batches.`,
						)
					: error,
			);
		},
	);
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
			transformOptions: { enableImplicitConversion: true },
		}),
	);

	let restBridge: ((req: Request, res: Response) => Promise<void>) | undefined;
	app.use(
		REST_BRIDGE_PATH,
		(req: Request, res: Response, next: NextFunction) => {
			if (!restBridge) {
				next();
				return;
			}
			void restBridge(req, res);
		},
	);

	const apiKeySecurityScheme = {
		type: "apiKey",
		in: "header",
		name: API_KEY_HEADER,
	} as const;

	// SwaggerModule.setup() registers its Express routes synchronously, so it must
	// happen before app.init() the same way the REST bridge does — Nest's own
	// routing (wired up during init) otherwise shadows anything registered after
	// it. The factory form defers building the document (which needs the tRPC
	// router, only available post-init) to first request instead.
	SwaggerModule.setup(
		"",
		app,
		() => {
			const { appRouter } = app.get(AppRouterHost);

			const trpcDocument = generateOpenApiDocument(appRouter, {
				title: "CRM API — tRPC bridge",
				description:
					"Every tRPC procedure, reachable over REST for tooling that cannot speak tRPC. Same validation, same middlewares, same services as the tRPC transport — this only translates the wire format.",
				version: "1.0",
				baseUrl: `${apiUrl}${REST_BRIDGE_PATH}`,
				securitySchemes: { apiKey: apiKeySecurityScheme },
			});

			const swaggerConfig = new DocumentBuilder()
				.setTitle("CRM API")
				.setDescription(
					`REST surface of the CRM API — auth, health, the internal cron routes, and a generated REST bridge (under ${REST_BRIDGE_PATH}) for every tRPC procedure.`,
				)
				.setVersion("1.0")
				.addCookieAuth(SESSION_COOKIE_NAME)
				.addApiKey(apiKeySecurityScheme, "apiKey")
				.build();
			const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

			swaggerDocument.paths = {
				...swaggerDocument.paths,
				...(trpcDocument.paths as typeof swaggerDocument.paths),
			};
			swaggerDocument.components = {
				...swaggerDocument.components,
				schemas: {
					...swaggerDocument.components?.schemas,
					...(trpcDocument.components?.schemas as NonNullable<
						typeof swaggerDocument.components
					>["schemas"]),
				},
			};

			return swaggerDocument;
		},
		{ jsonDocumentUrl: "openapi.json" },
	);

	await app.init();

	const { appRouter } = app.get(AppRouterHost);

	const cauBanChup = createOpenApiExpressMiddleware({
		router: appRouter,
		createContext: ({ req }) => createBaseTrpcContext(req),
		maxBodySize: BAN_CHUP_LO_TRINH.tranThanByte,
	});
	const cauChung = createOpenApiExpressMiddleware({
		router: appRouter,
		createContext: ({ req }) => createBaseTrpcContext(req),
		maxBodySize: REST_BRIDGE_BODY_LIMIT_BYTES,
	});
	restBridge = (req, res) =>
		req.path === BAN_CHUP_LO_TRINH.duongRest
			? cauBanChup(req, res)
			: cauChung(req, res);

	return app;
}
