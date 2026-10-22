import { canManageFields, workspaceRoleOf } from "@crm/auth";
import {
	type Db,
	type FieldEntity,
	type Prisma,
	Prisma as PrismaNamespace,
} from "@crm/db";
import {
	attachValues,
	type CachSapTruong,
	cachLocTruong,
	cachSapTruong,
	columnFor,
	type FieldDefinitionWithOptions,
	type FieldTypeName,
	FieldValueError,
	type FieldValueJson,
	fieldKeyFromLabel,
	locDuocTrong,
	type RecordField,
	readValue,
	recordColumn,
	type SerializedField,
	serializeField,
	TIEN_TO_COT_TRUONG,
	usesOptions,
	writeValues,
} from "@crm/db/fields";
import {
	isRequiredStandardKey,
	isStandardFieldKey,
	type MucBoTri,
	STANDARD_FIELD_KEYS,
	sapBoTri,
	viTriChuan,
} from "@crm/db/fields-chuan";
import {
	GIA_TRI_TRONG,
	type LocTruong,
	LocTruongError,
	MOC_NGAY,
	phanTichLocTruong,
} from "@crm/validation/bo-loc-truong";
import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { AgentTriggerService } from "../agent/agent-trigger.service";
import { InjectDatabase } from "../database/database.constants";
import type { Page, SortDirection } from "../trpc/list-input";
import type {
	FieldCreateInput,
	FieldReorderInput,
	FieldStandardHiddenInput,
	FieldUpdateData,
} from "./fields.contracts";
import { FIELDS_CONFIG } from "./fields-config";
import { LoiGiaTriTruong, laGiaTriRong } from "./loi-gia-tri-truong";
import { khoangMocTruong } from "./moc-ngay";

const WITH_OPTIONS = {
	options: { orderBy: { position: "asc" } },
} as const satisfies Prisma.FieldDefinitionInclude;

const RELATIONS = {
	COMPANY: "company",
	CONTACT: "contact",
	DEAL: "deal",
} as const satisfies Record<FieldEntity, string>;

export type DieuKienTruong =
	| { fieldValues: { some: Prisma.FieldValueWhereInput } }
	| { fieldValues: { none: Prisma.FieldValueWhereInput } }
	| { OR: DieuKienTruong[] };

function coGiaTriCua(definition: {
	id: string;
	type: FieldTypeName;
}): Prisma.FieldValueWhereInput {
	return {
		fieldId: definition.id,
		[columnFor(definition.type)]: { not: null },
	};
}

function phanTich(
	definition: FieldDefinitionWithOptions,
	values: string[],
): LocTruong {
	try {
		return phanTichLocTruong(cachLocTruong(definition.type), values);
	} catch (error) {
		if (error instanceof LocTruongError) {
			throw new BadRequestException(
				`${definition.label} (${definition.key}): ${error.message}`,
			);
		}
		throw error;
	}
}

function hoacCua(dieuKien: DieuKienTruong[]): DieuKienTruong {
	return dieuKien.length === 1
		? (dieuKien[0] as DieuKienTruong)
		: { OR: dieuKien };
}

function dieuKienLoc(
	definition: FieldDefinitionWithOptions,
	values: string[],
): DieuKienTruong {
	const loc = phanTich(definition, values);
	const fieldId = definition.id;
	const co = (where: Prisma.FieldValueWhereInput): DieuKienTruong => ({
		fieldValues: { some: { fieldId, ...where } },
	});
	const cacNhanh: DieuKienTruong[] = [];

	switch (loc.cach) {
		case "chua":
			for (const chu of loc.chu) {
				cacNhanh.push(co({ text: { contains: chu, mode: "insensitive" } }));
			}
			break;
		case "khoang": {
			if (loc.tu !== null || loc.den !== null) {
				cacNhanh.push(
					co({
						number: { gte: loc.tu ?? undefined, lte: loc.den ?? undefined },
					}),
				);
			}
			break;
		}
		case "moc":
			for (const moc of loc.moc)
				cacNhanh.push(co({ date: khoangMocTruong(moc) }));
			break;
		case "tich":
			for (const giaTri of new Set(loc.co)) {
				cacNhanh.push(
					giaTri
						? co({ bool: true })
						: { fieldValues: { none: { fieldId, bool: true } } },
				);
			}
			break;
		case "luaChon":
			if (loc.id.length > 0) cacNhanh.push(co({ optionId: { in: loc.id } }));
			break;
		case "nguoi":
			if (loc.id.length > 0) cacNhanh.push(co({ userId: { in: loc.id } }));
			break;
	}

	if (loc.cach !== "tich" && loc.trong) {
		cacNhanh.push({ fieldValues: { none: coGiaTriCua(definition) } });
	}

	return hoacCua(cacNhanh);
}

