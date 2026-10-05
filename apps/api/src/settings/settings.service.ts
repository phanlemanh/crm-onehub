import { canManageSettings, workspaceRoleOf } from "@crm/auth";
import type { Db } from "@crm/db";
import {
	DEFAULT_AGENT_MODEL,
	maskKey,
	readAgentModel,
	readArchiveRetentionDays,
	readContextDevKey,
	writeAgentModel,
	writeArchiveRetentionDays,
	writeContextDevKey,
} from "@crm/db/settings";
import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	Logger,
} from "@nestjs/common";
import { ResearchKeyService } from "../agent/research-key.service";
import { BackfillService } from "../backfill/backfill.service";
import { InjectDatabase } from "../database/database.constants";
import { ModelCatalogService } from "./model-catalog.service";
import type {
	AgentModelSettings,
	ArchiveRetentionSettings,
	ModelCatalogResult,
	ResearchKeySettings,
} from "./settings.contracts";
import { SETTINGS_CONFIG } from "./settings-config";

@Injectable()
export class SettingsService {
	private readonly logger = new Logger(SettingsService.name);

	constructor(
		@InjectDatabase() private readonly db: Db,
		private readonly catalog: ModelCatalogService,
		private readonly researchKeys: ResearchKeyService,
		private readonly backfill: BackfillService,
	) {}

	private async canManage(userId: string): Promise<boolean> {
		return canManageSettings(await workspaceRoleOf(userId));
	}

	private async requireManager(userId: string): Promise<void> {
		if (!(await this.canManage(userId))) {
			throw new ForbiddenException(SETTINGS_CONFIG.messages.forbidden);
		}
	}

	async agentModel(userId: string): Promise<AgentModelSettings> {
		const [model, row, canManage, models] = await Promise.all([
			readAgentModel(this.db),
			this.db.appSetting.findFirst({ select: { updatedAt: true } }),
			this.canManage(userId),
			this.catalog.models(),
		]);
		const effective = models?.find((entry) => entry.id === model.id) ?? null;

		return {
			selectedId: model.isDefault ? null : model.id,
			effectiveId: model.id,
			defaultId: DEFAULT_AGENT_MODEL.id,
			effective,
			selectedMissing:
				!model.isDefault && models !== null && effective === null,
			updatedAt: row?.updatedAt.toISOString() ?? null,
			canManage,
		};
	}

	async setAgentModel(
		userId: string,
		modelId: string | null,
	): Promise<AgentModelSettings> {
		await this.requireManager(userId);

		if (modelId === null) {
			await writeAgentModel(this.db, null);
			this.logger.log({ message: "Agent model reset to the default" });
			return this.agentModel(userId);
		}

		const models = await this.catalog.models();

		if (!models) {
			throw new BadRequestException(
				"Could not reach the AI Gateway to check that model. Try again in a moment.",
			);
		}

		const chosen = models.find((model) => model.id === modelId);

		if (!chosen) {
			throw new BadRequestException(
				`The AI Gateway does not serve a tool-using model called "${modelId}".`,
			);
		}

		await writeAgentModel(this.db, {
			id: chosen.id,
			contextWindowTokens: chosen.contextWindowTokens,
		});

		this.logger.log({ message: "Agent model changed", modelId: chosen.id });

		return this.agentModel(userId);
	}

	async modelCatalog(): Promise<ModelCatalogResult> {
		const models = await this.catalog.models();
		return { models: models ?? [], available: models !== null };
	}

	async researchKey(userId: string): Promise<ResearchKeySettings> {
		const [key, canManage] = await Promise.all([
			readContextDevKey(this.db),
			this.canManage(userId),
		]);

		return {
			configured: key !== null,
			hint: key ? maskKey(key) : null,
			canManage,
		};
	}

	async setResearchKey(
		userId: string,
		apiKey: string,
	): Promise<ResearchKeySettings> {
		await this.requireManager(userId);

		const check = await this.researchKeys.verify(apiKey);

		if (check.outcome === "invalid") {
			throw new BadRequestException(check.reason);
		}

		await writeContextDevKey(this.db, apiKey);

		this.logger.log({
			message: "Context key saved",
			verified: check.outcome === "valid",
		});

		// Every company added while there was no key is still PENDING, because a
		// brand task with nowhere to look leaves the record alone. The sign-in
		// sweep would find them, but the person who just fixed it is standing
		// here — so pick the work up now rather than on their next sign-in.
		void this.backfill
			.run("companies")
			.then(({ queued, remaining }) => {
				if (queued > 0) {
					this.logger.log({
						message: "Queued the research that was waiting on a key",
						queued,
						remaining,
					});
				}
			})
			.catch((cause: unknown) => {
				this.logger.warn(
					{ message: "Could not queue the waiting research" },
					cause instanceof Error ? cause.stack : String(cause),
				);
			});

		return this.researchKey(userId);
	}

	async archiveRetention(userId: string): Promise<ArchiveRetentionSettings> {
		const [days, canManage] = await Promise.all([
			readArchiveRetentionDays(this.db),
			this.canManage(userId),
		]);

		return { days, canManage };
	}

	async setArchiveRetention(
		userId: string,
		days: number,
	): Promise<ArchiveRetentionSettings> {
		await this.requireManager(userId);

		const saved = await writeArchiveRetentionDays(this.db, days);

		this.logger.log({
			message: "Archive retention changed",
			days: saved,
		});

		return { days: saved, canManage: true };
	}
}
