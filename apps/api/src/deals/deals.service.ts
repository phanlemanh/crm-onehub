import {
	ActivityType,
	type Db,
	type Prisma,
	Prisma as PrismaNamespace,
} from "@crm/db";
import { normalizeCurrency } from "@crm/db/currency";
import type { FieldDefinitionWithOptions } from "@crm/db/fields";
import { type LoaiGiaiDoan, laDaDong, laThua } from "@crm/db/giai-doan";
import {
	BadRequestException,
	Injectable,
	Logger,
	NotFoundException,
} from "@nestjs/common";
import {
	AgentTriggerService,
	type CrmEventInput,
} from "../agent/agent-trigger.service";
import { ARCHIVE } from "../archive/archive-config";
import {
	ActivityStampService,
	type StampTargets,
} from "../crm/activity-stamp.service";
import { type BulkResult, requireOwner, runBulk } from "../crm/bulk";
import {
	blankToNull,
	decimalFromCents,
	fromCents,
	toCents,
} from "../crm/values";
import { ConversionService } from "../currency/conversion.service";
import { InjectDatabase } from "../database/database.constants";
import { FieldsService } from "../fields/fields.service";
import { GIAI_DOAN_API } from "../giai-doan/giai-doan-config";
import {
	archivedFilter,
	countsByKey,
	FACET_UNASSIGNED,
	type ListResult,
	type OrderByColumns,
	ownerFilter,
	paginate,
	resolveOrderBy,
} from "../trpc/list-input";
import { DEAL_BOARD } from "./deal-board-config";
import type {
	ClosingWindow,
	DealAttachContactInput,
	DealBoardInput,
	DealBulkOwnerInput,
	DealBulkStageInput,
	DealContactRoleInput,
	DealCreateInput,
	DealDetachContactInput,
	DealListInput,
	DealUpdateInput,
	SetStageInput,
} from "./deals.contracts";
import { CLOSING_WINDOWS } from "./deals.contracts";

const OWNER_SELECT = {
	id: true,
	name: true,
	email: true,
	image: true,
} as const;

const COMPANY_SELECT = {
	id: true,
	name: true,
	domain: true,
	iconUrl: true,
	iconDarkUrl: true,
	iconTone: true,
	logoUrl: true,
} as const;

const CONTACT_SELECT = {
	id: true,
	firstName: true,
	lastName: true,
	email: true,
	title: true,
	imageUrl: true,
} as const;

const DANG_MO: Prisma.DealWhereInput = { giaiDoan: { kind: "OPEN" } };

const DA_DONG: Prisma.DealWhereInput = {
	giaiDoan: { kind: { in: ["WON", "LOST"] } },
};

const SORTABLE: OrderByColumns<Prisma.DealOrderByWithRelationInput[]> = {
	name: (dir) => [{ name: dir }],
	company: (dir) => [{ company: { name: dir } }, { name: "asc" }],
	stage: (dir) => [
		{ giaiDoan: { kind: dir } },
		{ giaiDoan: { position: dir } },
		{ expectedCloseDate: "asc" },
	],
	amount: (dir) => [{ baseAmount: { sort: dir, nulls: "last" } }],
	expectedCloseDate: (dir) => [{ expectedCloseDate: dir }],
	createdAt: (dir) => [{ createdAt: dir }],
	owner: (dir) => [{ owner: { name: dir } }, { name: "asc" }],
	lastActivity: (dir) => [{ lastActivityAt: { sort: dir, nulls: "last" } }],
	archivedAt: (dir) => [{ archivedAt: { sort: dir, nulls: "last" } }],
};

@Injectable()
export class DealsService {
	private readonly logger = new Logger(DealsService.name);

	constructor(
		@InjectDatabase() private readonly db: Db,
		private readonly agent: AgentTriggerService,
		private readonly stamp: ActivityStampService,
		private readonly conversion: ConversionService,
		private readonly fields: FieldsService,
	) {}

