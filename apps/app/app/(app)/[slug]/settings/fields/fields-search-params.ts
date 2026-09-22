import { createLoader, parseAsString, parseAsStringLiteral } from "nuqs/server";
import {
	entityOf,
	type FieldEntity,
} from "@/components/crm/fields/fields-entity";
import {
	ENTITY_KINDS,
	type EntityKind,
} from "@/components/crm/record-sheet/record-stack";
import { SEARCH_PARAM } from "@/lib/search-param-keys";

export const MAC_DINH: EntityKind = "company";

export const fieldsPageParams = {
	[SEARCH_PARAM.fieldsPage.entity]: parseAsStringLiteral(ENTITY_KINDS),
	[SEARCH_PARAM.fieldsPage.field]: parseAsString,
};

export const loadFieldsPageParams = createLoader(fieldsPageParams);

export function kindFrom(
	values: {
		[K in keyof typeof fieldsPageParams]: EntityKind | string | null;
	},
): EntityKind {
	const raw = values[SEARCH_PARAM.fieldsPage.entity];
	return (raw as EntityKind | null) ?? MAC_DINH;
}

export function entityFrom(
	values: {
		[K in keyof typeof fieldsPageParams]: EntityKind | string | null;
	},
): FieldEntity {
	return entityOf(kindFrom(values));
}
