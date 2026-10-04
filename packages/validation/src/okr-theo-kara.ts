export const TIEN_TO_VET_KARA = "tro-ly-okr:";

type GiaTriVet = string | number | boolean | null | readonly string[];

export type VetTen = {
	at: string;
	keyResultId: string | null;
	note: string | null;
	before: Readonly<Record<string, GiaTriVet>> | null;
	after: Readonly<Record<string, GiaTriVet>> | null;
};

export function krTheoKara(trail: readonly VetTen[]): ReadonlySet<string> {
	const cuoi = new Map<string, VetTen>();
	const doiTen = trail
		.filter((v) => v.keyResultId !== null && v.before?.title !== v.after?.title)
		.sort((a, b) => a.at.localeCompare(b.at));
	for (const v of doiTen) if (v.keyResultId) cuoi.set(v.keyResultId, v);
	return new Set(
		[...cuoi]
			.filter(([, v]) => v.note?.startsWith(TIEN_TO_VET_KARA) === true)
			.map(([id]) => id),
	);
}