	async list(input: DealListInput) {
		const filterableFields = await this.fields.filterableFieldsFor("DEAL");
		const where = this.buildWhere(input, filterableFields);
		const { skip, take } = paginate(input);

		const openWhere: Prisma.DealWhereInput = { AND: [where, DANG_MO] };
		const base = await this.conversion.reportingCurrency();

		const [rows, total, facetCounts, openValue, unconverted] =
			await Promise.all([
				this.db.deal.findMany({
					where,
					skip,
					take,
					orderBy: resolveOrderBy(input, SORTABLE, [{ createdAt: "desc" }]),
					select: {
						id: true,
						name: true,
						stage: true,
						amount: true,
						currency: true,
						baseAmount: true,
						expectedCloseDate: true,
						closedAt: true,
						company: { select: COMPANY_SELECT },
						owner: { select: OWNER_SELECT },
						lastActivityAt: true,
						createdAt: true,
						archivedAt: true,
					},
				}),
				this.db.deal.count({ where }),
				this.facetCounts(input, filterableFields),
				this.db.deal.aggregate({
					where: { AND: [openWhere, this.conversion.countedWhere(base)] },
					_sum: { baseAmount: true },
				}),
				this.conversion.unconverted(openWhere),
			]);

		const tableFields = await this.fields.tableValuesFor(
			"DEAL",
			rows.map((row) => row.id),
		);

		return {
			rows: rows.map(
				({
					amount,
					baseAmount,
					expectedCloseDate,
					closedAt,
					lastActivityAt,
					createdAt,
					archivedAt,
					...row
				}) => ({
					...row,
					amountCents: toCents(amount),
					baseAmountCents: toCents(baseAmount),
					expectedCloseDate: expectedCloseDate?.toISOString() ?? null,
					closedAt: closedAt?.toISOString() ?? null,
					lastActivityAt: lastActivityAt?.toISOString() ?? null,
					createdAt: createdAt.toISOString(),
					archivedAt: archivedAt?.toISOString() ?? null,
					fields: tableFields.get(row.id) ?? {},
				}),
			),
			total,
			facetCounts,
			openValueCents: toCents(openValue._sum.baseAmount),
			reportingCurrency: base,
			unconverted,
		} satisfies ListResult<unknown> & {
			openValueCents: number | null;
			reportingCurrency: string;
			unconverted: { count: number; currencies: string[] };
		};
	}

	async board(input: DealBoardInput) {
		const filterableFields = await this.fields.filterableFieldsFor("DEAL");
		const where = this.buildWhere(
			{
				...input,
				status: "all",
				stage: [],
				archived: false,
				page: 1,
				pageSize: 1,
			},
			filterableFields,
		);
		const base = await this.conversion.reportingCurrency();
		const orderBy = resolveOrderBy(input, SORTABLE, [{ createdAt: "desc" }]);

		const giaiDoan = await this.db.dealStage.findMany({
			where: { archivedAt: null },
			orderBy: [{ kind: "asc" }, { position: "asc" }],
			select: { id: true },
		});

		const columns = await Promise.all(
			giaiDoan.map(async ({ id: stage }) => {
				const stageWhere: Prisma.DealWhereInput = { AND: [where, { stage }] };
				const [count, value, unconverted, cards] = await Promise.all([
					this.db.deal.count({ where: stageWhere }),
					this.db.deal.aggregate({
						where: { AND: [stageWhere, this.conversion.countedWhere(base)] },
						_sum: { baseAmount: true },
						_count: { _all: true },
					}),
					this.conversion.unconverted(stageWhere),
					this.db.deal.findMany({
						where: stageWhere,
						take: DEAL_BOARD.cardsPerColumn,
						orderBy,
						select: {
							id: true,
							name: true,
							stage: true,
							amount: true,
							currency: true,
							baseAmount: true,
							baseCurrency: true,
							expectedCloseDate: true,
							closedAt: true,
							company: { select: COMPANY_SELECT },
							owner: { select: OWNER_SELECT },
							lastActivityAt: true,
							createdAt: true,
							archivedAt: true,
						},
					}),
				]);
				return {
					stage,
					count,
					valueCents: toCents(value._sum.baseAmount),
					countedCount: value._count._all,
					unconverted,
					cards: cards.map(
						({
							amount,
							baseAmount,
							baseCurrency,
							expectedCloseDate,
							closedAt,
							lastActivityAt,
							createdAt,
							archivedAt,
							...card
						}) => ({
							...card,
							amountCents: toCents(amount),
							baseAmountCents: toCents(baseAmount),
							counted: this.conversion.isCounted(
								{ baseAmount, baseCurrency },
								base,
							),
							expectedCloseDate: expectedCloseDate?.toISOString() ?? null,
							closedAt: closedAt?.toISOString() ?? null,
							lastActivityAt: lastActivityAt?.toISOString() ?? null,
							createdAt: createdAt.toISOString(),
							archivedAt: archivedAt?.toISOString() ?? null,
						}),
					),
				};
			}),
		);

		return { columns, reportingCurrency: base };
	}

