import type { Locale } from "@crm/ui/lib/locale";
import {
	type SettingsMessages,
	settingsMessages,
} from "@/lib/messages/settings";

export type MucCaiDat = {
	khoa: keyof SettingsMessages["thanhBen"];
	href: string;
};

export const GOC_CAI_DAT = "/settings";

export const MUC_CAI_DAT: readonly MucCaiDat[] = [
	{ khoa: "chung", href: GOC_CAI_DAT },
	{ khoa: "theoDoi", href: `${GOC_CAI_DAT}/tracking` },
	{ khoa: "ketNoi", href: `${GOC_CAI_DAT}/connections` },
	{ khoa: "tienTe", href: `${GOC_CAI_DAT}/currencies` },
	{ khoa: "truong", href: `${GOC_CAI_DAT}/fields` },
	{ khoa: "thanhVien", href: `${GOC_CAI_DAT}/members` },
	{ khoa: "khoaApi", href: `${GOC_CAI_DAT}/api-keys` },
	{ khoa: "sso", href: `${GOC_CAI_DAT}/sso` },
	{ khoa: "thongBaoCuaBan", href: `${GOC_CAI_DAT}/notifications` },
	{ khoa: "toChuc", href: `${GOC_CAI_DAT}/organization` },
	{ khoa: "chuongTrinhOkr", href: `${GOC_CAI_DAT}/okr` },
	{ khoa: "dieuPhoi", href: `${GOC_CAI_DAT}/onboarding` },
];

export function mucCaiDatDangMo(
	href: string,
	goc: string,
	pathname: string,
): boolean {
	return href === goc ? pathname === href : pathname.startsWith(href);
}

export function nhanCaiDat(muc: MucCaiDat, locale: Locale): string {
	return settingsMessages(locale).thanhBen[muc.khoa];
}
