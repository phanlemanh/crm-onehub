import type { Locale } from "@crm/ui/lib/locale";

export function tenGoi(hoTen: string, locale: Locale, thayThe: string): string {
	const phan = hoTen.trim().split(/\s+/).filter(Boolean);
	if (phan.length === 0) return thayThe;
	return (locale === "vi" ? phan[phan.length - 1] : phan[0]) ?? thayThe;
}
