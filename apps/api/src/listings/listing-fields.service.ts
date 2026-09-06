import type { Db } from "@crm/db";
import type { FieldDefinitionWithOptions } from "@crm/db/fields";
import { Injectable } from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import { FieldsService } from "../fields/fields.service";
import { LISTING, type ListingFieldKey } from "./listings-config";

@Injectable()
export class ListingFieldsService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		private readonly fields: FieldsService,
	) {}

	async ensure(): Promise<Map<ListingFieldKey, FieldDefinitionWithOptions>> {
		const existing = await this.fields.definitionsFor("CONTACT");
		const byKey = new Set(existing.map((row) => row.key));

		for (const field of LISTING.fields) {
			if (byKey.has(field.key)) continue;

			const last = await this.db.fieldDefinition.findFirst({
				where: { entity: "CONTACT" },
				orderBy: { position: "desc" },
				select: { position: true },
			});

			await this.db.fieldDefinition.create({
				data: {
					entity: "CONTACT",
					key: field.key,
					label: field.label,
					type: field.type,
					agentFilled: false,
					required: false,
					showOnSheet: true,
					showOnTable: "showOnTable" in field ? field.showOnTable : false,
					showOnFilter: "showOnFilter" in field ? field.showOnFilter : false,
					position: (last?.position ?? -1) + 1,
					options:
						"options" in field
							? {
									create: field.options.map((label, index) => ({
										label,
										position: index,
									})),
								}
							: undefined,
				},
			});
		}

		const after = await this.fields.definitionsFor("CONTACT");
		const wanted = new Set<string>(LISTING.fields.map((field) => field.key));

		return new Map(
			after
				.filter((row) => wanted.has(row.key))
				.map((row) => [row.key as ListingFieldKey, row]),
		);
	}
}
