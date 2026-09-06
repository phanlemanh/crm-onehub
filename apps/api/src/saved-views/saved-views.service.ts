import { type Db, type FieldEntity, Prisma as PrismaNamespace } from "@crm/db";
import { parseSavedViewFilters } from "@crm/validation/saved-view";
import {
	ConflictException,
	Injectable,
	Logger,
	NotFoundException,
} from "@nestjs/common";
import { CampaignsService } from "../campaigns/campaigns.service";
import { InjectDatabase } from "../database/database.constants";
import type {
	SavedView,
	SavedViewCreateInput,
	SavedViewUpdateData,
} from "./saved-views.contracts";

type SavedViewRow = {
	id: string;
	entity: FieldEntity;
	name: string;
	shared: boolean;
	filters: unknown;
	ownerId: string;
	createdAt: Date;
	updatedAt: Date;
};

@Injectable()
export class SavedViewsService {
	private readonly logger = new Logger(SavedViewsService.name);

	constructor(
		@InjectDatabase() private readonly db: Db,
		private readonly campaigns: CampaignsService,
	) {}

	async list(entity: FieldEntity, userId: string): Promise<SavedView[]> {
		const rows = await this.db.savedView.findMany({
			where: { entity, OR: [{ shared: true }, { ownerId: userId }] },
			orderBy: { name: "asc" },
		});

		const sizes = await Promise.all(rows.map((row) => this.sizeOf(row)));
		const used = await this.campaigns.usedByViews(rows.map((row) => row.id));

		return rows.map((row, index) =>
			this.serialize(row, userId, sizes[index], used.get(row.id) ?? []),
		);
	}

	async create(
		input: SavedViewCreateInput,
		userId: string,
	): Promise<SavedView> {
		try {
			const row = await this.db.savedView.create({
				data: {
					entity: input.entity,
					name: input.name,
					shared: input.shared,
					filters: input.filters,
					ownerId: userId,
				},
			});

			return this.serialize(row, userId, await this.sizeOf(row));
		} catch (error) {
			throw this.translate(error);
		}
	}

	async update(
		id: string,
		data: SavedViewUpdateData,
		userId: string,
	): Promise<SavedView> {
		const existing = await this.db.savedView.findUnique({ where: { id } });
		if (!existing || existing.ownerId !== userId) {
			throw new NotFoundException(`No saved view with id ${id}.`);
		}

		try {
			const row = await this.db.savedView.update({
				where: { id },
				data: {
					name: data.name,
					shared: data.shared,
					filters: data.filters,
				},
			});

			return this.serialize(row, userId, await this.sizeOf(row));
		} catch (error) {
			throw this.translate(error, id);
		}
	}

	async delete(id: string, userId: string): Promise<{ id: string }> {
		const existing = await this.db.savedView.findUnique({ where: { id } });
		if (!existing || existing.ownerId !== userId) {
			throw new NotFoundException(`No saved view with id ${id}.`);
		}

		const used = await this.campaigns.usedViewIds(id);
		if (used.length > 0) {
			throw new ConflictException(
				`This view is the segment of ${used.join(", ")}. Point those campaigns at another view first; the view stays as long as one of them uses it.`,
			);
		}

		try {
			await this.db.savedView.delete({ where: { id } });
		} catch (error) {
			throw this.translate(error, id);
		}

		return { id };
	}

	private async sizeOf(row: SavedViewRow): Promise<number | null> {
		if (row.entity !== "CONTACT") return null;

		try {
			return await this.campaigns.memberCount(
				parseSavedViewFilters(row.filters),
			);
		} catch (error) {
			this.logger.warn({
				message: "Saved view size not counted",
				savedViewId: row.id,
				reason: error instanceof Error ? error.message : "unknown",
			});

			return null;
		}
	}

	private serialize(
		row: SavedViewRow,
		userId: string,
		size: number | null | undefined,
		usedBy: string[] = [],
	): SavedView {
		return {
			id: row.id,
			entity: row.entity,
			name: row.name,
			shared: row.shared,
			filters: parseSavedViewFilters(row.filters),
			size: size ?? null,
			mine: row.ownerId === userId,
			usedBy,
			createdAt: row.createdAt.toISOString(),
			updatedAt: row.updatedAt.toISOString(),
		};
	}

	private translate(cause: unknown, id?: string): never {
		if (cause instanceof PrismaNamespace.PrismaClientKnownRequestError) {
			if (cause.code === "P2002") {
				throw new ConflictException("You already have a view with that name.");
			}
			if (cause.code === "P2025") {
				throw new NotFoundException(`No saved view with id ${id}.`);
			}
		}
		throw cause;
	}
}
