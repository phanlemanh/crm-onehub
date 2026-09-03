import type { Locale } from "@crm/ui/lib/locale";
import { crmMessages } from "@/lib/messages/crm";

const KHOA = [
	{ value: "overdue", khoa: "overdue" },
	{ value: "this-month", khoa: "thisMonth" },
	{ value: "next-month", khoa: "nextMonth" },
	{ value: "later", khoa: "later" },
	{ value: "none", khoa: "none" },
] as const;

export function closingOptions(locale: Locale) {
	const m = crmMessages(locale).closing;
	return KHOA.map(({ value, khoa }) => ({ value, label: m[khoa] }));
}
