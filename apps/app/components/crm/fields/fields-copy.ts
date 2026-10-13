import type { FieldTypeName } from "@crm/db/fields-shape";
import type { Locale } from "@crm/ui/lib/locale";
import type { EntityKind } from "@/components/crm/record-sheet/record-stack";
import { crmMessages } from "@/lib/messages/crm";
import type { FieldEntity } from "./fields-entity";

export function fieldsCopy(locale: Locale) {
	const m = crmMessages(locale);

	return {
		sheetTitle: m.sheet.fields,
		standardRow: m.fields.standardRow,
		standardNote: m.fields.standardNote,
		suggestedRow: m.fields.suggestedRow,
		suggestedNote: m.fields.suggestedNote,
		add: m.fields.add,
		customGroup: m.fields.customGroup,
		dragNote: m.fields.dragNote,
		archivedRow: m.fields.archivedRow,
		archivedNote: m.fields.archivedNote,
		newField: m.fields.newField,
		orderNote: m.fields.orderNote,
		manualOnly: m.fields.manualOnly,
		tableNote: m.fields.tableNote,
		filterNote: m.fields.filterNote,
		emptyTitle: m.fields.emptyTitle,
		emptyBody: m.fields.createHint,
		errorTitle: m.fields.errorTitle,
		errorBody: m.fields.retry,
		retry: m.fields.tryAgain,
		labelLabel: m.fields.labelLabel,
		keyLabel: m.fields.keyLabel,
		keyHelp: m.fields.keyHint,
		agentLabel: m.fields.agentLabel,
		agentHelp: m.fields.agentHint,
		briefLabel: m.fields.briefLabel,
		briefHelp: m.fields.emptyHint,
		typeLabel: m.fields.typeLabel,
		optionsLabel: m.fields.optionsLabel,
		addOption: m.fields.addOption,
		moreFor: m.fields.moreFor,
		canQuyen: m.fields.canQuyen,
		edit: m.fields.edit,
		restore: m.fields.restore,
		filledOf: m.fields.filledOf,
		removeOption: m.fields.removeOption,
		allFilled: m.fields.allFilled,
		addField: m.fields.addField,
		cancel: m.sheet.cancel,
		save: m.fields.saveChanges,
		archive: m.fields.archive,
		fillRest: m.fields.fillRest,
		pickedUp: m.fields.agentsPickUp,
	};
}

export function subtitleFor(kind: EntityKind, locale: Locale): string {
	const m = crmMessages(locale).fields;
	if (kind === "company") return m.shapesCompany;
	if (kind === "contact") return m.shapesContact;
	return m.shapesDeal;
}

export function stillToGo(n: number, locale: Locale): string {
	return crmMessages(locale).fields.stillToGo(String(n));
}

export function optionCount(n: number, locale: Locale): string {
	return crmMessages(locale).fields.optionCount(String(n));
}

export function optionLabel(index: number, locale: Locale): string {
	return crmMessages(locale).fields.option(String(index + 1));
}

export function sheetPlacement(entity: FieldEntity, locale: Locale): string {
	const m = crmMessages(locale).fields;
	if (entity === "COMPANY") return m.showCompany;
	if (entity === "CONTACT") return m.showContact;
	return m.showDeal;
}

export function tablePlacement(entity: FieldEntity, locale: Locale): string {
	const m = crmMessages(locale).fields;
	if (entity === "COMPANY") return m.columnCompany;
	if (entity === "CONTACT") return m.columnContact;
	return m.columnDeal;
}

export function filterPlacement(entity: FieldEntity, locale: Locale): string {
	const m = crmMessages(locale).fields;
	if (entity === "COMPANY") return m.filterCompany;
	if (entity === "CONTACT") return m.filterContact;
	return m.filterDeal;
}

export const TYPE_KEY = {
	TEXT: "text",
	LONG_TEXT: "longText",
	NUMBER: "number",
	DATE: "date",
	CHECKBOX: "checkbox",
	SELECT: "select",
	URL: "url",
	EMAIL: "email",
	PHONE: "phone",
	USER: "user",
} as const satisfies Record<FieldTypeName, string>;

export function fieldTypeLabel(
	type: keyof ReturnType<typeof crmMessages>["fields"]["type"],
	locale: Locale,
): string {
	return crmMessages(locale).fields.type[type];
}

export function coverageNoun(entity: FieldEntity, locale: Locale): string {
	const m = crmMessages(locale).standard;
	if (entity === "COMPANY") return m.companies.toLowerCase();
	if (entity === "CONTACT") return m.contacts.toLowerCase();
	return m.deals.toLowerCase();
}

export function filledOn(
	filled: number,
	total: number,
	entity: FieldEntity,
	locale: Locale,
): string {
	return crmMessages(locale).fields.filledOn(
		String(filled),
		String(total),
		coverageNoun(entity, locale),
	);
}

export function entityTabs(
	locale: Locale,
): readonly { kind: EntityKind; label: string }[] {
	const m = crmMessages(locale).standard;
	return [
		{ kind: "company", label: m.companies },
		{ kind: "contact", label: m.contacts },
		{ kind: "deal", label: m.deals },
	];
}
