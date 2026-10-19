import type { Locale } from "@crm/ui/lib/locale";

export type TenQuocGia = { ten: string; dich: boolean };

function tenVung(locale: string, ma: string): string | null {
	try {
		const ten = new Intl.DisplayNames([locale], { type: "region" }).of(ma);
		return ten && ten !== ma ? ten : null;
	} catch {
		return null;
	}
}

export function tenQuocGia(
	country: string | null | undefined,
	countryCode: string | null | undefined,
	locale: Locale,
): TenQuocGia | null {
	const goc = country?.trim();
	if (!goc) return null;

	const ma = countryCode?.trim().toUpperCase();
	if (!ma) return { ten: goc, dich: false };

	const tenAnh = tenVung("en", ma);
	if (!tenAnh || tenAnh.toLowerCase() !== goc.toLowerCase()) {
		return { ten: goc, dich: false };
	}

	const ten = tenVung(locale, ma);
	return ten ? { ten, dich: true } : { ten: goc, dich: false };
}
