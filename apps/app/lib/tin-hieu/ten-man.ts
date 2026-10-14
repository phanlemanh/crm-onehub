import type { Locale } from "@crm/ui/lib/locale";
import { GOC_CAI_DAT, MUC_CAI_DAT, nhanCaiDat } from "@/lib/cai-dat-dieu-huong";
import { MUC_RAIL, nhanRail } from "@/lib/khung-dieu-huong";
import { nhacQuaZaloMessages } from "@/lib/messages/nhac-qua-zalo";
import { tinHieuMessages } from "@/lib/messages/tin-hieu";

const NOI_TEN_CAI_DAT = " › ";

export const MAN_LUI = ["/ngoai-pham-vi"] as const;

function catDuong(duong: string): string {
	const cat = (duong.split(/[?#]/)[0] ?? "").replace(/\/+$/, "");
	return cat === "" ? "/" : cat;
}

function thuoc(duong: string, goc: string): boolean {
	return duong === goc || duong.startsWith(`${goc}/`);
}

function tenRail(duong: string, locale: Locale): string | null {
	const muc = MUC_RAIL.find((m) =>
		m.match === "exact"
			? duong === m.href
			: thuoc(duong, m.href) ||
				Boolean(m.related?.some((r) => thuoc(duong, r))),
	);
	return muc ? nhanRail(muc, locale) : null;
}

function tenCaiDat(duong: string, locale: Locale): string {
	const goc = tenRail(GOC_CAI_DAT, locale) ?? GOC_CAI_DAT;
	const muc = MUC_CAI_DAT.find(
		(m) => m.href !== GOC_CAI_DAT && thuoc(duong, m.href),
	);
	return muc ? `${goc}${NOI_TEN_CAI_DAT}${nhanCaiDat(muc, locale)}` : goc;
}

export function tenMan(duongVao: string, locale: Locale): string {
	const duong = catDuong(duongVao);
	if (MAN_LUI.some((g) => thuoc(duong, g))) return duongVao;
	if (thuoc(duong, GOC_CAI_DAT)) return tenCaiDat(duong, locale);
	if (thuoc(duong, "/reminders")) return nhacQuaZaloMessages(locale).tieuDe;
	if (thuoc(duong, "/tin-hieu")) return tinHieuMessages(locale).menu;
	return tenRail(duong, locale) ?? duongVao;
}
