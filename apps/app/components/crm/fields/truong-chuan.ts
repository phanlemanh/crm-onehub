import {
	STANDARD_FIELD_KEYS,
	type StandardFieldKey,
} from "@crm/db/fields-chuan";
import type { Locale } from "@crm/ui/lib/locale";
import type { MucBoTriTruong } from "@crm/validation/bo-tri-truong";
import { crmMessages } from "@/lib/messages/crm";
import { recordSheetMessages } from "@/lib/messages/record-sheet";
import type { KieuTruong } from "./doc-nhap";
import type { FieldEntity } from "./fields-entity";
import type { RecordFieldEntry } from "./record-fields";

export type KieuChuan = KieuTruong | "COMPANY";

type DongChuan = { nhan: (locale: Locale) => string; kieu: KieuChuan };

const sheet = (locale: Locale) => recordSheetMessages(locale);
const congTy = (locale: Locale) => crmMessages(locale).standard.company;

const DANH_MUC = {
	DEAL: {
		name: { nhan: (l) => sheet(l).deal.fields.name, kieu: "TEXT" },
		amount: { nhan: (l) => sheet(l).deal.fields.amount, kieu: "MONEY" },
		currency: { nhan: (l) => sheet(l).deal.fields.currency, kieu: "SELECT" },
		expectedCloseDate: {
			nhan: (l) => sheet(l).deal.fields.closeDate,
			kieu: "DATE",
		},
		company: { nhan: congTy, kieu: "COMPANY" },
		owner: { nhan: (l) => sheet(l).deal.fields.owner, kieu: "USER" },
	},
	COMPANY: {
		name: { nhan: (l) => sheet(l).company.fields.name, kieu: "TEXT" },
		domain: { nhan: (l) => sheet(l).company.fields.domain, kieu: "URL" },
		website: { nhan: (l) => sheet(l).company.fields.website, kieu: "URL" },
		phone: { nhan: (l) => sheet(l).company.fields.phone, kieu: "PHONE" },
		email: { nhan: (l) => sheet(l).company.fields.email, kieu: "EMAIL" },
		city: { nhan: (l) => sheet(l).company.fields.city, kieu: "TEXT" },
		country: { nhan: (l) => sheet(l).company.fields.country, kieu: "TEXT" },
		owner: { nhan: (l) => sheet(l).company.fields.owner, kieu: "USER" },
	},
	CONTACT: {
		firstName: {
			nhan: (l) => sheet(l).contact.fields.firstName,
			kieu: "TEXT",
		},
		lastName: { nhan: (l) => sheet(l).contact.fields.lastName, kieu: "TEXT" },
		title: { nhan: (l) => sheet(l).contact.fields.title, kieu: "TEXT" },
		email: { nhan: (l) => sheet(l).contact.fields.email, kieu: "EMAIL" },
		phone: { nhan: (l) => sheet(l).contact.fields.phone, kieu: "PHONE" },
		linkedin: { nhan: (l) => sheet(l).contact.fields.linkedin, kieu: "URL" },
		x: { nhan: (l) => sheet(l).contact.fields.x, kieu: "URL" },
		github: { nhan: (l) => sheet(l).contact.fields.github, kieu: "URL" },
		company: { nhan: congTy, kieu: "COMPANY" },
		owner: { nhan: (l) => sheet(l).contact.fields.owner, kieu: "USER" },
	},
} as const satisfies {
	[E in FieldEntity]: Record<StandardFieldKey<E>, DongChuan>;
};

function dong(entity: FieldEntity, key: string): DongChuan | undefined {
	const bang: Record<string, DongChuan> = DANH_MUC[entity];
	return bang[key];
}

export function nhanTruongChuan(
	entity: FieldEntity,
	key: string,
	locale: Locale,
): string {
	return dong(entity, key)?.nhan(locale) ?? key;
}

export function kieuTruongChuan(
	entity: FieldEntity,
	key: string,
): KieuChuan | undefined {
	return dong(entity, key)?.kieu;
}

export function khoaTruongChuan(entity: FieldEntity): readonly string[] {
	return STANDARD_FIELD_KEYS[entity];
}

export type MucChiTiet =
	| { kind: "standard"; key: string }
	| { kind: "custom"; field: RecordFieldEntry };

export function mucChiTiet(
	muc: readonly MucBoTriTruong[],
	tuTao: readonly RecordFieldEntry[],
): MucChiTiet[] {
	const theoId = new Map(tuTao.map((field) => [field.id, field]));
	const daDung = new Set<string>();
	const ra: MucChiTiet[] = [];

	for (const m of muc) {
		if (m.kind === "standard") {
			if (!m.hidden) ra.push({ kind: "standard", key: m.key });
			continue;
		}
		const field = theoId.get(m.id);
		if (!field) continue;
		daDung.add(field.id);
		if (field.showOnSheet) ra.push({ kind: "custom", field });
	}

	for (const field of tuTao) {
		if (!daDung.has(field.id) && field.showOnSheet)
			ra.push({ kind: "custom", field });
	}

	return ra;
}

export function khoaSauQuyDoi(chiTiet: readonly MucChiTiet[]): string | null {
	const khoa = chiTiet.map((m) => (m.kind === "standard" ? m.key : ""));
	const giaTri = khoa.indexOf("amount");
	if (giaTri < 0) return null;
	return khoa.indexOf("currency") > giaTri ? "currency" : "amount";
}
