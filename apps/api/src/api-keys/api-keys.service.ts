import {
	auth,
	configKhoaMay,
	DAY_SECONDS,
	loaiKhoaTuConfig,
	taoKhoaDayLoTrinh,
	taoKhoaKeoTinHieu,
	type WorkspaceRole,
} from "@crm/auth";
import type { Db, Prisma } from "@crm/db";
import { laQuanTriWorkspace } from "@crm/validation/vai-workspace";
import {
	ForbiddenException,
	HttpException,
	Injectable,
	InternalServerErrorException,
	Logger,
} from "@nestjs/common";
import { APIError } from "better-auth/api";
import { InjectDatabase } from "../database/database.constants";
import {
	type ListResult,
	type OrderByColumns,
	paginate,
	resolveOrderBy,
} from "../trpc/list-input";
import type {
	ApiKeyListInput,
	ApiKeySummary,
	CreateApiKeyInput,
	CreatedApiKey,
	RevokeApiKeyInput,
} from "./api-keys.contracts";

const KEY_SELECT = {
	id: true,
	name: true,
	start: true,
	enabled: true,
	createdAt: true,
	lastRequest: true,
	expiresAt: true,
	configId: true,
} satisfies Prisma.ApikeySelect;

type KeyRow = Prisma.ApikeyGetPayload<{ select: typeof KEY_SELECT }>;

const SORTABLE: OrderByColumns<Prisma.ApikeyOrderByWithRelationInput> = {
	name: (dir) => ({ name: dir }),
	createdAt: (dir) => ({ createdAt: dir }),
	lastRequest: (dir) => ({ lastRequest: dir }),
	expiresAt: (dir) => ({ expiresAt: dir }),
};

const STATUS_BY_CODE = new Map<string, number>([
	["BAD_REQUEST", 400],
	["UNAUTHORIZED", 401],
	["FORBIDDEN", 403],
	["NOT_FOUND", 404],
	["CONFLICT", 409],
	["UNPROCESSABLE_ENTITY", 400],
]);

function toSummary(row: KeyRow): ApiKeySummary {
	return {
		id: row.id,
		name: row.name,
		start: row.start,
		enabled: row.enabled ?? true,
		createdAt: row.createdAt.toISOString(),
		lastRequest: row.lastRequest?.toISOString() ?? null,
		expiresAt: row.expiresAt?.toISOString() ?? null,
		loai: loaiKhoaTuConfig(row.configId),
	};
}

@Injectable()
export class ApiKeysService {
	private readonly logger = new Logger(ApiKeysService.name);

	constructor(@InjectDatabase() private readonly db: Db) {}

	async list(
		userId: string,
		role: WorkspaceRole | null,
		input: ApiKeyListInput,
	): Promise<ListResult<ApiKeySummary> & { taoDuocKeoTinHieu: boolean }> {
		const where = this.searchWhere(userId, input.q);
		const { skip, take } = paginate(input);

		const [rows, total] = await Promise.all([
			this.db.apikey.findMany({
				where,
				skip,
				take,
				select: KEY_SELECT,
				orderBy: resolveOrderBy(input, SORTABLE, { createdAt: "desc" }),
			}),
			this.db.apikey.count({ where }),
		]);

		return {
			rows: rows.map(toSummary),
			total,
			facetCounts: {},
			taoDuocKeoTinHieu: laQuanTriWorkspace(role),
		};
	}

	async create(
		userId: string,
		role: WorkspaceRole | null,
		headers: Headers,
		input: CreateApiKeyInput,
	): Promise<CreatedApiKey> {
		const expiresIn =
			input.expiresInDays === null ? null : input.expiresInDays * DAY_SECONDS;
		const loai = input.loai ?? "toan-quyen";
		if (loai !== "toan-quyen" && !laQuanTriWorkspace(role)) {
			throw new ForbiddenException();
		}
		const created = await this.call(() => {
			if (loai === "keo-tin-hieu")
				return taoKhoaKeoTinHieu({ userId, name: input.name, expiresIn });
			if (loai === "day-lo-trinh")
				return taoKhoaDayLoTrinh({ userId, name: input.name, expiresIn });
			return auth.api.createApiKey({
				headers,
				body: { name: input.name, expiresIn },
			});
		});

		this.logger.log({
			message: "API key created",
			userId,
			apiKeyId: created.id,
			loai,
		});

		return {
			id: created.id,
			name: created.name,
			start: created.start,
			enabled: created.enabled,
			createdAt: created.createdAt.toISOString(),
			lastRequest: created.lastRequest?.toISOString() ?? null,
			expiresAt: created.expiresAt?.toISOString() ?? null,
			loai,
			key: created.key,
		};
	}

	async revoke(
		userId: string,
		headers: Headers,
		input: RevokeApiKeyInput,
	): Promise<{ id: string }> {
		const row = await this.db.apikey.findFirst({
			where: { id: input.id, referenceId: userId },
			select: { configId: true },
		});
		const configId = configKhoaMay(row?.configId ?? null);
		await this.call(() =>
			auth.api.deleteApiKey({
				headers,
				body: { keyId: input.id, configId },
			}),
		);

		this.logger.log({
			message: "API key revoked",
			userId,
			apiKeyId: input.id,
		});

		return { id: input.id };
	}

	private searchWhere(userId: string, q: string): Prisma.ApikeyWhereInput {
		const where: Prisma.ApikeyWhereInput = { referenceId: userId };
		const term = q.trim();

		if (term) {
			where.name = { contains: term, mode: "insensitive" };
		}

		return where;
	}

	private async call<T>(run: () => Promise<T>): Promise<T> {
		try {
			return await run();
		} catch (error) {
			if (error instanceof APIError) {
				const status =
					STATUS_BY_CODE.get(error.body?.code ?? "") ?? error.statusCode;

				throw new HttpException(
					error.body?.message ?? "The API key could not be saved.",
					status,
				);
			}

			this.logger.error(
				{ message: "API key call failed" },
				error instanceof Error ? error.stack : String(error),
			);

			throw new InternalServerErrorException(
				"Could not reach the auth service.",
			);
		}
	}
}