	async byId(id: string) {
		const deal = await this.db.deal.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				description: true,
				stage: true,
				stageChangedAt: true,
				amount: true,
				currency: true,
				baseAmount: true,
				fxRate: true,
				fxRateAt: true,
				expectedCloseDate: true,
				closedAt: true,
				closedReason: true,
				createdAt: true,
				archivedAt: true,
				company: { select: { ...COMPANY_SELECT, industry: true } },
				owner: { select: OWNER_SELECT },
				contacts: {
					select: { role: true, contact: { select: CONTACT_SELECT } },
					orderBy: { contact: { firstName: "asc" } },
				},
			},
		});

		if (!deal) {
			throw new NotFoundException(`No deal with id ${id}.`);
		}

		const {
			contacts,
			amount,
			baseAmount,
			fxRate,
			fxRateAt,
			archivedAt,
			...rest
		} = deal;

		return {
			...rest,
			fields: await this.fields.valuesFor("DEAL", id),
			amountCents: toCents(amount),
			baseAmountCents: toCents(baseAmount),
			reportingCurrency: await this.conversion.reportingCurrency(),
			fxRate: fxRate?.toNumber() ?? null,
			fxRateAt: fxRateAt?.toISOString() ?? null,
			stageChangedAt: deal.stageChangedAt.toISOString(),
			expectedCloseDate: deal.expectedCloseDate?.toISOString() ?? null,
			closedAt: deal.closedAt?.toISOString() ?? null,
			createdAt: deal.createdAt.toISOString(),
			archivedAt: archivedAt?.toISOString() ?? null,
			contacts: contacts.map(({ role, contact }) => ({ ...contact, role })),
		};
	}

	async create(input: DealCreateInput) {
		const now = new Date();

		const currency = normalizeCurrency(
			input.currency ?? (await this.conversion.reportingCurrency()),
		);
		const fx = await this.conversion.dealFields(
			decimalFromCents(input.amountCents),
			currency,
		);

		try {
			const deal = await this.agent.withCrmEvents(async (tx, emit) => {
				const giaiDoan = input.stage
					? await this.docGiaiDoanSong(tx, input.stage)
					: await this.giaiDoanMoDau(tx);
				const stage = giaiDoan.id;
				const closed = laDaDong(giaiDoan.kind);
				const created = await tx.deal.create({
					data: {
						name: input.name.trim(),
						companyId: input.companyId,
						ownerId: input.ownerId,
						stage,
						stageChangedAt: now,
						closedAt: closed ? now : null,
						amount: fromCents(input.amountCents),
						currency,
						...fx,
						expectedCloseDate: parseDate(input.expectedCloseDate),
					},
					select: { id: true, name: true, companyId: true, stage: true },
				});
				await emit({
					type: "deal.created",
					record: { kind: "deal", id: created.id },
					occurredAt: now,
					data: { companyId: created.companyId, stage },
				});
				if (closed) {
					await emit({
						type: "deal.closed",
						record: { kind: "deal", id: created.id },
						occurredAt: now,
						data: { companyId: created.companyId, from: null, to: stage },
					});
				}
				return created;
			});

			this.logger.log({
				message: "Deal created",
				dealId: deal.id,
				stage: deal.stage,
			});

			void this.fields.queueBackfillForNewRecord("DEAL", deal.id);

			return deal;
		} catch (error) {
			throw this.translateRelations(error);
		}
	}

	async update(id: string, input: DealUpdateInput) {
		const data: Prisma.DealUpdateInput = {};

		if (input.name !== undefined) data.name = input.name.trim();
		if (input.description !== undefined) {
			data.description =
				input.description === null ? null : blankToNull(input.description);
		}
		if (input.companyId !== undefined) {
			data.company = { connect: { id: input.companyId } };
		}
		if (input.ownerId !== undefined) {
			data.owner = { connect: { id: input.ownerId } };
		}
		if (input.amountCents !== undefined) {
			data.amount = fromCents(input.amountCents);
		}
		if (input.currency !== undefined) {
			data.currency = normalizeCurrency(input.currency);
		}
		if (input.expectedCloseDate !== undefined) {
			data.expectedCloseDate = parseDate(input.expectedCloseDate);
		}

		if (input.amountCents !== undefined || input.currency !== undefined) {
			const current = await this.db.deal.findUnique({
				where: { id },
				select: { amount: true, currency: true },
			});

			if (!current) {
				throw new NotFoundException(`No deal with id ${id}.`);
			}

			const amount =
				input.amountCents !== undefined
					? decimalFromCents(input.amountCents)
					: current.amount;
			const currency =
				input.currency !== undefined
					? normalizeCurrency(input.currency)
					: normalizeCurrency(current.currency);

			Object.assign(data, await this.conversion.dealFields(amount, currency));
		}

		try {
			return await this.db.$transaction(async (tx) => {
				if (input.fields) {
					await this.fields.applyValues(tx, "DEAL", id, input.fields);
				}

				return tx.deal.update({
					where: { id },
					data,
					select: { id: true, name: true },
				});
			});
		} catch (error) {
			throw this.translate(error, id);
		}
	}

	async archive(id: string): Promise<{ id: string; name: string }> {
		try {
			await this.db.deal.updateMany({
				where: { id, archivedAt: null },
				data: { archivedAt: new Date() },
			});
			const deal = await this.db.deal.findUniqueOrThrow({
				where: { id },
				select: { name: true },
			});

			this.logger.log({ message: "Deal archived", dealId: id });

			return { id, name: deal.name };
		} catch (error) {
			throw this.translate(error, id);
		}
	}

	async restore(id: string): Promise<{ id: string; name: string }> {
		try {
			const deal = await this.db.deal.update({
				where: { id },
				data: { archivedAt: null },
				select: { name: true },
			});

			this.logger.log({ message: "Deal restored", dealId: id });

			return { id, name: deal.name };
		} catch (error) {
			throw this.translate(error, id);
		}
	}

	async purge(id: string): Promise<{ id: string; name: string }>;
	async purge(
		id: string,
		guard: { archivedBefore: Date },
	): Promise<{ id: string; name: string } | null>;
	async purge(
		id: string,
		guard?: { archivedBefore: Date },
	): Promise<{ id: string; name: string } | null> {
		let deleted: { targets: StampTargets; name: string } | null;

		try {
			deleted = await this.db.$transaction(async (tx) => {
				const [row] = await tx.$queryRaw<Array<{ archivedAt: Date | null }>>`
					SELECT "archivedAt" FROM deal WHERE id = ${id} FOR UPDATE
				`;

				if (!row) {
					if (guard) return null;
					throw new NotFoundException(`No deal with id ${id}.`);
				}
				if (!guard && !row.archivedAt)
					throw new BadRequestException(ARCHIVE.thongDiep.chuaLuuTru);
				if (
					guard &&
					(!row.archivedAt || row.archivedAt > guard.archivedBefore)
				) {
					return null;
				}

				const targets = await this.stamp.targetsOf({ dealId: id }, tx);
				await tx.agentTask.deleteMany({ where: { dealId: id } });

				const deal = await tx.deal.delete({
					where: { id },
					select: { name: true },
				});

				return { targets, name: deal.name };
			});
		} catch (error) {
			throw this.translate(error, id);
		}

		if (!deleted) return null;

		await this.stamp.recomputeAfterDelete(deleted.targets, { dealId: id });

		this.logger.log({
			message: "Deal purged",
			dealId: id,
			name: deleted.name,
		});

		return { id, name: deleted.name };
	}

	async purgeExpired(before: Date): Promise<BulkResult> {
		const expired = await this.db.deal.findMany({
			where: { archivedAt: { lte: before } },
			select: { id: true },
			take: ARCHIVE.prune.maxBatch,
		});

		return runBulk(
			expired.map((row) => row.id),
			(id) => this.purge(id, { archivedBefore: before }),
		);
	}

	async docGiaiDoanSong(
		tx: Prisma.TransactionClient,
		id: string,
	): Promise<{ id: string; kind: LoaiGiaiDoan }> {
		const [giaiDoan] = await tx.$queryRaw<{ id: string; kind: LoaiGiaiDoan }[]>`
			SELECT id, kind::text AS kind
			FROM "dealStage"
			WHERE id = ${id} AND "archivedAt" IS NULL
			FOR SHARE
		`;
		if (!giaiDoan) {
			throw new BadRequestException(GIAI_DOAN_API.messages.khongCo);
		}
		return giaiDoan;
	}

	private async giaiDoanMoDau(
		tx: Prisma.TransactionClient,
	): Promise<{ id: string; kind: LoaiGiaiDoan }> {
		const [dau] = await tx.$queryRaw<{ id: string; kind: LoaiGiaiDoan }[]>`
			SELECT id, kind::text AS kind
			FROM "dealStage"
			WHERE kind = 'OPEN' AND "archivedAt" IS NULL
			ORDER BY position
			LIMIT 1
			FOR SHARE
		`;
		if (!dau) throw new BadRequestException(GIAI_DOAN_API.messages.khongCo);
		return dau;
	}

	async chuyenGiaiDoanTrongTx(
		tx: Prisma.TransactionClient,
		emit: (input: CrmEventInput) => Promise<void>,
		args: {
			dealId: string;
			toStageId: string;
			closedReason?: string;
			actingUserId: string;
			now: Date;
			giuNguyenDong?: boolean;
		},
	) {
		const closedReason = args.closedReason?.trim();
		const [deal] = await tx.$queryRaw<
			Array<{ id: string; stage: string; companyId: string }>
		>`
			SELECT id, stage, "companyId"
			FROM deal
			WHERE id = ${args.dealId}
			FOR UPDATE
		`;

		if (!deal) {
			throw new NotFoundException(`No deal with id ${args.dealId}.`);
		}

		const den = await this.docGiaiDoanSong(tx, args.toStageId);

		if (deal.stage === den.id) {
			return {
				changed: false as const,
				deal,
				updated: { id: deal.id, stage: deal.stage },
			};
		}
		if (laThua(den.kind) && !closedReason && !args.giuNguyenDong) {
			throw new BadRequestException(
				"Say why it was lost — a closed-lost deal with no reason teaches nobody anything.",
			);
		}

		const tu = await tx.dealStage.findUniqueOrThrow({
			where: { id: deal.stage },
			select: { kind: true },
		});
		const closed = laDaDong(den.kind);
		const wasClosed = laDaDong(tu.kind);
		const { now } = args;
		const updated = await tx.deal.update({
			where: { id: deal.id },
			data: args.giuNguyenDong
				? { stage: den.id, stageChangedAt: now }
				: {
						stage: den.id,
						stageChangedAt: now,
						closedAt: closed ? now : null,
						closedReason: closed ? (closedReason ?? null) : null,
					},
			select: { id: true, stage: true },
		});
		await tx.activity.create({
			data: {
				type: ActivityType.STAGE_CHANGE,
				subject: "Stage changed",
				body: closedReason ?? null,
				occurredAt: now,
				companyId: deal.companyId,
				dealId: deal.id,
				createdById: args.actingUserId,
				meta: { from: deal.stage, to: den.id },
			},
		});
		const data = { companyId: deal.companyId, from: deal.stage, to: den.id };
		const record = { kind: "deal" as const, id: deal.id };
		await emit({ type: "deal.stage.changed", record, occurredAt: now, data });
		if (!wasClosed && closed) {
			await emit({ type: "deal.closed", record, occurredAt: now, data });
		}
		if (wasClosed && !closed) {
			await emit({ type: "deal.opened", record, occurredAt: now, data });
		}

		return { changed: true as const, deal, updated };
	}

	async setStage(input: SetStageInput, actingUserId: string) {
		const now = new Date();
		const transition = await this.agent.withCrmEvents((tx, emit) =>
			this.chuyenGiaiDoanTrongTx(tx, emit, {
				dealId: input.id,
				toStageId: input.stage,
				closedReason: input.closedReason,
				actingUserId,
				now,
			}),
		);

		if (!transition.changed) {
			return { ...transition.updated, changed: false };
		}

		const { deal, updated } = transition;

		await this.stamp.touch({ companyId: deal.companyId, dealId: deal.id }, now);

		this.logger.log({
			message: "Deal stage changed",
			dealId: deal.id,
			from: deal.stage,
			to: input.stage,
		});

		return { ...updated, changed: true };
	}

	async contactOptions(dealId: string) {
		const deal = await this.db.deal.findUnique({
			where: { id: dealId },
			select: { companyId: true, contacts: { select: { contactId: true } } },
		});

		if (!deal) {
			throw new NotFoundException(`No deal with id ${dealId}.`);
		}

		return this.db.contact.findMany({
			where: {
				companyId: deal.companyId,
				id: { notIn: deal.contacts.map((row) => row.contactId) },
			},
			select: CONTACT_SELECT,
			orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
			take: 100,
		});
	}

	async attachContact(input: DealAttachContactInput) {
		const company = await this.companyOf(input.dealId);
		const contact = await this.db.contact.findUnique({
			where: { id: input.contactId },
			select: { companyId: true },
		});

		if (!contact) {
			throw new NotFoundException(`No contact with id ${input.contactId}.`);
		}

		if (contact.companyId !== company.id) {
			throw new BadRequestException(
				`That contact does not work at ${company.name}.`,
			);
		}

		const role = roleOrNull(input.role ?? null);

		await this.db.dealContact.upsert({
			where: {
				dealId_contactId: {
					dealId: input.dealId,
					contactId: input.contactId,
				},
			},
			create: { dealId: input.dealId, contactId: input.contactId, role },
			update: role === null ? {} : { role },
		});

		this.logger.log({
			message: "Contact attached to deal",
			dealId: input.dealId,
			contactId: input.contactId,
		});

		return { dealId: input.dealId, contactId: input.contactId };
	}

	async detachContact(input: DealDetachContactInput) {
		const { count } = await this.db.dealContact.deleteMany({
			where: { dealId: input.dealId, contactId: input.contactId },
		});

		if (count === 0) {
			throw new NotFoundException("That contact is not on this deal.");
		}

		this.logger.log({
			message: "Contact detached from deal",
			dealId: input.dealId,
			contactId: input.contactId,
		});

		return { dealId: input.dealId, contactId: input.contactId };
	}

	async setContactRole(input: DealContactRoleInput) {
		const role = roleOrNull(input.role);

		const { count } = await this.db.dealContact.updateMany({
			where: { dealId: input.dealId, contactId: input.contactId },
			data: { role },
		});

		if (count === 0) {
			throw new NotFoundException("That contact is not on this deal.");
		}

		return { dealId: input.dealId, contactId: input.contactId, role };
	}

	async bulkAssignOwner(input: DealBulkOwnerInput): Promise<BulkResult> {
		await requireOwner(this.db, input.ownerId);

		const ids = [...new Set(input.ids)];
		const { count } = await this.db.deal.updateMany({
			where: { id: { in: ids } },
			data: { ownerId: input.ownerId },
		});

		this.logger.log({
			message: "Deals reassigned",
			count,
			ownerId: input.ownerId,
		});

		return {
			requested: ids.length,
			succeeded: count,
			skipped: 0,
			failed: ids.length - count,
			message: null,
		};
	}

	async bulkSetStage(
		input: DealBulkStageInput,
		actingUserId: string,
	): Promise<BulkResult> {
		const closedReason = input.closedReason?.trim();
		const den = await this.db.dealStage.findUnique({
			where: { id: input.stage },
			select: { kind: true, archivedAt: true },
		});
		if (!den || den.archivedAt) {
			throw new BadRequestException(GIAI_DOAN_API.messages.khongCo);
		}

		if (laThua(den.kind) && !closedReason) {
			throw new BadRequestException(
				"Say why they were lost — a closed-lost deal with no reason teaches nobody anything.",
			);
		}

		return runBulk(input.ids, (id) =>
			this.setStage({ id, stage: input.stage, closedReason }, actingUserId),
		);
	}

	async bulkArchive(ids: string[]): Promise<BulkResult> {
		return runBulk(ids, (id) => this.archive(id));
	}

	async bulkRestore(ids: string[]): Promise<BulkResult> {
		return runBulk(ids, (id) => this.restore(id));
	}

	async bulkPurge(ids: string[]): Promise<BulkResult> {
		return runBulk(ids, (id) => this.purge(id));
	}

	private async companyOf(dealId: string) {
		const deal = await this.db.deal.findUnique({
			where: { id: dealId },
			select: { company: { select: { id: true, name: true } } },
		});

		if (!deal) {
			throw new NotFoundException(`No deal with id ${dealId}.`);
		}

		return deal.company;
	}

	private searchFilter(q: string): Prisma.DealWhereInput {
		const term = q.trim();
		if (!term) return {};

		return {
			OR: [
				{ name: { contains: term, mode: "insensitive" } },
				{ company: { name: { contains: term, mode: "insensitive" } } },
			],
		};
	}

	private buildWhere(
		input: DealListInput,
		filterableFields: FieldDefinitionWithOptions[],
	): Prisma.DealWhereInput {
		const and: Prisma.DealWhereInput[] = [
			this.searchFilter(input.q),
			archivedFilter(input.archived),
			...this.fields.fieldFilters(filterableFields, input.fields),
		];

		const owner = ownerFilter<Prisma.DealWhereInput>(input.owner);
		if (owner) and.push(owner);

		if (input.status === "open") {
			and.push(DANG_MO);
		} else if (input.status === "closed") {
			and.push(DA_DONG);
		}

		if (input.stage.length > 0) {
			and.push({ stage: { in: input.stage } });
		}

		if (input.closing.length > 0) {
			and.push({
				OR: input.closing.map((window) =>
					closingFilter(window as ClosingWindow),
				),
			});
		}

		return { AND: and };
	}

	private async facetCounts(
		input: DealListInput,
		filterableFields: FieldDefinitionWithOptions[],
	) {
		const where: Prisma.DealWhereInput = {
			AND: [this.searchFilter(input.q), archivedFilter(input.archived)],
		};

		const [
			owners,
			stages,
			openCount,
			closedCount,
			fieldFacets,
			...closingCounts
		] = await Promise.all([
			this.db.deal.groupBy({ by: ["ownerId"], where, _count: { _all: true } }),
			this.db.deal.groupBy({ by: ["stage"], where, _count: { _all: true } }),
			this.db.deal.count({ where: { AND: [where, DANG_MO] } }),
			this.db.deal.count({ where: { AND: [where, DA_DONG] } }),
			this.fields.filterFacetCounts("DEAL", where, filterableFields),
			...CLOSING_WINDOWS.map((window) =>
				this.db.deal.count({ where: { AND: [where, closingFilter(window)] } }),
			),
		]);

		const stageCounts = countsByKey(stages, "stage");

		return {
			status: { open: openCount, closed: closedCount },
			owner: countsByKey(owners, "ownerId", FACET_UNASSIGNED),
			stage: stageCounts,
			closing: Object.fromEntries(
				CLOSING_WINDOWS.map((window, index) => [
					window,
					closingCounts[index] ?? 0,
				]),
			),
			...Object.fromEntries(
				Object.entries(fieldFacets).map(([key, counts]) => [
					`field:${key}`,
					counts,
				]),
			),
		};
	}

	private translate(cause: unknown, id: string): never {
		if (
			cause instanceof PrismaNamespace.PrismaClientKnownRequestError &&
			cause.code === "P2025"
		) {
			throw new NotFoundException(`No deal with id ${id}.`);
		}
		return this.translateRelations(cause);
	}

	private translateRelations(cause: unknown): never {
		if (
			cause instanceof PrismaNamespace.PrismaClientKnownRequestError &&
			(cause.code === "P2003" || cause.code === "P2025")
		) {
			throw new BadRequestException(
				"That company or owner does not exist any more.",
			);
		}
		throw cause;
	}
}

function closingFilter(window: ClosingWindow): Prisma.DealWhereInput {
	const now = new Date();
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
	const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
	const startOfMonthAfter = new Date(now.getFullYear(), now.getMonth() + 2, 1);

	switch (window) {
		case "overdue":
			return {
				expectedCloseDate: { lt: now },
				...DANG_MO,
			};
		case "this-month":
			return {
				expectedCloseDate: { gte: startOfMonth, lt: startOfNextMonth },
			};
		case "next-month":
			return {
				expectedCloseDate: { gte: startOfNextMonth, lt: startOfMonthAfter },
			};
		case "later":
			return { expectedCloseDate: { gte: startOfMonthAfter } };
		case "none":
			return { expectedCloseDate: null };
	}
}

function roleOrNull(value: string | null): string | null {
	return value === null ? null : blankToNull(value);
}

function parseDate(value: string | null | undefined): Date | null {
	if (value === null || value === undefined || value === "") return null;
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		throw new BadRequestException(`"${value}" is not a date.`);
	}
	return date;
}
