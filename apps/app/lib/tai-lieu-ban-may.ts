import { coSoTronVen } from "@crm/validation/tai-lieu-so";
import { quoteKey, type TrichDoan } from "@crm/validation/tai-lieu-trich-doan";

export type DongSoMay = { so: string; trich: string | null };

const LOP_KY_TU = new Map([
	[" ", "[\\s\\u00a0\\u202f]+"],
	['"', '["\\u201c\\u201d]'],
	["'", "['\\u2018\\u2019]"],
	["-", "[-\\u2013\\u2014]"],
]);

function mauTrich(trich: string): RegExp {
	const mau = [...quoteKey(trich)]
		.map((c) => LOP_KY_TU.get(c) ?? c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
		.join("");
	return new RegExp(mau, "u");
}

export function doanTrongNguon(chuNguon: string, trich: string): string {
	if (chuNguon.includes(trich)) return trich;
	return chuNguon.match(mauTrich(trich))?.[0] ?? trich;
}

export function dongSoMay(
	soMoi: string[],
	trichDoan: TrichDoan[],
): DongSoMay[] {
	const khoa = trichDoan.map((t) => ({
		trich: t.trich,
		khoa: quoteKey(t.trich),
	}));
	return soMoi.map((so) => ({
		so,
		trich: khoa.find((t) => coSoTronVen(t.khoa, so))?.trich ?? null,
	}));
}
