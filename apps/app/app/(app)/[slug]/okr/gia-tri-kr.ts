import type { Locale } from "@crm/ui/lib/locale";
import { okrMessages } from "@/lib/messages/okr";
import type { KetQua } from "./kieu";
import { chuSo } from "./nguon-so";

export function giaTri(
	kr: Pick<KetQua, "kind" | "unit">,
	so: number,
	locale: Locale,
): string {
	const m = okrMessages(locale);
	if (kr.kind === "moc") return so >= 1 ? m.moc.xong : m.moc.chuaXong;
	const chu = chuSo(so, locale);
	return kr.unit === "%" ? `${chu}%` : `${chu} ${kr.unit}`.trim();
}
