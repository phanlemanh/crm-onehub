import type { Locale } from "@crm/ui/lib/locale";
import { khungUngDungMessages } from "@/lib/messages/khung-ung-dung";
import { okrMessages } from "@/lib/messages/okr";
import type { TabOkr } from "./tab-okr";

export function tieuDeKhu(locale: Locale): string {
	return khungUngDungMessages(locale).rail.okr;
}

export function tieuDeTrinhDuyet(
	locale: Locale,
	trang: TabOkr | string,
): string {
	const m = okrMessages(locale);
	const ten = trang in m.tab ? m.tab[trang as TabOkr] : trang;
	return `${ten} · ${tieuDeKhu(locale)}`;
}
