import type { Locale } from "@crm/ui/lib/locale";
import { crmMessages } from "@/lib/messages/crm";

type Hang = { readonly meta: { readonly add: string } };

export function nhanTruong(locale: Locale, hang: readonly Hang[]): string[] {
	const m = crmMessages(locale).fields;
	const rieng = hang.map((x) => {
		const m = x.meta;
		return m.add;
	});
	return [...rieng, m.add];
}

export function nhanChuan(locale: Locale): string {
	const m = crmMessages(locale).standard;
	return m.company;
}