const TEN_BAN_GHI = {
	COMPANY: [{ name: "asc" }],
	CONTACT: [{ lastName: "asc" }, { firstName: "asc" }],
	DEAL: [{ name: "asc" }],
} as const satisfies Record<FieldEntity, readonly object[]>;

export type WhereTheoLoai = {
	COMPANY: Prisma.CompanyWhereInput;
	CONTACT: Prisma.ContactWhereInput;
	DEAL: Prisma.DealWhereInput;
};

function thuTuGiaTri(
	cach: CachSapTruong,
	dir: SortDirection,
): Prisma.FieldValueOrderByWithRelationInput {
	if (cach === "luaChon") return { option: { position: dir } };
	if (cach === "nguoi") return { user: { name: dir } };
	return { [cach]: dir };
}

@Injectable()
export class FieldsService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		private readonly agent: AgentTriggerService,
	) {}

	async list(
		entity: FieldEntity,
		includeArchived: boolean,
	): Promise<SerializedField[]> {
		const definitions = await this.db.fieldDefinition.findMany({
			where: { entity, archivedAt: includeArchived ? undefined : null },
			include: WITH_OPTIONS,
			orderBy: { position: "asc" },
		});

		return definitions.map(serializeField);
	}

	async byKey(entity: FieldEntity, key: string): Promise<SerializedField> {
		const definition = await this.db.fieldDefinition.findUnique({
			where: { entity_key: { entity, key } },
			include: WITH_OPTIONS,
		});

		if (!definition) throw new NotFoundException("That field does not exist.");

		return serializeField(definition);
	}

	async access(actingUserId: string): Promise<{ canManage: boolean }> {
		return { canManage: canManageFields(await workspaceRoleOf(actingUserId)) };
	}

	private async requireManager(actingUserId: string): Promise<void> {
		if (!canManageFields(await workspaceRoleOf(actingUserId))) {
			throw new ForbiddenException(FIELDS_CONFIG.messages.forbidden);
		}
	}

	async create(
		actingUserId: string,
		input: FieldCreateInput,
	): Promise<SerializedField> {
		await this.requireManager(actingUserId);

		const key = fieldKeyFromLabel(input.label);

		if (!key) {
			throw new BadRequestException("That label does not make a usable key.");
		}

		const taken = await this.db.fieldDefinition.findUnique({
			where: { entity_key: { entity: input.entity, key } },
			select: { id: true },
		});

		if (taken) {
			throw new ConflictException(`There is already a field called "${key}".`);
		}

		if (usesOptions(input.type) && input.options.length === 0) {
			throw new BadRequestException("A select needs at least one option.");
		}

		if (input.required && !input.showOnSheet) {
			throw new BadRequestException(FIELDS_CONFIG.messages.requiredShown);
		}

		const next = await this.nextPosition(input.entity);

		const definition = await this.db.fieldDefinition.create({
			data: {
				entity: input.entity,
				key,
				label: input.label,
				type: input.type,
				agentFilled: input.agentFilled,
				agentBrief: input.agentBrief,
				required: input.required,
				showOnSheet: input.showOnSheet,
				showOnTable: input.showOnTable,
				showOnFilter: input.showOnFilter,
				position: next,
				options: usesOptions(input.type)
					? {
							create: input.options.map((option, index) => ({
								label: option.label,
								position: index,
							})),
						}
					: undefined,
			},
			include: WITH_OPTIONS,
		});

		if (definition.agentFilled) {
			const ids = await this.missingRecordIds(
				definition.entity,
				definition.id,
				FIELDS_CONFIG.backfill.maxRecordsPerRun,
			);
			await this.agent.fieldBackfillRecords(
				definition.entity,
				[definition.key],
				ids,
				`New field: ${definition.label}`,
			);
		}

		return serializeField(definition);
	}

	async update(
		actingUserId: string,
		id: string,
		data: FieldUpdateData,
	): Promise<SerializedField> {
		await this.requireManager(actingUserId);

		const existing = await this.db.fieldDefinition.findUnique({
			where: { id },
			include: WITH_OPTIONS,
		});

		if (!existing) throw new NotFoundException("That field does not exist.");

		if ((data.required ?? existing.required) && data.showOnSheet === false) {
			throw new BadRequestException(FIELDS_CONFIG.messages.requiredShown);
		}

		const showOnSheet =
			data.required === true && data.showOnSheet === undefined
				? true
				: data.showOnSheet;

		const type = data.type ?? existing.type;

		if (data.type && data.type !== existing.type) {
			const values = await this.db.fieldValue.count({
				where: { fieldId: id },
			});

			if (values > 0) {
				throw new ConflictException(
					"This field already holds values, so its type cannot change. Archive it and make a new one.",
				);
			}
		}

		const optionCount = data.options
			? data.options.length
			: existing.options.filter((option) => option.archivedAt === null).length;

		if (usesOptions(type) && optionCount === 0) {
			throw new BadRequestException("A select needs at least one option.");
		}

		const definition = await this.db.$transaction(async (tx) => {
			if (data.options && usesOptions(type)) {
				const keep = new Set(
					data.options
						.map((option) => option.id)
						.filter((value): value is string => Boolean(value)),
				);

				await tx.fieldOption.updateMany({
					where: { fieldId: id, id: { notIn: [...keep] }, archivedAt: null },
					data: { archivedAt: new Date() },
				});

				for (const [index, option] of data.options.entries()) {
					if (option.id) {
						await tx.fieldOption.update({
							where: { id: option.id },
							data: { label: option.label, position: index },
						});
						continue;
					}

					await tx.fieldOption.create({
						data: { fieldId: id, label: option.label, position: index },
					});
				}
			}

			return tx.fieldDefinition.update({
				where: { id },
				data: {
					label: data.label,
					type: data.type,
					agentFilled: data.agentFilled,
					agentBrief: data.agentBrief,
					required: data.required,
					showOnSheet,
					showOnTable: data.showOnTable,
					showOnFilter: data.showOnFilter,
				},
				include: WITH_OPTIONS,
			});
		});

		const briefChanged =
			data.agentBrief !== undefined && data.agentBrief !== existing.agentBrief;
		const turnedOn = data.agentFilled === true && !existing.agentFilled;

		if (definition.agentFilled && (briefChanged || turnedOn)) {
			const ids = await this.missingRecordIds(
				definition.entity,
				definition.id,
				FIELDS_CONFIG.backfill.maxRecordsPerRun,
			);
			await this.agent.fieldBackfillRecords(
				definition.entity,
				[definition.key],
				ids,
				briefChanged
					? `Brief changed: ${definition.label}`
					: `Turned on: ${definition.label}`,
			);
		}

		return serializeField(definition);
	}

	async layout(entity: FieldEntity): Promise<MucBoTri[]> {
		const [hangChuan, tuTao] = await Promise.all([
			this.db.standardFieldLayout.findMany({
				where: { entity },
				select: { key: true, position: true, hidden: true },
			}),
			this.db.fieldDefinition.findMany({
				where: { entity, archivedAt: null },
				select: { id: true, key: true, position: true },
			}),
		]);

		return sapBoTri(
			entity,
			hangChuan.filter((hang) => isStandardFieldKey(entity, hang.key)),
			tuTao,
		);
	}

	async reorder(
		actingUserId: string,
		input: FieldReorderInput,
	): Promise<SerializedField[]> {
		await this.requireManager(actingUserId);

		if (input.ids) {
			await this.reorderCustom(input.entity, input.ids);
		} else if (input.items) {
			await this.reorderMixed(input.entity, input.items);
		}

		return this.list(input.entity, false);
	}

	private async reorderCustom(entity: FieldEntity, ids: string[]) {
		const owned = await this.db.fieldDefinition.findMany({
			where: { id: { in: ids }, entity },
			select: { id: true, position: true },
		});

		if (owned.length !== ids.length || new Set(ids).size !== ids.length) {
			throw new BadRequestException(
				"That order names a field which is not on this record type.",
			);
		}

		const slots = owned.map((field) => field.position).sort((a, b) => a - b);

		await this.db.$transaction(
			ids.map((id, index) =>
				this.db.fieldDefinition.update({
					where: { id },
					data: { position: slots[index] },
				}),
			),
		);
	}

	private async reorderMixed(
		entity: FieldEntity,
		items: ({ standard: string } | { custom: string })[],
	) {
		const live = await this.db.fieldDefinition.findMany({
			where: { entity, archivedAt: null },
			select: { id: true },
		});
		const standardKeys: readonly string[] = STANDARD_FIELD_KEYS[entity];
		const named = items.map((item) =>
			"standard" in item ? `s:${item.standard}` : `c:${item.custom}`,
		);
		const expected = new Set([
			...standardKeys.map((key) => `s:${key}`),
			...live.map((field) => `c:${field.id}`),
		]);

		if (
			named.length !== expected.size ||
			new Set(named).size !== named.length ||
			named.some((name) => !expected.has(name))
		) {
			throw new BadRequestException(FIELDS_CONFIG.messages.orderMismatch);
		}

		const hidden = new Map(
			(
				await this.db.standardFieldLayout.findMany({
					where: { entity },
					select: { key: true, hidden: true },
				})
			).map((row) => [row.key, row.hidden]),
		);

		await this.db.$transaction(
			items.map((item, position) =>
				"standard" in item
					? this.db.standardFieldLayout.upsert({
							where: { entity_key: { entity, key: item.standard } },
							create: {
								entity,
								key: item.standard,
								position,
								hidden: hidden.get(item.standard) ?? false,
							},
							update: { position },
						})
					: this.db.fieldDefinition.update({
							where: { id: item.custom },
							data: { position },
						}),
			),
		);
	}

	async setStandardHidden(
		actingUserId: string,
		input: FieldStandardHiddenInput,
	): Promise<MucBoTri[]> {
		await this.requireManager(actingUserId);

		const { entity, key, hidden } = input;

		if (!isStandardFieldKey(entity, key)) {
			throw new BadRequestException(FIELDS_CONFIG.messages.notStandard);
		}

		if (hidden && isRequiredStandardKey(entity, key)) {
			throw new BadRequestException(
				FIELDS_CONFIG.messages.requiredStandardShown,
			);
		}

		const rows = await this.db.standardFieldLayout.findMany({
			where: { entity },
			select: { key: true, position: true, hidden: true },
		});
		const missing = viTriChuan(entity, rows).filter(
			(row) => !rows.some((existing) => existing.key === row.key),
		);

		if (missing.length > 0) {
			await this.ensureStandardRows(entity);
		}

		await this.db.standardFieldLayout.update({
			where: { entity_key: { entity, key } },
			data: { hidden },
		});

		return this.layout(entity);
	}

	private async ensureStandardRows(entity: FieldEntity) {
		const order = await this.layout(entity);

		await this.db.$transaction(
			order.map((item, position) =>
				item.kind === "standard"
					? this.db.standardFieldLayout.upsert({
							where: { entity_key: { entity, key: item.key } },
							create: { entity, key: item.key, position, hidden: item.hidden },
							update: { position },
						})
					: this.db.fieldDefinition.update({
							where: { id: item.id },
							data: { position },
						}),
			),
		);
	}

	private async nextPosition(entity: FieldEntity): Promise<number> {
		const [custom, standard] = await Promise.all([
			this.db.fieldDefinition.aggregate({
				where: { entity },
				_max: { position: true },
			}),
			this.db.standardFieldLayout.aggregate({
				where: { entity },
				_max: { position: true },
			}),
		]);

		return (
			Math.max(custom._max.position ?? -1, standard._max.position ?? -1) + 1
		);
	}

	async archive(actingUserId: string, id: string): Promise<SerializedField> {
		await this.requireManager(actingUserId);

		try {
			const definition = await this.db.fieldDefinition.update({
				where: { id },
				data: { archivedAt: new Date() },
				include: WITH_OPTIONS,
			});

			return serializeField(definition);
		} catch (error) {
			throw this.translate(error);
		}
	}

	async restore(actingUserId: string, id: string): Promise<SerializedField> {
		await this.requireManager(actingUserId);

		try {
			const definition = await this.db.fieldDefinition.update({
				where: { id },
				data: { archivedAt: null },
				include: WITH_OPTIONS,
			});

			return serializeField(definition);
		} catch (error) {
			throw this.translate(error);
		}
	}

	async delete(actingUserId: string, id: string): Promise<{ id: string }> {
		await this.requireManager(actingUserId);

		try {
			await this.db.fieldDefinition.delete({ where: { id } });
		} catch (error) {
			throw this.translate(error);
		}

		return { id };
	}

	async backfill(
		actingUserId: string,
		id: string,
	): Promise<{ queued: boolean }> {
		await this.requireManager(actingUserId);

		const definition = await this.db.fieldDefinition.findUnique({
			where: { id },
			select: {
				entity: true,
				key: true,
				label: true,
				agentFilled: true,
				archivedAt: true,
			},
		});

		if (!definition) throw new NotFoundException("That field does not exist.");

		if (!definition.agentFilled || definition.archivedAt !== null) {
			throw new BadRequestException(
				"Your agents do not fill this field, so there is nothing to run.",
			);
		}

		const ids = await this.missingRecordIds(
			definition.entity,
			id,
			FIELDS_CONFIG.backfill.maxRecordsPerRun,
		);
		const result = await this.agent.fieldBackfillRecords(
			definition.entity,
			[definition.key],
			ids,
			"Asked to fill the rest",
		);

		return { queued: result.queued > 0 || result.merged > 0 };
	}

	/** Every agent-filled field is inherently blank on a record that was just created. */
	async queueBackfillForNewRecord(
		entity: FieldEntity,
		recordId: string,
		values: Record<string, unknown> = {},
	): Promise<void> {
		const definitions = await this.db.fieldDefinition.findMany({
			where: { entity, archivedAt: null, agentFilled: true },
			select: { key: true },
		});
		const conTrong = definitions
			.map((definition) => definition.key)
			.filter((key) => laGiaTriRong(values[key]));

		if (conTrong.length === 0) return;

		await this.agent.fieldBackfillRecords(
			entity,
			conTrong,
			[recordId],
			"New record",
		);
	}

	async kiemBatBuocLucTao(
		client: Prisma.TransactionClient,
		entity: FieldEntity,
		values: Record<string, unknown>,
	): Promise<void> {
		const batBuoc = await client.fieldDefinition.findMany({
			where: { entity, archivedAt: null, required: true },
			select: { key: true, label: true },
			orderBy: { position: "asc" },
		});
		const thieu = batBuoc.find((definition) =>
			laGiaTriRong(values[definition.key]),
		);
		if (thieu) {
			throw new LoiGiaTriTruong(
				{ khoa: thieu.key, lyDo: "thieu" },
				`${thieu.label} is required.`,
			);
		}
	}

	async ghiTruongLucTao(
		tx: Prisma.TransactionClient,
		entity: FieldEntity,
		recordId: string,
		values: Record<string, unknown>,
	): Promise<void> {
		await this.kiemBatBuocLucTao(tx, entity, values);
		await this.applyValues(tx, entity, recordId, values);
	}

	private async missingRecordIds(
		entity: FieldEntity,
		fieldId: string,
		cap: number,
	): Promise<string[]> {
		const where = { fieldValues: { none: { fieldId } } };

		const rows =
			entity === "COMPANY"
				? await this.db.company.findMany({
						where,
						select: { id: true },
						take: cap,
					})
				: entity === "CONTACT"
					? await this.db.contact.findMany({
							where,
							select: { id: true },
							take: cap,
						})
					: await this.db.deal.findMany({
							where,
							select: { id: true },
							take: cap,
						});

		return rows.map((row) => row.id);
	}

	async coverage(id: string): Promise<{ filled: number; total: number }> {
		const definition = await this.db.fieldDefinition.findUnique({
			where: { id },
			select: { entity: true },
		});

		if (!definition) throw new NotFoundException("That field does not exist.");

		const column = recordColumn(definition.entity);

		const [filled, total] = await Promise.all([
			this.db.fieldValue.count({
				where: { fieldId: id, [column]: { not: null } },
			}),
			definition.entity === "COMPANY"
				? this.db.company.count()
				: definition.entity === "CONTACT"
					? this.db.contact.count()
					: this.db.deal.count(),
		]);

		return { filled, total };
	}

	async definitionsFor(
		entity: FieldEntity,
		client: Prisma.TransactionClient = this.db,
	): Promise<FieldDefinitionWithOptions[]> {
		return client.fieldDefinition.findMany({
			where: { entity, archivedAt: null },
			include: WITH_OPTIONS,
			orderBy: { position: "asc" },
		});
	}

	async valuesFor(
		entity: FieldEntity,
		recordId: string,
	): Promise<RecordField[]> {
		const column = recordColumn(entity);

		const [definitions, rows] = await Promise.all([
			this.definitionsFor(entity),
			this.db.fieldValue.findMany({ where: { [column]: recordId } }),
		]);

		return attachValues(definitions, rows);
	}

	async sapTheoTruong<E extends FieldEntity>(
		entity: E,
		sapXep: { sort?: string; dir: SortDirection },
		where: WhereTheoLoai[E],
		trang: Page,
	): Promise<string[] | null> {
		if (!sapXep.sort?.startsWith(TIEN_TO_COT_TRUONG)) return null;

		const key = sapXep.sort.slice(TIEN_TO_COT_TRUONG.length);
		if (!key) return null;

		const definition = await this.db.fieldDefinition.findFirst({
			where: { entity, key, archivedAt: null },
			select: { id: true, type: true },
		});
		if (!definition) return null;

		const cach = cachSapTruong(definition.type);
		if (!cach) return null;

		const relation = RELATIONS[entity];
		const column = recordColumn(entity);
		const coGiaTri = coGiaTriCua(definition);
		const doanCo: Prisma.FieldValueWhereInput = {
			...coGiaTri,
			[relation]: { is: where },
		};

		const [soCo, hangCo] = await Promise.all([
			this.db.fieldValue.count({ where: doanCo }),
			this.db.fieldValue.findMany({
				where: doanCo,
				orderBy: [
					thuTuGiaTri(cach, sapXep.dir),
					...TEN_BAN_GHI[entity].map((thuTu) => ({ [relation]: thuTu })),
					{ [column]: "asc" },
				],
				skip: trang.skip,
				take: trang.take,
				select: { [column]: true },
			}),
		]);

		const ids = hangCo.flatMap((hang) => {
			const id = hang[column];
			return id ? [id] : [];
		});

		const conLai = trang.take - ids.length;
		if (conLai <= 0) return ids;

		const trong = await this.banGhiTrong(entity, where, coGiaTri, {
			skip: Math.max(0, trang.skip - soCo),
			take: conLai,
		});

		return [...ids, ...trong];
	}

	private async banGhiTrong<E extends FieldEntity>(
		entity: E,
		where: WhereTheoLoai[E],
		coGiaTri: Prisma.FieldValueWhereInput,
		trang: Page,
	): Promise<string[]> {
		const khongGiaTri = { fieldValues: { none: coGiaTri } };
		const chon = { ...trang, select: { id: true } } as const;

		const hang =
			entity === "DEAL"
				? await this.db.deal.findMany({
						...chon,
						where: { AND: [where as Prisma.DealWhereInput, khongGiaTri] },
						orderBy: [...TEN_BAN_GHI.DEAL, { id: "asc" }],
					})
				: entity === "COMPANY"
					? await this.db.company.findMany({
							...chon,
							where: { AND: [where as Prisma.CompanyWhereInput, khongGiaTri] },
							orderBy: [...TEN_BAN_GHI.COMPANY, { id: "asc" }],
						})
					: await this.db.contact.findMany({
							...chon,
							where: { AND: [where as Prisma.ContactWhereInput, khongGiaTri] },
							orderBy: [...TEN_BAN_GHI.CONTACT, { id: "asc" }],
						});

		return hang.map((dong) => dong.id);
	}

	async tableValuesFor(
		entity: FieldEntity,
		recordIds: string[],
		gioiHan?: number,
	): Promise<Map<string, Record<string, FieldValueJson>>> {
		const byRecord = new Map<string, Record<string, FieldValueJson>>();

		if (recordIds.length === 0) return byRecord;

		const definitions = await this.db.fieldDefinition.findMany({
			where: { entity, archivedAt: null, showOnTable: true },
			include: WITH_OPTIONS,
			orderBy: { position: "asc" },
			take: gioiHan,
		});

		if (definitions.length === 0) return byRecord;

		const column = recordColumn(entity);

		const rows = await this.db.fieldValue.findMany({
			where: {
				[column]: { in: recordIds },
				fieldId: { in: definitions.map((definition) => definition.id) },
			},
		});

		const byId = new Map(definitions.map((entry) => [entry.id, entry]));

		for (const row of rows) {
			const recordId = row[column];
			if (!recordId) continue;

			const definition = byId.get(row.fieldId);
			if (!definition) continue;

			const current = byRecord.get(recordId) ?? {};
			current[definition.key] = tableValue(
				definition,
				readValue(definition, row),
			);
			byRecord.set(recordId, current);
		}

		return byRecord;
	}

	async filters(entity: FieldEntity): Promise<SerializedField[]> {
		const definitions = await this.filterableFieldsFor(entity);
		return definitions.map(serializeField);
	}

	async filterableFieldsFor(
		entity: FieldEntity,
	): Promise<FieldDefinitionWithOptions[]> {
		return this.db.fieldDefinition.findMany({
			where: {
				entity,
				archivedAt: null,
				showOnFilter: true,
			},
			include: WITH_OPTIONS,
			orderBy: { position: "asc" },
		});
	}

	/**
	 * Counted by joining straight to the entity table through `FieldValue`'s
	 * relation, filtered by the same search/archived condition as the rest of
	 * that list's facets — never by first fetching every matching id, which
	 * would not scale past a few thousand records.
	 */
	async filterFacetCounts(
		entity: FieldEntity,
		relationWhere:
			| Prisma.CompanyWhereInput
			| Prisma.ContactWhereInput
			| Prisma.DealWhereInput,
		definitions: FieldDefinitionWithOptions[],
	): Promise<Record<string, Record<string, number>>> {
		const facetCounts: Record<string, Record<string, number>> = {};
		if (definitions.length === 0) return facetCounts;

		const relation = RELATIONS[entity];
		const byId = new Map(
			definitions.map((definition) => [definition.id, definition]),
		);
		const selectIds = definitions
			.filter((definition) => cachLocTruong(definition.type) === "luaChon")
			.map((definition) => definition.id);
		const userIds = definitions
			.filter((definition) => cachLocTruong(definition.type) === "nguoi")
			.map((definition) => definition.id);

		const [selectGroups, userGroups] = await Promise.all([
			selectIds.length > 0
				? this.db.fieldValue.groupBy({
						by: ["fieldId", "optionId"],
						where: {
							fieldId: { in: selectIds },
							optionId: { not: null },
							[relation]: relationWhere,
						} as Prisma.FieldValueWhereInput,
						_count: { _all: true },
					})
				: [],
			userIds.length > 0
				? this.db.fieldValue.groupBy({
						by: ["fieldId", "userId"],
						where: {
							fieldId: { in: userIds },
							userId: { not: null },
							[relation]: relationWhere,
						} as Prisma.FieldValueWhereInput,
						_count: { _all: true },
					})
				: [],
		]);

		for (const group of selectGroups) {
			const definition = byId.get(group.fieldId);
			if (!definition || !group.optionId) continue;
			const bucket = facetCounts[definition.key] ?? {};
			facetCounts[definition.key] = bucket;
			bucket[group.optionId] =
				(bucket[group.optionId] ?? 0) + group._count._all;
		}

		for (const group of userGroups) {
			const definition = byId.get(group.fieldId);
			if (!definition || !group.userId) continue;
			const bucket = facetCounts[definition.key] ?? {};
			facetCounts[definition.key] = bucket;
			bucket[group.userId] = (bucket[group.userId] ?? 0) + group._count._all;
		}

		const demThem = await Promise.all(
			definitions.flatMap((definition) =>
				this.demGiaTriMenu(entity, relationWhere, definition).map(
					async ([gia, dem]) => [definition.key, gia, await dem] as const,
				),
			),
		);

		for (const [key, gia, dem] of demThem) {
			const bucket = facetCounts[key] ?? {};
			facetCounts[key] = bucket;
			bucket[gia] = dem;
		}

		return facetCounts;
	}

	private demGiaTriMenu(
		entity: FieldEntity,
		relationWhere: WhereTheoLoai[FieldEntity],
		definition: FieldDefinitionWithOptions,
	): Array<[string, Promise<number>]> {
		const relation = RELATIONS[entity];
		const fieldId = definition.id;
		const demGiaTri = (where: Prisma.FieldValueWhereInput) =>
			this.db.fieldValue.count({
				where: { fieldId, ...where, [relation]: relationWhere },
			});
		const dem: Array<[string, Promise<number>]> = [];

		if (cachLocTruong(definition.type) === "moc") {
			for (const moc of MOC_NGAY) {
				dem.push([moc, demGiaTri({ date: khoangMocTruong(moc) })]);
			}
		}

		if (cachLocTruong(definition.type) === "tich") {
			dem.push(["yes", demGiaTri({ bool: true })]);
			dem.push([
				"no",
				this.demBanGhi(entity, relationWhere, {
					fieldValues: { none: { fieldId, bool: true } },
				}),
			]);
		}

		if (locDuocTrong(definition.type)) {
			dem.push([
				GIA_TRI_TRONG,
				this.demBanGhi(entity, relationWhere, {
					fieldValues: { none: coGiaTriCua(definition) },
				}),
			]);
		}

		return dem;
	}

	private demBanGhi(
		entity: FieldEntity,
		where: WhereTheoLoai[FieldEntity],
		them: DieuKienTruong,
	): Promise<number> {
		if (entity === "DEAL") {
			return this.db.deal.count({
				where: { AND: [where as Prisma.DealWhereInput, them] },
			});
		}
		if (entity === "COMPANY") {
			return this.db.company.count({
				where: { AND: [where as Prisma.CompanyWhereInput, them] },
			});
		}
		return this.db.contact.count({
			where: { AND: [where as Prisma.ContactWhereInput, them] },
		});
	}

	fieldFilters(
		definitions: FieldDefinitionWithOptions[],
		selected: Record<string, string[]>,
	): DieuKienTruong[] {
		const byKey = new Map(
			definitions.map((definition) => [definition.key, definition]),
		);

		return Object.entries(selected)
			.filter(([, values]) => values.length > 0)
			.flatMap(([key, values]) => {
				const definition = byKey.get(key);
				if (!definition) return [];

				return [dieuKienLoc(definition, values)];
			});
	}

	async applyValues(
		tx: Prisma.TransactionClient,
		entity: FieldEntity,
		recordId: string,
		values: Record<string, unknown>,
	): Promise<void> {
		if (Object.keys(values).length === 0) return;

		const definitions = await this.definitionsFor(entity, tx);

		try {
			await writeValues(tx, entity, recordId, definitions, values);
		} catch (error) {
			if (error instanceof FieldValueError) {
				throw new LoiGiaTriTruong(
					{
						khoa: error.key,
						lyDo: laGiaTriRong(values[error.key]) ? "thieu" : "gia-tri",
					},
					error.message,
				);
			}

			throw error;
		}
	}

	private translate(cause: unknown): never {
		if (
			cause instanceof PrismaNamespace.PrismaClientKnownRequestError &&
			cause.code === "P2025"
		) {
			throw new NotFoundException("That field does not exist.");
		}

		throw cause;
	}
}

function tableValue(
	definition: FieldDefinitionWithOptions,
	value: FieldValueJson,
): FieldValueJson {
	if (definition.type !== "SELECT" || typeof value !== "string") return value;

	return (
		definition.options.find((option) => option.id === value)?.label ?? null
	);
}
