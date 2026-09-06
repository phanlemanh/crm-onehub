import { type Db, EnrichmentStatus, type Prisma, RecordSource } from "@crm/db";
import type { FieldDefinitionWithOptions } from "@crm/db/fields";
import type { ListingBatch, ListingItem } from "@crm/validation/listing-ingest";
import { Injectable, Logger } from "@nestjs/common";
import { blankToNull } from "../crm/values";
import { InjectDatabase } from "../database/database.constants";
import { ListingFieldsService } from "./listing-fields.service";
import {
	LISTING,
	type ListingFieldKey,
	MATCH_KEY,
	TIER_LABELS,
} from "./listings-config";

type Definitions = Map<ListingFieldKey, FieldDefinitionWithOptions>;

type ValuePayload = {
	text?: string;
	number?: number;
	date?: Date;
	optionId?: string | null;
};

type PersonName = {
	firstName: string;
	lastName: string | null;
};

function splitName(full: string): PersonName {
	const parts = full.trim().split(/\s+/);
	if (parts.length === 1)
		return { firstName: parts[0] ?? full, lastName: null };

	return {
		firstName: parts.slice(0, -1).join(" "),
		lastName: parts[parts.length - 1] ?? null,
	};
}

function optionId(
	definitions: Definitions,
	key: ListingFieldKey,
	label: string,
): string {
	const definition = definitions.get(key);
	const found = definition?.options.find((option) => option.label === label);
	if (found) return found.id;

	const known = (definition?.options ?? [])
		.map((option) => `"${option.label}"`)
		.join(", ");

	throw new Error(
		`Listing field "${key}" has no option labelled "${label}". Known options: ${known || "none"}.`,
	);
}

@Injectable()
export class ListingIngestService {
	private readonly logger = new Logger(ListingIngestService.name);

	constructor(
		@InjectDatabase() private readonly db: Db,
		private readonly fields: ListingFieldsService,
	) {}

	async ingest(
		batch: ListingBatch,
	): Promise<{ created: number; updated: number }> {
		const definitions = await this.fields.ensure();
		const crawledAt = new Date(batch.crawledAt);

		let created = 0;
		let updated = 0;

		for (const item of batch.items) {
			const outcome = await this.one(item, definitions, crawledAt);
			if (outcome === "created") created += 1;
			else updated += 1;
		}

		this.logger.log({
			message: "Listing batch ingested",
			source: batch.source,
			items: batch.items.length,
			created,
			updated,
		});

		return { created, updated };
	}

	private async one(
		item: ListingItem,
		definitions: Definitions,
		crawledAt: Date,
	): Promise<"created" | "updated"> {
		const match = definitions.get(MATCH_KEY);
		if (!match) throw new Error(`Missing field definition for ${MATCH_KEY}.`);

		return this.db.$transaction(async (tx) => {
			const existing = await tx.fieldValue.findFirst({
				where: { fieldId: match.id, text: item.url, contactId: { not: null } },
				select: { contactId: true },
			});

			const name = splitName(item.personName ?? item.shopName);
			const phone = item.phone ? blankToNull(item.phone) : null;

			const contactId = existing?.contactId
				? (
						await tx.contact.update({
							where: { id: existing.contactId },
							data: phone ? { phone } : {},
							select: { id: true },
						})
					).id
				: (
						await tx.contact.create({
							data: {
								firstName: name.firstName,
								lastName: name.lastName,
								phone,
								source: RecordSource.LISTING,
								enrichmentStatus: EnrichmentStatus.SKIPPED,
							},
							select: { id: true },
						})
					).id;

			await this.writeValues(tx, contactId, definitions, item, crawledAt);

			return existing?.contactId ? "updated" : "created";
		});
	}

	private async writeValues(
		tx: Prisma.TransactionClient,
		contactId: string,
		definitions: Definitions,
		item: ListingItem,
		crawledAt: Date,
	): Promise<void> {
		const values = {
			san_luong: {
				optionId: optionId(definitions, "san_luong", TIER_LABELS[item.tier]),
			},
			tin_dang: { number: item.listingsTotal },
			tin_moi_30_ngay: { number: item.listingsNew30d },
			dia_ban: { text: item.districts.join(", ") },
			hinh_thai: {
				optionId: optionId(
					definitions,
					"hinh_thai",
					item.isCompany ? "Công ty" : "Cá nhân",
				),
			},
			chung_chi: {
				optionId: optionId(
					definitions,
					"chung_chi",
					item.hasLicense ? "Có" : "Không",
				),
			},
			ten_chuyen_trang: { text: item.shopName },
			trang_nhatot: { text: item.url },
			san_cap_nhat_luc: { date: crawledAt },
		} satisfies Record<ListingFieldKey, ValuePayload>;

		for (const field of LISTING.fields) {
			const definition = definitions.get(field.key);
			if (!definition) continue;

			await tx.fieldValue.upsert({
				where: { fieldId_contactId: { fieldId: definition.id, contactId } },
				create: { fieldId: definition.id, contactId, ...values[field.key] },
				update: values[field.key],
			});
		}
	}
}
