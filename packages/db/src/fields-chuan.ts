import type { FieldEntityName } from "./fields-shape";

export const STANDARD_FIELD_KEYS = {
	DEAL: ["name", "amount", "currency", "expectedCloseDate", "company", "owner"],
	COMPANY: [
		"name",
		"domain",
		"website",
		"phone",
		"email",
		"city",
		"country",
		"owner",
	],
	CONTACT: [
		"firstName",
		"lastName",
		"title",
		"email",
		"phone",
		"linkedin",
		"x",
		"github",
		"company",
		"owner",
	],
} as const satisfies Record<FieldEntityName, readonly string[]>;

export const REQUIRED_STANDARD_KEYS = {
	DEAL: ["name", "currency", "company", "owner"],
	COMPANY: ["name"],
	CONTACT: ["firstName"],
} as const satisfies {
	[E in FieldEntityName]: readonly (typeof STANDARD_FIELD_KEYS)[E][number][];
};

export type StandardFieldKey<E extends FieldEntityName> =
	(typeof STANDARD_FIELD_KEYS)[E][number];

export function isStandardFieldKey(
	entity: FieldEntityName,
	key: string,
): boolean {
	return (STANDARD_FIELD_KEYS[entity] as readonly string[]).includes(key);
}

export function isRequiredStandardKey(
	entity: FieldEntityName,
	key: string,
): boolean {
	return (REQUIRED_STANDARD_KEYS[entity] as readonly string[]).includes(key);
}

export type MucBoTri =
	| { kind: "standard"; key: string; hidden: boolean; required: boolean }
	| { kind: "custom"; id: string; key: string };

export type HangChuan = { key: string; position: number; hidden: boolean };

export type HangTuTao = { id: string; key: string; position: number };

export function viTriChuan(
	entity: FieldEntityName,
	hangChuan: readonly HangChuan[],
): HangChuan[] {
	const khoa = STANDARD_FIELD_KEYS[entity];
	const theoKhoa = new Map(hangChuan.map((h) => [h.key, h]));

	if (theoKhoa.size === 0) {
		return khoa.map((key, i) => ({
			key,
			position: i - khoa.length,
			hidden: false,
		}));
	}

	const nhoNhat = Math.min(...hangChuan.map((h) => h.position));
	const ketQua: HangChuan[] = [];
	let truoc: number | null = null;

	for (const key of khoa) {
		const hang = theoKhoa.get(key);
		if (hang) {
			ketQua.push({ key, position: hang.position, hidden: hang.hidden });
			truoc = hang.position;
			continue;
		}
		const position: number = truoc === null ? nhoNhat - 1 : truoc + 1 / 1024;
		ketQua.push({ key, position, hidden: false });
		truoc = position;
	}

	return ketQua;
}

export function sapBoTri(
	entity: FieldEntityName,
	hangChuan: readonly HangChuan[],
	tuTao: readonly HangTuTao[],
): MucBoTri[] {
	const chuan = viTriChuan(entity, hangChuan).map((h) => ({
		position: h.position,
		thu: 0,
		khoa: h.key,
		muc: {
			kind: "standard",
			key: h.key,
			hidden: h.hidden,
			required: isRequiredStandardKey(entity, h.key),
		} satisfies MucBoTri as MucBoTri,
	}));
	const rieng = tuTao.map((h) => ({
		position: h.position,
		thu: 1,
		khoa: h.key,
		muc: {
			kind: "custom",
			id: h.id,
			key: h.key,
		} satisfies MucBoTri as MucBoTri,
	}));

	return [...chuan, ...rieng]
		.sort(
			(a, b) =>
				a.position - b.position ||
				a.thu - b.thu ||
				a.khoa.localeCompare(b.khoa),
		)
		.map((x) => x.muc);
}
