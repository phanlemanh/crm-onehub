import type { EntityKind } from "@/components/crm/record-sheet/record-stack";

export type FieldEntity = "COMPANY" | "CONTACT" | "DEAL";

const TO_ENTITY = {
	company: "COMPANY",
	contact: "CONTACT",
	deal: "DEAL",
} satisfies Record<EntityKind, FieldEntity>;

const TO_KIND = {
	COMPANY: "company",
	CONTACT: "contact",
	DEAL: "deal",
} satisfies Record<FieldEntity, EntityKind>;

export const FIELD_ENTITIES = [
	"COMPANY",
	"CONTACT",
	"DEAL",
] as const satisfies readonly FieldEntity[];

export function entityOf(kind: EntityKind): FieldEntity {
	return TO_ENTITY[kind];
}

export function kindOf(entity: FieldEntity): EntityKind {
	return TO_KIND[entity];
}
