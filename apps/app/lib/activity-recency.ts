import type { Locale } from "@crm/ui/lib/locale";
import { crmMessages } from "@/lib/messages/crm";

const KHOA = [
	{ value: "7", khoa: "within7" },
	{ value: "30", khoa: "within30" },
	{ value: "90", khoa: "within90" },
] as const;

export function activityFacetOptions(locale: Locale) {
	const m = crmMessages(locale).activity;
	return KHOA.map(({ value, khoa }) => ({ value, label: m[khoa] }));
}
