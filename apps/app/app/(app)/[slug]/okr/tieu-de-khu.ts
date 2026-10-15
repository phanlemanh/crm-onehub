import type { Locale } from "@crm/ui/lib/locale";
import { khungUngDungMessages } from "@/lib/messages/khung-ung-dung";
import { okrMessages } from "@/lib/messages/okr";
import type { TabOkr } from "./tab-okr";

/** Tiêu đề của cả khu — đúng chữ mục «Mục tiêu» trên thanh bên (A1). */
export function tieuDeKhu(locale: Locale): string {
	return khungUngDungMessages(locale).rail.okr;
}

/** Tiêu đề trình duyệt «<tên trang> · Mục tiêu». */
export function tieuDeTrinhDuyet(
	locale: Locale,
	trang: TabOkr | string,
): string {
	const m = okrMessages(locale);
	const ten = trang in m.tab ? m.tab[trang as TabOkr] : trang;
	return `${ten} · ${tieuDeKhu(locale)}`;
}
