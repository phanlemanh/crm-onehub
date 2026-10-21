export const FIELD_ENTITIES = ["COMPANY", "CONTACT", "DEAL"] as const;

export type FieldEntityName = (typeof FIELD_ENTITIES)[number];

export const FIELD_TYPES = [
	"TEXT",
	"LONG_TEXT",
	"NUMBER",
	"DATE",
	"CHECKBOX",
	"SELECT",
	"URL",
	"EMAIL",
	"PHONE",
	"USER",
] as const;

export type FieldTypeName = (typeof FIELD_TYPES)[number];

export type FieldValueColumn =
	| "text"
	| "number"
	| "date"
	| "bool"
	| "optionId"
	| "userId";

export type FieldValueWrite = Partial<Record<FieldValueColumn, unknown>>;

const COLUMNS = {
	TEXT: "text",
	LONG_TEXT: "text",
	URL: "text",
	EMAIL: "text",
	PHONE: "text",
	NUMBER: "number",
	DATE: "date",
	CHECKBOX: "bool",
	SELECT: "optionId",
	USER: "userId",
} as const satisfies Record<FieldTypeName, FieldValueColumn>;

export function columnFor(type: FieldTypeName): FieldValueColumn {
	return COLUMNS[type];
}

export const TIEN_TO_COT_TRUONG = "field:";

export type CachSapTruong = "text" | "number" | "date" | "luaChon" | "nguoi";

export const SAP_THEO_KIEU = {
	TEXT: "text",
	LONG_TEXT: "text",
	URL: "text",
	EMAIL: "text",
	PHONE: "text",
	NUMBER: "number",
	DATE: "date",
	SELECT: "luaChon",
	USER: "nguoi",
	CHECKBOX: null,
} as const satisfies Record<FieldTypeName, CachSapTruong | null>;

export function cachSapTruong(type: FieldTypeName): CachSapTruong | null {
	return SAP_THEO_KIEU[type];
}

export function sapDuocTheoKieu(type: string): boolean {
	return (
		Object.hasOwn(SAP_THEO_KIEU, type) &&
		SAP_THEO_KIEU[type as FieldTypeName] !== null
	);
}

export function usesOptions(type: FieldTypeName): boolean {
	return type === "SELECT";
}

export const RECORD_ID_COLUMNS = {
	COMPANY: "companyId",
	CONTACT: "contactId",
	DEAL: "dealId",
} as const satisfies Record<FieldEntityName, string>;

export type RecordIdColumn =
	(typeof RECORD_ID_COLUMNS)[keyof typeof RECORD_ID_COLUMNS];

export function recordColumn(entity: FieldEntityName): RecordIdColumn {
	return RECORD_ID_COLUMNS[entity];
}

const RESERVED_KEYS = new Set([
	"id",
	"createdat",
	"updatedat",
	"fields",
	"owner",
	"ownerid",
	"new",
]);

function boDau(label: string): string {
	return label
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[đĐ]/g, "d");
}

export function fieldKeyFromLabel(label: string): string {
	const key = boDau(label.trim())
		.toLowerCase()
		.replace(/['’]/g, "")
		.replace(/[^a-z0-9]+/g, "_")
		.replace(/^_+|_+$/g, "")
		.replace(/^([0-9])/, "f_$1")
		.slice(0, 60);

	return RESERVED_KEYS.has(key) ? `${key}_field` : key;
}

export class FieldValueError extends Error {
	readonly key: string;

	constructor(key: string, message: string) {
		super(message);
		this.name = "FieldValueError";
		this.key = key;
	}
}

export type FieldValueJson = string | number | boolean | null;
